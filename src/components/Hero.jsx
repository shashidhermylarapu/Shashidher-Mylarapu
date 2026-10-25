import { useEffect, useRef, useState } from 'react'
import { heroRoles, profile } from '../data'
import { gsap, READY_EVENT, reducedMotion, scrollToTarget } from '../lib/motion'
import { FitText } from './Type'

// Digits roll through 0–9 reels into place, like an odometer
function Counter({ value, run }) {
  return (
    <span className="counter" aria-label={value}>
      {[...value].map((c, i) =>
        /\d/.test(c) ? (
          <span key={i} className="reel" aria-hidden="true">
            <span className="reel-strip" style={{ transform: run ? `translateY(-${(10 + Number(c)) * 10 / 2}%)` : 'translateY(0)', transitionDelay: `${i * 0.12}s` }}>
              {[...'01234567890123456789'].map((d, k) => <span key={k}>{d}</span>)}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">{c}</span>
        )
      )}
    </span>
  )
}

export function useCopyToast() {
  const [copied, setCopied] = useState(false)
  const copy = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }
  return [copied, copy]
}

export default function Hero({ onCopy }) {
  const ref = useRef(null)
  const [run, setRun] = useState(false)
  const [conf, setConf] = useState(0)
  const [scan, setScan] = useState(false)

  // the "model" re-detects the face: scan line sweeps and confidence counts up again
  const rescan = () => {
    if (scan) return
    setScan(true)
    const o = { v: 0 }
    gsap.to(o, { v: 0.99, duration: reducedMotion() ? 0 : 1.4, ease: 'power3.out', onUpdate: () => setConf(o.v) })
    setTimeout(() => setScan(false), 1500)
  }

  useEffect(() => {
    const el = ref.current
    const ctx = gsap.context(() => {
      const letters = el.querySelectorAll('.ht')
      const intro = () => {
        setRun(true)
        setTimeout(rescan, reducedMotion() ? 0 : 1600)
        if (reducedMotion()) return
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from(letters, { yPercent: 110, duration: 1.3, stagger: 0.035 })
          .from('.hero-card', { scaleY: 0, transformOrigin: '50% 0%', duration: 1.2 }, 0.2)
          .from('.hero-photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.4 }, 0.35)
          .from('[data-hero]', { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.5)
      }
      window.addEventListener(READY_EVENT, intro, { once: true })

      if (!reducedMotion()) {
        // gentle depth while scrolling away
        gsap.to('.hero-title-wrap', { yPercent: -35, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('.hero-photo', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
      }
      return () => window.removeEventListener(READY_EVENT, intro)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="top" className="hero light" ref={ref}>
      <div className="hero-num" data-hero>
        <Counter value="99.5" run={run} /><span className="mono hero-num-label">% inference<br />availability</span>
      </div>

      <h1 className="sr-only">{profile.name}, AI/ML Engineer</h1>
      <div className="hero-title-wrap" aria-hidden="true">
        <FitText as="p" className="hero-title">
          {[...'AI/ML ENGINEER'].map((c, i) => (
            <span key={i} className="ht-mask"><span className="ht">{c === ' ' ? ' ' : c}</span></span>
          ))}
        </FitText>
      </div>
      <p className="hero-title-m" aria-hidden="true">
        {['AI/ML', 'ENGINEER'].map((w) => (
          <span key={w} className="ht-mask"><span className="ht">{w}</span></span>
        ))}
      </p>

      <p className="hero-based" data-hero aria-label={`Based in ${profile.location}`}>
        {'BASED IN MANCHESTER, NH'.split(' ').map((w, i) => <span key={i}>{w}</span>)}
      </p>

      <div className="hero-card" aria-hidden="true" />
      <div className={`hero-photo ${scan ? 'scanning' : ''}`} onMouseEnter={rescan}>
        <img src={profile.photo} alt={`Portrait of ${profile.name}`} width="460" height="460" />
        <div className={`detect ${run ? 'on' : ''}`} aria-hidden="true">
          <i /><i /><i /><i />
          <span className="detect-label mono">PERSON {conf.toFixed(2)} · AI/ML ENGINEER</span>
          <span className="detect-meta mono">bbox [0.28, 0.21, 0.72, 0.72]</span>
        </div>
        <span className="detect-scan" aria-hidden="true" />
      </div>
      <ul className="hero-roles">
        {heroRoles.map((r) => <li key={r} data-hero>/ {r.toUpperCase()}</li>)}
      </ul>

      <div className="hero-desc mono" data-hero>
        <p>AI/ML engineer building machine learning, deep learning and generative AI systems that hold up in production.</p>
        <p>MODEL. DEPLOY. MEASURE.</p>
      </div>

      <a className="hero-recent" href="#works" data-hero onClick={(e) => { e.preventDefault(); scrollToTarget('works') }}>
        <span className="mono">CURRENT ROLE ↘</span>
        <strong>FORD MOTOR COMPANY</strong>
      </a>

      <div className="hero-avail" data-hero>
        <span className="mono">AVAILABLE FOR COLLABORATION ↘</span>
        <a href={`mailto:${profile.email}`} onClick={() => onCopy(profile.email)}>{profile.email}</a>
      </div>
    </section>
  )
}
