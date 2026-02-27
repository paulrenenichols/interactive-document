# Phase plan: Scaffold (01-setup)

Step-by-step execution plan for the scaffold phase. Follow the git workflow: branch first, commit/push at logical points, final commit/push on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `01-setup/01-scaffold`.

---

## 2. Nx workspace

- Initialize Nx workspace at repo root (or add Nx to existing repo). Ensure `nx.json` and project config for apps exist.
- Add/verify `package.json` scripts or Nx targets for build and serve (e.g. `nx build frontend`, `nx build api`).
- **Checkpoint:** Add, commit, and push with message e.g. "chore: add Nx workspace and config".

---

## 3. Next.js app (frontend)

- Add Next.js application (App Router) under `apps/frontend`. Use Nx generator or create manually; ensure it is an Nx project.
- Add minimal `app/page.tsx` (e.g. landing placeholder) and `app/layout.tsx`. Set up `NEXT_PUBLIC_API_URL` via env (e.g. `.env.local` or Docker env).
- Verify `nx build frontend` and dev server run.
- **Checkpoint:** Add, commit, and push with message e.g. "feat(setup): add Next.js frontend app with App Router".

---

## 4. Fastify app (API)

- Add Fastify application under `apps/api`. Use Nx generator or create manually; ensure it is an Nx project.
- Add a root or health route (e.g. `GET /` or `GET /health`) returning JSON. Read `DATABASE_URL` from env (optional: test DB connection on health).
- Verify `nx build api` and running the API (e.g. `node dist/main.js` or npm script) work.
- **Checkpoint:** Add, commit, and push with message e.g. "feat(setup): add Fastify API app with health route".

---

## 5. Docker Compose

- Add `docker-compose.yml` (or `compose.yaml`) with services: `frontend`, `api`, `db`.
- **db:** PostgreSQL image; expose port if needed for local tools; set `DATABASE_URL` via env for the api service; use a volume for data persistence.
- **api:** Build from Nx API project (or use Dockerfile that runs `nx build api` and runs the server). Depends on `db`; env: `DATABASE_URL`.
- **frontend:** Build from Nx frontend project (or use Dockerfile that runs `nx build frontend` and serves with Node or static server). Env: `NEXT_PUBLIC_API_URL` pointing at `http://api:3000` or the API’s internal URL. Ensure browser can reach frontend (port mapping) and frontend can call API (same host or CORS as needed).
- Optional: health checks for `db` and `api` so startup order is clear.
- **Checkpoint:** Add, commit, and push with message e.g. "feat(setup): add Docker Compose for frontend, api, db".

---

## 6. Postgres schema (migrations)

- Add migrations folder (e.g. `apps/api/migrations` or `libs/db/migrations`). Use number-prefixed SQL files (e.g. `001_initial.sql`).
- In initial migration, create tables (or equivalent): `users` (id, email or username, password_hash, created_at, etc.), `decks` (id, owner_id, visibility, share_token, etc.), `slides` (id, deck_id, order), `blocks` (id, slide_id, type, layout, content/config as JSONB or columns), `data_sources` (id, name, deck or owner context, etc.), and a table or structure for data rows (e.g. `data_rows` with data_source_id and row data as JSONB). Add foreign keys and indexes as needed for the data model in the project overview.
- Document how to run migrations (e.g. script `node scripts/run-migrations.js` or manual `psql`). Optionally run migrations on API startup in dev.
- **Checkpoint:** Add, commit, and push with message e.g. "feat(setup): add Postgres schema and initial migration".

---

## 7. Final step (on user approval)

- When the user confirms the scaffold phase is complete: add any remaining changes, commit, and push with message e.g. "chore(01-setup): complete scaffold phase".
- Optionally open a PR from `01-setup/01-scaffold` to `main` for review before merging.
