# Phase plan: Material UI catalog and polish (ux-and-stack-overhaul)

Step-by-step execution plan. Branch from main after phase 03 is merged. Commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `ux-and-stack-overhaul/03b-material-ui-catalog-and-polish`.
- Branch from main after phase 03 is merged.

---

## 2. Theme and motion foundation

- Add motion tokens to [libs/material-ui/src/theme.css](libs/material-ui/src/theme.css) (durations, easings per exploration).
- In [libs/material-ui/.storybook/preview.tsx](libs/material-ui/.storybook/preview.tsx), apply theme with `useLayoutEffect` and set `.dark` on `document.documentElement` so theme is applied before first paint.
- Implement **Transitions** utility: Fade and Grow (single child, forward ref + style; `in`, `timeout` e.g. `{ enter: 225, exit: 195 }`, `onExited`). Use MUI-consistent durations; Grow supports `transformOrigin` (e.g. top-left for Menu).

---

## 3. Fix existing components (theme + animation)

- **Button, TextField:** Ensure no hardcoded colors; optional short transition for hover/focus (e.g. `transition-colors` with duration-short).
- **Dialog:** Replace hardcoded overlay (e.g. `bg-black/50`) with semantic token from theme.css. Wrap backdrop in Fade, panel in Fade (not Grow—MUI Dialog uses Fade). Keep content mounted until exit completes (`onExited`). Timeout: enter 225ms, exit 195ms.
- **Menu:** Wrap menu list in Grow with `transformOrigin` from anchor (top-left). Optional Fade for backdrop. Unmount only after exit transition (`onExited`).

**Checkpoint:** Commit and push (e.g. "fix(material-ui): theme reactivity and MUI-consistent transitions for Dialog and Menu").

---

## 4. Utilities

- **Portal** — Render children into `document.body` or optional container.
- **Modal** — Backdrop (Fade) + focus trap + scroll lock; semantic overlay token.
- **Popover** — Positioned overlay (anchorEl + anchorOrigin/transformOrigin); Grow for content; optional Fade backdrop. Refactor Menu to use Popover + Grow.
- **ClickAwayListener** — Click outside detection.
- **useMediaQuery** — Hook for media query boolean.
- **CSSBaseline** — Optional global reset + M3 base styles from tokens.
- Refactor Dialog to use Modal; ensure Menu uses Popover.

**Checkpoint:** Commit and push (e.g. "feat(material-ui): add Portal, Modal, Popover, ClickAwayListener, useMediaQuery, CSSBaseline").

---

## 5. Remaining components (by category)

Implement in dependency order; add stories and use theme tokens + documented animations (Fade/Grow/Slide/Collapse where specified in plan).

- **Inputs:** IconButton, ButtonGroup, Checkbox, Switch, Radio, Select, Slider, NumberField, ToggleButton, FAB, Rating, Autocomplete.
- **Data display:** Typography, Avatar, Badge, Chip, Divider, Icons, List/ListItem, Table, Tooltip.
- **Feedback:** Alert, Backdrop (if not part of Modal), CircularProgress, LinearProgress, Skeleton, Snackbar.
- **Surface:** Paper, Card, Accordion, AppBar.
- **Navigation:** Tabs, Drawer, BottomSheet, BottomNavigation, NavigationRail, Breadcrumbs, Link, Pagination, Stepper.
- **Layout:** Box, Stack, Container, Grid, ImageList.

**Checkpoint:** Commit and push in batches (e.g. by category or logical group).

---

## 6. READMEs and progress

- Update [libs/material-ui/README.md](libs/material-ui/README.md) with full component list and transition behavior.
- Add or update `_docs/progress/ux-and-stack-overhaul/03b-material-ui-catalog-and-polish.md` summarizing theme/animation fixes and catalog completion.

---

## 7. Final step (on user approval)

- Final pass on progress doc; commit and push (e.g. "chore(ux-and-stack-overhaul): complete 03b-material-ui-catalog-and-polish phase").
