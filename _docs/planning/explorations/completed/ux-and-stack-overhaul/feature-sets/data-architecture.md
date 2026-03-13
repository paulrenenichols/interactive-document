# Data architecture

## Summary

The architectural overview of how TanStack Query, zustand, zod, and sql.js coordinate in the frontend. Each library owns a distinct concern. This document defines layer responsibilities, data flows, the sync pattern between API and local cache, and why each library earns its place.

This is the "glue" document that the individual feature-set docs ([zustand](zustand-state-management.md), [zod](zod-schema-validation.md), [sql.js](sqljs-local-data-cache.md)) reference for architectural context.

## Layer responsibilities

```
┌─────────────────────────────────────────────────────────┐
│  UI Components (canvas, toolbar, sidebar, panels)       │
├──────────┬──────────┬──────────────┬────────────────────┤
│ Zustand  │ TanStack │   sql.js     │       Zod          │
│          │  Query   │              │                    │
│ editor   │ API sync │ local chart  │ validates data at  │
│ UI state │ coord.   │ data cache   │ every boundary     │
│          │          │              │                    │
│ selected │ fetch    │ SELECT/GROUP │ API → frontend     │
│ block,   │ decks,   │ BY/JOIN on   │ form input → store │
│ drag,    │ slides,  │ chart data   │ sql.js write       │
│ undo,    │ blocks,  │ locally      │ validation         │
│ zoom,    │ trigger  │              │                    │
│ theme    │ sql.js   │ persisted to │                    │
│ pref     │ sync     │ IndexedDB    │                    │
└──────────┴──────────┴──────────────┴────────────────────┘
```

### TanStack Query

- **Owns:** API sync -- when to fetch, staleness management, background refetching, cache invalidation after mutations.
- **Does NOT:** Store chart data rows in its own cache long-term. For chart data, TanStack Query's role is the *sync coordinator* -- it fetches from the API and writes to sql.js, but chart components read from sql.js directly.
- **Continues to own:** Deck/slide/block CRUD operations (the current pattern is preserved).

### Zustand

- **Owns:** Ephemeral/reactive UI state -- selected slide, selected block(s), drag-in-progress, resize-in-progress, panel visibility, zoom level, canvas scroll position, theme preference.
- **Does NOT:** Cache server data. Zustand never holds copies of decks, slides, or data rows.
- **Key justification:** The WYSIWYG editor needs shared state across deeply nested components (canvas, toolbar, sidebar, properties panel). Zustand's selector-based subscriptions re-render only the component whose slice changed, unlike React context which re-renders all consumers.

### sql.js

- **Owns:** Local structured data -- chart data rows, data source metadata. Persisted to IndexedDB. Queryable via SQL.
- **Does NOT:** Manage UI state. sql.js is a data store, not a reactive state manager.
- **Key justification:** Chart data rows can be large (thousands of rows from a CSV). Local SQL enables aggregations, pivots, and GROUP BY without hitting the API. Enables offline chart rendering and lays the foundation for SQL-driven charts (user writes a query, result drives a chart).

### Zod

- **Owns:** Boundary validation. Stateless -- plugs into TanStack Query `queryFn`, sql.js write operations, and form inputs.
- **Does NOT:** Manage state or own a layer in the architecture. It's a validation function that runs at boundaries between layers.
- **Key justification:** Two data boundaries to validate (API → frontend, frontend → sql.js). Schemas serve as the single source of truth for TypeScript types via `z.infer<>`.

## Data flows

### Chart data flow

```
User uploads CSV
       │
       ▼
API stores in PostgreSQL (source of truth)
       │
       ▼
TanStack Query fetches data rows from API
       │
       ▼
Zod validates the response shape (DataRowArraySchema.parse)
       │
       ▼
Validated rows INSERT'd into local sql.js database
       │
       ▼
sql.js DB serialized → persisted to IndexedDB
       │
       ▼
Chart components query sql.js directly (instant, offline-capable)
       │
       ▼
TanStack Query manages staleness ─── refetches and updates sql.js if changed
```

### Deck/slide/block CRUD flow

```
User action (create slide, move block, edit text)
       │
       ▼
Zustand updates optimistic UI state (e.g., block position)
       │
       ▼
TanStack Query mutation sends to API
       │
       ▼
Zod validates the API response
       │
       ▼
TanStack Query invalidates relevant query keys → refetch
       │
       ▼
Zustand-driven components re-render with confirmed data
```

## Sync pattern

TanStack Query serves as the sync coordinator between the API (PostgreSQL) and the local cache (sql.js). The pattern is a **read-through cache** where TanStack Query decides *when* to sync and sql.js stores *what* is cached.

```typescript
// TanStack Query manages sync timing
const { data: syncStatus } = useQuery({
  queryKey: ['dataSource', dataSourceId, 'sync'],
  queryFn: async () => {
    const rows = await api.getDataRows(dataSourceId);
    const validated = DataRowArraySchema.parse(rows);  // zod boundary
    await localDb.upsertRows(dataSourceId, validated); // sql.js write
    return { lastSynced: Date.now(), rowCount: validated.length };
  },
  staleTime: 5 * 60 * 1000,  // refetch every 5 min
});

// Chart reads from sql.js -- not from TanStack Query cache
const chartData = useMemo(
  () => localDb.query(
    `SELECT category, SUM(value) FROM rows
     WHERE source_id = ? GROUP BY category`,
    [dataSourceId]
  ),
  [dataSourceId, syncStatus?.lastSynced]
);
```

Key aspects:

- TanStack Query's `staleTime` controls how often the API is polled.
- The `syncStatus.lastSynced` timestamp is the bridge between TanStack Query and the chart components. When it changes, `useMemo` recomputes the chart data from sql.js.
- On first load, sql.js is rehydrated from IndexedDB before chart render. If IndexedDB has data, charts render instantly while TanStack Query checks staleness in the background.
- On CSV upload or data mutation, the relevant TanStack Query key is invalidated, triggering a refetch that updates sql.js.

## Why each library earns its place

| Library | Without it | With it |
|---------|-----------|---------|
| Zustand | Prop-drill editor state through 4+ component layers, or use React context which re-renders all consumers on any change. Undo/redo requires a custom history stack from scratch. | Selector-based subscriptions. Temporal middleware for undo/redo. Persist middleware for theme preference. |
| Zod | TypeScript interfaces provide compile-time safety but zero runtime guarantees. API returns bad data → cryptic chart rendering error. | Runtime validation at every boundary. Single source of truth for types. Errors caught at the boundary, not in the rendering layer. |
| sql.js | Chart data refetched from API on every page load. No offline capability. Aggregations done in JavaScript (duplicated `pivotBySeries` across chart components). | Instant chart rendering from local cache. Offline capability. SQL aggregations replace duplicated JS functions. Foundation for SQL-driven charts. |
| TanStack Query | Already in use. | Continues to own API sync. Now also coordinates sql.js cache freshness. |

## Boundaries and anti-patterns

### Do

- Let TanStack Query decide when to fetch.
- Let zustand own reactive UI state.
- Let sql.js own structured data.
- Let zod validate at every boundary.

### Do NOT

- Put server data in zustand (use TanStack Query).
- Put UI state in sql.js (use zustand or useState).
- Skip zod validation because "we trust the API" (boundaries exist for a reason).
- Read chart data from TanStack Query cache (read from sql.js for instant, offline-capable rendering).
- Duplicate the same data in multiple layers (each datum lives in exactly one store).
