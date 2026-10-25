import { useCallback, useEffect, useRef, useState } from 'react'
import { works } from '../data'
import { gsap, reducedMotion, ScrollTrigger, startScroll, stopScroll } from '../lib/motion'
import { createRoom } from '../three/room'
import { drawPoster } from '../three/posters'
import { createSystemMap, createTerminal } from '../three/walls'
import { Jitter, Roll } from './Type'

const pad = (n) => String(n).padStart(2, '0')

function CaseModal({ work, index, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!work) return
    stopScroll()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    gsap.fromTo(ref.current, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'expo.inOut' })
    ref.current.querySelector('button')?.focus()
    return () => { window.removeEventListener('keydown', onKey); startScroll() }
  }, [work, onClose])
  if (!work) return null
  return (
    <div className="case" ref={ref} role="dialog" aria-modal="true" aria-label={work.title} data-lenis-prevent>
      <div className="case-top mono">
        <span>CASE {pad(index + 1)}/{pad(works.length)}</span>
        <button onClick={onClose}>[ <Roll>CLOSE</Roll> ]</button>
      </div>
      <p className="case-cat mono">{work.category.toUpperCase()} — {work.org.toUpperCase()} — {work.year}</p>
      <h2 className="case-title">{work.title.toUpperCase()}</h2>
      <div className="case-grid">
        <div className="case-metric" style={{ '--acc': work.accent }}>
          <strong>{work.metric}</strong>
          <span className="mono">{work.metricLabel.toUpperCase()}</span>
        </div>
        <div className="case-body mono">
          <p className="case-summary">{work.summary.toUpperCase()}</p>
          <p className="case-sub">WHAT I DID ↘</p>
          <ul>{work.bullets.map((b) => <li key={b}>/ {b}</li>)}</ul>
          <p className="case-sub">STACK ↘</p>
          <p>{work.stack.join(' / ').toUpperCase()}</p>
        </div>
      </div>
    </div>
  )
}

export default function Works() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const roomRef = useRef(null)
  const postersRef = useRef([])
  const wallsRef = useRef([])
  const cursorRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [landed, setLanded] = useState(false)
  const [open, setOpen] = useState(null)
  const closeCase = useCallback(() => setOpen(null), [])

  // build the scene once fonts are ready, so the posters use the right typefaces
  useEffect(() => {
    let room
    let disposed = false
    const ctx = gsap.context(() => {})
    document.fonts.ready.then(() => {
      if (disposed) return
      try {
        room = createRoom(canvasRef.current)
      } catch {
        stageRef.current.classList.add('no-webgl')
        return
      }
      roomRef.current = room
      postersRef.current = works.map((w, i) => drawPoster(w, i, works.length))
      room.setScreen(postersRef.current[0])
      wallsRef.current = [createTerminal(), createSystemMap()]
      wallsRef.current.forEach((d) => d.setWork(works[0]))
      room.setDisplays(wallsRef.current)

      ctx.add(() => {
        const st = ScrollTrigger.create({
          trigger: stageRef.current,
          start: 'top top',
          end: reducedMotion() ? '+=1' : '+=260%',
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const p = reducedMotion() ? 1 : Math.min(1, self.progress / 0.7)
            room.setProgress(p)
            setLanded(p >= 0.98)
            room.setPower(p >= 0.9)
          },
          onToggle: (self) => room.setActive(self.isActive),
        })
        // render while approaching/leaving the pinned range too
        ScrollTrigger.create({ trigger: stageRef.current, start: 'top bottom', end: 'bottom top', onToggle: (s) => room.setActive(s.isActive || st.isActive) })
        room.setProgress(reducedMotion() ? 1 : 0)
        room.renderOnce()
      })
      ScrollTrigger.refresh()
    })
    return () => { disposed = true; ctx.revert(); room?.dispose() }
  }, [])

  const show = (next) => {
    const room = roomRef.current
    const n = (next + works.length) % works.length
    setIndex(n)
    if (!room) return
    room.flicker()
    wallsRef.current.forEach((d) => d.setWork(works[n]))
    // projector "flicker" while the slide changes
    const c = room.screenMaterial.color
    gsap.timeline()
      .to(c, { r: 0.05, g: 0.05, b: 0.05, duration: 0.18, ease: 'power2.in' })
      .add(() => room.setScreen(postersRef.current[n]))
      .to(c, { r: 1.6, g: 1.6, b: 1.6, duration: 0.08 })
      .to(c, { r: 1, g: 1, b: 1, duration: 0.4, ease: 'power2.out' })
  }

  // swipe / drag to change slides once landed
  const drag = useRef(null)
  const onDown = (e) => { drag.current = e.clientX }
  const onMove = (e) => {
    const c = cursorRef.current
    if (!c) return
    const r = stageRef.current.getBoundingClientRect()
    c.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
    c.classList.toggle('hide', !!e.target.closest('button'))
  }
  const onUp = (e) => {
    if (drag.current == null) return
    const dx = e.clientX - drag.current
    drag.current = null
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1))
  }

  useEffect(() => {
    if (!landed) return
    const onKey = (e) => {
      if (open) return
      if (e.key === 'ArrowRight') show(index + 1)
      if (e.key === 'ArrowLeft') show(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const work = works[index]
  return (
    <section id="works" className="works dark" ref={sectionRef}>
      <div className="works-head">
        <Jitter as="h2" text="RECENT WORKS" className="works-title" />
      </div>
      <div className="stage" ref={stageRef} onPointerDown={onDown} onPointerUp={onUp} onPointerMove={onMove}>
        <canvas ref={canvasRef} className="room" aria-label="3D gallery showing recent work" />
        <div className={`stage-ui ${landed ? 'on' : ''}`} aria-hidden={!landed}>
          <p className="stage-name mono">{work.title.toUpperCase()}</p>
          <p className="stage-count mono">{index + 1}/{works.length}</p>
          <div className="stage-ctrl mono">
            <button onClick={() => show(index - 1)} aria-label="Previous work" tabIndex={landed ? 0 : -1}>←</button>
            <button className="view" onClick={() => setOpen(index)} tabIndex={landed ? 0 : -1}>[ <Roll>VIEW CASE</Roll> ]</button>
            <button onClick={() => show(index + 1)} aria-label="Next work" tabIndex={landed ? 0 : -1}>→</button>
          </div>
          <p className="stage-hint mono">DRAG TO SWITCH · MOVE TO LOOK AROUND</p>
        </div>
        <span ref={cursorRef} className={`stage-cursor mono ${landed ? 'on' : ''}`} aria-hidden="true">← DRAG →</span>
        <ol className="works-fallback">
          {works.map((w, i) => (
            <li key={w.id}><button onClick={() => setOpen(i)}>{pad(i + 1)} — {w.title.toUpperCase()} <span>{w.metric}</span></button></li>
          ))}
        </ol>
      </div>
      <CaseModal work={open === null ? null : works[open]} index={open ?? 0} onClose={closeCase} />
    </section>
  )
}
