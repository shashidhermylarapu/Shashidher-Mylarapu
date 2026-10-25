import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isTouch = () => window.matchMedia('(hover: none)').matches

let lenis = null

// Smooth scrolling driven by GSAP's ticker so ScrollTrigger and Lenis stay in sync
export function initSmoothScroll() {
  if (lenis || reducedMotion()) return lenis
  lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.getElementById(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6, ...opts })
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
}

export const stopScroll = () => { lenis?.stop(); document.documentElement.classList.add('no-scroll') }
export const startScroll = () => { lenis?.start(); document.documentElement.classList.remove('no-scroll') }

// Signals the end of the preloader so sections can play their intro
export const READY_EVENT = 'site:ready'
