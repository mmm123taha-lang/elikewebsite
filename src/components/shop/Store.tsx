import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, ShoppingBag, Check } from 'lucide-react'
import { colors, money, products } from '@/lib/catalog'
import type { CartItem, Language } from '@/lib/catalog'
import { ProductImage } from './ProductImage'
export function Store({ lang, add }: { lang: Language; add: (item: CartItem) => void }) {
  const [filter, setFilter] = useState('all')
  const [choices, setChoices] = useState<Record<string, number>>({})
  const [added, setAdded] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const ar = lang === 'ar'
  return <section className="shop-page wrap">
    <div className="page-heading"><p className="eyebrow">{ar ? 'المتجر / صُنع في قطر' : 'THE STORE / MADE IN QATAR'}</p><h1>{ar ? 'أشياء صغيرة. شخصية كبيرة.' : 'Small things. Big personality.'}</h1><p>{ar ? 'اختر القطعة واللون الذي يشبهك.' : 'Pick a little favourite. Find your colour. Make it yours.'}</p></div>
    <div className="collection-toolbar"><div className="segmented">{[['all', 'All pieces', 'كل القطع'], ['keychains', 'Keychains', 'ميداليات'], ['home', 'For your space', 'لمساحتك']].map(([id, en, arabic]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{ar ? arabic : en}</button>)}</div><span>{ar ? '٦ قطع · ٣ ألوان' : '6 pieces · 3 colourways'}</span></div>
    <p className="subtle-notice">{ar ? 'الميداليات ١٥ ر.ق. بقية الأسعار مقترحة. الصور توضيحية والطلبات المدفوعة غير متاحة بعد.' : 'Keychains QAR 15 · other prices are samples · illustrative renders · online ordering opens soon.'}</p>
    <div className="product-grid">{products.filter(p => filter === 'all' || p.category === filter).map((product, index) => {
      const color = choices[product.id] ?? 0
      return <motion.article key={product.id} layout initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: index * .04 }} className="product-card">
        <div className="product-visual"><ProductImage column={product.column} color={color} name={ar ? product.ar : product.name} /><span className="product-category">{product.category === 'keychains' ? (ar ? 'ميدالية' : 'KEYCHAIN') : (ar ? 'للمنزل' : 'FOR YOUR SPACE')}</span></div>
        <div className="product-info"><div className="product-title"><h2>{ar ? product.ar : product.name}</h2><span>{money(product.price, lang)}</span></div><p>{ar ? product.arNote : product.note}</p><span className="product-dimensions" dir="ltr">{product.dimensions} · PLA</span>
          <div className="color-choice"><div className="swatches" role="group" aria-label={ar ? 'اللون' : 'Colour'}>{colors.map((c, i) => <button key={c.id} aria-label={`${ar ? c.ar : c.name} — ${ar ? product.ar : product.name}`} aria-pressed={color === i} style={{ '--swatch': c.hex } as React.CSSProperties} onClick={() => setChoices({ ...choices, [product.id]: i })}><span />{color === i && <Check size={13} aria-hidden="true" />}</button>)}</div><span>{ar ? colors[color].ar : colors[color].name}</span></div>
          <button className="add-button" onClick={() => { add({ id: `${product.id}-${color}`, productId: product.id, name: product.name, ar: product.ar, price: product.price, quantity: 1, color, column: product.column }); setAdded(product.id); setTimeout(() => setAdded(null), 1800) }}>{added === product.id ? <Check size={17} /> : <ShoppingBag size={17} />}{added === product.id ? (ar ? 'أُضيفت للسلة' : 'Added to your bag') : (ar ? 'أضف للسلة' : 'Add to bag')}<ArrowUpRight size={17} /></button>
        </div>
      </motion.article>
    })}</div>
  </section>
}
