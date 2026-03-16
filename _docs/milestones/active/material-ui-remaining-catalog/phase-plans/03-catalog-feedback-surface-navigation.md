# Phase plan: Catalog — feedback, surface, navigation (material-ui-remaining-catalog)

Step-by-step execution plan. Branch from main after phase 02 is merged. Commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `material-ui-remaining-catalog/03-catalog-feedback-surface-navigation`.
- Branch from main after phase 02 is merged.

---

## 2. Feedback, surface, and navigation components

- Add **Slide** and **Collapse** to Transitions if not yet present. Implement **Skeleton**, **CircularProgress**, **LinearProgress**, **Backdrop**, **Alert**, **Snackbar**; **Card** (with CardHeader, CardContent, CardActions, CardMedia), **Accordion**, **AppBar**; **Link**, **Breadcrumbs**, **Tabs**, **Drawer**, **BottomNavigation**, **NavigationRail**, **Stepper**, **Pagination**, **BottomSheet** per exploration. Each: theme tokens, `.dark`, story; use Fade/Grow/Slide/Collapse where specified. Export and update library README.
- **Checkpoint:** Commit and push at logical subgroups (e.g. feedback, then surface, then navigation).

---

## 3. Progress doc and final step

- Add or update `_docs/progress/material-ui-remaining-catalog/03-catalog-feedback-surface-navigation.md`. Update project-root README if needed.
- On user approval: final commit and push (e.g. "chore(material-ui-remaining-catalog): complete 03-catalog-feedback-surface-navigation phase").
