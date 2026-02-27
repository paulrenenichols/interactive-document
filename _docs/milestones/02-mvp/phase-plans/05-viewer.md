# Phase plan: Viewer (02-mvp)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `02-mvp/05-viewer`.

---

## 2. View route and permission

- Implement route `view/[deckId]`. Fetch deck and slides (TanStack Query); API enforces canViewDeck (public or restricted). On 401/403 show access denied and link to login or home.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): view route with permission-aware data fetch").

---

## 3. Full-screen viewer UI

- Full-screen layout: one slide at a time; reuse slide/block components from editor in read-only mode. Next/previous buttons; keyboard (e.g. Arrow keys, Space). Optional: slide progress (e.g. "3 / 10") or slide list drawer.
- Charts render with same component; tooltips work. No edit controls.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): full-screen viewer with next/prev and keyboard").

---

## 4. Editor ↔ viewer navigation

- From editor: add "View" or "Present" action that navigates to `view/[deckId]`.
- From viewer: if user has edit permission, show "Edit" link to `edit/[deckId]`.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): editor-viewer navigation").

---

## 5. Final step (on user approval)

- When the user confirms the phase is complete: add any remaining changes, commit, and push (e.g. "chore(02-mvp): complete viewer phase").
