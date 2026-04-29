# AccessHub — Accessibility Community Portal

A full React application for an accessibility practitioner community portal.

## Features
- **Community discussions** with upvoting, filtering, and search
- **Resources library** with category filtering
- **Tools directory** linking to real accessibility tools
- **Events & workshops** listing
- **NVDA testing guide** — interactive step-by-step reference with checklist
- **Fully responsive** — works on mobile, tablet, desktop
- **Accessible by design** — ARIA landmarks, skip links, semantic HTML, keyboard navigable

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm start

# Build for production
npm run build
```

## Deploy to Netlify (free)
1. Run `npm run build`
2. Drag the `build/` folder to [netlify.com/drop](https://netlify.com/drop)

## Deploy to Vercel (free)
```bash
npm install -g vercel
vercel
```

## Deploy to GitHub Pages
```bash
npm install --save-dev gh-pages
# Add to package.json: "homepage": "https://yourusername.github.io/accesshub"
# Add scripts: "predeploy": "npm run build", "deploy": "gh-pages -d build"
npm run deploy
```

## Project Structure
```
src/
  App.js                  — Root component, page routing
  data.js                 — All content data
  index.css               — Global styles & CSS variables
  components/
    Navbar.jsx/.module.css
    Portal.jsx/.module.css    — Community feed (home page)
    Resources.jsx/.module.css
    Tools.jsx/.module.css
    Events.jsx/.module.css
    NVDAGuide.jsx/.module.css — Interactive NVDA testing guide
    Footer.jsx/.module.css
```
