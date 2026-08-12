import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import gsap from 'gsap'
import SiteChrome from '../components/SiteChrome.jsx'
import PageFooter from '../components/PageFooter.jsx'
import { NAV_PAGE } from '../data/collection.js'
import '../styles/account.css'

export default function Account() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return

    async function fetchOrders() {
      if (!supabase) {
        setLoadingOrders(false)
        return
      }
      
      const { data, error } = await supabase
        .from('guest_order')
        .select('reference, status, total_ksh, created_at')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setOrders(data)
      }
      setLoadingOrders(false)
    }

    fetchOrders()
  }, [user])

  useEffect(() => {
    if (!loading && user) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      )
    }
  }, [loading, user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  if (loading || !user) {
    return (
      <>
        <SiteChrome links={NAV_PAGE} />
        <div className="account-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: "var(--ash)" }}>LOADING...</p>
        </div>
        <PageFooter />
      </>
    )
  }

  return (
    <>
      <SiteChrome links={NAV_PAGE} />
      <div className="account-page">
        <div className="account-container" ref={containerRef}>
          <div className="account-header">
            <h1 className="account-title">Your Account</h1>
            <p className="account-email">{user.email}</p>
            <button className="account-signout" onClick={handleSignOut}>SIGN OUT</button>
          </div>

          <div className="account-orders">
            <h2 className="orders-title">Order History</h2>
            
            {loadingOrders ? (
              <p className="orders-empty">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="orders-empty">No orders found.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.reference} className="order-card">
                    <div className="order-header">
                      <span className="order-ref">#{order.reference}</span>
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="order-details">
                      <span className="order-status">{order.status}</span>
                      <span className="order-total">KSH {order.total_ksh}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <PageFooter />
    </>
  )
}
