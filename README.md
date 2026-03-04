# Catat

Personal income & expense tracker. Simple, fast, offline-first.

## Stack

- **Vite** — build tool & dev server
- **Chart.js** — daily flow chart
- **Vanilla JS** — no framework, no overhead
- **CSS Variables** — dark/light theme

## Project Structure

```
catat/
├── index.html              # App shell & HTML pages
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── styles/
    │   ├── tokens.css      # Design tokens + reset
    │   ├── layout.css      # Shell, sidebar, nav
    │   └── components.css  # Cards, chart, drawer, etc.
    └── js/
        ├── main.js         # Entry point, event wiring
        ├── store.js        # State + localStorage
        ├── render.js       # All DOM rendering
        └── utils.js        # Formatting helpers
```

## Getting Started

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build     # outputs to /dist
npm run preview   # test the build locally
```

### Deploy to Vercel

Connect the GitHub repo on [vercel.com](https://vercel.com):
- **Framework**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`

Every push to `main` auto-deploys.
