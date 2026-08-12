import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(err => {
      console.error('Supabase session error:', err)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = (email, password) => {
    if (!supabase) return Promise.reject(new Error('Supabase client is null'))
    return supabase.auth.signUp({ email, password })
  }

  const signIn = (email, password) => {
    if (!supabase) return Promise.reject(new Error('Supabase client is null'))
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signInWithGoogle = () => {
    if (!supabase) return Promise.reject(new Error('Supabase client is null'))
    return supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/account'
      }
    })
  }

  const signOut = () => {
    if (!supabase) return Promise.reject(new Error('Supabase client is null'))
    return supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
