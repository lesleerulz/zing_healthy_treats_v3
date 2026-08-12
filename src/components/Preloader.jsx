import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStallGuard } from '../hooks/useStallGuard.js'

export default function Preloader({ sources, onReveal }) {
  const root = useRef(null)
  const count = useRef(null)
  const done = useRef(false)
  const reveal = useRef(onReveal)
  const [gone, setGone] = useState(false)

  reveal.current = onReveal

  useEffect(() => {
    const total = sources.length || 1
    let loaded = 0
    let failsafe = null

    const ctx = gsap.context(() => {
      const finish = () => {
        if (done.current) return
        done.current = true
        clearTimeout(failsafe)

        gsap
          .timeline()
          .to('.pl-word span', { y: 0, duration: 1, ease: 'power4.out', delay: 0.15 })
          .to(root.current, { yPercent: -100, duration: 1.1, ease: 'power4.inOut', delay: 0.55 })
          .add(() => reveal.current?.(), '-=0.55')
          .add(() => setGone(true))
      }

      const bump = () => {
        loaded += 1
        const progress = loaded / total
        if (count.current) {
          count.current.textContent = String(Math.round(progress * 100)).padStart(3, '0')
        }
        gsap.to('.pl-bar i', { scaleX: progress, duration: 0.4, ease: 'power2.out' })
        if (loaded >= total) finish()
      }

      sources.forEach((src) => {
        const img = new Image()
        img.onload = bump
        img.onerror = bump
        img.src = src
      })

      failsafe = setTimeout(finish, 9000)
      return () => clearTimeout(failsafe)
    }, root)

    return () => ctx.revert()
  }, [sources])

  useStallGuard(() => {
    if (done.current && gone) return
    done.current = true
    reveal.current?.()
    setGone(true)
  })

  if (gone) return null

  return (
    <div id="preloader" ref={root}>
      <div className="pl-word">
        <span>ZING</span>
      </div>
      <div className="pl-bar">
        <i />
      </div>
      <div className="pl-count" ref={count}>
        000
      </div>
    </div>
  )
}
