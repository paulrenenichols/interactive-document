# Authentication and permissions — Interactive Presentation App

How authentication works (registration, login, JWT) and how permissions control access to decks (view vs edit, public vs restricted). Aligns with [project overview](../project-overview/overview.md) and [user flow](user-flow.md).

---

## Authentication model

- **Stateless JWT only.** No server-side session store. The API issues a JWT on successful login (and optionally on register); the client sends that JWT on subsequent requests.
- **Credentials:** Email + password (or username + password; exact identity field is an implementation choice). Stored in the database; password hashed (e.g. bcrypt) before storage.
- **Register:** POST to an auth/register endpoint; create user record; then either return JWT (auto-login) or require a separate login. Frontend then redirects per [user flow](user-flow.md).
- **Login:** POST to an auth/login endpoint with credentials; backend verifies, issues JWT, returns it to the client.
- **Logout:** Client-side only: discard the token. No server endpoint required for MVP (optional invalidate/blacklist later).

---

## JWT handling

- **Issuance (backend):** On successful login (and optionally register), sign a JWT containing at least: user id (sub), expiry (exp), and optionally issuer/audience. Use a secret (or key pair) kept in env (e.g. `JWT_SECRET`); do not expose it to the frontend.
- **Storage (frontend):** Store the token so it can be sent with API requests. Common options:
  - **In-memory + optional persistence:** e.g. React state + localStorage or sessionStorage so it survives refresh. Simple; vulnerable to XSS if the app is compromised.
  - **httpOnly cookie:** Backend sets cookie on login; browser sends it with same-origin or credentialed cross-origin requests. More secure against XSS; requires API and frontend to agree on same site or CORS/credentials.
  The overview does not mandate one; choose based on security vs simplicity. Document the choice in [tech-stack](tech-stack.md) and here.
- **Sending the token:** For non-cookie storage, frontend sends `Authorization: Bearer <token>` on requests to the API. For cookie-based auth, the browser sends the cookie automatically when credentials are included.
- **Validation (backend):** On protected routes, middleware (or equivalent) verifies the JWT (signature, expiry, optional issuer/audience), then attaches the user id to the request. Invalid or missing token → 401.

---

## Permission model

Two separate concerns: **who can edit** and **who can view** a deck.

### Edit permission

- **Rule:** Only users with **edit permission** for a deck may open the editor and mutate content.
- **MVP:** Edit permission is held by the **deck owner** only (the user who created the deck, `owner_id` in the data model). Future: shared editors, roles.
- **Enforcement:** All edit/mutation routes (decks CRUD where mutating, slides, blocks, data sources) require a valid JWT and a check that the authenticated user is the deck owner (or otherwise has edit permission). If not → 403.

### View permission

- **Rule:** Whether a user (or anonymous) can open the **view** route and read deck/slides is determined by **deck visibility** and optional **allow-list** or **share token**.
- **Visibility:**
  - **Public:** Anyone with the view link can open `/view/[deckId]`. No login required. Backend allows the request without a JWT for public decks.
  - **Restricted:** Only certain users or bearers of a valid share token can view. Backend checks: if JWT present, is the user on the deck's viewer allow-list? If no JWT (or not on list), is a valid share token provided (e.g. query param)? If neither → 401 (no auth) or 403 (auth but no permission).
- **Allow-list:** For restricted decks, the owner can add viewer user ids (or emails that resolve to users). Stored in DB (e.g. `deck_viewers` or similar). Backend: `canViewDeck(deckId, userId?)` returns true if deck is public, or (if restricted) if `userId` is on the allow-list.
- **Share token (optional for MVP):** A per-deck token (or per-link token) that grants view access without login. If in scope: backend accepts e.g. `?token=...` on the view route; if token matches the deck's stored token (or a generated link token), allow view. Allows sharing a single link that works for anyone with the link. If not in MVP, restrict view to "allow-list only" for restricted decks.

---

## Backend helpers and usage

- **canEditDeck(deckId, userId):** True if the deck exists and `userId` is the owner (or has an edit role, if added later). Use before any edit/mutation.
- **canViewDeck(deckId, userId?, shareToken?):** True if the deck is public; or if restricted and (`userId` is on allow-list or `shareToken` is valid). Use on all view/read routes that return deck or slide content.
- **Route behavior:**
  - **Auth routes:** register, login — no JWT required; login returns JWT.
  - **Edit/mutation routes:** Require valid JWT; then require `canEditDeck`. 401 if no/invalid JWT; 403 if no edit permission.
  - **View/read routes for a deck:** Require `canViewDeck` with the request's user (if any) and optional token. 401 if restricted and no auth/token; 403 if auth but not allowed; 404 if deck not found.

---

## Frontend behavior (summary)

- **Login/register:** Call API; store JWT (or rely on cookie); redirect per user flow (return URL or default).
- **API client:** For non-cookie auth, attach `Authorization: Bearer <token>` to every API request; for cookie auth, use credentials. On 401, clear token and redirect to login (with return URL if desired).
- **Edit route:** If no token, redirect to login. If 403, show "No edit access" and optionally link to view or home.
- **View route:** For public decks, no token needed. For restricted, send token (and optional share token in URL). On 401/403, show access denied and optionally prompt login or explain token.

---

## Decisions to confirm

- **Token storage:** In-memory + localStorage/sessionStorage vs httpOnly cookie. Affects CORS and API configuration.
- **Share token in MVP:** Include share tokens for restricted view (link-with-token) or defer to post-MVP and use allow-list only for restricted.
- **Identity field:** Email vs username (or both) for login/register.

Once these are fixed, update this doc and tech-stack so implementation is consistent.

---

## Future work

### Refresh token and access token expiration policy

- **Access token:** Short-lived JWT (e.g. 15–60 minutes) used for authorizing API requests. Stored and sent as today (e.g. `Authorization: Bearer <token>` or cookie).
- **Refresh token:** Long-lived, opaque token stored server-side (or in a signed/encrypted cookie). Used only to obtain a new access token; not sent with every request. Client calls a dedicated refresh endpoint (e.g. `POST /auth/refresh`) when the access token expires or is about to expire; backend validates the refresh token and issues a new access token (and optionally rotates the refresh token).
- **Expiration policy:** Define TTLs for access and refresh tokens; consider refresh rotation and revocation (e.g. on logout or security event). Document in this section and in [tech-stack](tech-stack.md) when implemented.

### Email signup flow

- **Verification:** After register, require the user to verify their email before the account is fully active (or before sensitive actions). Backend sends a verification email containing a time-limited link (e.g. `/verify-email?token=...`); when the user clicks it, backend marks the email verified and (optionally) logs them in or redirects to login.
- **Local development:** Email-based signup (and any other email flows, e.g. password reset) require an SMTP catch-all in local dev so developers can receive and click verification links. **Mailpit** must be added to Docker Compose: run Mailpit as a service, expose its SMTP port (e.g. 1025) and web UI (e.g. 8025). Configure the API to use Mailpit as the SMTP host when running in the local Docker environment (e.g. via `SMTP_HOST=mailpit`, `SMTP_PORT=1025`). Developers open the Mailpit UI to view outgoing emails and use the verification links. See [tech-stack](tech-stack.md) (Runtime / local email) for the Mailpit requirement.
