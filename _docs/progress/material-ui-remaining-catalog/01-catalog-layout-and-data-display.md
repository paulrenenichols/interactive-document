# Phase 01: Catalog — layout and data display

**Milestone:** [material-ui-remaining-catalog](../../milestones/active/material-ui-remaining-catalog/)  
**Branch:** `material-ui-remaining-catalog/01-catalog-layout-and-data-display`

## Summary

Layout and data display components added to `@interactive-document/material-ui`:

- **Layout:** Container (max-width + padding), Grid (CSS Grid, columns/rows/spacing).
- **Data display:** Divider, Avatar, Badge, Chip, Icon (wrapper), List/ListItem, Table (TableHead, TableBody, TableRow, TableCell), Tooltip (Fade).

Each component uses theme tokens, `.dark` support, and has a Storybook story.

## Completed

- [x] Container and Grid implemented; stories; exported.
- [x] Divider, Avatar, Badge, Chip, Icon, List, ListItem, Table*, Tooltip implemented; stories; exported.
- [x] Library README and `src/index.ts` updated.
- [ ] Phase merged to main (pending PR/approval).

\* Table: Table, TableHead, TableBody, TableRow, TableCell (variant head/body).

## Notes

- Icon is a wrapper for SVG content with size and color (inherit/primary/secondary/muted). No icon set dependency.
- Tooltip uses Fade and Portal; positioning is fixed relative to a wrapper anchor.
