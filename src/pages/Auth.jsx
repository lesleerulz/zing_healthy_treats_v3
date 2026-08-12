import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import gsap from 'gsap'
import SiteChrome from '../components/SiteChrome.jsx'
import PageFooter from '../components/PageFooter.jsx'
import { NAV_PAGE } from '../data/collection.js'
import '../styles/auth.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '50px', background: 'white', position: 'absolute', zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0 }}>
          <h1>Auth Page Crashed</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Auth() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth()
  const navigate = useNavigate()
  
  const formRef = useRef(null)

  useEffect(() => {
    if (!loading && user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (!loading && formRef.current) {
      gsap.fromTo(formRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      )
    }
  }, [isSignIn, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      if (isSignIn) {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage('Check your email for the confirmation link.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const { error } = await signInWithGoogle()
      if (error) throw error
      // Note: OAuth redirects, so code below might not run
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignIn(!isSignIn)
    setError('')
    setMessage('')
  }

  if (loading) {
    return (
      <>
        <SiteChrome links={NAV_PAGE} />
        <div className="auth-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: "var(--ash)" }}>LOADING...</p>
        </div>
        <PageFooter />
      </>
    )
  }

  return (
    <>
      <SiteChrome links={NAV_PAGE} />
      <div className="auth-page">
        <div className="auth-container" ref={formRef}>
          <h1 className="auth-title">{isSignIn ? 'Sign In' : 'Sign Up'}</h1>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-message error">{error}</div>}
            {message && <div className="auth-message success">{message}</div>}
            
            <div className="auth-field">
              <label htmlFor="email">EMAIL</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="auth-field">
              <label htmlFor="password">PASSWORD</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {!isSignIn && (
              <div className="auth-field">
                <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'PLEASE WAIT...' : (isSignIn ? 'SIGN IN' : 'CREATE ACCOUNT')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '-12px', marginBottom: '12px', color: 'var(--ash)', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem' }}>OR</div>
          
          <button type="button" className="auth-button" onClick={handleGoogleSignIn} disabled={isLoading} style={{ marginTop: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            CONTINUE WITH GOOGLE
          </button>
          
          <div className="auth-toggle" style={{ marginTop: '20px' }}>
            <button type="button" onClick={toggleMode} className="auth-toggle-btn">
              {isSignIn ? 'NEED AN ACCOUNT? SIGN UP' : 'ALREADY HAVE AN ACCOUNT? SIGN IN'}
            </button>
          </div>
        </div>
      </div>
      <PageFooter />
    </>
  )
}

export default function AuthWrapper() {
  return (
    <ErrorBoundary>
      <Auth />
    </ErrorBoundary>
  )
}
