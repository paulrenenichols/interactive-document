# Progress: 02-mvp / 01-auth-permissions

Summary of work done on branch `02-mvp/01-auth-permissions` (from commits).

## Deliverables

- **Backend:** Register and login routes with JWT; password hashing (e.g. bcrypt); JWT middleware; `canEditDeck` and `canViewDeck` permission helpers; deck/slide routes protected.
- **Frontend:** Login and register pages; API client with Bearer token and 401 handling; edit route protected; 403 "No edit access" handling.
- **READMEs:** Project and app READMEs updated.

## Key commits

- feat(api): add register and login with JWT
- feat(api): JWT middleware and canViewDeck/canEditDeck
- feat(frontend): login and register pages, API client with JWT
- feat(frontend): protect edit route, handle 401/403
- docs: add/update READMEs for project and packages
- chore(02-mvp): complete auth-permissions phase
- fix(api): add CORS for frontend; add JWT_SECRET to docker-compose

## Phase plan

See [_docs/milestones/02-mvp/phase-plans/01-auth-permissions.md](../../milestones/02-mvp/phase-plans/01-auth-permissions.md).
