// Invoke from a trusted server scheduler, never from browser code.
import { admin, gateway, json } from '../_shared/server.ts'
Deno.serve(async request => {
  if (request.method !== 'POST' || request.headers.get('authorization') !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) return json({ error: 'Unauthorized.' }, 401)
  const db = admin()
  const pending = await db.from('orders').select('id,gateway_invoice_id,total_qar,currency').eq('status','pending').eq('checkout_state','ready').order('created_at', { ascending: true }).limit(50)
  if (pending.error) return json({ error: 'Could not check pending orders.' }, 503)
  let confirmed = 0, unresolved = 0
  for (const order of pending.data) {
    try {
      const invoice = await gateway('GetPaymentStatus', { Key: order.gateway_invoice_id, KeyType: 'InvoiceId' })
      if (String(invoice.InvoiceId) !== order.gateway_invoice_id || invoice.CustomerReference !== order.id || order.currency !== 'QAR' || Math.round(Number(invoice.InvoiceValue) * 100) !== Math.round(Number(order.total_qar) * 100)) { unresolved++; continue }
      if (invoice.InvoiceStatus === 'Paid') { const update = await db.from('orders').update({ status: 'paid' }).eq('id',order.id).eq('status','pending'); if (update.error) unresolved++; else confirmed++ }
      else if (invoice.InvoiceStatus === 'Expired') { const update = await db.from('orders').update({ status: 'failed' }).eq('id',order.id).eq('status','pending'); if (update.error) unresolved++ }
    } catch { unresolved++ }
  }
  return json({ checked: pending.data.length, confirmed, unresolved })
})
