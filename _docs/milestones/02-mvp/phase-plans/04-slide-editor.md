# Phase plan: Slide model + editor (02-mvp)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `02-mvp/04-slide-editor`.

---

## 2. Editor layout and slide list

- Implement edit route layout per ui-rules: slide list (sidebar), canvas (current slide), properties panel. Load deck and slides with TanStack Query; select current slide.
- Slide list: show slides in order; click to select; add/remove/reorder slides (mutations and invalidation).
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): editor layout and slide list with CRUD").

---

## 3. Canvas and blocks

- Canvas: render current slide’s blocks (text and chart). Support add block (type choice); delete and reorder blocks. Select block (single selection); highlight selected.
- Persist block create/update/delete/reorder via API; invalidate slides/blocks queries.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): canvas with blocks CRUD and selection").

---

## 4. Properties panel and chart config

- Properties panel: when text block selected, show content and formatting controls; when chart block selected, show data source picker and column mapping (category, value, series). Persist to block config via update mutation.
- Ensure chart block uses chart pipeline component with block’s data_source_id and column_mapping; fetch rows and render.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): properties panel, chart block config and data binding").

---

## 6. READMEs (on phase completion)

- Add or update `README.md` at the project root (overview, how to run, links to apps).
- Add or update `README.md` in each app and library that exists at phase completion (e.g. `apps/frontend`, `apps/api`, and any `libs/*`). Each should describe the package's purpose and how to run or use it.
- **Checkpoint:** Add, commit, and push (e.g. "docs: add/update READMEs for project and packages").

---

## 7. Final step (on user approval)

- When the user confirms the phase is complete: add any remaining changes, commit, and push (e.g. "chore(02-mvp): complete slide-editor phase").
