# Phase plan: WYSIWYG editor and Google Slides UX (ux-and-stack-overhaul)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `ux-and-stack-overhaul/05-wysiwyg-and-slides-ux`.
- Branch from main after phase 04 is merged.

---

## 2. Canvas and block model

- Introduce canvas model for slides (fixed aspect ratio, coordinate space). Add block position/size fields and render blocks on canvas. Zoom/pan state in zustand.
- **Checkpoint:** Add, commit, and push (e.g. "feat: canvas model and block positioning").

---

## 3. Drag, resize, selection

- Implement block drag-and-drop (e.g. @dnd-kit), resize handles, single and multi-select, rubber-band selection. Slide thumbnail reorder in sidebar.
- **Checkpoint:** Add, commit, and push (e.g. "feat: block drag, resize, and selection").

---

## 4. WYSIWYG and Google Slides UX

- In-place editing, snap-to-grid, smart guides, undo/redo. Three-panel layout, keyboard shortcuts, presenter view per exploration scope.
- **Checkpoint:** Add, commit, and push (e.g. "feat: WYSIWYG behavior and Slides-inspired UX").

---

## 5. READMEs and progress

- Update READMEs. Add or update `_docs/progress/ux-and-stack-overhaul/05-wysiwyg-and-slides-ux.md`.

---

## 6. Final step (on user approval)

- Final pass on progress doc; commit and push (e.g. "chore(ux-and-stack-overhaul): complete 05-wysiwyg-and-slides-ux phase").
