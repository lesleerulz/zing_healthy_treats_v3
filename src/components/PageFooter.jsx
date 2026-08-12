import { Link } from 'react-router-dom'
import { useTimeOfDay } from '../hooks/useTimeOfDay'

export default function PageFooter() {
  const timeOfDay = useTimeOfDay()
  return (
    <footer className="page-foot" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '4rem 2rem 2rem' }}>
      <div className="newsletter-capture" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h4 style={{ fontFamily: "'Italiana', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--bone)', fontWeight: 400 }}>JOIN THE CLUB</h4>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--ash)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Leave your email to hear about new roasts and private batches.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); e.target.reset(); alert('Welcome to the Zing VIP list.') }} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="email" placeholder="YOUR EMAIL ADDRESS" required style={{ flex: 1, padding: '0.8rem 1rem', background: 'transparent', border: '1px solid var(--line)', color: 'var(--bone)', fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em' }} />
          <button type="submit" style={{ padding: '0.8rem 1.5rem', background: 'var(--bone)', color: 'var(--ink)', border: 'none', fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer' }}>SUBSCRIBE</button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '1px solid var(--line)', paddingTop: '2rem', fontSize: '0.7rem', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', color: 'var(--ash)' }}>
        <span>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>← BACK TO THE {timeOfDay.label} ROAST</Link>
        </span>
        <span>© MMXXVI ZING HEALTHY TREATS</span>
      </div>
    </footer>
  )
}
