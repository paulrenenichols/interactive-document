# Phase: WYSIWYG editor and Google Slides UX (ux-and-stack-overhaul)

Replace the vertical-list block editor with a WYSIWYG canvas: drag-and-drop, resize, multi-select, snap-to-grid, undo/redo. Adopt Google Slides–inspired UX: three-panel layout, slide thumbnails with drag reorder, canvas interactions, keyboard shortcuts, and presenter view where applicable.

---

## Scope

- **Canvas model** — Fixed-ratio slide canvas (e.g. 16:9); blocks have position and size; zoom and pan.
- **Drag, resize, selection** — @dnd-kit (or chosen library) for block and slide reorder; resize handles; single/multi-select and rubber-band.
- **WYSIWYG behavior** — In-place editing, smart guides, optional snap-to-grid; undo/redo via zustand.
- **Google Slides UX** — Three-panel layout, thumbnail strip, keyboard shortcuts, and presenter view as scoped in exploration.

---

## Goals

- Editors work on a visual canvas with direct manipulation; no more move-up/move-down only.
- UX feels familiar to Google Slides users where patterns are intentionally adopted.

---

## References

- Exploration: [wysiwyg-deck-editor](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/wysiwyg-deck-editor.md), [google-slides-ux](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/google-slides-ux.md).
