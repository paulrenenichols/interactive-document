# User flow — Interactive Presentation App

User journey through the application: entry points, authentication, navigation between edit and view, and how permissions (public vs restricted) affect access. This document guides architecture and UI decisions.

---

## Entry points and routes

| Route | Purpose | Auth required |
|-------|---------|----------------|
| `/` (or landing) | Home / landing; may list user's decks or prompt login | No |
| `/login` | Sign in | No |
| `/register` | Create account | No |
| `/edit/[...deckId]` | Edit a deck (slides, blocks, charts, data sources) | Yes; must have edit permission |
| `/view/[deckId]` | Present / view a deck (one slide at a time, full-screen) | Depends on deck visibility |

---

## Unauthenticated users

1. **Landing**  
   User arrives at `/` (or landing). Options: go to **Login** or **Register**, or open a **view** link if they have one.

2. **Register**  
   User goes to `/register`, submits credentials, account is created. Then redirect to login or auto-login (implementation choice).

3. **Login**  
   User goes to `/login`, submits credentials, receives JWT. Redirect to a default destination (e.g. dashboard/list of decks, or previously requested URL).

4. **View link (public deck)**  
   User has a link like `/view/[deckId]`. They open it without logging in. Backend allows access because the deck is **public**. They see the deck in view mode (one slide at a time, next/prev, interactive chart tooltips).

5. **View link (restricted deck)**  
   User has a link like `/view/[deckId]` but the deck is **restricted**. Backend denies access (401/403) unless the user is on the allow-list or presents a valid share token (e.g. query param). Unauthenticated user: typically 401 or redirect to login with return URL; if token is required, the link may include a token that grants view access without full login (product decision).

6. **Edit link (unauthenticated)**  
   User follows a link to `/edit/[deckId]` without being logged in. Backend requires auth and edit permission. Frontend redirects to login, with return URL back to the edit route so after login they land on the editor.

---

## Authenticated users

1. **After login**  
   Redirect to a sensible default: e.g. list of decks the user owns or can edit, or the URL they were trying to reach (return URL).

2. **Deck list / dashboard**  
   User sees decks they own or can edit. They can open a deck in **edit** or copy/share a **view** link. (Exact screen and naming—e.g. "My decks", "Dashboard"—is an implementation detail.)

3. **Opening edit**  
   User navigates to `/edit/[deckId]` (e.g. from deck list or direct link). Backend checks JWT and edit permission. If allowed: show editor (slide list, canvas, properties panel). If not allowed: 403; frontend shows an error and may offer a link to view or back to deck list.

4. **Opening view**  
   User navigates to `/view/[deckId]` (from shared link or from editor "View" action).  
   - **Public deck:** Access allowed with or without login.  
   - **Restricted deck:** Allowed if user is on allow-list or has valid share token; otherwise 403.  
   Frontend shows full-screen viewer with next/prev (and optional keyboard); charts show tooltips.

5. **Editor → Viewer**  
   From the editor, user can switch to "View" (or "Present") for the same deck. Navigate to `/view/[deckId]`. Same permission rules apply; if they can edit, they can view.

6. **Viewer → Editor**  
   If the user has edit permission, the viewer may show an "Edit" action that goes to `/edit/[deckId]`. If they only have view permission, no edit entry point.

---

## Permission and error flows

- **Deck not found (404)**  
   User hits `/view/[deckId]` or `/edit/[deckId]` with invalid or deleted deck id. API returns 404. Frontend shows a "Deck not found" (or similar) message and a way to go home or to deck list.

- **Not allowed to view (403)**  
   User tries to open a restricted deck without permission (and without valid token). API returns 403. Frontend shows "You don't have access" (or similar) and does not expose deck content.

- **Not allowed to edit (403)**  
   User is logged in but tries to edit a deck they can only view (or have no access to). API returns 403. Frontend shows an error and may offer "View only" or link back.

- **Unauthenticated (401)**  
   User hits an edit route or a restricted view without a valid JWT (or token where required). API returns 401. Frontend redirects to login with return URL, or shows "Please log in" and a login link.

---

## How edit and view connect

- **Same deck, two modes**  
   Edit and view are two routes for the same deck. Edit is for changing content; view is for presenting. Data (slides, blocks, chart config, data sources) is shared; only the UI and capabilities differ (editing vs read-only with navigation).

- **Shared chart behavior**  
   Charts are configured in edit mode (data source, column mapping, type). In view mode, the same chart components render read-only with the same data; tooltips and interactions (e.g. hover to see source data) work in both.

- **Navigation**  
   From editor: "View" / "Present" → `/view/[deckId]`. From viewer (if user can edit): "Edit" → `/edit/[deckId]`.

---

## Summary diagram (flows)

```
Landing (/) ──┬── Login ──► Authenticated ──► Deck list ──► Edit or View link
              ├── Register ──► (then Login) ──► same
              └── View link (public) ──► View mode (no login)
                  View link (restricted) ──► 401/403 or token flow

Edit (/edit/[deckId]) ──► requires auth + edit permission
  ──► 401 → redirect to Login (return URL)
  ──► 403 → "No edit access"
  ──► 200 → Editor (slides, canvas, properties)

View (/view/[deckId]) ──► depends on visibility
  ──► Public: anyone can view
  ──► Restricted: allow-list or token required; else 403 (or 401 if login required)
  ──► 200 → Full-screen viewer (next/prev, chart tooltips)
```

This document should be updated if new entry points (e.g. password reset, invite flow) or permission rules are added.

---

## Future work

### Email signup flow

- **Flow:** User submits register form → backend creates user and sends verification email → user sees “Check your email” (no immediate login). User opens email and clicks verification link (e.g. `/verify-email?token=...`) → backend marks email verified → redirect to login or auto-login. Until verified, optional: block login or show “Verify your email” message.
- **Local development:** This flow requires sending real-looking email in dev. Local Docker Compose must include **Mailpit** so the API can send mail to it; developers use the Mailpit web UI to view the verification email and click the link. See [auth](auth.md) (Future work — Email signup flow) and [tech-stack](tech-stack.md) (Runtime / local email).
