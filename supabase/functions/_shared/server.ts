import { createClient } from 'npm:@supabase/supabase-js@2'
export const site = Deno.env.get('SITE_URL') || 'https://mmm123taha-lang.github.io/elikewebsite/'
const origin = new URL(site).origin
export const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' }
export function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }) }
export function preflight(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) return json({ error: 'Origin not allowed.' }, 403)
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  return null
}
export function admin() { return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } }) }
export async function customer(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false } })
  const { data, error } = await client.auth.getUser(token)
  return error ? null : data.user
}
export async function gateway(path: string, data: unknown) {
  if (Deno.env.get('PAYMENT_PROVIDER') !== 'myfatoorah') throw Error('No payment provider has been selected.')
  const mode = Deno.env.get('MYFATOORAH_MODE')
  if (!['test','qatar-live'].includes(mode ?? '')) throw Error('Choose a verified gateway mode first.')
  const token = Deno.env.get('MYFATOORAH_API_TOKEN')
  if (!token) throw Error('Payment provider is not connected.')
  const endpoint = mode === 'qatar-live' ? 'https://api-qa.myfatoorah.com' : 'https://apitest.myfatoorah.com'
  const response = await fetch(`${endpoint}/v2/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(20000) })
  const result = await response.json()
  if (!response.ok || !result.IsSuccess || !result.Data) throw Error('The payment provider could not complete this request.')
  return result.Data
}
