import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, KeyboardEvent } from 'react'
import { Undo2, Trash2, Copy, ShoppingBag, Check, Download, RotateCcw, ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Motif } from './Motif'
import { motifOptions } from '@/lib/catalog'
import type { CartItem, Language, MotifKind, PlacedMotif } from '@/lib/catalog'
import { money } from '@/lib/catalog'
import { readSaved, save } from '@/lib/persistence'
function bounded(m: PlacedMotif): PlacedMotif {
  const edge = m.size * .72
  return { ...m, x: Math.max(edge + 8, Math.min(1492 - edge, m.x)), y: Math.max(edge + 8, Math.min(292 - edge, m.y)) }
}
function Stencil({ motifs }: { motifs: PlacedMotif[] }) { return <>{motifs.map(m => <g key={m.id} transform={`translate(${m.x} ${m.y}) rotate(${m.rotation}) scale(${m.size / 100}) translate(-50 -50)`}><Motif kind={m.kind} /></g>)}</> }
function svgSource(motifs: PlacedMotif[]) { return renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 300" width="150mm" height="30mm"><g color="#592C20"><Stencil motifs={motifs} /></g></svg>) }
export function Henna({ lang, add }: { lang: Language; add: (item: CartItem) => void }) {
  const ar = lang === 'ar'
  const [motifs, setMotifs] = useState<PlacedMotif[]>(() => readSaved('elike-henna', []))
  const [history, setHistory] = useState<PlacedMotif[][]>([])
  const [kind, setKind] = useState<MotifKind>('flower')
  const [selected, setSelected] = useState<string | null>(null)
  const [size, setSize] = useState(100)
  const [snap, setSnap] = useState(false)
  const [added, setAdded] = useState(false)
  const svg = useRef<SVGSVGElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const chosen = motifs.find(m => m.id === selected)
  useEffect(() => { save('elike-henna', motifs) }, [motifs])
  function remember() { setHistory(h => [...h.slice(-39), motifs]) }
  function update(next: PlacedMotif[]) { remember(); setMotifs(next) }
  function point(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - rect.left) / rect.width * 1500, y: (event.clientY - rect.top) / rect.height * 300 }
  }
  function down(event: PointerEvent<SVGSVGElement>) {
    const p = point(event)
    const id = (event.target as Element).closest('[data-motif-id]')?.getAttribute('data-motif-id')
    if (id) {
      const m = motifs.find(item => item.id === id)!
      setSelected(id); remember(); dragging.current = { id, dx: p.x - m.x, dy: p.y - m.y }
      event.currentTarget.setPointerCapture(event.pointerId)
    } else if (motifs.length < 80) {
      const m = bounded({ id: crypto.randomUUID(), kind, x: snap ? Math.round(p.x / 25) * 25 : p.x, y: snap ? Math.round(p.y / 25) * 25 : p.y, size, rotation: 0 })
      update([...motifs, m]); setSelected(m.id)
    }
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    const drag = dragging.current
    if (!drag) return
    const p = point(event)
    setMotifs(items => items.map(m => m.id === drag.id ? bounded({ ...m, x: snap ? Math.round((p.x - drag.dx) / 25) * 25 : p.x - drag.dx, y: snap ? Math.round((p.y - drag.dy) / 25) * 25 : p.y - drag.dy }) : m))
  }
  function change(values: Partial<PlacedMotif>) { if (chosen) update(motifs.map(m => m.id === selected ? bounded({ ...m, ...values }) : m)) }
  function undo() { const previous = history.at(-1); if (previous) { setMotifs(previous); setHistory(history.slice(0, -1)); setSelected(null) } }
  function keyboard(event: KeyboardEvent<SVGSVGElement>) {
    if (!chosen) return
    if (['Delete', 'Backspace'].includes(event.key)) { event.preventDefault(); update(motifs.filter(m => m.id !== selected)); setSelected(null) }
    const delta: Record<string, [number, number]> = { ArrowUp: [0, -5], ArrowDown: [0, 5], ArrowLeft: [-5, 0], ArrowRight: [5, 0] }
    if (delta[event.key]) { event.preventDefault(); change({ x: chosen.x + delta[event.key][0], y: chosen.y + delta[event.key][1] }) }
  }
  function download() { const url = URL.createObjectURL(new Blob([svgSource(motifs)], { type: 'image/svg+xml' })); const a = document.createElement('a'); a.href = url; a.download = 'elike-henna-15x3cm.svg'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
  return <section className="shop-page wrap">
    <div className="page-heading"><p className="eyebrow">{ar ? 'استوديو الحنّة / لمستك الخاصة' : 'THE HENNA STUDIO / A LITTLE OF YOU'}</p><h1>{ar ? 'حنّة. بطريقتك.' : 'Henna. Your way.'}</h1><p>{ar ? 'اختر نقشة ثم المس مكانها على الشريط. حرّكها وأضف لمستك.' : 'Choose a motif. Tap the strip to place it. A little heart here, a flower there.'}</p></div>
    <div className="studio-layout henna-layout"><div className="design-workspace">
      <div className="workspace-toolbar"><span>{ar ? 'قالب حنّة مخصص' : 'YOUR CUSTOM STENCIL'}</span><span dir="ltr">15 × 3 cm</span></div>
      <div className="henna-workarea"><p className="dimension-label">15 cm</p><div className="canvas-scroller" ref={scroller}><svg ref={svg} className="henna-canvas" viewBox="0 0 1500 300" aria-label={ar ? 'شريط التصميم، انقر لإضافة نقشة' : 'Henna design strip, click to place a motif'} role="application" tabIndex={0} onPointerDown={down} onPointerMove={move} onPointerUp={() => { dragging.current = null }} onPointerCancel={() => { dragging.current = null }} onKeyDown={keyboard}>
        <defs><pattern id="henna-grid" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="#BEB5A4" /></pattern></defs><rect width="1500" height="300" fill="#F7EFE3" /><rect width="1500" height="300" fill="url(#henna-grid)" />
        {motifs.length === 0 && <text x="750" y="160" textAnchor="middle" fill="#835A42" fontSize="27" pointerEvents="none">{ar ? 'اختر نقشة، ثم اضغط هنا' : 'Choose a motif, then tap here'}</text>}
        {motifs.map(m => <g key={m.id} data-motif-id={m.id} transform={`translate(${m.x} ${m.y}) rotate(${m.rotation}) scale(${m.size / 100}) translate(-50 -50)`} color="#592C20" style={{ cursor: 'grab' }}><rect width="100" height="100" fill="transparent" />{m.id === selected && <rect x="-6" y="-6" width="112" height="112" fill="none" stroke="#835A02" strokeWidth="2" strokeDasharray="5 4" pointerEvents="none" />}<Motif kind={m.kind} /></g>)}
      </svg></div><p className="dimension-label vertical-dimension">{ar ? 'ارتفاع ٣ سم · العرض ١٥ سم' : '3 cm high · 15 cm wide'}</p></div>
      <div className="strip-navigation"><button className="icon-button" aria-label={ar ? 'تحريك الشريط لليسار' : 'Scroll design strip left'} onClick={() => scroller.current?.scrollBy({ left: -240, behavior: 'smooth' })}><ArrowLeft size={16} /></button><button className="text-button" onClick={() => { if (motifs.length < 80) { const m = bounded({ id: crypto.randomUUID(), kind, x: 750, y: 150, size, rotation: 0 }); update([...motifs, m]); setSelected(m.id); scroller.current?.scrollTo({ left: (scroller.current.scrollWidth - scroller.current.clientWidth) / 2, behavior: 'smooth' }) } }}><Plus size={15} />{ar ? 'إضافة في المنتصف' : 'Place motif at centre'}</button><button className="icon-button" aria-label={ar ? 'تحريك الشريط لليمين' : 'Scroll design strip right'} onClick={() => scroller.current?.scrollBy({ left: 240, behavior: 'smooth' })}><ArrowRight size={16} /></button></div>
      <div className="editor-tools"><button onClick={undo} disabled={!history.length}><Undo2 size={16} />{ar ? 'تراجع' : 'Undo'}</button><button onClick={() => { if (chosen && motifs.length < 80) { const m = bounded({ ...chosen, id: crypto.randomUUID(), x: chosen.x + 120 }); update([...motifs, m]); setSelected(m.id) } }} disabled={!chosen || motifs.length >= 80}><Copy size={16} />{ar ? 'نسخ' : 'Duplicate'}</button><button onClick={() => { update(motifs.filter(m => m.id !== selected)); setSelected(null) }} disabled={!chosen}><Trash2 size={16} />{ar ? 'حذف' : 'Delete'}</button><button onClick={() => { update([]); setSelected(null) }} disabled={!motifs.length}><RotateCcw size={16} />{ar ? 'مسح' : 'Clear'}</button></div>
      <p className="editor-help">{ar ? 'اسحب النقشة لتحريكها. استخدم الأسهم لتحريك النقشة المحددة. على الهاتف، مرّر الشريط أفقياً.' : 'Drag to move. Arrow keys move the selected motif. On mobile, scroll the strip sideways.'}</p>
      <div className="henna-summary"><span>{motifs.length}/80 {ar ? 'نقشة' : 'motifs'}</span><label><input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)} />{ar ? 'محاذاة للشبكة' : 'Snap to grid'}</label><button className="text-button" onClick={download} disabled={!motifs.length}><Download size={15} />{ar ? 'تنزيل التصميم' : 'Download design'}</button></div>
    </div><aside className="studio-options"><p className="eyebrow">{ar ? 'اختر نقشتك' : 'PICK YOUR MOTIF'}</p><div className="motif-grid">{motifOptions.map(m => <button key={m.kind} aria-pressed={kind === m.kind} onClick={() => { setKind(m.kind); setSelected(null) }}><svg viewBox="0 0 100 100" aria-hidden="true"><Motif kind={m.kind} /></svg><span>{ar ? m.ar : m.en}</span></button>)}</div>
      <label className="range-label">{ar ? 'الحجم' : 'Motif size'}<span>{((chosen?.size ?? size) / 100).toFixed(1)} cm</span><input type="range" min="40" max="180" step="10" value={chosen?.size ?? size} onChange={e => { const value = +e.target.value; setSize(value); if (chosen) change({ size: value }) }} /></label>
      <label className="range-label">{ar ? 'الدوران' : 'Rotation'}<span>{chosen?.rotation ?? 0}°</span><input type="range" min="-180" max="180" step="5" disabled={!chosen} value={chosen?.rotation ?? 0} onChange={e => change({ rotation: +e.target.value })} /></label>
      <div className="studio-price"><span>{ar ? 'قالب مخصص، سعر مقترح' : 'Custom stencil · sample price'}</span><strong>{money(25, lang)}</strong></div><button className="primary-button full-width" disabled={!motifs.length} onClick={() => { add({ id: crypto.randomUUID(), productId: 'henna-stencil', name: 'Your henna stencil', ar: 'قالب الحنّة الخاص بك', price: 25, quantity: 1, config: { motifs, dimensions: '15 × 3 cm' }, thumbnail: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgSource(motifs))}` }); setAdded(true); setTimeout(() => setAdded(false), 1800) }}>{added ? <Check size={17} /> : <ShoppingBag size={17} />}{added ? (ar ? 'أُضيف للسلة' : 'Added to bag') : (ar ? 'أضف تصميمك للسلة' : 'Add your design to bag')}</button><p className="fine-print">{ar ? 'معاينة تصميم فقط. يُراجع القالب للتصنيع قبل تأكيد الطلب.' : 'Design preview. Stencil cuts and motif bridges need a workshop review before production.'}</p>
    </aside></div>
  </section>
}
