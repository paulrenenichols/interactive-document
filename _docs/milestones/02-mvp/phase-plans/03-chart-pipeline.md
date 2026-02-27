# Phase plan: Chart pipeline (02-mvp)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `02-mvp/03-chart-pipeline`.

---

## 2. Chart component and tooltip

- Add Recharts (or ensure it is in dependencies). Create a bar chart component that accepts data array and config (e.g. categoryKey, valueKey, seriesKey).
- Implement custom tooltip: receive payload; display underlying row data (e.g. full row or configured columns). Use theme tokens for colors/text.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): bar chart component with custom tooltip").

---

## 3. Wire chart to TanStack Query data

- Use rows from a data source (useQuery) as chart data. Pass column mapping from config so category/value/series align. Handle loading and empty states.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): chart wired to API data via TanStack Query").

---

## 5. READMEs (on phase completion)

- Add or update `README.md` at the project root (overview, how to run, links to apps).
- Add or update `README.md` in each app and library that exists at phase completion (e.g. `apps/frontend`, `apps/api`, and any `libs/*`). Each should describe the package's purpose and how to run or use it.
- **Checkpoint:** Add, commit, and push (e.g. "docs: add/update READMEs for project and packages").

---

## 6. Final step (on user approval)

- When the user confirms the phase is complete: add any remaining changes, commit, and push (e.g. "chore(02-mvp): complete chart-pipeline phase").
