# Phase plan: Auth and permissions (02-mvp)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `02-mvp/01-auth-permissions`.

---

## 2. Backend: users and auth routes

- Ensure users table has required columns (e.g. id, email, password_hash, created_at). Add migration if needed.
- Implement register: POST body (email, password); hash password (e.g. bcrypt); insert user; return 201 and optionally JWT.
- Implement login: POST body (email, password); verify credentials; issue JWT (sub=user id, exp); return token (and optionally user payload).
- **Checkpoint:** Add, commit, and push (e.g. "feat(api): add register and login with JWT").

---

## 3. Backend: JWT middleware and permission helpers

- Add JWT verification middleware: verify signature and exp; attach user id to request; on invalid/missing token return 401.
- Implement canEditDeck(deckId, userId): true if deck exists and owner_id === userId.
- Implement canViewDeck(deckId, userId?, shareToken?): true if deck is public, or (if restricted) userId on allow-list or shareToken valid. Add deck_viewers table or share_token column if not in schema.
- Apply middleware and permission checks to deck/slide routes (read and mutation). Return 403 when no permission.
- **Checkpoint:** Add, commit, and push (e.g. "feat(api): JWT middleware and canViewDeck/canEditDeck").

---

## 4. Frontend: login and register UI

- Add login page (e.g. app/login/page.tsx): form (email, password), submit to API, store JWT (per auth doc: memory + persistence or cookie).
- Add register page (e.g. app/register/page.tsx): form (email, password), submit to API; redirect to login or auto-login.
- API client: send Authorization: Bearer <token> on requests; on 401 clear token and redirect to login (optional return URL).
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): login and register pages, API client with JWT").

---

## 5. Frontend: protect edit route and handle 401/403

- On edit route, require token; if missing redirect to login with return URL. On 403 show "No edit access" and link to view or home.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): protect edit route, handle 401/403").

---

## 7. READMEs (on phase completion)

- Add or update `README.md` at the project root (overview, how to run, links to apps).
- Add or update `README.md` in each app and library that exists at phase completion (e.g. `apps/frontend`, `apps/api`, and any `libs/*`). Each should describe the package's purpose and how to run or use it.
- **Checkpoint:** Add, commit, and push (e.g. "docs: add/update READMEs for project and packages").

---

## 8. Final step (on user approval)

- When the user confirms the phase is complete: add any remaining changes, commit, and push (e.g. "chore(02-mvp): complete auth-permissions phase").
