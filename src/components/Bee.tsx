import { useEffect, useState } from 'react'
import { motion, useAnimate, useReducedMotion, useSpring } from 'motion/react'
import { asset } from '@/lib/catalog'
let hasFlownThisPage = false
export function Bee() {
  const reduced = useReducedMotion()
  const [arrived, setArrived] = useState(hasFlownThisPage || Boolean(reduced))
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const x = useSpring(0, { stiffness: 80, damping: 20 })
  const y = useSpring(0, { stiffness: 80, damping: 20 })
  const rotate = useSpring(0, { stiffness: 80, damping: 20 })
  useEffect(() => {
    if (reduced || arrived || !scope.current) return
    const node = scope.current
    const home = node.parentElement!.getBoundingClientRect()
    const rect = { left: home.left + (home.width - node.offsetWidth) / 2, top: home.top + (home.height - node.offsetHeight) / 2, width: node.offsetWidth, height: node.offsetHeight }
    const mobile = innerWidth < 768
    const limitX = Math.max(30, innerWidth - rect.width - 30)
    const limitY = Math.max(80, innerHeight - rect.height - 30)
    const points = mobile
      ? [[30, rect.top + 65], [innerWidth * .45, rect.top + 145], [limitX - 12, rect.top + 52], [rect.left, rect.top]]
      : [[45, rect.top - 75], [innerWidth * .34, rect.top + 35], [innerWidth * .62, rect.top - 105], [rect.left, rect.top]]
    let cancelled = false
    const flight = animate(node, {
      x: points.map((p, i) => i === 3 ? 0 : Math.max(25, Math.min(limitX, p[0])) - rect.left),
      y: points.map((p, i) => i === 3 ? 0 : Math.max(80, Math.min(limitY, p[1])) - rect.top),
      rotate: [-14, 12, -9, 0], opacity: [1, 1, 1, 1],
    }, { duration: 2, times: [0, .32, .65, 1], ease: 'easeInOut' })
    flight.then(() => { if (!cancelled) { hasFlownThisPage = true; setArrived(true) } })
    return () => { cancelled = true; flight.stop() }
  }, [animate, arrived, reduced, scope])
  useEffect(() => {
    if (reduced || !arrived) return
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const dx = (event.clientX / innerWidth - .5) * 2
      const dy = (event.clientY / innerHeight - .5) * 2
      x.set(dx * 12); y.set(dy * 9); rotate.set(dx * 4)
    }
    const reset = () => { x.set(0); y.set(0); rotate.set(0) }
    window.addEventListener('pointermove', move); document.addEventListener('pointerleave', reset)
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', reset) }
  }, [arrived, reduced, x, y, rotate])
  return <motion.div ref={scope} className="bee-arrival" data-arrived={arrived || Boolean(reduced)} data-phase={arrived || reduced ? 'landed' : 'flying'} style={{ opacity: arrived || reduced ? 1 : 0 }}>
    <motion.img className="hero-bee" src={asset('brand/elike-bee.svg')} height="105" alt="" style={{ aspectRatio: '114 / 67', ...(reduced ? {} : { x, y, rotate }) }} />
  </motion.div>
}
