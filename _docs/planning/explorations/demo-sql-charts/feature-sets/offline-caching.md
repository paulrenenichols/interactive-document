# Offline caching

## Summary

Explore **caching data in the in-browser sql.js database** so that document or chart data can be used when the app is offline or when the network is unavailable. This informs how the main project might support offline-capable documents.

## Scope

- **When to persist:** Decide whether the demo DB is in-memory only, or persisted (e.g. to IndexedDB or localStorage via sql.js export/import).
- **What to cache:** Define a minimal set of "document" or chart data that the demo treats as cacheable (e.g. results of a query, or a snapshot of a table).
- **Offline behaviour:** How the app behaves when offline: read from cache only, show a clear "offline" state, and optionally queue writes for when back online (if we explore write path).
- Document findings: what worked, limits of sql.js persistence, and how this could translate to the main app's offline story.

## Implementation options

- sql.js supports exporting the DB to a binary array and loading from it; persistence can be implemented by storing that array in IndexedDB and rehydrating on load.
- Alternatively, keep the demo in-memory only and document "persistence would be implemented by…" for a future iteration.

## Out of scope

- Full sync or conflict resolution with a server; this exploration is about local caching only.
