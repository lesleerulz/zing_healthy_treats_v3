import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteChrome from '../components/SiteChrome.jsx'
import PageFooter from '../components/PageFooter.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { supabase } from '../lib/supabase.js'
import { NAV_PAGE } from '../data/collection.js'
import '../styles/checkout.css'

const money = (value) => `KSh ${Number(value).toLocaleString('en-KE')}`
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Checkout() {
  useDocumentTitle('CHECKOUT — ZING HEALTHY TREATS')
  const { user } = useAuth()

  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const [form, setForm] = useState({ email: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [complete, setComplete] = useState(false)
  const [reference, setReference] = useState('')
  const [paidOrder, setPaidOrder] = useState(null)
  const [polling, setPolling] = useState(false)
  const root = useRef(null)
  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const startPayment = async (event) => {
    event.preventDefault()
    setError('')

    if (!items.length) {
      setError('Your basket is empty. Visit the Pantry to choose a jar first.')
      return
    }
    if (!supabase) {
      setError('Database connection missing. Please contact support.')
      return
    }
    if (!emailPattern.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.phone.trim().length < 7 || form.address.trim().length < 3) {
      setError('Please add a phone number and delivery address.')
      return
    }
    if (!paystackKey || !window.PaystackPop) {
      setError('Paystack is not connected yet. Add the store payment key before taking live payments.')
      return
    }

    setWorking(true)
    const nextReference = `zing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const { data, error: orderError } = await supabase.rpc('create_guest_order', {
      p_items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      p_email: form.email.trim(),
      p_phone: form.phone.trim(),
      p_address: form.address.trim(),
      p_reference: nextReference,
    })

    if (orderError || !data?.[0]) {
      console.error('guest order creation failed', orderError)
      setWorking(false)
      setError('We could not prepare your order. Please check your details and try again.')
      return
    }

    const order = data[0]
    const amountKsh = Number(order.total_ksh)
    const popup = new window.PaystackPop()
    popup.newTransaction({
      key: paystackKey,
      email: form.email.trim(),
      amount: Math.round(amountKsh * 100),
      currency: 'KES',
      reference: nextReference,
      metadata: {
        order_id: order.order_id,
        custom_fields: [{ display_name: 'Delivery address', variable_name: 'delivery_address', value: form.address.trim() }],
      },
      onSuccess: (transaction) => {
        setReference(transaction.reference)
        setPolling(true)
        
        let attempts = 0
        const poll = setInterval(async () => {
          attempts++
          if (attempts > 30) {
            clearInterval(poll)
            setPolling(false)
            setError('Payment taking longer than expected to confirm. We will email you once confirmed.')
            return
          }
          
          const { data } = await supabase.from('guest_order').select('status, total_ksh').eq('reference', transaction.reference).single()
          if (data && data.status === 'paid') {
            clearInterval(poll)
            setPaidOrder({
               total: data.total_ksh,
               items: [...items]
            })
            setComplete(true)
            clearCart()
            setPolling(false)
            setWorking(false)
          }
        }, 3000)
      },
      onClose: () => {
        if (!polling) setWorking(false)
      },
    })
  }

  return (
    <div ref={root}>
      <SiteChrome links={NAV_PAGE} />
      <main className="checkout-main">
        <header className="checkout-head">
          <p className="checkout-kicker">THE ZING PANTRY — PAYMENT</p>
          <h1>CHECKOUT</h1>
          <p>One last step before your jar begins its journey.</p>
        </header>

        {complete ? (
          <section className="checkout-success">
            <span>PAYMENT RECEIVED</span>
            <h2>Your morning is on its way.</h2>
            <p>We have your order and will prepare it fresh. Your Paystack reference is <b>{reference}</b>.</p>

            {paidOrder && (
              <div style={{ textAlign: 'left', background: 'var(--ink)', padding: '2rem', margin: '2rem 0', color: 'var(--bone)', border: '1px solid var(--line)' }}>
                 <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: "1rem", color: "var(--ash)" }}>ORDER SUMMARY</h3>
                 {paidOrder.items.map(item => (
                   <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.8rem' }}>
                     <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontStyle: 'italic' }}>{item.quantity} × {item.title}</span>
                     <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem" }}>{money(item.price * item.quantity)}</span>
                   </div>
                 ))}
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem' }}>
                   <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--ash)" }}>TOTAL PAID</span>
                   <strong style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.85rem" }}>{money(paidOrder.total)}</strong>
                 </div>
              </div>
            )}

            <Link className="checkout-button" to="/pantry">RETURN TO THE PANTRY</Link>
          </section>
        ) : !user ? (
          <div className="checkout-layout" style={{ justifyContent: 'center', textAlign: 'center', padding: '10vh 0', borderTop: '1px solid var(--line)' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <h2 style={{ fontFamily: "'Italiana', serif", fontSize: '2.5rem', marginBottom: '1rem' }}>ALMOST THERE</h2>
              <p style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--ash)' }}>You must be signed in to verify your contact details and securely place your order.</p>
              <Link className="checkout-button" to="/auth">SIGN IN OR REGISTER</Link>
            </div>
          </div>
        ) : (
          <div className="checkout-layout">
            <section className="checkout-basket">
              <div className="section-label">YOUR BASKET — {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}</div>
              {!items.length ? (
                <div className="empty-basket">
                  <p>No jars have joined the basket yet.</p>
                  <Link to="/pantry">BROWSE THE PANTRY →</Link>
                </div>
              ) : items.map((item) => (
                <article className="basket-line" key={item.id}>
                  <img src={item.image} alt="" />
                  <div className="basket-line-copy">
                    <h2>{item.title}</h2>
                    <p>{money(item.price)} each</p>
                    <button onClick={() => removeItem(item.id)}>REMOVE</button>
                  </div>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.title}`}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.title}`}>+</button>
                  </div>
                  <strong>{money(item.price * item.quantity)}</strong>
                </article>
              ))}
              <div className="basket-total"><span>ROAST TOTAL</span><strong>{money(subtotal)}</strong></div>
            </section>

            <form className="checkout-form" onSubmit={startPayment}>
              <div className="section-label">DELIVERY DETAILS</div>
              <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" required /></label>
              <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="07XX XXX XXX" required /></label>
              <label>Delivery address<textarea name="address" value={form.address} onChange={updateField} placeholder="Where should we bring the morning?" rows="4" required /></label>
              <div className="payment-note"><span>PAYMENT</span><p>Secure checkout powered by Paystack. Pay in Kenyan shillings.</p></div>
              {error && <p className="checkout-error" role="alert">{error}</p>}
              <button className="checkout-button" type="submit" disabled={working || polling || !items.length}>
                {working || polling ? 'VERIFYING PAYMENT…' : `PAY ${money(subtotal)}`}
              </button>
              <p className="secure-note">YOUR DETAILS ARE ONLY USED TO DELIVER THIS ORDER.</p>
            </form>
          </div>
        )}
      </main>
      <PageFooter />
    </div>
  )
}
