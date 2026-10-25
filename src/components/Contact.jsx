import { useEffect, useRef, useState } from 'react'
import { nav, profile, roleTypes } from '../data'
import { scrollToTarget } from '../lib/motion'
import { FitText, Jitter, Roll, useReveal } from './Type'

export function Contact() {
  const ref = useRef(null)
  useReveal(ref)
  const [role, setRole] = useState(roleTypes[0])
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const v = Object.fromEntries(f.entries())
    const errs = {}
    if (!v.name?.trim()) errs.name = 'PLEASE ADD YOUR NAME'
    if (!/^\S+@\S+\.\S+$/.test(v.email || '')) errs.email = 'PLEASE ADD A VALID EMAIL'
    setErrors(errs)
    if (Object.keys(errs).length) return
    // no backend: hand the message to the visitor's mail app
    const body = [
      `Name: ${v.name}`,
      v.company ? `Company: ${v.company}` : null,
      `Email: ${v.email}`,
      `Role type: ${role}`,
      '',
      v.message || '',
    ].filter((l) => l !== null).join('\n')
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`${role} role — ${v.name}`)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section id="contact" className="contact light" ref={ref}>
      <p className="ct-kicker" data-reveal>LET’S START THE CONVERSATION</p>
      <Jitter as="h2" text="GREAT MODELS" className="ct-big" />
      <p className="ct-spaced" aria-hidden="true">{'STARTS WITH'.split(' ').map((w) => <span key={w}>{w}</span>)}</p>
      <Jitter as="p" text="GREAT COLLABORATION" className="ct-big ct-wide" />

      <form className="ct-form mono" onSubmit={submit} noValidate data-reveal>
        <label className={errors.name ? 'err' : ''}>
          <span>YOUR NAME*</span>
          <input name="name" autoComplete="name" />
          {errors.name && <em>{errors.name}</em>}
        </label>
        <label>
          <span>COMPANY</span>
          <input name="company" autoComplete="organization" />
        </label>
        <label className={errors.email ? 'err' : ''}>
          <span>YOUR EMAIL*</span>
          <input name="email" type="email" autoComplete="email" />
          {errors.email && <em>{errors.email}</em>}
        </label>
        <label>
          <span>HOW CAN I HELP YOU</span>
          <textarea name="message" rows="3" />
        </label>
        <fieldset>
          <legend>ROLE TYPE</legend>
          <div className="ct-roles">
            {roleTypes.map((r) => (
              <button type="button" key={r} className={r === role ? 'on' : ''} aria-pressed={r === role} onClick={() => setRole(r)}>{r.toUpperCase()}</button>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="ct-submit"><Roll>DISCUSS THE ROLE</Roll> <span>→</span></button>
        {sent && <p className="ct-sent">THANK YOU. YOUR EMAIL APP SHOULD OPEN WITH THE MESSAGE READY.</p>}
      </form>
    </section>
  )
}

function Clock() {
  const fmt = () => {
    const now = new Date()
    const time = new Intl.DateTimeFormat('en-US', { timeZone: profile.timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
    const zone = new Intl.DateTimeFormat('en-US', { timeZone: profile.timezone, timeZoneName: 'shortOffset' }).formatToParts(now).find((p) => p.type === 'timeZoneName')?.value
    return `(${zone}) ${time}`
  }
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 10000)
    return () => clearInterval(id)
  }, [])
  return <span>MANCHESTER, NH: {t}</span>
}

export function Footer({ onCopy }) {
  const go = (id) => (e) => { e.preventDefault(); scrollToTarget(id) }
  return (
    <footer className="footer light" id="footer">
      <div className="ft-grid">
        <div className="ft-big">
          <a href={profile.phoneHref}>{profile.phone}</a>
          <a href={`mailto:${profile.email}`} onClick={() => onCopy(profile.email)}>{profile.email}</a>
        </div>
        <div className="ft-social">
          <a href={profile.linkedin} target="_blank" rel="noreferrer"><Roll>LINKEDIN</Roll> ↗</a>
          <a href={profile.github} target="_blank" rel="noreferrer"><Roll>GITHUB</Roll> ↗</a>
          <a href={profile.resume} target="_blank" rel="noreferrer"><Roll>RÉSUMÉ</Roll> ↗</a>
        </div>
        <nav className="ft-menu mono" aria-label="Footer">
          {nav.slice(0, 3).map((n) => <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}><Roll>{n.label.toUpperCase()}</Roll></a>)}
        </nav>
        <p className="ft-address mono">Based in:<br />{profile.city}<br />{profile.country}</p>
      </div>
      <div className="ft-brackets mono">
        <button onClick={() => onCopy(profile.email)}>[ <Roll>COPY EMAIL</Roll> ]</button>
        <a href={profile.resume} download>[ <Roll>DOWNLOAD CV</Roll> ]</a>
        <a href="#top" onClick={go('top')}>[ <Roll>BACK TO TOP</Roll> ]</a>
      </div>
      <div className="ft-name-wrap">
        <FitText as="p" className="ft-name" aria-label={profile.name}>{profile.name.toUpperCase()}</FitText>
      </div>
      <div className="ft-bottom mono">
        <Clock />
        <span>AI/ML ENGINEER — {new Date().getFullYear()}</span>
        <span className="ft-legal">{new Date().getFullYear()} All rights reserved. {profile.name}<br />Built with React, Three.js, GSAP &amp; Matter.js.</span>
      </div>
    </footer>
  )
}
