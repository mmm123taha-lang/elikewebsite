import { asset, colors } from '@/lib/catalog'
export function ProductImage({ column, color, name, className = '' }: { column: number; color: number; name: string; className?: string }) {
  return <div role="img" aria-label={`${name} — ${colors[color]?.name ?? 'Honey gold'} product render`} className={`product-image ${className}`} style={{ backgroundImage: `url("${asset('products/collection.png')}")`, backgroundPosition: `${column * 20}% ${color * 50}%` }} />
}
