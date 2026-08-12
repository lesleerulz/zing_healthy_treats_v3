import { useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Cursor from './components/Cursor.jsx'
import Grain from './components/Grain.jsx'
import { SmoothScrollProvider, useLenis } from './hooks/useLenis.jsx'
import Home from './pages/Home.jsx'
import Pantry from './pages/Pantry.jsx'
import Checkout from './pages/Checkout.jsx'
import About from './pages/About.jsx'
import Auth from './pages/Auth.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

/** Each route starts at the top with a clean set of ScrollTrigger measurements. */
function RouteTransition() {
  const { pathname } = useLocation()
  const lenis = useLenis()

  useLayoutEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [pathname, lenis])

  return null
}

export default function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <SmoothScrollProvider>
          <Cursor />
          <Grain />
          <RouteTransition />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/archive" element={<Navigate to="/pantry" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SmoothScrollProvider>
      </AuthProvider>
    </CartProvider>
  )
}
