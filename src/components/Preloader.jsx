import { useEffect, useRef, useState } from 'react'
import { ringWords } from '../data'
import { gsap, reducedMotion, READY_EVENT, startScroll, stopScroll } from '../lib/motion'

const MIN_TIME = 2600

export default function Preloader() {
  const ref = useRef(null)
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    stopScroll()
    const t0 = performance.now()
    const fast = reducedMotion()
    let loaded = false
    const ready = Promise.all([document.fonts?.ready, new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })))])
    ready.then(() => { loaded = true })

    let raf
    const tick = () => {
      const elapsed = performance.now() - t0
      const timePct = Math.min(1, elapsed / (fast ? 300 : MIN_TIME))
      const p = loaded ? timePct : Math.min(timePct, 0.9)
      setPct(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else finish()
    }
    const finish = () => {
      gsap.to(ref.current, {
        yPercent: -100, duration: fast ? 0.01 : 1.1, ease: 'expo.inOut', delay: fast ? 0 : 0.25,
        onComplete: () => { setGone(true); startScroll(); window.scrollTo(0, 0); window.dispatchEvent(new Event(READY_EVENT)) },
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (gone) return null
  const step = 360 / ringWords.length
  return (
    <div ref={ref} className="preloader" aria-hidden="true">
      <div className="pl-stage">
        <div className="pl-ring">
          {ringWords.map((w, i) => (
            <span key={w} className={`pl-word ${i % 2 ? 'small' : ''}`} style={{ transform: `translate(-50%, -50%) rotateY(${i * step}deg) translateZ(var(--r))` }}>{w}</span>
          ))}
        </div>
        <span className="pl-center">MOVES</span>
      </div>
      <span className="pl-pct">{pct}%</span>
    </div>
  )
}
