# Phase: Catalog — layout and data display (material-ui-remaining-catalog)

Implement layout primitives and data-display components for `libs/material-ui`: Container, Grid; Divider, Avatar, Badge, Chip, Icons, List/ListItem, Table, Tooltip. Each component uses theme tokens, supports `.dark`, and has a Storybook story.

---

## Scope

- **Layout:** Container (max-width + padding), Grid (CSS Grid rows/columns).
- **Data display:** Divider (horizontal/vertical, full-width/inset), Avatar (image/initials/icon, sizes), Badge (dot or count, anchor to icon/avatar), Chip (assist/filter/input/suggestion; selectable, deletable), Icons (wrapper for icon set TBD), List/ListItem (single/two/three-line; leading/trailing), Table (basic, sortable, selectable, paginated), Tooltip (hover/focus; Fade).
- Per exploration: export from `libs/material-ui/src/index.ts`, update `libs/material-ui/README.md`, add `*.stories.tsx` for each.

---

## References

- Exploration feature set: [remaining-material-ui-catalog](../../../../planning/explorations/completed/06-material-ui-remaining-catalog/feature-sets/remaining-material-ui-catalog.md).
- Existing progress: [03-material-component-library](../../../../progress/05-ux-and-stack-overhaul/03-material-component-library.md), [03b-material-ui-catalog-and-polish](../../../../progress/05-ux-and-stack-overhaul/03b-material-ui-catalog-and-polish.md).
