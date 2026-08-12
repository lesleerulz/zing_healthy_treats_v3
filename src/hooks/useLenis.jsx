import { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext(null)

/** Returns the app-wide Lenis instance (null on the very first render). */
export const useLenis = () => useContext(LenisContext)

/**
 * Owns the single Lenis instance and drives it from the GSAP ticker so that
 * ScrollTrigger and the smooth-scroll layer never fight over rAF.
 */
export function SmoothScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 1.05, smoothWheel: true })
    const raf = (time) => instance.raf(time * 1000)

    instance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)

    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
