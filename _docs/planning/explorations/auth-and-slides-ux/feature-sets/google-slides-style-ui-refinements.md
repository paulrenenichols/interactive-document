# Google Slides–style UI refinements

## Summary

Refine and extend the Google Slides–inspired editor and viewer experience. This feature set builds on the work scoped and (partially) delivered in the [05-ux-and-stack-overhaul](../../completed/05-ux-and-stack-overhaul) milestone and its [google-slides-ux](../../completed/05-ux-and-stack-overhaul/feature-sets/google-slides-ux.md) exploration. It covers follow-up UI work: layout polish, thumbnails, canvas behavior, keyboard shortcuts, and presenter view.

## Supporting design spec

**[google-slides-ux.md](../../supporting-docs/google-slides-ux.md)** in supporting-docs defines the target editor experience; **[theme.md](../../supporting-docs/theme.md)** provides semantic tokens for panel/canvas so the editor matches the app palette.

**From the supporting doc (committed for implementation):**

- **Layout:** Full-height; fixed top AppBar/Toolbar (undo/redo, insert, share, present; theme toggle, user avatar). Left permanent Drawer ~256px with `@dnd-kit` (SortableContext, verticalListSortingStrategy) for slide/block list. Central flexible Paper canvas (Recharts). Right contextual Paper ~320px, visibility based on selection (chart data, style, etc.). Reference: `app/edit/[deckId]/page.tsx`.
- **Keyboard shortcuts:** New block/slide Ctrl+M | Duplicate Ctrl+D | Undo Ctrl+Z | Redo Ctrl+Y | Insert chart Ctrl+Alt+C | Present F5 / Ctrl+F5 (aligned with Google Slides where noted). Implement via `use-hotkeys` or native listener; optimistic UI + TanStack Query for data flow.

## Relationship to milestone 05

- **Already in scope of 05:** Three-panel layout, slide thumbnails (with drag reorder), canvas interactions, keyboard shortcuts, presenter view — as documented in the exploration and phase plans.
- **This feature set:** Identifies refinements, gaps, or extensions beyond 05 (e.g. additional shortcuts, panel state persistence, thumbnail fidelity, presenter view enhancements, or entry/exit transitions). Document what was shipped in 05 vs what remains or should be improved.

## Proposed scope (refinements)

- **Layout and panels:** Target layout above (AppBar, Drawer, canvas, right panel). Collapsible side panels, default open/closed state, resize handles, and responsive behavior (narrow viewports).
- **Slide thumbnails:** Visual fidelity (e.g. live mini-render vs static), performance with many slides, context menu completeness (duplicate, delete, skip).
- **Canvas:** Zoom/pan UX, snap-to-grid and guides, selection feedback, and context menus. Any gaps vs the original google-slides-ux doc.
- **Keyboard shortcuts:** Coverage vs the exploration table; discoverability (help overlay or tooltips).
- **Presenter view:** Layout, slide advance, speaker notes, and exit flow. Optional: timer, next-slide preview.
- **Entry/exit and polish:** Loading states, transitions between edit and view, and any “Slides-like” polish (animations, focus management).

## Storybook-first implementation

For this feature set, treat the Slides editor as a **screen-level Storybook component** and iterate there before wiring to real decks:

- **Screen components:**
  - `SlidesEditorScreen` — full three-panel layout (toolbar, left drawer with slides, central canvas, right properties).
  - (Optional) `PresenterViewScreen` — presenter mode layout with next slide, notes, and controls.
- **Stories should cover at least:**
  - Empty/first deck state (no slides yet).
  - Typical deck with a handful of slides (drag-and-drop, selection, keyboard shortcuts).
  - “Many slides” deck to observe scrollbar behavior, performance, and thumbnail fidelity.
  - Presenter mode view with sample notes and timer.
- **Next.js awareness:**
  - Run stories under a Next.js-aware Storybook config (e.g. `@storybook/nextjs`) so layout and routing integrations match the app.
  - Mock deck data loading with TanStack Query + MSW (or equivalent) so the editor behaves as if it’s talking to the real API.
  - Ensure the same theme providers and global CSS used in the app (including the semantic tokens from `theme.md`) are applied in Storybook.

After the Storybook flows feel correct, map `SlidesEditorScreen` into the actual `app/edit/[deckId]/page.tsx` (and related routes), reusing the same structure and interactions.

## Out of scope

- Re-scoping the core feature set already defined in the 05 exploration; that remains the source of truth for “what Slides patterns we adopt.”
- Backend or data-model changes unless required for a specific UI refinement.

## Open questions

- What was actually shipped in 05 for Slides UX, and what’s still missing or rough?
- Should presenter view be a priority for the next milestone or deferred?
- Any user feedback or usability findings to incorporate?

## References

- Supporting-docs [google-slides-ux.md](../../supporting-docs/google-slides-ux.md) (editor layout and shortcuts), [theme.md](../../supporting-docs/theme.md) (semantic tokens).
- [google-slides-ux](../../completed/05-ux-and-stack-overhaul/feature-sets/google-slides-ux.md) (original 05 exploration).
- [05-wysiwyg-and-slides-ux progress](../../../../progress/05-ux-and-stack-overhaul/05-wysiwyg-and-slides-ux.md).
