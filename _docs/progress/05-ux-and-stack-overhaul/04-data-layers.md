# Progress: 04-data-layers (ux-and-stack-overhaul)

## Summary

Phase 04 implements the layered data architecture: Zod at boundaries, zustand for ephemeral UI state, and sql.js for local chart data with IndexedDB persistence. TanStack Query remains the API sync coordinator; chart data flows API → validate → sql.js → components.

## 1. Zod schemas and boundaries

- **`apps/frontend/lib/schemas.ts`** — Single source of truth for API and form types:
  - `DeckSchema`, `SlideSchema`, `BlockSchema`, `DataSourceSchema`, `DataRowSchema`, `DataRowWithSourceSchema`, and array/response wrappers.
  - Form/editor: `BlockPositionSchema`, `ChartConfigSchema`, `ThemeModeSchema`.
  - Types exported via `z.infer<>` (Zod 4: `z.output<>` where applicable).
- **`apps/frontend/lib/queries.ts`** — All API response hooks now validate in `queryFn` with the corresponding schema (e.g. `DecksResponseSchema.parse(data)`). Inline types removed; types re-exported from `schemas.ts`.
- **Dependency:** `zod` added at workspace root.

## 2. Zustand stores

- **Editor store** — `apps/frontend/lib/stores/editor-store.ts`:
  - State: `selectedSlideId`, `selectedBlockIds`, `dragState`, `resizeState`, `zoomLevel`, `canvasScrollPosition`, `isPanelOpen` (properties, slides).
  - Actions: `selectSlide`, `selectBlock`, `clearSelection`, `startDrag` / `updateDrag` / `endDrag`, `startResize` / `updateResize` / `endResize`, `setZoom`, `setCanvasScroll`, `togglePanel`, `resetForDeck`.
- **History store** — `apps/frontend/lib/stores/history-store.ts`:
  - State: `past`, `future` (arrays of `EditorAction`).
  - Actions: `push`, `undo`, `redo`, `clear`. Selectors: `selectCanUndo`, `selectCanRedo`.
  - Undo/redo not yet wired to editor actions (foundation only).
- **Theme store** — Already existed at `apps/frontend/lib/theme-store.ts` (persist middleware, `getEffectiveTheme`).
- **Edit page** — `apps/frontend/app/edit/[deckId]/page.tsx` uses `useEditorStore` for `selectedSlideId` and `selectedBlockId` (and multi-select–ready `selectedBlockIds`). Selection and panel state are no longer local `useState`; `resetForDeck` runs when `deckId` changes.

## 3. sql.js local cache

- **`apps/frontend/lib/local-db.ts`**:
  - Async init: `initSqlJs` loads WASM from `https://sql.js.org/dist/sql-wasm.wasm`; DB rehydrated from IndexedDB when present.
  - Schema: `data_sources` (id, deck_id, name, last_synced), `data_rows` (id, source_id, row_index, row_data JSON).
  - API: `initDb()`, `upsertRows(sourceId, rows)` (validates with Zod, INSERT OR REPLACE, then persist), `queryRows(sourceId)`, `getRowCount(sourceId)`, `exportDb()`, `importDb()`.
  - Persistence: `idb-keyval` with key `interactive-document-local-db`; export after each sync.
- **Sync coordinator** — `useDataSourceRowsSync(id)` in `queries.ts`:
  - Query key: `['dataSource', id, 'sync']`.
  - `queryFn`: `initDb()` → fetch `/data-sources/:id/rows` → `DataSourceRowsResponseSchema.parse` → `upsertRows(id, parsed.rows)` → return `{ rows: queryRows(id), total, lastSynced }`.
  - `staleTime: 5 * 60 * 1000`. Invalidated on data source upload (`queryKeys.dataSourceSync(result.id)`).
- **Chart components** — `DataBarChart`, `DataLineChart`, `DataPieChart`, `DataAreaChart`:
  - When **no** `shareToken`: use `useDataSourceRowsSync` (read-through cache; charts read from sql.js after sync).
  - When **with** `shareToken`: use `useDataSourceRows` (API only; no local cache).
- **Dependencies:** `sql.js`, `idb-keyval` added at workspace root.

## 4. Data flow (achieved)

- **Chart data (edit view):** API → Zod → sql.js → IndexedDB; chart components consume rows from sync query (backed by sql.js). Offline: charts can render from cached sql.js after rehydration.
- **Deck/slide/block CRUD:** Unchanged; TanStack Query + Zod-validated responses.
- **Editor/UI state:** Zustand (editor selection, panel state); theme already in zustand with persist.

## Gaps / follow-ups

- **Undo/redo:** History store is in place; wiring to block/slide mutations and canvas actions is left for a later phase (e.g. WYSIWYG phase).
- **Panel visibility:** `isPanelOpen` exists on editor store but the edit page UI does not yet toggle panels from it (can be wired when refining layout).
- **Local SQL aggregations:** sql.js is ready for `SELECT … GROUP BY` etc.; chart components still use existing JS `pivotBySeries`-style logic. Migration to SQL-driven aggregations can be done when refining chart data layer.
- **WASM bundling:** WASM is loaded from CDN (`sql.js.org`). For full offline, consider copying `sql-wasm.wasm` into `apps/frontend/public/` and using `locateFile` to point to it.

## References

- Phase: [04-data-layers](../../milestones/completed/05-ux-and-stack-overhaul/phases/04-data-layers.md)
- Phase plan: [04-data-layers](../../milestones/completed/05-ux-and-stack-overhaul/phase-plans/04-data-layers.md)
- Exploration: [data-architecture](../../planning/explorations/completed/05-ux-and-stack-overhaul/feature-sets/data-architecture.md), [zod-schema-validation](../../planning/explorations/completed/05-ux-and-stack-overhaul/feature-sets/zod-schema-validation.md), [zustand-state-management](../../planning/explorations/completed/05-ux-and-stack-overhaul/feature-sets/zustand-state-management.md), [sqljs-local-data-cache](../../planning/explorations/completed/05-ux-and-stack-overhaul/feature-sets/sqljs-local-data-cache.md).
