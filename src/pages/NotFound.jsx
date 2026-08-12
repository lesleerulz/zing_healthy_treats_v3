import { Link } from 'react-router-dom'
import SiteChrome from '../components/SiteChrome.jsx'
import PageFooter from '../components/PageFooter.jsx'
import { NAV_PAGE } from '../data/collection.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function NotFound() {
  useDocumentTitle('NOT FOUND — ZING HEALTHY TREATS')

  return (
    <div>
      <SiteChrome links={NAV_PAGE} />
      <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 2rem' }}>
        <h1 style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(4rem, 10vw, 8rem)', margin: 0, fontWeight: 400, color: 'var(--bone)' }}>404</h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontStyle: 'italic', margin: '1rem 0 3rem', color: 'var(--ash)' }}>
          You've wandered outside the orchard boundaries.
        </p>
        <Link to="/pantry" className="hero-cta" style={{ display: 'inline-block', padding: '1.2rem 2.5rem', border: '1px solid var(--bone)', borderRadius: '4px', color: 'var(--bone)', fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', letterSpacing: '0.2em', textDecoration: 'none', transition: 'all 0.3s ease' }}>
          RETURN TO THE PANTRY →
        </Link>
      </main>
      <PageFooter />
    </div>
  )
}
