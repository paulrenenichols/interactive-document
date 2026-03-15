# Phase: Data layers (ux-and-stack-overhaul)

Implement the layered data architecture: zod at boundaries, zustand for ephemeral UI state, sql.js for local chart data with IndexedDB persistence. TanStack Query remains the API sync coordinator; chart data flows API → validate → sql.js → components.

---

## Scope

- **Zod** — Schemas at API response, sql.js write, and form boundaries; types via `z.infer<>`.
- **Zustand** — Stores for editor selection, drag/resize, undo/redo, theme preference, panel state.
- **sql.js** — Read-through cache for chart data; IndexedDB persistence; local SQL for aggregations.
- **Data architecture** — Implement flows and layer responsibilities described in the exploration.

---

## Goals

- Chart data: API → Zod → sql.js → IndexedDB; chart components read from sql.js.
- Editor and UI state live in zustand; no overlap with server or chart cache.

---

## References

- Exploration: [data-architecture](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/data-architecture.md), [zod-schema-validation](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/zod-schema-validation.md), [zustand-state-management](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/zustand-state-management.md), [sqljs-local-data-cache](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/sqljs-local-data-cache.md).
