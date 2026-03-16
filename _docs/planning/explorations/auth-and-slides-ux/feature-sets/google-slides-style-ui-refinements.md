# Google Slides–style UI refinements

## Summary

Refine and extend the Google Slides–inspired editor and viewer experience. This feature set builds on the work scoped and (partially) delivered in the [05-ux-and-stack-overhaul](../../completed/05-ux-and-stack-overhaul) milestone and its [google-slides-ux](../../completed/05-ux-and-stack-overhaul/feature-sets/google-slides-ux.md) exploration. It covers follow-up UI work: layout polish, thumbnails, canvas behavior, keyboard shortcuts, and presenter view.

## Relationship to milestone 05

- **Already in scope of 05:** Three-panel layout, slide thumbnails (with drag reorder), canvas interactions, keyboard shortcuts, presenter view — as documented in the exploration and phase plans.
- **This feature set:** Identifies refinements, gaps, or extensions beyond 05 (e.g. additional shortcuts, panel state persistence, thumbnail fidelity, presenter view enhancements, or entry/exit transitions). Document what was shipped in 05 vs what remains or should be improved.

## Proposed scope (refinements)

- **Layout and panels:** Collapsible side panels, default open/closed state, resize handles, and responsive behavior (narrow viewports).
- **Slide thumbnails:** Visual fidelity (e.g. live mini-render vs static), performance with many slides, context menu completeness (duplicate, delete, skip).
- **Canvas:** Zoom/pan UX, snap-to-grid and guides, selection feedback, and context menus. Any gaps vs the original google-slides-ux doc.
- **Keyboard shortcuts:** Coverage vs the exploration table; discoverability (help overlay or tooltips).
- **Presenter view:** Layout, slide advance, speaker notes, and exit flow. Optional: timer, next-slide preview.
- **Entry/exit and polish:** Loading states, transitions between edit and view, and any “Slides-like” polish (animations, focus management).

## Out of scope

- Re-scoping the core feature set already defined in the 05 exploration; that remains the source of truth for “what Slides patterns we adopt.”
- Backend or data-model changes unless required for a specific UI refinement.

## Open questions

- What was actually shipped in 05 for Slides UX, and what’s still missing or rough?
- Should presenter view be a priority for the next milestone or deferred?
- Any user feedback or usability findings to incorporate?

## References

- [google-slides-ux](../../completed/05-ux-and-stack-overhaul/feature-sets/google-slides-ux.md) (original exploration).
- [05-wysiwyg-and-slides-ux progress](../../../../progress/05-ux-and-stack-overhaul/05-wysiwyg-and-slides-ux.md).
