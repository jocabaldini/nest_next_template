# nest_next_template

Full-stack template built with **NestJS**, **Next.js**, **Prisma**, and **PostgreSQL**, organized as an **npm Workspace monorepo**.

## 🗂️ Project Structure

```
.
├── apps/
│   ├── api/   # NestJS backend
│   └── web/   # Next.js frontend
├── packages/  # Shared packages (optional)
└── package.json
```

## ✅ Requirements

- Node.js `>=20 <21`
- npm `10.8.2`
- PostgreSQL running locally or via Docker

## ⚙️ Environment Variables

### `apps/api/.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your_jwt_secret"
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run database migrations

```bash
npm run db:migrate
```

### 3. Seed the database

```bash
ADMIN_EMAIL=admin@admin.com ADMIN_PASSWORD=senha123 ADMIN_NAME=Admin npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| API (NestJS) | http://localhost:3000 |
| Web (Next.js) | http://localhost:3001 |

## 🛠️ Available Scripts

### Root

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and Web in dev mode |
| `npm run dev:api` | Start only the API |
| `npm run dev:web` | Start only the Web |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `npm run test` | Run tests for all apps |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Create and run a new migration |
| `npm run db:deploy` | Deploy migrations (production) |
| `npm run db:reset` | Reset the database |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## 📄 License

MIT © João Carlos de Souza Baldini
