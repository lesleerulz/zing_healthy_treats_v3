import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import SiteChrome from '../components/SiteChrome.jsx'
import PageFooter from '../components/PageFooter.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useStallGuard } from '../hooks/useStallGuard.js'
import { supabase } from '../lib/supabase.js'
import { NAV_PAGE } from '../data/collection.js'
import '../styles/pantry.css'

const money = (value) => `KSh ${Number(value).toLocaleString('en-KE')}`

export default function Pantry() {
  useDocumentTitle('PANTRY — ZING HEALTHY TREATS')

  const root = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')
  const { addItem, itemCount } = useCart()

  useEffect(() => {
    let active = true

    async function loadProducts() {
      const { data, error: queryError } = await supabase
        .from('product')
        .select('id, title, description, image, price, quantity, is_peoples_choice')
        .gt('quantity', 0)
        .order('id')

      if (!active) return
      if (queryError) {
        console.error('product catalog failed', queryError)
        setError('The pantry is taking a moment to warm up. Please refresh and try again.')
      } else {
        setProducts(data ?? [])
      }
      setLoading(false)
    }

    loadProducts()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!products.length) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.pantry-head h1 span', { yPercent: 110, duration: 1.1, ease: 'power4.out', delay: 0.15 })
      gsap.from('.pantry-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06,
        delay: 0.35,
      })
    }, root)
    return () => ctx.revert()
  }, [products])

  useStallGuard(() => {
    gsap.globalTimeline.progress(1)
    gsap.set('.pantry-head h1 span, .pantry-card', { clearProps: 'all' })
  })

  const addToCart = (product) => {
    addItem(product)
    setNotice(`${product.title} added to your basket`)
    window.setTimeout(() => setNotice(''), 2200)
  }

  return (
    <div ref={root}>
      <SiteChrome links={NAV_PAGE} />
      <main className="pantry-main">
        <header className="pantry-head">
          <div>
            <p className="pantry-kicker">THE ZING PANTRY — SMALL BATCH, ROASTED TO ORDER</p>
            <h1><span>PANTRY</span></h1>
          </div>
          <p className="pantry-intro">Breakfast, made warmer. Choose a jar, read its story, and let the first crunch set the pace.</p>
        </header>

        {loading && <div className="pantry-state">WARMING THE ROASTING PANS…</div>}
        {error && <div className="pantry-state pantry-error">{error}</div>}
        {!loading && !error && !products.length && <div className="pantry-state">The pantry is empty today. Check back after the next roast.</div>}

        <section className="pantry-grid" aria-label="Zing nut blends">
          {products.map((product, index) => (
            <article className="pantry-card" key={product.id}>
              <button className="pantry-image" onClick={() => setSelected(product)} aria-label={`Read about ${product.title}`}>
                <img src={product.image} alt={product.title} loading={index > 2 ? 'lazy' : 'eager'} />
                {product.is_peoples_choice && <span className="choice-tag">PEOPLE'S CHOICE</span>}
              </button>
              <div className="pantry-card-meta">
                <span>BLEND {String(index + 1).padStart(2, '0')}</span>
                <span>{money(product.price)}</span>
              </div>
              <button className="pantry-title" onClick={() => setSelected(product)}>{product.title}</button>
              <p className="pantry-description">{product.description}</p>
              <div className="pantry-actions">
                <button className="read-button" onClick={() => setSelected(product)}>READ THE JAR NOTE</button>
                <button className="add-button" onClick={() => addToCart(product)}>ADD TO BASKET</button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {itemCount > 0 && (
        <Link className="basket-float" to="/checkout">
          BASKET <b>{itemCount}</b><span>→</span>
        </Link>
      )}
      {notice && <div className="basket-notice" role="status">{notice}</div>}

      {selected && (
        <div className="jar-modal" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}>
          <div className="jar-modal-inner" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <img src={selected.image} alt={selected.title} />
            <div className="modal-copy">
              <span className="modal-label">THE JAR NOTE</span>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <strong>{money(selected.price)}</strong>
              <button className="add-button" onClick={() => { addToCart(selected); setSelected(null) }}>ADD TO BASKET</button>
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  )
}
