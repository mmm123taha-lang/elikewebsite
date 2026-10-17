import { admin, customer, gateway, json, preflight } from '../_shared/server.ts'
Deno.serve(async request => {
  const early = preflight(request); if (early) return early
  const user = await customer(request); if (!user) return json({ error: 'Sign in to check your order.' }, 401)
  try {
    const body = await request.json()
    if (typeof body.paymentId !== 'string' || !/^[A-Za-z0-9_-]{1,150}$/.test(body.paymentId)) return json({ error: 'Invalid payment reference.' }, 400)
    const invoice = await gateway('GetPaymentStatus', { Key: body.paymentId, KeyType: 'PaymentId' })
    const db = admin()
    const found = await db.from('orders').select('id,total_qar,currency,gateway_invoice_id,status').eq('id', invoice.CustomerReference).eq('user_id', user.id).single()
    if (found.error || !found.data || found.data.gateway_invoice_id !== String(invoice.InvoiceId) || found.data.currency !== 'QAR' || Math.round(Number(invoice.InvoiceValue) * 100) !== Math.round(Number(found.data.total_qar) * 100)) return json({ error: 'Payment does not match this order.' }, 409)
    if (invoice.InvoiceStatus === 'Paid' && found.data.status === 'pending') {
      const updated = await db.from('orders').update({ status: 'paid' }).eq('id', found.data.id).eq('status', 'pending')
      if (updated.error) throw Error('Status update failed.')
    }
    return json({ orderId: found.data.id, status: invoice.InvoiceStatus === 'Paid' ? 'paid' : found.data.status })
  } catch { return json({ error: 'Payment has not been verified. Check your order before attempting another payment.' }, 503) }
})
