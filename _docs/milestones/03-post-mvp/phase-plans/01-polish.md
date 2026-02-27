# Phase plan: Polish (03-post-mvp)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `03-post-mvp/01-polish`.

---

## 2. Additional chart types

- Add line chart component (same data/config pattern as bar); add to chart type options in block config.
- Add pie (and optionally area) chart; wire to data and tooltip. Use theme tokens.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): line and pie chart types").

---

## 3. Chart axis and labels

- Improve axis labels, titles, and legend across chart types. Ensure accessibility (e.g. aria labels) and theme consistency.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): chart axis, labels, and legend polish").

---

## 4. Optional export (if in scope)

- If export is agreed: implement export path (e.g. PDF or image per slide); add "Export" action in editor or viewer. Otherwise skip and document as future work.
- **Checkpoint:** If implemented, add, commit, and push (e.g. "feat(frontend): optional deck/slide export").

---

## 6. READMEs (on phase completion)

- Add or update `README.md` at the project root (overview, how to run, links to apps).
- Add or update `README.md` in each app and library that exists at phase completion (e.g. `apps/frontend`, `apps/api`, and any `libs/*`). Each should describe the package's purpose and how to run or use it.
- **Checkpoint:** Add, commit, and push (e.g. "docs: add/update READMEs for project and packages").

---

## 7. Final step (on user approval)

- When the user confirms the phase is complete: add any remaining changes, commit, and push (e.g. "chore(03-post-mvp): complete polish phase").
