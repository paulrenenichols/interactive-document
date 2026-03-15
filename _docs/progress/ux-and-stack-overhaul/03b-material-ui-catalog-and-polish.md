# Progress: 03b-material-ui-catalog-and-polish (ux-and-stack-overhaul)

## Summary

Phase 03b adds theme reactivity, MUI-consistent enter/exit transitions, utilities (Portal, Modal, Popover, ClickAwayListener, useMediaQuery, CSSBaseline), refactors Dialog and Menu to use Modal and Popover, and implements a first batch of catalog components (Box, Stack, Typography, Paper, IconButton). Remaining catalog components can be added in follow-up work.

## Theme and motion foundation

- **Motion tokens** in `libs/material-ui/src/theme.css`: `--duration-short` (150ms), `--duration-standard` (225ms), `--duration-leave` (195ms), `--ease-in`, `--ease-out`, `--ease-in-out`.
- **Overlay token**: `--overlay` (and `--color-overlay` in `@theme`) for light/dark backdrops.
- **Storybook preview**: Theme applied with `useLayoutEffect` and `.dark` on `document.documentElement` to avoid theme flash.
- **Transitions**: `Fade` and `Grow` components with configurable timeout (default enter 225ms, exit 195ms), `onExited` for unmount-after-exit.

## Existing component fixes

- **Button, TextField**: Short transition for hover/focus (`transition-colors duration-[150ms]`).
- **Dialog**: Backdrop and panel use Fade; content stays mounted until exit completes (`onExited`); backdrop uses semantic `var(--overlay)`; refactored to use **Modal** (Portal + Fade backdrop + Fade content + focus trap + scroll lock).
- **Menu**: Menu list uses Grow with `transformOrigin: top left`; exit animation before unmount; refactored to use **Popover** (Portal + Fade backdrop + Grow content + anchorEl from ref).

## Utilities added

- **Portal** — `createPortal` into `document.body` or optional container.
- **Modal** — Backdrop (Fade), focus trap (Tab cycles within content), scroll lock on body, Escape to close; used by Dialog.
- **Popover** — Anchor-based overlay with `anchorOrigin`, Grow for content, Fade backdrop; used by Menu.
- **ClickAwayListener** — Wrapper that fires `onClickAway` on mousedown/touchstart outside.
- **useMediaQuery** — Hook returning boolean for a given media query string.
- **CSSBaseline** — Style tag with box-sizing, body background/text from theme.

## Catalog (first batch)

- **Box** — Layout primitive, optional `component` prop.
- **Stack** — Flex with direction (row/column), spacing (8px units), alignItems, justifyContent.
- **Typography** — Variants h1–h6, body1, body2, caption, overline; theme text tokens.
- **Paper** — Elevated, outlined, filled variants; theme backgrounds.
- **IconButton** — Small/medium/large; theme text and hover.

Stories added for Box, Stack, Typography, Paper, IconButton.

## Remaining catalog (for follow-up)

Per phase plan and [progress 03](03-material-component-library.md) gap table: inputs (IconButton done; Checkbox, Switch, Select, etc.), data display (Avatar, Badge, Chip, Divider, List, Table, Tooltip), feedback (Alert, CircularProgress, Snackbar, etc.), surface (Accordion, AppBar, Card), navigation (Tabs, Drawer, Breadcrumbs, etc.), layout (Container, Grid, ImageList). Each should use theme tokens and Fade/Grow/Slide/Collapse where specified.

## Branch and commits

- Branch: `ux-and-stack-overhaul/03b-material-ui-catalog-and-polish`.
- Checkpoint commits: (1) "fix(material-ui): theme reactivity and MUI-consistent transitions for Dialog and Menu", (2) "feat(material-ui): add Portal, Modal, Popover, ClickAwayListener, useMediaQuery, CSSBaseline". Final commit on user approval: catalog batch (Box, Stack, Typography, Paper, IconButton), README, and this progress doc.
