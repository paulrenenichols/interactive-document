# Project rules — Interactive Presentation App

Directory structure, file naming, and code conventions for an AI-friendly, navigable codebase. Aligns with [project overview](../project-overview/overview.md), [user flow](user-flow.md), [auth](auth.md), [tech stack](tech-stack.md), [UI rules](ui-rules.md), and [theme rules](theme-rules.md).

---

## Workspace layout (Nx)

- **Root:** Nx workspace at repo root. Config: `nx.json`, `project.json` (or inferred) per project.
- **Apps:**
  - `apps/frontend` — Next.js (App Router). All UI; data via API and TanStack Query.
  - `apps/api` — Fastify. JSON API, JWT auth, raw SQL, migrations.
- **Libs (optional):** Under `libs/`. Candidates: shared TypeScript types (e.g. deck, slide, block, data source), validation schemas, chart config types. Frontend and API do **not** import from each other at runtime; they share via libs or duplicated DTOs. Prefer libs for types used by both.
- **Boundaries:** Frontend talks to API only over HTTP. No direct DB or server code in frontend. API does not depend on frontend.

---

## Frontend (`apps/frontend`)

- **Routing:** Next.js App Router. Routes under `app/`: e.g. `app/page.tsx` (landing), `app/login/page.tsx`, `app/register/page.tsx`, `app/edit/[[...deckId]]/page.tsx`, `app/view/[deckId]/page.tsx`. Use `layout.tsx` for shared shell and auth redirects where needed.
- **Components:** Group by feature or area (e.g. `components/editor/`, `components/viewer/`, `components/auth/`, `components/charts/`). One component per file; PascalCase file names for components (e.g. `SlideList.tsx`, `ChartBlock.tsx`).
- **Data and API:** Centralize API base URL and auth (e.g. `lib/api-client.ts` or `lib/auth.ts`). TanStack Query hooks in a dedicated folder (e.g. `hooks/` or `queries/`) with consistent query keys (see [tech stack](tech-stack.md)).
- **Styles:** Per tech stack and [theme rules](theme-rules.md). Use theme tokens (CSS variables or Tailwind theme) for colors and spacing.
- **Naming:** Components and hooks: PascalCase. Files for components: PascalCase. Utils, hooks (non-component): camelCase or kebab-case consistently (e.g. `useDeck.ts`, `api-client.ts`).

---

## Backend (`apps/api`)

- **Structure:** By domain or route. Examples: `src/routes/auth.ts`, `src/routes/decks.ts`, `src/routes/slides.ts`, `src/routes/data-sources.ts`. Plugins: `src/plugins/db.ts`, `src/plugins/auth.ts` (JWT verify, attach user). Helpers: `src/lib/permissions.ts` (`canViewDeck`, `canEditDeck`).
- **SQL and migrations:** Raw SQL only. Migrations: `apps/api/migrations/` (or `libs/db/migrations/` if you introduce a shared db lib). Number or timestamp prefix (e.g. `001_initial.sql`, `002_deck_viewers.sql`). Application code uses `pg` with parameterized queries; keep queries in route handlers or small `src/db/` modules (e.g. `decks.ts`, `slides.ts`).
- **Naming:** Route files: kebab-case. Handlers and helpers: camelCase. Migration files: number or timestamp + descriptive name.

---

## File size and modularity

- **Target max file size:** ~500 lines. If a file grows beyond that, split by responsibility (e.g. separate hooks, subcomponents, or query modules). This improves readability and AI tool compatibility.
- **Single responsibility:** One main export or one clear purpose per file. Avoid "god" components or "god" route files.

---

## Comments and documentation

- **File header:** At the top of each file, a short comment (or TSDoc block) describing what the file contains and its role (e.g. "Editor slide list and canvas layout", "Deck CRUD routes and permission checks").
- **Functions and public APIs:** Use JSDoc/TSDoc for purpose, parameters, and return value. Document non-obvious behavior and permission assumptions (e.g. "Requires authenticated user with edit permission for the deck").
- **Complex logic:** Inline comments for non-obvious branches or business rules. Prefer clear names over comments where possible.

---

## Naming conventions summary

| Kind | Convention | Example |
|------|------------|---------|
| React component file | PascalCase | `SlideList.tsx` |
| Next.js route folder | lowercase, dynamic segments in brackets | `app/view/[deckId]/page.tsx` |
| API route module | kebab-case | `data-sources.ts` |
| Migration file | number + snake_case or kebab-case | `002_deck_viewers.sql` |
| Util / hook (non-component) | camelCase or kebab-case | `useDeck.ts`, `api-client.ts` |
| Type/interface | PascalCase | `Deck`, `SlideBlock` |

---

## Environment and config

- **Frontend:** Only `NEXT_PUBLIC_*` env vars are exposed to the browser. Document in README or `.env.example`: `NEXT_PUBLIC_API_URL`.
- **API:** Document `DATABASE_URL`, `JWT_SECRET`, and any CORS/origin. No secrets in repo; use `.env` or deployment env.
- **Align with [tech stack](tech-stack.md)** for Node version, package manager, and TypeScript strictness.

---

## What not to do

- Do not import from `apps/frontend` into `apps/api` or vice versa for runtime code (only shared types via libs if used).
- Do not put raw SQL strings with string interpolation of user input; always use parameterized queries.
- Do not commit `.env` or secrets. Do commit `.env.example` with placeholder keys.
- Do not exceed ~500 lines per file without splitting; do not leave large files undocumented.

These rules should be reflected in [milestones](../milestones/) and phase plans so implementation stays consistent.
