# Progress: 02-mvp / 05-viewer

Summary of work done on branch `02-mvp/05-viewer` (from commits).

## Deliverables

- **Frontend:** Route `view/[deckId]` refactored to use TanStack Query for deck and slides; 401/403 derived from query errors with access-denied UI (sign in required / no view access). Optional share token in URL (`?token=`) for restricted decks; token passed to deck, slides, and blocks fetches and to chart data (DataBarChart `shareToken` prop). Full-screen viewer: one slide at a time, next/previous buttons and keyboard (Arrow keys, Space, Escape); read-only slide and block rendering (text and chart with tooltips); slide progress (e.g. 3 / 10). Editor: "View" and "Present" links to viewer. Viewer: "Edit" link when current user is deck owner (JWT decode for `getUserId()`).
- **READMEs:** Project root and frontend README updated (viewer at `view/[deckId]`, full-screen, next/prev, keyboard, Edit link, share token).

## Key commits

- feat(frontend): view route with permission-aware data fetch
- feat(frontend): full-screen viewer with next/prev and keyboard
- feat(frontend): editor-viewer navigation
- docs: add/update READMEs for project and packages
- chore(02-mvp): complete viewer phase

## Phase plan

See [_docs/milestones/completed/02-mvp/phase-plans/05-viewer.md](../../../milestones/completed/02-mvp/phase-plans/05-viewer.md).
