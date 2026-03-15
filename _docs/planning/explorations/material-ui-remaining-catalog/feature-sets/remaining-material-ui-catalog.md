# Remaining Material UI catalog

Created with the **docs-driven-dev** skill (v1.4.0). Updated with the **docs-driven-dev** skill (v1.5.0).

## Summary

Implement the remaining components and layout primitives for `libs/material-ui` so the library reaches the full catalog scoped in the ux-and-stack-overhaul exploration. What is **already implemented** (phase 03 + 03b) is out of scope here; see [progress 03](../../../../progress/05-ux-and-stack-overhaul/03-material-component-library.md) and [progress 03b](../../../../progress/05-ux-and-stack-overhaul/03b-material-ui-catalog-and-polish.md).

All new components must use theme tokens from `theme.css`, support `.dark` (no hardcoded colors), and use Fade/Grow/Slide/Collapse where the phase plan specifies. Each component gets a Storybook story.

## References

- Original scope: [material-design-component-library](../../../completed/05-ux-and-stack-overhaul/feature-sets/material-design-component-library.md) (ux-and-stack-overhaul exploration).
- Gap table and counts: [03-material-component-library](../../../../progress/05-ux-and-stack-overhaul/03-material-component-library.md#gap-vs-exploration-scope).

## Already done (not in scope)

- **Inputs:** Button, TextField, IconButton.
- **Data display:** Typography.
- **Feedback:** Dialog.
- **Surface:** Paper.
- **Navigation:** Menu / MenuItem.
- **Layout:** Box, Stack.
- **Utilities:** Portal, Modal, Popover, ClickAwayListener, useMediaQuery, CSSBaseline, Transitions (Fade, Grow).

## Remaining catalog (in scope)

### Inputs (11)

| Component     | Notes |
|--------------|-------|
| Autocomplete | Combobox with search/filter; build on TextField + Menu/Popover. |
| ButtonGroup  | Group related buttons; shared styling. |
| Checkbox     | Standard + indeterminate; optional label. |
| FAB          | Floating action button; small/regular/large, extended. |
| NumberField  | Numeric input with increment/decrement. |
| Radio        | Radio group wrapper. |
| Rating        | Star-based rating (standard, half, custom icons). |
| Select        | Dropdown with options; can use Popover. |
| Slider        | Continuous, discrete, range; value label. |
| Switch        | Toggle with optional label. |
| ToggleButton  | On/off button; exclusive and grouped variants. |

### Data display (8)

| Component     | Notes |
|--------------|-------|
| Avatar        | Image, initials, or icon fallback; sizes. |
| Badge         | Dot or count; anchor to icon/avatar. |
| Chip          | Assist, filter, input, suggestion; selectable, deletable. |
| Divider       | Horizontal, vertical; full-width, inset. |
| Icons         | Wrapper for icon nodes (icon set TBD). |
| List / ListItem | Single/two/three-line; leading/trailing. |
| Table         | Basic, sortable, selectable, paginated. |
| Tooltip       | Hover/focus; plain or rich; use Fade. |

### Feedback (6)

| Component        | Notes |
|------------------|-------|
| Alert            | Severity: success, info, warning, error; optional action. |
| Backdrop         | Overlay (can share Modal backdrop token). |
| CircularProgress | Determinate, indeterminate. |
| LinearProgress   | Determinate, indeterminate, buffer. |
| Skeleton         | Text, rectangular, circular; pulse. |
| Snackbar         | Auto-dismiss; optional action; consider Fade. |

### Surface (3)

| Component | Notes |
|-----------|-------|
| Accordion | Expand/collapse; header + content; Collapse transition. |
| AppBar    | Top app bar; center-aligned, small/medium/large. |
| Card      | Elevated, filled, outlined; CardHeader, CardContent, CardActions, CardMedia. |

### Navigation (9)

| Component        | Notes |
|------------------|-------|
| BottomNavigation | Icon + label; fixed bottom. |
| BottomSheet      | Slide up from bottom; use Slide transition. |
| Breadcrumbs      | Link trail; separators. |
| Drawer           | Side panel; persistent or temporary; Slide. |
| Link             | Themed anchor. |
| NavigationRail   | Vertical nav; icons. |
| Pagination       | Page navigation. |
| Stepper          | Step indicator (horizontal/vertical). |
| Tabs             | Tab list + panel; can use existing components. |

### Layout (3)

| Component | Notes |
|-----------|-------|
| Container | Max-width + padding. |
| Grid      | CSS Grid layout; rows/columns. |
| ImageList | Masonry or standard image grid. |

## Dependency order (suggested)

1. **Layout:** Container, Grid — minimal dependencies.
2. **Data display:** Divider, Avatar, Badge, Chip, Icons, List/ListItem, Table, Tooltip.
3. **Inputs:** Checkbox, Switch, Radio, Slider, Select, NumberField, ButtonGroup, ToggleButton, Rating, Autocomplete, FAB.
4. **Feedback:** Skeleton, CircularProgress, LinearProgress, Backdrop (if not folded into Modal), Alert, Snackbar.
5. **Surface:** Card (uses Paper), Accordion, AppBar.
6. **Navigation:** Link, Breadcrumbs, Tabs, Drawer, BottomNavigation, NavigationRail, Stepper, Pagination, BottomSheet.

## Deliverables

- Each component in `libs/material-ui/src/<ComponentName>/` with `index.ts`, `*.tsx`, and `*.stories.tsx`.
- Export from `libs/material-ui/src/index.ts`.
- Update `libs/material-ui/README.md` with new entries.
- Optional: add Slide and Collapse to Transitions if not yet present, for Drawer/BottomSheet/Accordion.

## Storybook publishing (GitHub Pages)

Publishing is **already** done in CI (`.github/workflows/ci.yml`): one GitHub Pages site with frontend Storybook at `/` and material-ui Storybook at `/material-ui/`. No separate workflow or site is required; the existing job builds both, merges them into a single artifact (frontend at root, material-ui in `material-ui/`), and deploys. The frontend Storybook is unchanged at the root; the material-ui catalog is an extra app at the `/material-ui/` subpath.

- **Build:** `nx run material-ui:build-storybook`; output is `libs/material-ui/storybook-static`. CI runs this and copies the result into the combined artifact.
- **Base path:** If the material-ui Storybook has broken assets when served from `/material-ui/`, set Storybook’s `base` (or Vite `base`) in `libs/material-ui/.storybook` to `/material-ui/` — or `/<repo>/material-ui/` for a project site (e.g. `https://<org>.github.io/<repo>/`) — so asset URLs match the subpath.

## Frontend migration (replace with material-ui)

Replace UI in the frontend app (`apps/frontend`) with equivalents from `@interactive-document/material-ui` so the app uses the shared component library and theme consistently.

- **Audit:** Identify all UI that can be replaced — forms (inputs, buttons), layout (containers, stacks), navigation (links, menus where used), surfaces (cards, paper), typography, and any ad-hoc styled elements. The frontend currently uses native HTML and inline styles in many places (e.g. login/register, edit pages, layout).
- **Replace:** Swap those with library components: e.g. `Button`, `TextField`, `Typography`, `Box`, `Stack`, `Paper`, `Link` (or Next.js `Link` wrapped with library styling), and others as the catalog grows. Ensure the app’s theme provider (or root) applies the same theme/class (e.g. `.dark`) so library tokens and dark mode stay in sync.
- **Order:** Prefer replacing screens that use components already in the library first (Button, TextField, Typography, Box, Stack, Paper, Dialog, Menu, etc.). Add and adopt new catalog components (e.g. Card, Tabs, Drawer) as they are implemented.
- **Scope:** `apps/frontend` only; other apps can be migrated in a later phase if needed.
