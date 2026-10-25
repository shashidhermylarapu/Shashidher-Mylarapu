import { useEffect } from 'react'
import Preloader from './components/Preloader'
import Header from './components/Header'
import Hero, { useCopyToast } from './components/Hero'
import Manifesto from './components/Manifesto'
import Works from './components/Works'
import { About, Credentials, Expertise } from './components/Sections'
import { Contact, Footer } from './components/Contact'
import { initSmoothScroll, ScrollTrigger } from './lib/motion'

export default function App() {
  const [copied, copy] = useCopyToast()

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    initSmoothScroll()
    // fonts change text metrics, so re-measure every trigger once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <a href="#main" className="skip">Skip to main content</a>
      <Preloader />
      <Header />
      <main id="main">
        <Hero onCopy={copy} />
        <Manifesto />
        <Works />
        <About />
        <Expertise />
        <Credentials />
        <Contact />
      </main>
      <Footer onCopy={copy} />
      <div className={`toast mono ${copied ? 'show' : ''}`} role="status">{copied ? 'EMAIL COPIED' : ''}</div>
    </>
  )
}
