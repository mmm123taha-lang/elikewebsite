import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Upload, Sun, Moon, ShoppingBag, Check, Play, ArrowRight, ImagePlus, RotateCcw } from 'lucide-react'
import { asset, lithoSizes, money } from '@/lib/catalog'
import type { CartItem, Language } from '@/lib/catalog'
import { getAsset, readSaved, save, saveAsset } from '@/lib/persistence'
export function Lithophane({ lang, add }: { lang: Language; add: (item: CartItem) => void }) {
  const ar = lang === 'ar', reduced = useReducedMotion()
  const [intro, setIntro] = useState(true)
  const [progress, setProgress] = useState(0)
  const [photo, setPhoto] = useState<string | null>(null)
  const [assetId, setAssetId] = useState<string | null>(null)
  const [lit, setLit] = useState(true)
  const [size, setSize] = useState(0)
  const [shape, setShape] = useState('arch')
  const [led, setLed] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState(false)
  const [zoom, setZoom] = useState(1)
  const canvas = useRef<HTMLCanvasElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const upload = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)
  const price = lithoSizes[size].price + (led ? 25 : 0)
  useEffect(() => {
    let cancelled = false
    const id = readSaved<string | null>('elike-litho-asset', null)
    if (id) getAsset(id).then(blob => { if (blob && !cancelled) { const url = URL.createObjectURL(blob); objectUrl.current = url; setPhoto(url); setAssetId(id) } }).catch(() => { if (!cancelled) setError(ar ? 'تعذّر استعادة الصورة السابقة. ارفعها من جديد.' : 'Your previous photo could not be restored. Please upload it again.') })
    return () => { cancelled = true; if (objectUrl.current) URL.revokeObjectURL(objectUrl.current) }
  // The saved image is loaded once; changing language should not reload it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!photo || !canvas.current) return
    const output = canvas.current, context = output.getContext('2d')
    if (!context) return
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (cancelled) return
      const width = 600, height = size === 0 ? 900 : size === 1 ? 830 : 800
      output.width = width; output.height = height
      const scale = Math.max(width / image.width, height / image.height) * zoom
      context.drawImage(image, (width - image.width * scale) / 2, (height - image.height * scale) / 2, image.width * scale, image.height * scale)
      const pixels = context.getImageData(0, 0, width, height)
      for (let i = 0; i < pixels.data.length; i += 4) {
        const v = (.2126 * pixels.data[i] + .7152 * pixels.data[i + 1] + .0722 * pixels.data[i + 2]) / 255
        const thickness = .8 + (1 - v) * 2.4
        const transmission = Math.exp(-.65 * thickness)
        const brightness = lit ? 54 + transmission * 250 : 212 + v * 14
        const line = Math.floor(i / 4 / width) % 3 === 0 ? (lit ? 2 : 3) : 0
        pixels.data[i] = Math.min(255, brightness + (lit ? 25 : 8) - line)
        pixels.data[i + 1] = Math.min(255, brightness + (lit ? 14 : 6) - line)
        pixels.data[i + 2] = Math.min(255, brightness - (lit ? 18 : 0) - line)
      }
      context.putImageData(pixels, 0, 0)
    }
    image.onerror = () => setError(ar ? 'تعذّر عرض هذه الصورة.' : 'This image could not be displayed.')
    image.src = photo
    return () => { cancelled = true }
  }, [photo, lit, size, zoom, ar, shape, intro])
  async function choose(file?: File) {
    if (!file) return
    setError(''); setBusy(true)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError(ar ? 'اختر صورة JPG أو PNG أو WebP بحجم أقل من ١٠ ميغابايت.' : 'Choose a JPG, PNG, or WebP image under 10 MB.'); setBusy(false); return }
    try {
      const image = await createImageBitmap(file)
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height))
      const source = document.createElement('canvas'); source.width = Math.round(image.width * scale); source.height = Math.round(image.height * scale)
      source.getContext('2d')!.drawImage(image, 0, 0, source.width, source.height); image.close()
      const blob = await new Promise<Blob>((resolve, reject) => source.toBlob(b => b ? resolve(b) : reject(new Error('Could not process this photo.')), 'image/jpeg', .9))
      const id = crypto.randomUUID(); await saveAsset(id, blob)
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
      const url = URL.createObjectURL(blob); objectUrl.current = url; setPhoto(url); setAssetId(id); setZoom(1); save('elike-litho-asset', id)
    } catch { setError(ar ? 'تعذّر حفظ الصورة. تحقق من صلاحية الملف ومساحة المتصفح.' : 'Could not save the photo. Check the image and available browser storage.') } finally { setBusy(false); if (upload.current) upload.current.value = '' }
  }
  function addDesign() {
    if (!canvas.current || !assetId) return
    const thumbnail = document.createElement('canvas'); thumbnail.width = 100; thumbnail.height = 145
    thumbnail.getContext('2d')!.drawImage(canvas.current, 0, 0, 100, 145)
    add({ id: crypto.randomUUID(), productId: 'lithophane', name: 'Your photo, in a new light', ar: 'صورتك في ضوء جديد', price, quantity: 1, assetId, config: { size: lithoSizes[size].id, dimensions: lithoSizes[size].label, shape, led, zoom }, thumbnail: thumbnail.toDataURL('image/jpeg', .7) }); setAdded(true); setTimeout(() => setAdded(false), 1800)
  }
  return <section className="shop-page wrap">
    <div className="page-heading"><p className="eyebrow">{ar ? 'استوديو الليثوفان / ذاكرة مضيئة' : 'THE LITHOPHANE STUDIO / A MEMORY, REIMAGINED'}</p><h1>{ar ? 'ذكرياتك. في ضوء جديد.' : 'Your memories. A new light.'}</h1><p>{ar ? 'ارفع صورة وجرّب الضوء لتكتشف التفاصيل.' : 'Upload a favourite photograph. Add a little light. Watch the memory appear.'}</p></div>
    <AnimatePresence mode="wait">{intro ? <motion.div key="intro" className="litho-intro" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="intro-copy"><span className="eyebrow">{ar ? 'كيف يعمل؟ / ٩ ثوانٍ' : 'HOW IT WORKS / 9 SECONDS'}</span><h2>{ar ? 'ليست مجرد صورة.' : 'More than a photograph.'}</h2><p>{ar ? 'نطبع صورتك بسماكات دقيقة. عندما يمر الضوء خلالها، تظهر التفاصيل.' : 'Your photograph becomes a relief of delicate printed layers. The thinner areas let more light through, revealing your picture.'}</p><button className="primary-button" onClick={() => setIntro(false)}>{ar ? 'ابدأ بصورتك' : 'Start with your photograph'}<ArrowRight size={17} /></button></div>
      <div className="intro-video"><video ref={video} src={asset('media/lithophane-intro.mp4')} poster={asset('media/lithophane-poster.jpg')} autoPlay={!reduced} muted playsInline preload="metadata" onTimeUpdate={e => setProgress(Math.min(9, e.currentTarget.currentTime))} onEnded={() => setIntro(false)} aria-label={ar ? 'فيديو يشرح الليثوفان خلال تسع ثوانٍ' : 'Nine-second illustrated explanation of how a lithophane works'} /><button className="skip-intro" onClick={() => setIntro(false)}>{ar ? 'تخطّي' : 'Skip intro'}<ArrowRight size={16} /></button><button className="video-play" aria-label={ar ? 'تشغيل الفيديو' : 'Play video'} onClick={() => { video.current?.play().catch(() => setError(ar ? 'اضغط تخطّي لبدء التصميم.' : 'Tap Skip intro to start designing.')) }}><Play size={18} /></button><span className="intro-count">{Math.ceil(9 - progress)}s</span><div className="intro-progress"><span style={{ transform: `scaleX(${progress / 9})` }} /></div></div>
    </motion.div> : <motion.div key="studio" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="studio-layout">
      <div className="litho-workspace"><div className="workspace-toolbar"><span>{ar ? 'معاينة صورتك' : 'YOUR PHOTO PREVIEW'}</span><button className="text-button" onClick={() => { setIntro(true); setProgress(0) }}><Play size={14} />{ar ? 'كيف يعمل؟' : 'How it works'}</button></div>
        <div className={`litho-preview ${lit ? 'is-lit' : 'is-unlit'}`}><div className="photo-glow" />{photo ? <motion.div className={`photo-frame shape-${shape}`} animate={reduced ? {} : { opacity: 1 }} key={`${shape}-${size}-${lit}`} initial={reduced ? false : { opacity: .5 }}><canvas ref={canvas} aria-label={lit ? (ar ? 'صورتك مع إضاءة خلفية' : 'Your uploaded photograph with simulated backlighting') : (ar ? 'صورتك بدون إضاءة خلفية' : 'Your uploaded photograph without backlighting')} /><div className="photo-base" /></motion.div> : <button className="upload-empty" onClick={() => upload.current?.click()}><ImagePlus size={40} strokeWidth={1} /><span>{ar ? 'كل صورة تحمل قصة.' : 'Every photograph has a story.'}</span><small>{ar ? 'ارفع صورتك لتشاهدها في ضوء جديد.' : 'Upload yours to see it in a new light.'}</small></button>}</div>
        <div className="light-toolbar"><div className="segmented dark-segmented"><button aria-pressed={lit} onClick={() => setLit(true)}><Sun size={16} />{ar ? 'مع ضوء' : 'Light on'}</button><button aria-pressed={!lit} onClick={() => setLit(false)}><Moon size={16} />{ar ? 'بدون ضوء' : 'Light off'}</button></div><span>{ar ? 'معاينة تقريبية على الشاشة' : 'Simulated screen preview'}</span></div>
      </div><aside className="studio-options"><p className="eyebrow">{ar ? 'صمّم ذكراك' : 'MAKE IT PERSONAL'}</p><input ref={upload} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => choose(e.target.files?.[0])} /><button className="upload-button" onClick={() => upload.current?.click()} disabled={busy}><Upload size={18} />{busy ? (ar ? 'جارٍ تجهيز الصورة…' : 'Preparing your photo…') : photo ? (ar ? 'تغيير الصورة' : 'Change photograph') : (ar ? 'رفع صورة' : 'Upload photograph')}</button><p className="fine-print">JPG, PNG, WebP · {ar ? 'حتى ١٠ ميغابايت. تبقى الصورة في متصفحك حتى ترسل الطلب.' : 'Up to 10 MB. Your photo stays in this browser until you submit an order.'}</p>
        {photo && <label className="range-label">{ar ? 'تكبير الصورة' : 'Photo zoom'}<span>{zoom.toFixed(1)}×</span><input type="range" min="1" max="2" step=".1" value={zoom} onChange={e => setZoom(+e.target.value)} /></label>}
        <fieldset className="option-field"><legend>{ar ? 'الحجم' : 'Dimensions'}</legend><div className="size-options">{lithoSizes.map((option, i) => <button key={option.id} aria-pressed={size === i} onClick={() => setSize(i)}><span dir="ltr">{option.label}</span><span>{money(option.price, lang)}</span></button>)}</div></fieldset>
        <fieldset className="option-field"><legend>{ar ? 'الشكل' : 'Shape'}</legend><div className="segmented"><button aria-pressed={shape === 'arch'} onClick={() => setShape('arch')}>{ar ? 'قوس' : 'Arch'}</button><button aria-pressed={shape === 'rectangle'} onClick={() => setShape('rectangle')}>{ar ? 'مستطيل' : 'Rectangle'}</button></div></fieldset>
        <label className="checkbox-option"><input type="checkbox" checked={led} onChange={e => setLed(e.target.checked)} /><span>{ar ? 'إضافة قاعدة LED' : 'Add an LED base'}<small>+ {money(25, lang)}</small></span></label>
        <div className="studio-price"><span>{ar ? 'السعر المقترح' : 'Sample price'}</span><strong aria-live="polite">{money(price, lang)}</strong></div><button className="primary-button full-width" disabled={!photo || busy} onClick={addDesign}>{added ? <Check size={17} /> : <ShoppingBag size={17} />}{added ? (ar ? 'أُضيف للسلة' : 'Added to bag') : (ar ? 'أضف للسلة' : 'Add to bag')}</button><button className="text-button" onClick={() => { setLit(true); setZoom(1) }}><RotateCcw size={14} />{ar ? 'إعادة المعاينة' : 'Reset preview'}</button>
        <p className="fine-print">{ar ? 'الأسعار مؤقتة. المعاينة ليست ملف تصنيع؛ قد تختلف الإضاءة والنتيجة المطبوعة.' : 'Proposed prices. This preview is not a fabrication model; printed detail and brightness will vary.'}</p>
      </aside>
    </motion.div>}</AnimatePresence>{error && <p className="form-message error" role="alert">{error}</p>}
  </section>
}
