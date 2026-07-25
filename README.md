# LeadDesk Mini

A small lead desk: one enquiry form on a public site, one table for the team, three states in between.

The public page captures enquiries. The admin dashboard shows what came in, what is still waiting on a reply, and what closed. Nothing else — the point of the product is that there is no pipeline to design before you can use it.

```
frontend/   Next.js 16 App Router · React 19 · Tailwind v4 · shadcn/ui
backend/    NestJS 11 · Prisma 6 · PostgreSQL · Passport JWT
docs/       Architecture notes and the reasoning behind the trade-offs
```

---

## What it does

**Public site** — a marketing page and a validated four-field enquiry form. Server-rendered, no client JavaScript beyond the theme toggle, the scroll reveals and the form itself.

**Admin dashboard** — sign in, see four counts, then search, filter, sort and page through every lead. Status changes are applied optimistically and roll back if the API refuses them.

**API** — a documented REST surface with a single response envelope, structured logs with a correlation id on every request, and rate limits on the two endpoints anyone can reach without a token.

---

## Running it locally

You need Node 20+ and a PostgreSQL 14+ database. [Neon](https://neon.tech) works well and has a free tier.

### 1. The API

```bash
cd backend
cp .env.example .env          # then set DATABASE_URL and JWT_SECRET
npm install                   # postinstall runs `prisma generate`
npx prisma migrate deploy     # creates the admins and leads tables
npm run db:seed               # two admins + a set of sample leads
npm run start:dev             # http://localhost:4000
```

`JWT_SECRET` must be at least 32 characters — the app refuses to boot otherwise, which is deliberate. Generate one with `openssl rand -base64 48`.

Seeded sign-in, from `.env`:

| Role          | Email                | Password      |
| ------------- | -------------------- | ------------- |
| `ADMIN`       | `admin@leaddesk.dev` | `Admin@12345` |
| `SUPER_ADMIN` | `owner@leaddesk.dev` | `Owner@12345` |

Interactive API docs run at `http://localhost:4000/docs` in development.

### 2. The web app

```bash
cd frontend
cp .env.example .env.local    # API_BASE_URL should point at the API
npm install
npm run dev                   # http://localhost:3000
```

Then open `http://localhost:3000` for the public site or `http://localhost:3000/admin` for the dashboard.

---

## Scripts

| Backend              |                                                   |
| -------------------- | ------------------------------------------------- |
| `npm run start:dev`  | Watch mode                                        |
| `npm run build`      | Compile to `dist/`                                |
| `npm run lint`       | ESLint, type-aware, zero warnings tolerated       |
| `npm test`           | Unit tests                                        |
| `npm run test:e2e`   | End-to-end tests — no database required           |
| `npm run db:seed`    | Seed admins and sample leads                      |
| `npm run prisma:studio` | Browse the data                                |

| Frontend            |                                    |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Development server                 |
| `npm run build`     | Production build                   |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | `tsc --noEmit`                     |

---

## API

Every response — success or failure — uses the same envelope:

```jsonc
// success
{ "success": true, "message": "Lead created", "data": { /* ... */ } }

// failure
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": ["email must be a valid email address"],
  "path": "/leads",
  "timestamp": "2026-07-24T09:12:44.108Z",
  "requestId": "b7f1c2e0-..."
}
```

| Method   | Route                | Auth        | Notes                                             |
| -------- | -------------------- | ----------- | ------------------------------------------------- |
| `POST`   | `/auth/login`        | public      | 5 attempts per minute per IP                      |
| `GET`    | `/auth/me`           | bearer      | Re-reads the admin, so deleted accounts fail fast |
| `POST`   | `/auth/logout`       | bearer      | Stateless; the client clears the cookie           |
| `POST`   | `/leads`             | public      | The capture form. 10 per minute per IP            |
| `GET`    | `/leads`             | bearer      | `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder` |
| `GET`    | `/leads/:id`         | bearer      | UUID-validated                                    |
| `PATCH`  | `/leads/:id/status`  | bearer      | Enforces the lifecycle rules                      |
| `DELETE` | `/leads/:id`         | `SUPER_ADMIN` | Role-restricted                                 |
| `GET`    | `/dashboard`         | bearer      | Counts, conversion rate, recent leads             |
| `GET`    | `/health`            | public      | Confirms the database answers `SELECT 1`          |

Budget is captured as one of five INR bands rather than a free-text amount, so the values stay comparable and filterable:

| Enum value | Shown as |
| --- | --- |
| `UNDER_50K` | Under ₹50,000 |
| `FROM_50K_TO_2L` | ₹50,000 – ₹2,00,000 |
| `FROM_2L_TO_5L` | ₹2,00,000 – ₹5,00,000 |
| `FROM_5L_TO_10L` | ₹5,00,000 – ₹10,00,000 |
| `ABOVE_10L` | ₹10,00,000+ |

The currency lives entirely in `BUDGET_LABELS` (`frontend/src/lib/constants.ts`) — the API stores and returns only the enum key, so changing how the bands are displayed never touches the database.

A lead moves `NEW → CONTACTED → CLOSED`, and can be moved back one step to correct a mis-click. Re-applying the status a lead already has is a no-op rather than an error.

---

## Tests

```
backend   29 unit tests    5 suites   passing
backend   34 e2e tests     1 suite    passing
frontend  tsc --noEmit + eslint + next build   passing
```

The end-to-end suite boots the real Nest application — real guards, real pipes, real filters — and substitutes an in-memory implementation of `PrismaService`. That means `npm run test:e2e` runs on a laptop with no database and in CI with no service container, while still exercising authentication, validation, pagination, search, the status rules, role restrictions, the error envelope and rate limiting through actual HTTP requests.

---

## Deploying

**API → Railway.** `railway.json` runs `prisma migrate deploy` on release and health-checks `/health`. Set `DATABASE_URL`, `JWT_SECRET` and `CORS_ORIGINS` (the deployed web origin). A `Dockerfile` is included if you would rather build the image yourself.

**Web → Vercel.** Set `API_BASE_URL` to the deployed API and `NEXT_PUBLIC_SITE_URL` to the site's own URL. `API_BASE_URL` is intentionally not a `NEXT_PUBLIC_` variable: the browser never calls the API directly.

**Database → Neon.** Use the pooled connection string and keep `?sslmode=require`.

---

## Versions, and where "latest" stops

Everything is on the newest release that the surrounding toolchain actually accepts. Three places where the ecosystem is not yet self-consistent, each verified rather than assumed:

- **TypeScript 6.0.3, not 7.0.2.** `ts-jest@29.4.12` declares `typescript >=4.3 <7`, so npm refuses the install outright, and `typescript-eslint` fails to load under TS 7 with an explicit "does not support TS 7.0" error. The Next 16 build worker also crashed on it. TS 6 is the newest version that works end to end; revisit when ts-jest and typescript-eslint ship TS 7 support.
- **ESLint 9.39.5 on the web app, 10.7.0 on the API.** `eslint-config-next@16` throws a circular-structure error under ESLint 10. The API has no Next config and runs fine on 10.
- **Prisma 6.19.3, not 7.9.0.** Prisma 7 changes the client generator contract, and `prisma generate` needs a network fetch that was blocked in the environment this was built in — so a 7.x upgrade could not be verified. It installs cleanly; treat the upgrade as its own task with the migration guide open.

Two upgrades did land with breaking changes handled: **zod 4** replaced the `errorMap` option with `error`, and **Next 16** ships native flat ESLint configs, so `eslint.config.mjs` now spreads `eslint-config-next/core-web-vitals` directly instead of bridging through `FlatCompat`.

## Other notes

- **`npm audit` reports three advisories** against `postcss` and `sharp`, both transitive dependencies of Next. No released Next version resolves them, and neither sits in this app's request path — nothing here uses `next/image`.
- **`components/ui/button.tsx` declares `'use client'`.** `@radix-ui/react-slot`, which powers `asChild`, creates a React context at module scope, and contexts do not exist in the React Server Components runtime.
- **`Admin.password` stores a bcrypt hash**, never a plaintext password. The doc comment in `schema.prisma` says so explicitly.
- **The compiled API entrypoint is `dist/main.js`.** The seed script is excluded from the production build, so the output no longer nests under `dist/src/`.

Further reading: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) covers the request lifecycle, the layering rules, why the session token never reaches the browser, and what I would change next.
