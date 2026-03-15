# Progress: 05-wysiwyg-and-slides-ux (ux-and-stack-overhaul)

## Summary

Phase 05 adds a WYSIWYG deck editor with a canvas model, block positioning, zoom/pan, and (in later checkpoints) drag/resize/selection and full Google Slides–inspired UX.

## 2. Canvas and block model (checkpoint)

- **`apps/frontend/lib/canvas-model.ts`** — Canvas coordinate space and block position/size:
  - `CANVAS_WIDTH` (960) and `CANVAS_HEIGHT` (540) for a fixed 16:9 slide aspect ratio.
  - `getBlockPosition(block, index)` returns `BlockPosition` from `block.layout` (x, y, width, height) when valid, otherwise default stacked layout (margin 40, gap 24; text height 100, chart height 280).
  - `layoutFromPosition(pos)` builds the layout payload for `useUpdateBlock` so position can be persisted.
- **Edit page** — `apps/frontend/app/edit/[deckId]/page.tsx`:
  - Main slide area is a **fixed-aspect-ratio canvas**: an inner slide div at 960×540 with `transform: scale(zoomLevel)` and origin top-left; outer wrapper sized to `CANVAS_* * zoomLevel` so the canvas is scrollable when zoomed.
  - Blocks are rendered **on canvas** with `position: absolute` using `getBlockPosition(b, i)` for left, top, width, height. Block content (text or chart) and move/delete controls unchanged; selection and click-to-select wired.
  - **Zoom**: toolbar zoom controls (− / 100% / +) call `setZoom`; zoom level clamped 0.25–2 and stored in `useEditorStore`.
  - **Pan/scroll**: scroll container ref and `onScroll` sync scroll position to `setCanvasScroll`; `canvasScrollPosition` in zustand (used when we add programmatic pan or restore).

## Next (phase plan)

- **Step 3:** Drag, resize, selection — @dnd-kit (or equivalent), resize handles, multi-select, rubber-band, slide thumbnail reorder in sidebar.
- **Step 4:** WYSIWYG and Google Slides UX — in-place editing, snap-to-grid, smart guides, undo/redo, three-panel layout refinements, keyboard shortcuts, presenter view per exploration scope.
- **Step 5:** READMEs and progress doc updates.
- **Step 6:** Final commit on user approval.

## References

- Phase: [05-wysiwyg-and-slides-ux](../../milestones/active/ux-and-stack-overhaul/phases/05-wysiwyg-and-slides-ux.md)
- Phase plan: [05-wysiwyg-and-slides-ux](../../milestones/active/ux-and-stack-overhaul/phase-plans/05-wysiwyg-and-slides-ux.md)
- Exploration: [wysiwyg-deck-editor](../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/wysiwyg-deck-editor.md), [google-slides-ux](../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/google-slides-ux.md).
