# sql.js local data cache

## Summary

Use sql.js as the local data layer for chart data, providing a read-through cache with IndexedDB persistence, offline capability, and local SQL aggregations. Builds on prior research in the [demo-sql-charts](../../demo-sql-charts/README.md) exploration.

## Current state

- Chart data rows are fetched from the API via TanStack Query on every page load.
- No local caching -- data is lost on page refresh.
- No offline support -- charts fail to render without network connectivity.
- Aggregation and pivot logic is duplicated across chart components as JavaScript functions (`pivotBySeries`, `blockColumnMappingToConfig`).

## Scope

### sql.js integration

- Install `sql.js` npm package.
- Async initialization -- sql.js loads a WASM binary (~1MB). Must initialize before any database operations.
- Singleton database instance managed by a service module (e.g., `apps/frontend/lib/local-db.ts`).
- Service module exposes typed functions: `initDb()`, `upsertRows()`, `query()`, `exportDb()`, `importDb()`.

### Local schema

SQLite tables mirror the API's data model for chart-relevant data:

```sql
CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL,
  name TEXT NOT NULL,
  last_synced INTEGER
);

CREATE TABLE IF NOT EXISTS data_rows (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES data_sources(id),
  row_index INTEGER NOT NULL,
  row_data TEXT NOT NULL  -- JSON string
);

CREATE INDEX IF NOT EXISTS idx_data_rows_source
  ON data_rows(source_id);
```

### Read-through caching strategy

The caching strategy is coordinated by TanStack Query (see [data-architecture.md](data-architecture.md) for the full sync pattern).

**First load (cold cache):**
1. App starts. Attempt to rehydrate sql.js from IndexedDB.
2. If IndexedDB has a stored database, load it into sql.js. Charts can render immediately from cached data.
3. TanStack Query fires sync queries with `staleTime` check. If data is stale, it fetches from the API.
4. Zod validates the API response.
5. Validated rows are upserted into sql.js (INSERT OR REPLACE).
6. sql.js DB is exported as `Uint8Array` and stored back to IndexedDB.

**Subsequent loads (warm cache):**
1. App starts. Rehydrate sql.js from IndexedDB (instant -- typically <100ms).
2. Charts render immediately from cached data.
3. TanStack Query checks staleness in the background and refetches only if stale.

**Offline:**
1. App starts. Rehydrate sql.js from IndexedDB.
2. Charts render from cached data.
3. TanStack Query fetch fails (network error). Query enters `error` state but does not discard cached sql.js data.
4. App shows a subtle "offline" indicator. Charts continue to work.

**Cache invalidation:**
1. User uploads a new CSV or modifies data via the editor.
2. TanStack Query mutation succeeds.
3. Relevant query keys are invalidated (`queryClient.invalidateQueries`).
4. TanStack Query refetches, zod validates, sql.js is updated.

### IndexedDB persistence

- sql.js supports exporting the entire database as a `Uint8Array` and importing from one.
- Use `idb-keyval` (tiny IndexedDB wrapper) or a minimal custom wrapper to store/retrieve the binary.
- Storage key: `interactive-document-local-db` (or per-user if multi-user on same browser).
- Export after every sync (debounced if syncs are frequent).
- On import failure (corrupted data), discard and rebuild from API.

### Local SQL capabilities

Replace duplicated JavaScript aggregation functions with SQL queries:

| Current JS function | SQL replacement |
|-------------------|-----------------|
| `pivotBySeries` | `SELECT series, category, SUM(value) FROM rows GROUP BY series, category` |
| Column value extraction from JSONB `row_data` | `json_extract(row_data, '$.columnName')` |
| Filtering by data source | `WHERE source_id = ?` |

This eliminates code duplication across chart components and makes data transformations declarative.

### Future: SQL-driven charts

This feature set lays the foundation for the SQL-driven charts vision from the `demo-sql-charts` exploration. Once the local sql.js cache is in place, a future feature set could allow users to write SQL queries that drive charts directly -- the query result set maps to chart axes/series.

## Implementation options

- **WASM loading:** Load sql.js WASM from a CDN (`cdnjs`, `unpkg`) or bundle it with the app (`public/sql-wasm.wasm`). Bundling is more reliable for offline use but increases initial download.
- **Worker thread:** Run sql.js in a Web Worker to avoid blocking the main thread during large imports or complex queries. Adds complexity but improves responsiveness.
- **Per-deck vs global database:** One sql.js database per deck (simpler isolation) or one global database with deck_id partitioning (fewer IndexedDB entries). Global database is recommended -- simpler to manage, single rehydration on app start.

## Dependencies

- [Data architecture](data-architecture.md) -- defines how sql.js coordinates with TanStack Query, zustand, and zod.
- [Zod schema validation](zod-schema-validation.md) -- validates data before writing to sql.js.

## Relationship to `demo-sql-charts` exploration

This feature set absorbs and supersedes:
- `sqljs-and-demo-data.md` -- sql.js integration and schema design
- `offline-caching.md` -- IndexedDB persistence and offline behavior

The following feature sets from `demo-sql-charts` remain as future enhancements that build on this foundation:
- `sql-query-interface.md` -- UI for writing and running SQL
- `sql-driven-charts.md` -- user-written SQL as chart data source
- `statistics-and-charts.md` -- derived statistics from the database

## Out of scope

- Full sync or conflict resolution with the server. This is a read-through cache -- the API/PostgreSQL is always the source of truth.
- Write-back from sql.js to API (e.g., offline edits queued for sync). The editor writes to the API directly; sql.js is read-only for chart data.
- Encryption of the local database.
