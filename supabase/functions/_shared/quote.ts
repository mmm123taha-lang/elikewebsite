// Pure validation/pricing: the browser never supplies authoritative prices.
export type ProductRow = { id: string; name: string; price_qar: number; approved: boolean; active: boolean }
export type QuoteLine = { productId: string; quantity: number; color?: number; config?: Record<string, unknown>; photoPath?: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const motifs = new Set(['heart','flower','rose','leaf','star','moon','diamond','sun','sparkle','paisley','dot','vine'])
export function isUuid(value: unknown): value is string { return typeof value === 'string' && uuid.test(value) }
export function calculateQuote(input: unknown, catalog: ProductRow[], userId: string) {
  if (!Array.isArray(input) || !input.length || input.length > 30) throw Error('A bag must contain between 1 and 30 designs.')
  const lookup = new Map(catalog.map(p => [p.id, p]))
  let cents = 0
  const items = input.map((raw: QuoteLine) => {
    if (!raw || typeof raw.productId !== 'string' || !Number.isInteger(raw.quantity) || raw.quantity < 1 || raw.quantity > 20) throw Error('Invalid product or quantity.')
    const config = raw.config ?? {}
    let id = raw.productId, extra = 0
    if (id === 'lithophane') {
      if (!['small','medium','large'].includes(String(config.size)) || !['arch','rectangle'].includes(String(config.shape)) || typeof config.led !== 'boolean' || !Number.isFinite(config.zoom) || Number(config.zoom) < 1 || Number(config.zoom) > 2) throw Error('Invalid lithophane options.')
      if (typeof raw.photoPath !== 'string' || !raw.photoPath.startsWith(`${userId}/`) || !isUuid(raw.photoPath.slice(userId.length + 1, -4)) || !raw.photoPath.endsWith('.jpg')) throw Error('The photograph must belong to this customer.')
      id = `lithophane-${config.size}`
      if (config.led) { const led = lookup.get('led-base'); if (!led?.approved || !led.active) throw Error('LED base pricing is not approved.'); extra = Math.round(Number(led.price_qar) * 100) }
    } else if (id === 'henna-stencil') {
      if (!Array.isArray(config.motifs) || config.motifs.length < 1 || config.motifs.length > 80) throw Error('Invalid stencil.')
      for (const m of config.motifs) {
        if (!m || !motifs.has(m.kind) || ![m.x,m.y,m.size,m.rotation].every(Number.isFinite) || m.size < 40 || m.size > 180 || m.rotation < -180 || m.rotation > 180) throw Error('Invalid stencil motif.')
        const edge = m.size * .72
        if (m.x < edge + 7 || m.x > 1493 - edge || m.y < edge + 7 || m.y > 293 - edge) throw Error('A stencil motif is outside the 15 × 3 cm design area.')
      }
    } else {
      if (!['heart-keychain','capsule-keychain','flower-keychain','hex-keychain','ribbed-planter','phone-stand'].includes(id)) throw Error('Invalid product identifier.')
      if (!Number.isInteger(raw.color) || Number(raw.color) < 0 || Number(raw.color) > 2) throw Error('Invalid colour.')
    }
    const product = lookup.get(id)
    if (!product?.active || !product.approved) throw Error('This product is awaiting workshop approval and cannot be purchased yet.')
    const unitCents = Math.round(Number(product.price_qar) * 100) + extra
    if (!Number.isFinite(unitCents) || unitCents <= 0) throw Error('Invalid catalogue price.')
    cents += unitCents * raw.quantity
    return { productId: raw.productId, name: product.name, quantity: raw.quantity, unitPrice: unitCents / 100, color: raw.color, config, photoPath: raw.productId === 'lithophane' ? raw.photoPath : undefined }
  })
  if (cents > 1000000) throw Error('This order needs a workshop quote.')
  return { total: cents / 100, items }
}
