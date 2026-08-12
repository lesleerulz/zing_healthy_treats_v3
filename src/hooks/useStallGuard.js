import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Watchdog: if rAF is throttled or stalled (background tab, weak device) the
 * entrance animations never run and content stays trapped at opacity 0.
 * When the ticker stops advancing, `recover` snaps everything to its end state.
 */
export function useStallGuard(recover) {
  const recoverRef = useRef(recover)
  recoverRef.current = recover

  useEffect(() => {
    let interval
    const start = setTimeout(() => {
      let last = gsap.ticker.frame
      interval = setInterval(() => {
        if (gsap.ticker.frame === last) recoverRef.current()
        last = gsap.ticker.frame
      }, 2500)
    }, 3000)

    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [])
}
