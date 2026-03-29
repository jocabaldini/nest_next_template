# Fullstack Template: **School System** (Next.js + NestJS + Prisma) — Vercel + Fly.io + Supabase

Production-ready **monorepo** for a multi-tenant school management system built with:

- **Web**: Next.js (App Router) deployed on **Vercel**
- **API**: NestJS deployed on **Fly.io**
- **DB**: Postgres (e.g. **Supabase**)
- **ORM/Migrations**: Prisma
- **Auth**: **Bearer token** (`Authorization: Bearer ...`)
- **Server-side proxy in Next**: browsers call **your Vercel domain** at `/api/...`, and Next forwards to the Fly API

---

## Table of Contents

- Architecture
- Repository structure
- Prerequisites
- Run locally (step-by-step)
- Environment variables
- Database & Prisma commands (npm scripts)
- Production deploy
  - 1. Database (Supabase/Postgres)
  - 2. API on Fly.io
  - 3. Web on Vercel
- Routes and healthcheck
- Important notes (Proxy, CORS, Auth)
- Troubleshooting

---

## Architecture

### Recommended flow (from the browser’s perspective)

1. The **browser** calls: `https://your-site.vercel.app/api/...`
2. A **Next Route Handler** (server-side) proxies to: `https://your-api.fly.dev/...`
3. The **Nest API** talks to **Postgres** (Supabase) via `DATABASE_URL`

**Benefits**

- You don’t expose the API base URL to the client (`API_URL` stays server-only)
- Fewer CORS headaches
- Single-origin from the browser’s point of view

---

## Repository structure

Monorepo using **npm workspaces**:

- `apps/api/` — NestJS API
  - `src/main.ts` — bootstrap (Helmet, CORS, ValidationPipe, shutdown hooks)
  - `src/health.controller.ts` — `GET /health`
  - `src/prisma/` — Prisma module/service
  - `prisma/` — `schema.prisma` and migrations
  - `Dockerfile` — API Docker image for Fly.io
  - `fly.toml` — Fly configuration (healthcheck + `release_command`)

- `apps/web/` — Next.js (App Router)
  - `app/api/[...path]/route.ts` — server-side proxy to the API (Fly)
  - `lib/api/config.ts` — reads `API_URL` (server-only) and normalizes it

- `packages/*` — shared packages (if/when you add them)
- `.dockerignore` — optimizes Docker build context

---

## Prerequisites

- **Node.js** `>=20 <21`
- **npm** `10.x` (repo uses `npm@10.8.2`)
- **Docker** (recommended for local Postgres)
- **Fly CLI**: https://fly.io/docs/hands-on/install-flyctl/
- A **Supabase** account (or any Postgres provider)
- A **Vercel** account

---

## Run locally (step-by-step)

### 1) Install dependencies

From the repository root:

    npm ci

### 2) Start local Postgres (recommended)

If you don’t want to use Supabase in dev, run Postgres via Docker:

    docker run --name postgres-dev \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_DB=app \
      -p 5432:5432 \
      -d postgres:16

Example `DATABASE_URL`:

    postgresql://postgres:postgres@localhost:5432/app?schema=public

### 3) Configure API env vars (local)

Create `apps/api/.env`:

    PORT=3001
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
    JWT_SECRET="put-a-secret-with-at-least-32-characters-here"
    JWT_EXPIRES_IN="7d"

    # Optional: only needed if you want to call the API directly from the browser
    # (not required when using the Next proxy)
    CORS_ORIGIN="http://localhost:3000"

> [!NOTE]
> `CORS_ORIGIN="*"` is intentionally blocked by Joi validation.

### 4) Configure Web env vars (local)

Create `apps/web/.env.local`:

    API_URL="http://localhost:3001"

> [!TIP]
> The Web app reads `API_URL` **server-side only** (via the Next Route Handler proxy).  
> In the recommended flow, the browser should not call the Fly API directly.

### 5) Run database migrations (dev) + generate Prisma client

Use the repo scripts:

    npm run db:generate
    npm run db:migrate

### 6) Start the apps (API + Web)

Run both with one command:

    npm run dev

Or run separately:

    npm run dev:api
    npm run dev:web

Endpoints:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- API Health: `http://localhost:3001/health`

### 7) Test the proxy (important)

Open in the browser:

- `http://localhost:3000/api/health`

Expected response:

    { "ok": true }

---

## Environment variables

