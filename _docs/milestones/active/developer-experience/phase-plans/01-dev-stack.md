# Phase plan: Dev stack (developer-experience)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `developer-experience/01-dev-stack`.

---

## 2. docker-compose.dev.yml and script

- Add `docker-compose.dev.yml`: override/extend base Compose; mount repo source; run dev servers in containers (`tsx watch` for API, `next dev` for frontend). Keep db and migrations as-is.
- Add package.json script (e.g. `pnpm dev` or `pnpm dev:docker`) that runs `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`.
- **Checkpoint:** Add, commit, and push (e.g. "feat: dev Docker Compose and script with live reload").

---

## 3. DB UI (dev only)

- Add DB UI service (e.g. Adminer) to `docker-compose.dev.yml` only; expose URL (e.g. port 8080) to same Postgres as app.
- **Checkpoint:** Add, commit, and push (e.g. "feat: add Adminer to dev Compose").

---

## 4. Seed data (dev only)

- Add env var (e.g. `RUN_SEED=true`) for dev only; migrations or post-migration step runs seed (sample users, decks, slides, data sources). Set only in dev Compose; prod Compose unseeded. Keep seed idempotent or document for fresh dev DBs.
- **Checkpoint:** Add, commit, and push (e.g. "feat: optional dev seed data via env").

---

## 5. READMEs (on phase completion)

- Add or update `README.md` at project root (how to run dev stack, link to DB UI).
- Add or update `README.md` in apps (e.g. `apps/frontend`, `apps/api`) as needed.
- **Checkpoint:** Add, commit, and push (e.g. "docs: update READMEs for dev stack").

---

## 6. Progress documentation

- Add or update `_docs/progress/active/developer-experience/01-dev-stack.md` with a short summary of work done (deliverables and key changes). Optionally link to this phase plan.

---

## 7. Final step (on user approval)

- When the user confirms the phase is complete: final pass on `_docs/progress/active/developer-experience/01-dev-stack.md`. Add any remaining changes, commit, and push (e.g. "chore(developer-experience): complete 01-dev-stack phase"), including the progress doc.
