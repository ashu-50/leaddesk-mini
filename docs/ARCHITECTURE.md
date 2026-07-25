# Architecture

Notes on how LeadDesk Mini is put together and why it is put together that way. The README covers running it; this covers the reasoning.

---

## The shape of it

```
                     ┌───────────────────────────────────────┐
   visitor  ───────► │  Next.js 15 (App Router)              │
                     │                                       │
                     │  /            public site + form      │
                     │  /admin       dashboard (protected)   │
                     │  /api/*       route handlers          │
                     └──────────────┬────────────────────────┘
                                    │  server-to-server,
                                    │  Bearer token attached here
                                    ▼
                     ┌───────────────────────────────────────┐
                     │  NestJS 11                            │
                     │  guards → pipes → service → repo      │
                     └──────────────┬────────────────────────┘
                                    │  Prisma, always parameterised
                                    ▼
                            PostgreSQL (admins, leads)
```

The browser talks to Next. Next talks to Nest. Nothing in a browser tab ever holds an API token or knows the API's address.

---

## Why the token never reaches the browser

The obvious design is: log in, get a JWT, put it in `localStorage`, attach it to every `fetch`. It is also the design where a single cross-site scripting bug hands an attacker a working session.

So the flow here is:

1. The login form posts to `/api/auth/login` — a **Next route handler**, not the API.
2. That handler calls NestJS, receives the token, and writes it into a cookie marked `httpOnly`, `sameSite=lax`, and `secure` in production.
3. Every later admin request goes to a Next route handler too. The handler reads the cookie server-side, attaches `Authorization: Bearer …`, and proxies to Nest.

No script on the page can read an `httpOnly` cookie, so XSS cannot exfiltrate the session. `sameSite=lax` covers the cross-site request forgery case for the state-changing verbs. The cost is one extra network hop on admin requests, which is a fair price.

`API_BASE_URL` is deliberately **not** a `NEXT_PUBLIC_` variable — it is only ever read on the server, which is what makes the proxy honest rather than decorative.

### Three checks, not one

| Layer | What it checks | Why it is not enough on its own |
| --- | --- | --- |
| `middleware.ts` | Does a session cookie exist? | It never validates the token. It exists so nobody sees a dashboard skeleton flash before being bounced to the login page. |
| `app/admin/(protected)/layout.tsx` | Calls `GET /auth/me` before rendering | This is the real gate for the UI, and it runs on every request because the segment is `force-dynamic`. |
| NestJS guards | Signature, expiry, and the admin still existing | The only check that actually protects the data. The other two are user experience. |

Treating middleware as a security boundary is a common and expensive mistake; the comment in `middleware.ts` says so in as many words.

---

## The request lifecycle inside NestJS

Global providers are registered in a deliberate order in `app.module.ts`:

```
ThrottlerGuard  →  JwtAuthGuard  →  RolesGuard
       ↓
ValidationPipe (whitelist + forbidNonWhitelisted + transform)
       ↓
LoggingInterceptor  →  ResponseInterceptor
       ↓
AllExceptionsFilter
```

- **Rate limiting runs before authentication.** A flood of unauthenticated requests should be rejected before any of them touches bcrypt or the database.
- **`JwtAuthGuard` is global**, so every route is protected unless it opts out with `@Public()`. Forgetting a decorator locks a route down; it does not expose one. The public routes are the capture form, login and health, and each says so out loud.
- **`forbidNonWhitelisted`** means an unexpected property in a request body is a 400, not a silently ignored field. That is what closes off mass-assignment — nobody can create a lead that arrives pre-marked `CLOSED`.
- **One exit point.** `AllExceptionsFilter` is the only place that formats an error, which is why the envelope is genuinely consistent rather than consistent-by-convention.

---

## Layering

```
controller  binds HTTP, delegates, documents. No logic.
service     the rules. Knows nothing about HTTP or SQL.
repository  the only code that touches Prisma.
```

The rule that keeps this honest: **a service never imports `PrismaService`.** `LeadsRepository` is the single place lead rows are read or written, so when the dashboard needed counts it reused the repository rather than opening its own connection to the same table.

`LeadEntity.fromModel()` maps rows to responses. It exists so that adding an internal column — an assigned-to id, an internal note — does not automatically widen the public API by accident.

---

## The response envelope

Every response, success or failure, has the same shape. Clients write one unwrapping function and stop thinking about it:

```jsonc
{ "success": true,  "message": "...", "data": { }, "meta": { } }
{ "success": false, "message": "...", "statusCode": 400, "errors": [], "requestId": "..." }
```

`requestId` is attached by middleware, echoed in the response header, and printed in every log line for that request. When something fails in production, the id in the user's screenshot finds the exact log entry.

