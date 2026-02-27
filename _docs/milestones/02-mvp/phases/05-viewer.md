# Phase: Viewer (02-mvp)

Scope and goals for the full-screen presentation view at `view/[deckId]`: one slide at a time, next/prev, keyboard, same chart components with tooltips. Access controlled by view permission (public vs restricted).

---

## Scope

- **Frontend:** Route `view/[deckId]`; load deck/slides (TanStack Query); enforce view permission (API returns 401/403 for restricted when not allowed). Full-screen layout: one slide at a time; next/previous buttons and keyboard (e.g. Arrow keys, Space). Reuse same slide/chart components as editor in read-only mode; charts remain interactive (hover tooltips). Optional: slide progress (e.g. "3 / 10") or slide list drawer.
- **Backend:** Already enforced in data layer: view routes use canViewDeck (public or restricted with allow-list/token). No new backend work unless a dedicated view endpoint is added.

---

## Goals

- Anyone with the view link can open a public deck without logging in. Restricted decks require login and allow-list (or share token) and return 403 when not allowed.
- User can step through slides; charts show tooltips. From editor, user can switch to "View" / "Present"; from viewer (if they have edit permission), optional "Edit" link to editor.

---

## Out of scope

- Export (PDF/PPTX), additional chart types, or viewer-specific features beyond navigation and read-only slide render.
