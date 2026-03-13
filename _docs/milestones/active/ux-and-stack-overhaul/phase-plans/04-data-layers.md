# Phase plan: Data layers (ux-and-stack-overhaul)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `ux-and-stack-overhaul/04-data-layers`.
- Branch from main after phase 03 is merged.

---

## 2. Zod schemas and boundaries

- Define Zod schemas for API responses, chart data, and form inputs. Use in TanStack Query queryFn, sql.js writes, and forms. Export types via `z.infer<>`.
- **Checkpoint:** Add, commit, and push (e.g. "feat: Zod schemas at data boundaries").

---

## 3. Zustand stores

- Add zustand stores for editor/UI state: selection, drag/resize, undo/redo, theme preference, panel visibility. Wire components to selectors.
- **Checkpoint:** Add, commit, and push (e.g. "feat: zustand stores for editor state").

---

## 4. sql.js local cache

- Integrate sql.js for chart data: read-through cache, IndexedDB persistence, local SQL for aggregations. TanStack Query fetches from API, validates with Zod, writes to sql.js; chart components read from sql.js.
- **Checkpoint:** Add, commit, and push (e.g. "feat: sql.js chart data cache with IndexedDB").

---

## 5. READMEs and progress

- Update READMEs as needed. Add or update `_docs/progress/ux-and-stack-overhaul/04-data-layers.md`.

---

## 6. Final step (on user approval)

- Final pass on progress doc; commit and push (e.g. "chore(ux-and-stack-overhaul): complete 04-data-layers phase").
