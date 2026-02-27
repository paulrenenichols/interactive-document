# Phase: Auth and permissions (02-mvp)

Scope and goals for authentication and deck-level permissions. Delivers register/login, JWT, and canViewDeck/canEditDeck so edit and view routes can enforce access.

---

## Scope

- **Backend:** Auth routes: register (create user, hash password), login (verify credentials, issue JWT). JWT middleware to verify token and attach user id. Permission helpers: `canEditDeck(deckId, userId)` (owner only for MVP), `canViewDeck(deckId, userId?, shareToken?)` (public deck or restricted with allow-list/token). Apply these on deck/slide read and mutation routes; return 401/403 as per auth and user-flow docs.
- **Database:** Ensure users table supports credentials; add deck visibility and optional viewer allow-list (or share_token) if not in scaffold migration.
- **Frontend:** Login and register pages; call auth API; store JWT (per tech-stack and auth doc); API client sends `Authorization: Bearer <token>` (or cookie). Redirect to login when unauthenticated on edit route; handle 401/403 with clear messaging.

---

## Goals

- Users can register and log in; JWT is issued and validated on protected routes.
- Edit/mutation routes require valid JWT and edit permission (deck owner); view/read routes respect public vs restricted and allow-list or share token.
- Unauthenticated access to edit returns 401; frontend redirects to login with return URL. Restricted view returns 403 when not allowed.

---

## Out of scope

- Email verification, password reset, or refresh tokens (see auth future work).
- Real CSV upload or chart/slide content; only auth and permission checks for deck/slide access.
