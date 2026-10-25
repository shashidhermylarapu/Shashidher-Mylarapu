import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/motion'

// Hover effect: each letter rolls up and is replaced by its copy from below
export function Roll({ children, className = '' }) {
  const chars = [...String(children)]
  const row = (hidden) => (
    <span className="roll-row" aria-hidden={hidden || undefined}>
      {chars.map((c, i) => (
        <span key={i} className="roll-char" style={{ '--i': i }}>{c === ' ' ? ' ' : c}</span>
      ))}
    </span>
  )
  return (
    <span className={`roll ${className}`}>
      <span className="sr-only">{children}</span>
      <span className="roll-inner" aria-hidden="true">{row()}{row(true)}</span>
    </span>
  )
}

// Scales a single-line heading so it exactly fills its container's width
export function FitText({ as: Tag = 'h2', children, className = '', ...rest }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    const fit = () => {
      el.style.fontSize = '100px'
      const w = el.scrollWidth
      const target = el.parentElement.clientWidth
      if (w > 0) el.style.fontSize = `${(100 * target) / w}px`
    }
    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [children])
  return <Tag ref={ref} className={`fit ${className}`} {...rest}>{children}</Tag>
}

// Heading whose letters start scattered (offset, stretched) and settle into line while scrolling
export function Jitter({ as: Tag = 'h2', text, className = '', fit = false, start = 'top 95%', end = 'center 55%' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    let ro = null
    if (fit) {
      const doFit = () => {
        el.style.fontSize = '100px'
        const w = el.scrollWidth
        if (w > 0) el.style.fontSize = `${(100 * el.parentElement.clientWidth) / w}px`
      }
      doFit()
      document.fonts?.ready.then(doFit)
      ro = new ResizeObserver(doFit)
      ro.observe(el.parentElement)
    }
    if (reducedMotion()) return () => ro?.disconnect()
    const letters = el.querySelectorAll('.jl')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        letters,
        {
          yPercent: () => gsap.utils.random(-45, 45),
          scaleY: () => gsap.utils.random(0.55, 1.45),
          scaleX: () => gsap.utils.random(0.8, 1.15),
          transformOrigin: '50% 100%',
        },
        { yPercent: 0, scaleY: 1, scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start, end, scrub: 0.6 } }
      )
    }, el)
    return () => { ctx.revert(); ro?.disconnect() }
  }, [text, fit, start, end])
  return (
    <Tag ref={ref} className={`jitter ${className}`} aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} className="jl" aria-hidden="true">{c === ' ' ? ' ' : c}</span>
      ))}
    </Tag>
  )
}

// Fades and lifts children into place as they enter the viewport
export function useReveal(scopeRef, selector = '[data-reveal]') {
  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el) => {
        gsap.from(el, {
          y: 50, opacity: 0, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        })
      })
    }, scopeRef)
    return () => ctx.revert()
  }, [scopeRef, selector])
}
