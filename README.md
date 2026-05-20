# Allcanaccess — Accessibility Community Portal

React community portal with **email/password authentication** backed by **Node.js + PostgreSQL**.

## Features

- Community discussions, resources, tools, events, NVDA guide
- **Sign up / sign in** (email + password, bcrypt, JWT httpOnly cookie)
- Accessible UI (ARIA, skip links, keyboard navigation)
- Responsive layout

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

## Quick start

### 1. PostgreSQL

**Docker:**

```bash
docker compose up -d
```

**Or** use an existing Postgres instance and set `DATABASE_URL` in `.env`.

### 2. Environment

```bash
cp .env.example .env
# Edit JWT_SECRET for anything beyond local dev
```

### 3. Install & migrate

```bash
npm install
npm run db:migrate
```

### 4. Run (React + API)

```bash
npm run dev
```

- React: http://localhost:3000  
- API: http://localhost:4000  

CRA proxies `/api/*` to the API in development.

### 5. Auth UI

- **Create account:** http://localhost:3000/register  
- **Sign in:** http://localhost:3000/login  

Posting questions and comments requires sign-in.

## Project structure

```
AccessHub/
├── server/
│   ├── index.js           # Express app
│   ├── config.js
│   ├── routes/auth.js     # register, login, logout, me
│   ├── middleware/auth.js
│   └── db/
│       ├── migrate.js
│       ├── pool.js
│       └── migrations/001_users.sql
├── src/
│   ├── api/client.js
│   ├── context/AuthContext.jsx
│   ├── pages/LoginPage.jsx, RegisterPage.jsx
│   └── components/...
├── docker-compose.yml
└── .env.example
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create account `{ email, password, displayName? }` |
| `POST` | `/api/auth/login` | Sign in `{ email, password }` |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Current user (requires cookie) |
| `GET` | `/api/health` | Health check |

## Production

```bash
npm run build
NODE_ENV=production JWT_SECRET=... DATABASE_URL=... CLIENT_ORIGIN=https://your-domain.com npm run start:prod
```

The API serves the React `build/` folder and handles auth.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | React + API (development) |
| `npm run server` | API only |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run build` | Production React build |
| `npm run start:prod` | Serve build + API |

## Security notes

- Passwords hashed with **bcrypt** (12 rounds)
- Sessions use **httpOnly** cookies (7-day JWT)
- Rate limiting on `/api/auth/*`
- `contextIsolation`-style separation: React has no Node access; only REST + cookies

## Legacy static deploy

The app can still be built as static-only (`npm run build` + Netlify), but **auth requires the Node API and PostgreSQL**.
