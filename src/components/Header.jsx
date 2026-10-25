import { useEffect, useState } from 'react'
import { nav, profile } from '../data'
import { scrollToTarget, startScroll, stopScroll } from '../lib/motion'
import { Roll } from './Type'

export default function Header() {
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    if (!menu) return
    stopScroll()
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => { startScroll(); window.removeEventListener('keydown', onKey) }
  }, [menu])

  const go = (id) => (e) => {
    e.preventDefault()
    setMenu(false)
    setTimeout(() => scrollToTarget(id), menu ? 60 : 0)
  }

  return (
    <>
      <header className="header">
        <a href="#top" className="logo" onClick={go('top')} aria-label={`${profile.name}, back to top`}>
          <span>{profile.first}</span>
          <span>{profile.last}</span>
        </a>
        <nav className="nav mono" aria-label="Main">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}>
              <span className="br">[</span> <Roll>{n.label.toUpperCase()}</Roll> <span className="br">]</span>
            </a>
          ))}
        </nav>
        <a href="#contact" className="contact-link" onClick={go('contact')}>
          <Roll>CONTACT ME</Roll> <span className="arr">↗</span>
        </a>
        <button className="menu-btn mono" onClick={() => setMenu(true)} aria-haspopup="dialog">MENU<sup>+</sup></button>
      </header>

      <div className={`mmenu ${menu ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!menu}>
        <button className="mmenu-close mono" onClick={() => setMenu(false)} tabIndex={menu ? 0 : -1}>CLOSE ✕</button>
        <nav>
          {nav.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)} tabIndex={menu ? 0 : -1} style={{ '--d': `${i * 60}ms` }}>
              <span className="mono">0{i + 1}</span>{n.label.toUpperCase()}
            </a>
          ))}
        </nav>
        <div className="mmenu-foot mono">
          <a href={`mailto:${profile.email}`} tabIndex={menu ? 0 : -1}>{profile.email}</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" tabIndex={menu ? 0 : -1}>LINKEDIN ↗</a>
        </div>
      </div>
    </>
  )
}
