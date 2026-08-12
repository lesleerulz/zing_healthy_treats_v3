# ZING HEALTHY TREATS — Batch №7: THE MORNING ROAST

Scroll-driven food editorial for a small-batch healthy breakfast nut company, built with Vite + React, GSAP/ScrollTrigger and Lenis.

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the production build
```

## Structure

```
src/
  App.jsx              routes + per-route scroll reset
  main.jsx             entry
  images.js            Pexels food photography URLs
  components/
    ChapterTag.jsx     fixed chapter readout + scroll progress hairline
    Cursor.jsx         custom cursor, hover targets matched by delegation
    Grain.jsx          animated film grain overlay
    PageFooter.jsx     shared footer for the inner pages
    Preloader.jsx      image counter, hands off to the hero entrance
    SiteChrome.jsx     header, burger, full-screen mobile nav
  data/collection.js   nav, manifesto, blends, principles, 28-blend catalog
  hooks/
    useDocumentTitle.js
    useLenis.jsx       single Lenis instance, driven from the GSAP ticker
    useStallGuard.js   rAF-stall watchdog so content is never trapped hidden
  pages/               Home, Archive, About
  styles/              base.css (shared chrome) + one file per page
```

## Notes

- Every GSAP graph is built inside `gsap.context()` scoped to the page root and
  torn down with `ctx.revert()`, so pinned sections and pin-spacers clean up
  correctly on route change and under React StrictMode's double-mount.
- Lenis is instantiated once at the app level and driven from the GSAP ticker,
  so the smooth-scroll layer and ScrollTrigger never fight over rAF.
- Entrance reveals use `gsap.from` rather than CSS-hidden start states, so the
  copy stays readable if JavaScript never runs.

## Deploying

This is a client-routed SPA. Point your host's rewrite rule at `index.html`
(e.g. Netlify `/* /index.html 200`, or `try_files $uri /index.html` on nginx)
so `/archive` and `/about` resolve on a hard refresh.