Errors never leak internals. Prisma's `P2002` becomes a 409, `P2025` becomes a 404, and anything at 500 or above returns a generic message to the caller while the full stack goes to the server log.

---

## Data model

Two tables. UUID primary keys, because leads are created through a public form and sequential ids would let anyone count the business's enquiries.

```prisma
Admin  id · email(unique) · password(bcrypt) · role · timestamps
Lead   id · name · email · budget · message · status · timestamps
```

Three indexes, each earning its place against a query the app actually runs:

| Index | Query it serves |
| --- | --- |
| `createdAt DESC` | The default table view, newest first |
| `(status, createdAt DESC)` | The status filter, still newest first |
| `email` | Looking up or de-duplicating by email |

`budget` is an enum of five INR bands, not a number. Storing the band rather than an amount keeps the values comparable, makes the filter a simple equality check, and means the currency symbol lives only in the frontend label map. The bands were renamed from an earlier USD set by `20260724120000_inr_budget_bands`, which uses `ALTER TYPE … RENAME VALUE` so existing rows keep their meaning — Prisma's default enum diff would have dropped and recreated the type, taking the column data with it.

Search uses Prisma's `mode: 'insensitive'`, which compiles to `ILIKE` and is always parameterised — user input cannot become SQL.

Pagination reads the page and the total count inside one `$transaction`, so the count can never disagree with the rows beside it.

---

## The lead lifecycle

```
NEW ⇄ CONTACTED ⇄ CLOSED
 └──────────────────►
        ✗ CLOSED → NEW
```

Everything can move forward, and a mis-click can be walked back one step. The single refused move is `CLOSED → NEW`, answered with a 422: "new" means *nobody has replied yet*, so reopening a finished lead that way would quietly inflate every waiting-on-you figure on the dashboard. Reopen to `CONTACTED` instead.

The rule lives in `ALLOWED_STATUS_TRANSITIONS` in `leads.constants.ts` and is enforced in the service. The admin UI reads the same table to disable moves the API would reject, so the interface never offers a button that fails.

Re-applying a lead's current status is a no-op that returns 200, not an error — two people clicking the same button is not a failure.

---

## Optimistic updates

Marking a lead contacted updates the table before the request leaves the browser. TanStack Query snapshots every cached page first; if the API refuses, all of them are restored and a toast explains why.

The snapshot is the whole point. An optimistic update that cannot roll back is not optimistic, it is a lie — the screen would keep showing a change the database never accepted.

---

## Testing

**Unit tests** cover the parts where being wrong is expensive: the login path, the status rules, the dashboard's arithmetic, the roles guard.

**End-to-end tests** boot the real application — real guards, real pipes, real filters, real interceptors — and replace only `PrismaService` with an in-memory implementation.

That substitution is the interesting decision. The alternative, a Postgres container, tests Prisma and the network as much as it tests this code, and it means the suite cannot run on a laptop without Docker or in CI without a service container. Swapping the lowest layer keeps every layer above it real: requests still go through HTTP, tokens are still signed and verified, validation still rejects what it should, and the throttler still returns 429.

The trade-off is honest: these tests cannot catch a mistake in a Prisma query itself. That is what the type-checked schema and a staging environment are for.

```
29 unit tests · 34 end-to-end tests · both green with no database running
```

---

## Trade-offs taken

**JWT with no server-side revocation.** Logging out clears the cookie; it does not invalidate the token, which stays valid until it expires. For a two-admin tool that is a reasonable trade. If sessions ever need to die on command, the change is a denylist checked in `JwtStrategy.validate` — one lookup on a token id, which is why the token carries one.

**Filter state in React, not the URL.** Nobody bookmarks "page 3 of contacted leads" in a single-screen tool, and keeping it in state avoids a router round trip per keystroke. If sharing a filtered view ever matters, `nuqs` or `useSearchParams` slots in without touching the data layer.

**No soft deletes.** `DELETE` removes the row. Restricting it to `SUPER_ADMIN` was the cheaper safeguard for a tool this size than carrying a `deletedAt` column through every query for the rest of its life.

**Two `password` naming quirks.** The column is `password` and holds a bcrypt hash. `passwordHash` would say it better; renaming it now would touch the migration, the seed, the service and the tests for a cosmetic gain, so the schema comment carries the meaning instead.

---

## What I would do next

1. **Assignment and notes** — one `assignedTo` relation and a `LeadNote` table, which is the first thing a second person on the team will ask for.
2. **Email on capture** — a queued job rather than an inline send, so a slow SMTP server cannot make the public form time out.
3. **Cursor pagination** past roughly fifty thousand leads, when `OFFSET` starts to cost real time.
4. **A denylist for logout**, if immediate revocation ever becomes a requirement.
5. **Playwright** over the two flows that matter end to end: submit an enquiry, then find it in the dashboard and close it.
