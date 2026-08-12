import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import SiteChrome from '../components/SiteChrome.jsx'
import PageFooter from '../components/PageFooter.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useStallGuard } from '../hooks/useStallGuard.js'
import { images } from '../images.js'
import { NAV_PAGE, PRINCIPLES } from '../data/collection.js'
import '../styles/about.css'

export default function About() {
  useDocumentTitle('ABOUT — ZING HEALTHY TREATS')

  const root = useRef(null)

  useEffect(() => {
    const scope = root.current

    const ctx = gsap.context(() => {
      gsap.from('.ab-hero h1 .line > span', {
        yPercent: 110,
        duration: 1.3,
        ease: 'power4.out',
        stagger: 0.14,
        delay: 0.25,
      })
      gsap.from('.ab-hero .ab-kicker', { opacity: 0, duration: 1.2, delay: 0.6 })
      gsap.fromTo(
        '.ab-hero img',
        { yPercent: -12 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.ab-hero', start: 'top top', end: 'bottom top', scrub: true },
        },
      )

      scope.querySelectorAll('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        })
      })

      gsap.fromTo(
        '.ab-split .q-media img',
        { yPercent: -9 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.ab-split', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [])

  useStallGuard(() => {
    gsap.globalTimeline.progress(1)
    gsap.set('[data-reveal], .ab-hero h1 .line > span', { clearProps: 'all' })
  })

  return (
    <div ref={root}>
      <SiteChrome links={NAV_PAGE} />

      <main>
        <section className="ab-hero">
          <img src={images.detail} alt="Almonds in a jar with warm lighting on a wooden table" />
          <div className="ab-shade" />
          <div className="ab-title">
            <div className="ab-kicker">THE KITCHEN — EST. MMXVII, OAKLAND CA</div>
            <h1>
              {['NOTHING IS ADDED.', 'EVERYTHING IS ROASTED.'].map((line) => (
                <span className="line" key={line}>
                  <span>{line}</span>
                </span>
              ))}
            </h1>
          </div>
        </section>

        <section className="ab-sec">
          <div className="s-index">THREE PRINCIPLES</div>
          {PRINCIPLES.map((principle) => (
            <div className="principle" data-reveal key={principle.numeral}>
              <div className="p-num">{principle.numeral}</div>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="ab-split">
          <div className="q-media">
            <img src={images.look3} alt="Greek yogurt with strawberries nuts and honey" />
          </div>
          <div className="q-text">
            <blockquote data-reveal>
              “Roasting is not cooking. Roasting is the nut revealing what it already was — and this
              kitchen is only the heat that lets it speak.”
              <cite>— Z. KITCHEN, HEAD ROASTER</cite>
            </blockquote>
          </div>
        </section>

        <section className="colophon">
          <div className="s-index">COLOPHON</div>
          <dl data-reveal>
            <div>
              <dt>KITCHEN</dt>
              <dd>
                1428 Adeline Street
                <br />
                Oakland, CA, by appointment
              </dd>
            </div>
            <div>
              <dt>STOCKISTS</dt>
              <dd>
                Small grocers and morning markets.
                <br />
                Each batch roasted to order.
              </dd>
            </div>
            <div>
              <dt>PRESS</dt>
              <dd>
                hello@zingtreats.com
                <br />
                Response within one roast cycle
              </dd>
            </div>
            <div>
              <dt>ELSEWHERE</dt>
              <dd>
                <Link to="/">The Morning Roast</Link>
                <br />
                <Link to="/pantry">The Pantry</Link>
              </dd>
            </div>
          </dl>
        </section>
      </main>

      <PageFooter />
    </div>
  )
}
