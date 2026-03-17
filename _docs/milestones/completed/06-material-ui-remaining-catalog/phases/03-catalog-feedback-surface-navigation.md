# Phase: Catalog — feedback, surface, navigation (material-ui-remaining-catalog)

Implement feedback, surface, and navigation components for `libs/material-ui`. Each uses theme tokens, supports `.dark`, and has a Storybook story. Use Fade/Grow/Slide/Collapse where specified (add Slide and Collapse to Transitions if not yet present).

---

## Scope

- **Feedback:** Skeleton (text, rectangular, circular; pulse), CircularProgress (determinate, indeterminate), LinearProgress (determinate, indeterminate, buffer), Backdrop (overlay; can share Modal token), Alert (severity + optional action), Snackbar (auto-dismiss; optional action; consider Fade).
- **Surface:** Card (elevated, filled, outlined; CardHeader, CardContent, CardActions, CardMedia; uses Paper), Accordion (expand/collapse; Collapse transition), AppBar (top app bar; center-aligned, small/medium/large).
- **Navigation:** Link (themed anchor), Breadcrumbs (link trail; separators), Tabs (tab list + panel), Drawer (persistent or temporary; Slide), BottomNavigation (icon + label; fixed bottom), NavigationRail (vertical; icons), Stepper (horizontal/vertical), Pagination, BottomSheet (slide up from bottom; Slide).
- Per exploration: export from `libs/material-ui/src/index.ts`, update README, add stories.

---

## References

- Exploration feature set: [remaining-material-ui-catalog](../../../../planning/explorations/completed/06-material-ui-remaining-catalog/feature-sets/remaining-material-ui-catalog.md).
