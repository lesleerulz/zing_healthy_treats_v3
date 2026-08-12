import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLenis } from '../hooks/useLenis.jsx'
import { useTimeOfDay } from '../hooks/useTimeOfDay'

export default function SiteChrome({ links }) {
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const { pathname } = useLocation()
  const timeOfDay = useTimeOfDay()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    if (open) lenis?.stop()
    else lenis?.start()

    return () => {
      document.body.classList.remove('menu-open')
      lenis?.start()
    }
  }, [open, lenis])

  const handleAnchor = (event, hash) => {
    event.preventDefault()
    setOpen(false)
    lenis?.scrollTo(hash, { duration: 1.6 })
  }

  const renderLink = (link, index) => {
    const key = link.to ?? link.hash
    const ordinal = <i>{String(index + 1).padStart(2, '0')}</i>

    if (link.hash) {
      return (
        <a key={key} href={link.hash} onClick={(e) => handleAnchor(e, link.hash)}>
          {ordinal}
          {link.label}
        </a>
      )
    }
    return (
      <Link key={key} to={link.to} aria-current={pathname === link.to ? 'page' : undefined}>
        {ordinal}
        {link.label}
      </Link>
    )
  }

  return (
    <>
      <header className="site-head">
        <Link className="logo" to="/">
          ZING
        </Link>
        <nav>
          {links.map((link) =>
            link.hash ? (
              <a key={link.hash} href={link.hash} onClick={(e) => handleAnchor(e, link.hash)}>
                {link.label}
              </a>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                aria-current={pathname === link.to ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </header>

      <button
        className="burger"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="mnav">
        {links.map(renderLink)}
        <div className="mnav-foot">
          <span>BATCH №7</span>
          <span>THE {timeOfDay.label} ROAST</span>
        </div>
      </div>
    </>
  )
}
