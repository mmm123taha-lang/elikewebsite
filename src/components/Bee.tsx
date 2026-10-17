import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { asset } from '@/lib/catalog'
export function Bee() {
  const reduced = useReducedMotion()
  const [first] = useState(() => { try { return sessionStorage.getItem('elike-bee-arrived') !== 'yes' } catch { return true } })
  const [arrived, setArrived] = useState(!first)
  const x = useSpring(0, { stiffness: 80, damping: 20 })
  const y = useSpring(0, { stiffness: 80, damping: 20 })
  const rotate = useSpring(0, { stiffness: 80, damping: 20 })
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
  return <motion.div className="bee-arrival" data-arrived={arrived || reduced} initial={reduced || !first ? false : { x: -180, y: -100, rotate: -30, opacity: 0 }} animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ duration: first ? 1.35 : 0, ease: [.22, 1, .36, 1] }} onAnimationComplete={() => { setArrived(true); try { sessionStorage.setItem('elike-bee-arrived', 'yes') } catch { /* private browsing */ } }}>
    <motion.img className="hero-bee" src={asset('brand/elike-bee.svg')} height="105" alt="" style={reduced ? {} : { x, y, rotate }} />
  </motion.div>
}
