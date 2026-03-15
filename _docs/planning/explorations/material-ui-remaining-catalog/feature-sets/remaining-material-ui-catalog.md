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
