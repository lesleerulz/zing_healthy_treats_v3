import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/** Fixed chapter readout plus the page-wide scroll progress hairline. */
export default function ChapterTag({ num, label }) {
  const numRef = useRef(null)
  const labelRef = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(lineRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [numRef.current, labelRef.current],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      )
    })
    return () => ctx.revert()
  }, [num, label])

  return (
    <div className="chapter-tag">
      <span className="ct-num" ref={numRef}>
        {num}
      </span>
      <span className="ct-line">
        <i ref={lineRef} />
      </span>
      <span className="ct-label" ref={labelRef}>
        {label}
      </span>
    </div>
  )
}
