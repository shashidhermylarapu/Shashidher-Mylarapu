import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { manifesto } from '../data'
import { gsap, isTouch, reducedMotion, ScrollTrigger } from '../lib/motion'

const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter

// Once the section is pinned and read, every letter becomes a physics body and drops
export default function Manifesto() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const section = sectionRef.current
    const letters = [...textRef.current.querySelectorAll('.ml')]
    let engine = null
    let raf = 0
    let state = 'idle' // idle | dropped
    let items = []

    const drop = () => {
      if (state === 'dropped') return
      state = 'dropped'
      const box = section.getBoundingClientRect()
      engine = Engine.create({ gravity: { y: 1.15 } })
      const w = box.width
      const h = box.height
      const wall = 200
      Composite.add(engine.world, [
        Bodies.rectangle(w / 2, h + wall / 2 - 2, w * 2, wall, { isStatic: true }),
        Bodies.rectangle(-wall / 2, h / 2, wall, h * 4, { isStatic: true }),
        Bodies.rectangle(w + wall / 2, h / 2, wall, h * 4, { isStatic: true }),
      ])
      items = letters.map((el) => {
        const r = el.getBoundingClientRect()
        const x = r.left - box.left + r.width / 2
        const y = r.top - box.top + r.height / 2
        const body = Bodies.rectangle(x, y, r.width * 0.9, r.height * 0.68, {
          restitution: 0.2, friction: 0.5, frictionAir: 0.012, density: 0.002, chamfer: { radius: 6 },
        })
        // made static afterwards (not via the option) so Matter keeps the mass needed to release it
        Body.setStatic(body, true)
        Composite.add(engine.world, body)
        return { el, body, ox: x, oy: y }
      })
      // release letters progressively, bottom lines first, so the text crumbles
      const sorted = [...items].sort((a, b) => b.oy - a.oy || Math.random() - 0.5)
      sorted.forEach((it, i) => {
        setTimeout(() => {
          if (state !== 'dropped') return
          Body.setStatic(it.body, false)
          Body.setAngularVelocity(it.body, gsap.utils.random(-0.06, 0.06))
          Body.setVelocity(it.body, { x: gsap.utils.random(-1.5, 1.5), y: gsap.utils.random(-1, 0.5) })
        }, i * 22 + gsap.utils.random(0, 120))
      })

      if (!isTouch()) {
        const mouse = Mouse.create(section)
        // let the page keep scrolling over the canvas-less physics layer
        section.removeEventListener('wheel', mouse.mousewheel)
        section.removeEventListener('mousewheel', mouse.mousewheel)
        section.removeEventListener('DOMMouseScroll', mouse.mousewheel)
        Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }))
        section.classList.add('grabbable')
      }

      const step = () => {
        Engine.update(engine, 1000 / 60)
        for (const it of items) {
          const { x, y } = it.body.position
          it.el.style.transform = `translate(${x - it.ox}px, ${y - it.oy}px) rotate(${it.body.angle}rad)`
        }
        raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    const reset = () => {
      if (state !== 'dropped') return
      state = 'idle'
      cancelAnimationFrame(raf)
      if (engine) { Composite.clear(engine.world, false); Engine.clear(engine) }
      engine = null
      section.classList.remove('grabbable')
      gsap.to(letters, { x: 0, y: 0, rotation: 0, duration: 0.9, ease: 'expo.out', stagger: 0.004, clearProps: 'transform' })
    }

    const ctx = gsap.context(() => {
      gsap.from('.ml-line', { yPercent: 40, opacity: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 70%' } })
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=140%',
        pin: true,
        onUpdate: (self) => {
          if (self.progress > 0.42) drop()
          else if (self.progress < 0.12) reset()
        },
      })
    }, section)

    return () => { cancelAnimationFrame(raf); ctx.revert() }
  }, [])

  return (
    <section className="manifesto dark" ref={sectionRef} aria-label="Philosophy">
      <div className="mf-top">
        <span className="mf-count">2/5</span>
        <span className="mf-label mono">FOR ME</span>
        <span className="mf-code">MLE/2</span>
      </div>
      <p className="sr-only">{manifesto.map((l) => l.text).join(' ')}</p>
      <div className="mf-text" ref={textRef} aria-hidden="true">
        {manifesto.map((line, li) => (
          <div key={li} className={`ml-line ${line.dim ? 'dim' : ''}`}>
            {line.text.split(' ').map((word, wi) => (
              <span key={wi} className="ml-word">
                {[...word].map((c, ci) => <span key={ci} className="ml">{c}</span>)}
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className="mf-hint mono">DRAG THE LETTERS</span>
    </section>
  )
}
