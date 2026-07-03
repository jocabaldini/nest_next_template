# CLAUDE.md — nest_next_template

This file gives Claude Code the context needed to work on this project.

## What this project is

A full-stack boilerplate built with NestJS + Next.js + Prisma + PostgreSQL.
It is **not deployed to production** — it serves as the starting point for two derived projects:

- `school_system` — school management system
- `laundromat_system` — laundry management system

## How to work with the developer

- **Always discuss and present a plan before writing any code.**
- The developer reviews each backlog item before implementation begins.
- One item at a time — do not move to the next item without explicit confirmation.
- All code comments and commit messages must be in **English**.
- Conventional Commits are enforced via Husky: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `ci`, `perf`.

## Tech stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| API      | NestJS 11, TypeScript, Prisma ORM             |
| Web      | Next.js 16, React 19, Tailwind CSS 4          |
| Database | PostgreSQL 16 (local) / Supabase (production) |
| Auth     | JWT access + refresh tokens with rotation     |
| Monorepo | npm workspaces                                |
| CI/CD    | GitHub Actions                                |

## Architecture decisions (do not change without discussion)

- **Refresh token hashing**: SHA-256 via `crypto.createHash` — NOT bcrypt (bcrypt truncates at 72 bytes, breaking token rotation)
- **Token uniqueness**: `jti: randomUUID()` on every generated JWT
- **Request context**: `AsyncLocalStorage` propagates `requestId` through the entire request lifecycle
- **Logger**: transport pattern — `ILogTransport` interface, `LOG_TRANSPORTS` DI token. Only 5xx errors are logged by `HttpExceptionFilter`
- **RBAC**: roles embedded in JWT payload — no extra DB round-trip per request
- **Prisma**: `directUrl` configured for Supabase (direct connection for migrations, pooled for runtime)
- **Next.js**: uses `proxy.ts` (not `middleware.ts`) for route protection and token refresh
- **Env validation**: API uses Joi, Web uses Zod — both fail fast on startup

## Known issues to fix before next clone

These issues were discovered during deployment of derived projects and need to be backported:

1. `apps/api/tsconfig.json` — add `"prisma/**/*.ts"` back to `include` (needed by ESLint `projectService`)
2. `apps/api/eslint.config.mjs` — remove `'prisma/**'` from `ignores`; add override block:
   ```js
   {
     files: ['prisma/**/*.ts'],
     rules: {
       '@typescript-eslint/no-unsafe-call': 'off',
       '@typescript-eslint/no-unsafe-member-access': 'off',
       '@typescript-eslint/no-unsafe-assignment': 'off',
       '@typescript-eslint/no-floating-promises': 'off',
     },
   },
   ```

## Project structure

```
apps/api/src/
  auth/                   — JWT auth, guards, decorators
  common/filters/         — HttpExceptionFilter (global)
  common/logger/          — LoggerService, transport pattern
  common/request-context/ — AsyncLocalStorage request ID
  config/                 — Joi env validation
  i18n/                   — translation files (en/, pt/)
  prisma/                 — PrismaService
  users/                  — Users CRUD with RBAC

apps/web/
  app/(auth)/login/       — public route
  app/(protected)/        — auth-gated routes
  app/api/[...path]/      — API proxy route
  lib/auth/               — session management, login/logout actions
  lib/api/                — client, routes, config
  proxy.ts                — route protection + token refresh (replaces middleware.ts)

fly.toml                  — at monorepo ROOT (not in apps/api/)
.github/workflows/ci.yml  — lint + e2e + deploy (gated by ENABLE_DEPLOY var)
```

## Prisma schema (current)

```prisma
enum Role {
  ADMIN
  USER
}

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  name             String?
  passwordHash     String
  refreshTokenHash String?
  role             Role      @default(USER)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

## API endpoints (current)

```
POST   /auth/login       — public
POST   /auth/refresh     — public
POST   /auth/logout      — Bearer
GET    /auth/me          — Bearer
POST   /users            — ADMIN only
GET    /users            — ADMIN only
GET    /users/:id        — ADMIN or own
PATCH  /users/:id        — ADMIN or own
DELETE /users/:id        — ADMIN only
GET    /health           — public
```

## E2E tests

```bash
docker compose up -d
npm run -w apps/api test:e2e
# Expected: 37/37 passing
```

## Backlog

### Known fixes to apply (priority before anything else)

- [ ] Fix `tsconfig.json` and `eslint.config.mjs` (see "Known issues" section above)
- [ ] Commit: `fix(api): fix eslint and tsconfig for prisma seed file`

### No active feature development planned for the boilerplate

New features are developed in the derived projects and backported here if they are domain-agnostic.
