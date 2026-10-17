import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { LithophaneScene } from '@/lib/lithophane-scene'
import type { LithoSceneOptions } from '@/lib/lithophane-scene'
import type { Language } from '@/lib/catalog'
export function LithophaneViewer({ photo, width, height, shape, zoom, lit, lang, onReady, onError }: LithoSceneOptions & { lang: Language; onReady: (canvas: HTMLCanvasElement) => void; onError: () => void }) {
  const holder = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null), scene = useRef<LithophaneScene | null>(null)
  const [failed, setFailed] = useState(false)
  const reduced = useReducedMotion()
  const errorCallback = useRef(onError), readyCallback = useRef(onReady)
  useEffect(() => { errorCallback.current = onError; readyCallback.current = onReady }, [onError, onReady])
  const drag = useRef<{ x: number; angle: number } | null>(null)
  useEffect(() => {
    if (!canvas.current || !holder.current) return
    let active = true, frame = 0
    const container = holder.current
    try {
      const renderer = new LithophaneScene(canvas.current); scene.current = renderer
      const resize = () => { if (!active || !container.isConnected) return; const r = container.getBoundingClientRect(); renderer.resize(r.width, r.height); renderer.render() }
      resize(); const observer = new ResizeObserver(resize); observer.observe(container)
      let previousOrbit = Number.NaN
      const tick = () => { if (!active) return; if (renderer.orbit !== previousOrbit || Math.abs(renderer.light - renderer.targetLight) > .001) { renderer.render(Boolean(reduced)); previousOrbit = renderer.orbit }; frame = requestAnimationFrame(tick) }
      frame = requestAnimationFrame(tick)
      return () => { active = false; cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose(); scene.current = null }
    } catch { errorCallback.current(); queueMicrotask(() => setFailed(true)) }
  }, [reduced])
  useEffect(() => {
    const renderer = scene.current
    if (!renderer) return
    let active = true
    if (canvas.current) canvas.current.dataset.ready = 'false'
    renderer.configure({ photo, width, height, shape, zoom, lit }).then(() => {
      if (!active || !canvas.current) return
      renderer.render(Boolean(reduced)); canvas.current.dataset.photo = photo; canvas.current.dataset.ready = 'true'; readyCallback.current(canvas.current)
    }).catch(() => { if (active) errorCallback.current() })
    return () => { active = false }
  }, [photo, width, height, shape, zoom, lit, reduced])
  const ar = lang === 'ar'
  return <div ref={holder} className="litho-3d-viewer" tabIndex={0} aria-label={ar ? 'عارض الليثوفان، استخدم الأسهم لتدويره' : 'Lithophane viewer, use left and right arrow keys to rotate'} onKeyDown={e => { if (!scene.current) return; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); scene.current.orbit = Math.max(-.6, Math.min(.6, scene.current.orbit + (e.key === 'ArrowLeft' ? -.06 : .06))) } if (e.key === 'Home') { e.preventDefault(); scene.current.orbit = .14 } }} onPointerDown={e => { if (!scene.current) return; drag.current = { x: e.clientX, angle: scene.current.orbit }; e.currentTarget.setPointerCapture(e.pointerId) }} onPointerMove={e => { if (drag.current && scene.current) scene.current.orbit = Math.max(-.6, Math.min(.6, drag.current.angle + (e.clientX - drag.current.x) / 350)) }} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
    <canvas ref={canvas} aria-label={lit ? (ar ? 'معاينة ثلاثية الأبعاد لصورتك مع الإضاءة' : '3D lithophane photograph with backlight on') : (ar ? 'معاينة ثلاثية الأبعاد لنقش صورتك بدون إضاءة' : '3D lithophane photo relief with backlight off')} />
    {failed && <div className="viewer-fallback"><img src={photo} alt={ar ? 'الصورة الأصلية' : 'Original photograph'} /><p>{ar ? 'المعاينة ثلاثية الأبعاد غير مدعومة في هذا المتصفح.' : '3D preview is unavailable in this browser.'}</p></div>}
    <span className="viewer-hint">{ar ? 'اسحب لرؤية عمق النقش' : 'Drag to inspect the relief'}</span>
  </div>
}
