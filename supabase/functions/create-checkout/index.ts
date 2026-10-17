import { admin, customer, gateway, json, preflight, site } from '../_shared/server.ts'
import { calculateQuote, isUuid } from '../_shared/quote.ts'
Deno.serve(async request => {
  const early = preflight(request); if (early) return early
  const user = await customer(request); if (!user) return json({ error: 'Sign in before checking out.' }, 401)
  if (Deno.env.get('CHECKOUT_ENABLED') !== 'true' || !Deno.env.get('PAYMENT_PROVIDER')) return json({ error: 'Online ordering has not opened yet.' }, 503)
  try {
    const text = await request.text(); if (text.length > 100000) return json({ error: 'Design is too large.' }, 413)
    const body = JSON.parse(text)
    if (!isUuid(body.requestId) || body.fulfilment !== 'pickup' || typeof body.customer?.name !== 'string' || body.customer.name.trim().length < 1 || body.customer.name.length > 100 || !/^(?:\+974)?[0-9]{8}$/.test(String(body.customer.phone ?? '').replace(/[\s-]/g, ''))) return json({ error: 'Check your pickup details.' }, 400)
    const db = admin()
    const existing = await db.from('orders').select('id,payment_url,checkout_state,status').eq('user_id', user.id).eq('request_id', body.requestId).maybeSingle()
    if (existing.error) throw Error('Order lookup failed.')
    if (existing.data) return existing.data.payment_url && existing.data.status === 'pending' ? json({ url: existing.data.payment_url }) : json({ error: 'An order attempt already exists. Check your orders before trying again.' }, 409)
    const recent = await db.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', new Date(Date.now() - 3600000).toISOString())
    if (recent.error) throw Error('Could not check order attempts.')
    if ((recent.count ?? 0) >= 10) return json({ error: 'Too many order attempts. Please try again later.' }, 429)
    const catalog = await db.from('products').select('*')
    if (catalog.error) throw Error('Catalogue unavailable.')
    const quote = calculateQuote(body.items, catalog.data, user.id)
    if (!Number.isFinite(body.expectedTotal) || Math.round(body.expectedTotal * 100) !== Math.round(quote.total * 100)) return json({ error: 'Prices have changed. Refresh your bag before continuing.' }, 409)
    for (const item of quote.items) {
      if (item.photoPath) { const key = item.photoPath.split('/')[1]; const found = await db.storage.from('customer-designs').list(user.id, { search: key, limit: 2 }); if (found.error || !found.data.some(file => file.name === key)) return json({ error: 'Photo upload is missing.' }, 400) }
    }
    const created = await db.from('orders').insert({ user_id: user.id, request_id: body.requestId, customer_name: body.customer.name.trim(), customer_phone: body.customer.phone.trim(), items: quote.items, total_qar: quote.total }).select('id').single()
    if (created.error) return json({ error: 'The order could not be prepared. Check existing orders before retrying.' }, 409)
    const id = created.data.id
    // Only the verified provider API can produce a checkout URL. No mock payment success.
    const returnUrl = new URL(site); returnUrl.searchParams.set('view', 'orders')
    const invoice = await gateway('SendPayment', { NotificationOption: 'LNK', CustomerName: body.customer.name.trim(), CustomerEmail: user.email, InvoiceValue: quote.total, DisplayCurrencyIso: 'QAR', CallBackUrl: returnUrl.href, ErrorUrl: returnUrl.href, CustomerReference: id, UserDefinedField: id })
    const url = new URL(invoice.InvoiceURL)
    if (url.protocol !== 'https:' || !(url.hostname === 'myfatoorah.com' || url.hostname.endsWith('.myfatoorah.com'))) throw Error('Untrusted checkout URL.')
    const updated = await db.from('orders').update({ gateway_invoice_id: String(invoice.InvoiceId), payment_url: url.href, checkout_state: 'ready' }).eq('id', id)
    if (updated.error) throw Error('Could not retain the invoice.')
    return json({ url: url.href, orderId: id })
  } catch (error) {
    // Never include gateway responses, tokens, customer photos or full request bodies in logs.
    const validation = error instanceof Error && /Invalid|awaiting|outside|must contain|pricing|photograph|needs a workshop|bag must/i.test(error.message)
    return json({ error: validation ? error.message : 'Checkout could not be started. No order is confirmed. Please check your orders before retrying.' }, validation ? 400 : 503)
  }
})
