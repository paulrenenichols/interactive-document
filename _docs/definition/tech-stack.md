# Tech stack — Interactive Presentation App

Core technologies, their roles, conventions, and limitations. Aligns with [project overview](../project-overview/overview.md), [user flow](user-flow.md), and [auth](auth.md).

---

## Overview

| Layer | Choice | Alternative(s) |
|-------|--------|----------------|
| Monorepo | Nx | Turborepo, pnpm workspaces |
| Frontend | Next.js (App Router) | Remix, Vite + React Router |
| Backend | Fastify (Node) | Express, Hono |
| Auth | JWT | Session cookies, OAuth/OIDC |
| Database | PostgreSQL, raw SQL (`pg`) | PostgreSQL + Prisma/Drizzle, SQLite |
| Data fetching (frontend) | TanStack Query | SWR, Apollo, plain fetch |
| Charts | Recharts | Chart.js, Victory, D3 |
| Runtime | Docker Compose | Kubernetes, bare Node |

---

## Monorepo — Nx

- **Role:** Single repo; shared tooling, build caching, dependency graph. Apps: `apps/frontend` (Next.js), `apps/api` (Fastify). Optional `libs/` for shared types, validation, chart config.
- **Conventions:** Run builds and tests via Nx commands (`nx build frontend`, `nx build api`). Use `nx affected` in CI. Keep app–lib boundaries clear so the graph stays sane.
- **Best practices:** One Nx project per app and per lib; avoid circular dependencies; put shared code in libs and depend on libs from apps, not the reverse for app-specific code.
- **Limitations:** Learning curve; overkill for tiny repos. Cache can be confusing when switching branches.
- **Pitfalls:** Importing from app to app (bypass libs) creates hidden coupling; keep APIs between frontend and backend via HTTP only, not shared Node modules for runtime.

---

## Frontend — Next.js (App Router)

- **Role:** React framework; routing (`/`, `/login`, `/edit/[...deckId]`, `/view/[deckId]`), SSR/SSG where useful, and client components for editor/viewer. All data from Fastify API via TanStack Query.
- **Conventions:** App Router under `app/`; route segments as folders; `layout.tsx` and `page.tsx` per segment. Use client components for interactive UI (editor, viewer, forms); server components for static shell or SEO if needed. Environment: `NEXT_PUBLIC_API_URL` for the API base URL.
- **Best practices:** Keep data fetching in client components with TanStack Query (no direct fetch in server components for API auth unless using cookie and same-origin). Protect edit routes with auth checks and redirect to login when unauthenticated.
- **Limitations:** App Router and React Server Components are still evolving; some patterns (e.g. global state, auth) need clear decisions up front.
- **Pitfalls:** Mixing server and client boundaries incorrectly; forgetting that only `NEXT_PUBLIC_*` is exposed to the browser; hardcoding API URL.

---

## Backend — Fastify (Node)

- **Role:** JSON API; auth (register/login, JWT); decks, slides, blocks, data_sources CRUD; CSV upload and row access. Raw SQL only (`pg`).
- **Conventions:** Structure by domain or route (e.g. `routes/auth`, `routes/decks`). Use Fastify plugins for DB pool, auth middleware (JWT verify), and permission helpers (`canViewDeck`, `canEditDeck`). Env: `DATABASE_URL`, `JWT_SECRET` (and optional CORS/origin).
- **Best practices:** Validate input (e.g. with Fastify schema or a validation lib). Always use parameterized queries; never concatenate user input into SQL. Return consistent error shapes (e.g. 401/403/404 with a small JSON body).
- **Limitations:** No ORM: migrations and queries are hand-written SQL. Good for control and performance; more boilerplate for complex schemas.
- **Pitfalls:** Leaking stack traces in errors; not validating request body/query; forgetting to run permission checks on every relevant route.

---

## Authentication — JWT

- **Role:** Stateless auth; backend issues JWT on login; frontend sends it (e.g. `Authorization: Bearer <token>` or cookie). Backend validates on protected routes and attaches user id.
- **Conventions:** Store signing secret in `JWT_SECRET`; set reasonable expiry (e.g. 24h or 7d). Payload: at least `sub` (user id) and `exp`. Frontend: store per [auth.md](auth.md) (memory + persistence or httpOnly cookie) and send on every API request.
- **Best practices:** Use HTTPS in production. Prefer short-lived tokens; if using refresh tokens, implement rotation and secure storage. Do not put sensitive data in the payload (it is base64, not encrypted).
- **Limitations:** Revocation is hard without a blocklist or short TTL. Cookie-based JWT must respect SameSite/CSRF if applicable.
- **Pitfalls:** Oversized payload; forgetting expiry; storing secret in client or in repo.

---

## Database — PostgreSQL + raw SQL (`pg`)

