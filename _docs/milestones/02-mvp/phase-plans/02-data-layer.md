# Phase plan: Data layer (02-mvp)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `02-mvp/02-data-layer`.

---

## 2. Backend: decks and slides CRUD

- Implement decks routes: create (owner_id from JWT), list (for authenticated user), get by id, update, delete. Use canEditDeck for mutate, canViewDeck for get.
- Implement slides routes: create, list by deck_id, get, update, delete, reorder. Enforce canEditDeck/canViewDeck via deck.
- **Checkpoint:** Add, commit, and push (e.g. "feat(api): decks and slides CRUD with permissions").

---

## 3. Backend: data sources and CSV upload

- Add data_sources table/columns if needed; link to deck or user.
- CSV upload route: accept file, parse with Papa Parse (or similar); store rows (table or JSONB); create data_source record; return data source id and metadata.
- Routes: list data sources (scoped), get data source, get rows (with optional pagination/sampling for large sets).
- **Checkpoint:** Add, commit, and push (e.g. "feat(api): data sources and CSV upload, get rows").

---

## 4. Backend: blocks CRUD

- Implement blocks routes: create (slide_id, type, layout, config), update, delete, reorder. Enforce canEditDeck via slide’s deck.
- **Checkpoint:** Add, commit, and push (e.g. "feat(api): blocks CRUD").

---

## 5. Frontend: TanStack Query and API client

- Set up QueryClient; create hooks or query helpers for decks, slides, blocks, data_sources, rows. Use mutation hooks for create/update/delete; invalidate relevant queries on success.
- Minimal UI to exercise: e.g. deck list, create deck, open deck and see slides (or placeholder). Ensure auth header is sent and 401/403 handled.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): TanStack Query for decks, slides, blocks, data sources").

---

## 6. Final step (on user approval)

- When the user confirms the phase is complete: add any remaining changes, commit, and push (e.g. "chore(02-mvp): complete data-layer phase").
