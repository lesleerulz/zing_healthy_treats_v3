import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Elements that swell the cursor ring. Matched by delegation on every move so
 * that nodes mounted later (route changes, generated lists) are covered too.
 */
const HOVER_SELECTOR = 'a, button, .look, .d-media, .principle, .a-item'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cx = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' })
      const cy = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' })
      const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
      const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })

      const onMove = (e) => {
        cx(e.clientX)
        cy(e.clientY)
        rx(e.clientX)
        ry(e.clientY)
        const over = e.target instanceof Element && e.target.closest(HOVER_SELECTOR)
        ring.current.classList.toggle('is-hover', !!over)
      }

      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      <div className="cursor" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  )
}