- **Role:** Persist users, decks, slides, blocks, data_sources, and parsed CSV rows (table or JSONB). Migrations as SQL files; application uses `pg` (or `pg` with a wrapper) and parameterized queries only.
- **Conventions:** Migrations in a known folder (e.g. `apps/api/migrations` or `libs/db/migrations`); run in order (by timestamp or number). One migration per logical change. Use transactions for multi-statement operations.
- **Best practices:** Index foreign keys and columns used in WHERE/ORDER; avoid N+1 (batch or join). For large CSV payloads, consider JSONB or a separate rows table with pagination.
- **Limitations:** No type-safe query builder; schema changes are manual. Need a migration runner (e.g. custom script or a small tool).
- **Pitfalls:** SQL injection; missing indexes on deck_id/slide_id; storing huge blobs in a single row without streaming or chunking.

---

## Data fetching — TanStack Query

- **Role:** Server state for API data: decks, slides, blocks, data sources, rows. Caching, refetch, and mutations with invalidation so the UI stays in sync with the backend.
- **Conventions:** One client (e.g. `QueryClient`) at app root. Use `useQuery` for GETs and `useMutation` for create/update/delete; on mutation success, invalidate relevant query keys (e.g. deck list, slide list). Use the same base URL as `NEXT_PUBLIC_API_URL` and attach the auth token (or credentials for cookie).
- **Best practices:** Define query keys in a central place (e.g. `['decks']`, `['deck', deckId], ['slides', deckId]`). Avoid fetching in loops; use a single query or batched endpoint. Handle loading and error states in the UI.
- **Limitations:** Not a global state store for client-only state; use React state or a small store for that. SSR with TanStack Query needs care (prefetch or fetch on client).
- **Pitfalls:** Stale keys after mutation; not handling 401 (e.g. clear token and redirect); over-fetching or under-invalidating.

---

## Charts — Recharts

- **Role:** Render bar, line, and (later) pie/area charts. Data comes from TanStack Query (API returns rows for a data source). Custom tooltip to show underlying row/columns on hover.
- **Conventions:** One chart component per chart type; accept data array and config (column mapping, labels). Tooltip component receives payload and optionally row data; display full row or configured columns.
- **Best practices:** Memoize or derive data shape so Recharts doesn't re-render unnecessarily. Keep config (axis, colors) in theme or shared config. For large datasets, consider sampling or aggregation on the backend.
- **Limitations:** Less flexible than full D3; complex custom visuals may require custom components or another lib.
- **Pitfalls:** Passing new object/array references every render; not handling empty or malformed data.

---

## Runtime — Docker Compose

- **Role:** Run frontend, API, and Postgres in containers for local dev and (if chosen) deployment. Images build from Nx targets (`nx build frontend`, `nx build api`).
- **Conventions:** `docker-compose.yml` (or `compose.yaml`) with services: `frontend`, `api`, `db`. Frontend uses `NEXT_PUBLIC_API_URL` pointing at `api`; API uses `DATABASE_URL` pointing at `db`. Volumes for Postgres data; optional bind mounts for dev.
- **Best practices:** Do not commit secrets in compose files; use env files or env vars. Health checks for api and db so startup order is clear. Use a single network so services resolve by name.
- **Limitations:** Not a production orchestrator; for production consider a proper orchestration or PaaS.
- **Pitfalls:** Wrong API URL from browser (e.g. localhost vs service name); db not ready before api runs; exposing db port unnecessarily.

**Future work — Local email (Mailpit):** When email-based flows are added (e.g. email verification on signup, password reset), local development must include **Mailpit** in Docker Compose. Add a `mailpit` service; expose SMTP (e.g. port 1025) and the Mailpit web UI (e.g. port 8025). Configure the API for local dev to use Mailpit as SMTP (`SMTP_HOST=mailpit`, `SMTP_PORT=1025`) so outgoing emails are caught and viewable in the Mailpit UI. Developers use it to open verification/reset links. See [auth](auth.md) (Future work — Email signup flow) and [user flow](user-flow.md) (Future work — Email signup flow).

---

## Conventions summary

- **Node version:** Set in `.nvmrc` or `package.json` engines; use LTS (e.g. 20.x).
- **Package manager:** pnpm or npm; lockfile committed. Use workspace support for monorepo.
- **Env:** Document all required env vars (frontend: `NEXT_PUBLIC_API_URL`; api: `DATABASE_URL`, `JWT_SECRET`; optional CORS, cookie domain). No secrets in repo.
- **TypeScript:** Use across frontend and API; shared types in a lib if needed. Strict mode recommended.

These choices are assumed by [project-rules](project-rules.md), [ui-rules](ui-rules.md), and [theme-rules](theme-rules.md). If you change a choice, update this file and any dependent docs.
