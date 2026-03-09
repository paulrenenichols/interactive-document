# Phase: Data layer (02-mvp)

Scope and goals for CSV upload, data sources, and decks/slides CRUD. Delivers the API and frontend data flow so the editor and charts can use real data.

---

## Scope

- **Backend:** CSV upload (e.g. Papa Parse); parse and store rows (table or JSONB) linked to a data_source; list data sources (scoped to user/deck); get rows for a data source. Decks CRUD (create, list, get, update, delete) and slides CRUD; enforce auth and canEditDeck/canViewDeck per auth phase. Raw SQL only (`pg`).
- **Frontend:** TanStack Query: useQuery for decks, slides, data sources, rows; useMutation for create/update/delete. Centralized API client with base URL and auth header. Invalidate queries after mutations so UI stays in sync.

---

## Goals

- User can create a deck, add slides, and upload a CSV to create a data source; API persists and returns data.
- Frontend can list decks/slides, load a deck’s slides and blocks, and fetch data source rows for charts.
- Permission checks from auth phase apply: only owner can mutate; view access follows public/restricted and allow-list or token.

---

## Out of scope

- Chart rendering or slide editor UI (next phases). This phase is API and data fetching only; minimal UI to exercise the layer (e.g. deck list, create deck) is enough.
