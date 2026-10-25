import { useEffect, useRef, useState } from 'react'
import { about, credentials, education, expertise, profile } from '../data'
import { gsap, reducedMotion, scrollToTarget } from '../lib/motion'
import { Jitter, useReveal } from './Type'

export function About() {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section id="about" className="about dark" ref={ref}>
      <div className="about-title-wrap">
        <Jitter as="h2" text="ABOUT ME" className="about-title" fit />
      </div>

      <div className="about-intro">
        <p className="about-label mono" data-reveal>ABOUT ME</p>
        <figure className="about-portrait" data-reveal>
          <img src={profile.photo} alt={`${profile.name}, AI/ML Engineer`} loading="lazy" width="460" height="460" />
          <figcaption className="mono">HELLO!<br />I’M {profile.name.toUpperCase()}</figcaption>
        </figure>
      </div>

      <div className="about-exp mono" data-reveal>
        <p className="about-k">MY EXPERIENCE <span>↘</span></p>
        <p className="about-p">{about.experience.toUpperCase()}</p>
      </div>

      <hr className="about-rule" />

      <p className="about-quote mono" data-reveal>
        {about.quote.map((l) => <span key={l}>{l.toUpperCase()}</span>)}
      </p>

      <p className="about-p about-work mono" data-reveal>{about.work.toUpperCase()}</p>

      <div className="about-phil mono" data-reveal>
        <p className="about-k">MY PHILOSOPHY <span>↘</span></p>
        <p className="about-p">{about.philosophy.toUpperCase()}</p>
      </div>

      <div className="about-life">
        <div className="life-cards">
          <figure className="life-a" data-reveal>
            <img src={profile.photo} alt="" loading="lazy" />
          </figure>
          <figure className="life-b mono" data-reveal aria-label="Training log">
            <pre>{`$ python train.py \\
  --model xgboost
  --cv 5

fold 1  ██████████
fold 2  ██████████
fold 3  ██████████
fold 4  ██████████
fold 5  ██████████

✓ f1 +8% vs
  previous model
✓ registered
  → staging`}</pre>
          </figure>
          <a href="#contact" className="life-cta" onClick={(e) => { e.preventDefault(); scrollToTarget('contact') }}>LETS CONTACT <span>↗</span></a>
        </div>
        <div className="life-text mono" data-reveal>
          <p className="about-k">MY APPROACH <span>↘</span></p>
          <p className="about-p">{about.approach.toUpperCase()}</p>
          <div className="life-closing">
            {about.closing.map((c) => <p key={c} className="about-p">{c.toUpperCase()}</p>)}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Expertise() {
  const [active, setActive] = useState(2)
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section id="expertise" className="expertise light" ref={ref}>
      <div className="sec-head">
        <Jitter as="h2" text="EXPERTISE" className="sec-title" />
        <span className="sec-code">MLE/4</span>
      </div>
      <div className="cols">
        {expertise.map((e, i) => (
          <article
            key={e.title}
            className={`col ${i === active ? 'is-active' : ''}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            tabIndex={0}
            aria-expanded={i === active}
          >
            <div className="col-head">
              <span className="col-num">00-{i + 1}</span>
              <h3 className="col-title">{e.title.toUpperCase()}</h3>
              <span className="col-title-big">// {e.title.toUpperCase()}</span>
            </div>
            <div className="col-body mono">
              <ul>{e.items.map((it) => <li key={it}>/ {it.toUpperCase()}</li>)}</ul>
              <p>{e.text.toUpperCase()}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Credentials() {
  const ref = useRef(null)
  const linesRef = useRef(null)
  useReveal(ref)
  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.cred-lines span', { scaleY: 1 }, { scaleY: 0, ease: 'none', scrollTrigger: { trigger: linesRef.current, start: 'top 70%', end: 'bottom top', scrub: true } })
      gsap.from('.cred-row', { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.cred-list', start: 'top 85%' } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section className="creds light" ref={ref} aria-labelledby="creds-title">
      <div className="cred-lines" ref={linesRef} aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="sec-head creds-head">
        <Jitter as="h2" text="CREDENTIALS" className="sec-title" />
        <span className="sec-code">MLE/5</span>
      </div>
      <div className="creds-intro">
        <p className="creds-lede mono" data-reveal>MY EXPERTISE IS CONFIRMED<br />BY <b>INDUSTRY CERTIFICATIONS</b><br /><b>&amp; MEASURED RESULTS</b></p>
        <p className="creds-callout" data-reveal><b>4+ YEARS IN AI/ML ENGINEERING</b><span className="mono">(MANUFACTURING &amp; ENTERPRISE AI) AT FORD · AUGUR</span></p>
      </div>
      <ul className="cred-list">
        {credentials.map((c) => (
          <li key={c.name}>
            <a className="cred-row" href={`${profile.linkedin}details/certifications/`} target="_blank" rel="noreferrer">
              <span className="cred-mark mono">{c.mark}</span>
              <span className="cred-name">{c.name.toUpperCase()}<sup className="mono">( {c.issuer} )</sup></span>
              <span className="cred-arr">↗</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="creds-edu">
        {education.map((e) => (
          <p key={e.short} className="mono" data-reveal>
            {e.degree.toUpperCase()} AT<br /><b>{e.short}</b> <span>{e.dates}</span>
          </p>
        ))}
      </div>
    </section>
  )
}
