# Allcanaccess — Accessibility Community Portal

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
npm install
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, Google OAuth

# PostgreSQL: create DB, then apply migrations
npm run db:migrate
npm run db:seed

# API (3015) + React (3010)
npm run dev
```

- Web: http://localhost:3010  
- API: http://localhost:3015  

```bash
# API only
npm run server

# Static production build on 3010
npm run build && npm run serve:prod
```

### Jenkins / server deploy

Do **not** run bare `react-scripts start` in CI (causes `allowedHosts` errors if `HOST` is empty).

| Command | Use |
|---------|-----|
| `npm start` | Dev server on port 3010 (uses `scripts/start-dev.js`) |
| `npm run start:deploy` | Production: `npm run build` + API + static on 3010 |

Remove any Jenkins env var `HOST=` (empty). If you must use dev mode on the server, run `npm start` after `git pull`, not `react-scripts start` directly.

### Database scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Apply SQL migrations to PostgreSQL (`DATABASE_URL`) |
| `npm run db:seed` | Seed sample discussion threads (skipped if posts exist) |
| `npm run db:migrate-from-sqlite` | One-time: migrate `./data/accesshub.db` into PostgreSQL |

### Forgot password

1. Run `npm run db:migrate` (migration `002_password_reset.sql`).
2. Set `APP_URL` in `.env` to your site origin (e.g. `http://localhost:3010`).
3. **Dev:** leave SMTP unset — the API logs the reset link to the console when someone requests a reset.
4. **Production:** configure `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` to send mail.

Routes: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`. UI: `/forgot-password`, `/reset-password?token=…`.

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
# Add to package.json: "homepage": "https://yourusername.github.io/allcanaccess"
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