### API (`apps/api`)

- `PORT` (default `3001`)
- `DATABASE_URL` (**required**)
- `JWT_SECRET` (**required**, min 32 chars)
- `JWT_EXPIRES_IN` (default `7d`)
- `CORS_ORIGIN` (optional; comma-separated list, e.g. `https://site.com,https://admin.com`)
  - `*` is forbidden

### Web (`apps/web`)

- `API_URL` (**required at runtime**, server-side)
  - Dev: `http://localhost:3001`
  - Prod: `https://your-project-api.fly.dev` (or your custom domain)

---

## Database & Prisma commands (npm scripts)

From the repository root:

- Prisma Studio:

      npm run db:studio

- Generate Prisma client:

      npm run db:generate

- Create/apply dev migrations:

      npm run db:migrate

- Deploy migrations (production-style):

      npm run db:deploy

- Reset DB (dangerous — drops data):

      npm run db:reset

- Seed:

      npm run db:seed

> [!CAUTION]
> `db:reset` is destructive. Use it only for local development.

---

## Production deploy

### 1) Database (Supabase/Postgres)

1. Create a project on Supabase
2. Copy the `DATABASE_URL`
3. Ensure the DB is reachable from Fly (typically yes)

> [!TIP]
> Depending on your provider setup (pooler vs direct), you may prefer using the **direct** connection string for migrations. Adjust to your environment.

---

### 2) API on Fly.io

#### 2.1) Login

    fly auth login

#### 2.2) Create the app (one-time)

    fly apps create your-project-api

Edit `apps/api/fly.toml` and set:

    app = "your-project-api"

#### 2.3) Set secrets

    fly secrets set \
      DATABASE_URL="postgresql://..." \
      JWT_SECRET="a-secret-with-32-or-more-characters" \
      JWT_EXPIRES_IN="7d" \
      CORS_ORIGIN="https://your-site.vercel.app"

> [!NOTE]
> `CORS_ORIGIN` is optional for the main flow (server-side proxy).  
> Set it if you want to allow direct browser calls to the API.

#### 2.4) Deploy

    fly deploy -c apps/api/fly.toml

#### 2.5) Logs / status

    fly logs
    fly status

Test:

- `https://your-project-api.fly.dev/health`

---

### 3) Web on Vercel

#### 3.1) Create a Vercel project

- Import the repository into Vercel
- Configure the project root as `apps/web` (depending on your monorepo settings)

#### 3.2) Set `API_URL`

On the Vercel dashboard (Project → Settings → Environment Variables):

- `API_URL` = `https://your-project-api.fly.dev`

#### 3.3) Deploy

Vercel will build and deploy automatically.

Test:

- `https://your-site.vercel.app/api/health`

---

## Routes and healthcheck

### API (NestJS)

- `GET /health` → `{ ok: true }`

### Web (Next.js)

- `GET /api/*` → proxies to `${API_URL}/*`

---

## Important notes (Proxy, CORS, Auth)

### Auth: Bearer token (no cookies)

This template uses:

    Authorization: Bearer <token>

Therefore:

- API CORS uses `credentials: false`
- It does not depend on cross-site cookies

### Proxy and CORS

- The browser talks to `/api/...` on Vercel (same-origin)
- Vercel (server) talks to Fly (server-to-server)
- CORS mostly matters only if you choose to expose the Fly API directly to browsers

> [!IMPORTANT]
> Recommended approach: **browser → Vercel `/api/*` → Fly API**.

---

## Troubleshooting

### `API_URL` missing in Web

The Web server code (e.g. `apps/web/lib/api/config.ts`) should fail fast if `API_URL` is not set in:

- `apps/web/.env.local` (dev), or
- Vercel environment variables (prod)

### Fly healthcheck failing

Check:

- API listens on `0.0.0.0` and respects `PORT`
- `GET /health` route exists and is public
- logs:

      fly logs

### Migrations not running on deploy

Check:

- `release_command` exists in `apps/api/fly.toml`
- `prisma/` is included in the final image (Dockerfile copies it to `/app/prisma`)
- deploy logs:

      fly logs

### CORS blocks direct browser calls to the API

If you are calling the Fly API directly from the browser (without the Next proxy), set:

    CORS_ORIGIN="https://your-site.vercel.app,http://localhost:3000"

> [!CAUTION]
> `CORS_ORIGIN="*"` is forbidden by design.
