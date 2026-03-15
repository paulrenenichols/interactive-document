# Phase: Material UI catalog and polish (ux-and-stack-overhaul)

Follow-up to phase 03. Fixes theme reactivity and enter/exit animations on the existing four components (Button, TextField, Dialog, Menu), then implements the remaining ~53 components/utilities for MUI feature parity. Transitions align with MUI (Fade for Dialog, Grow for Menu/Popover; 225ms enter / 195ms exit).

---

## Scope

- **Theme and animation fixes** — Existing components respond to `.dark` (no flash in Storybook; useLayoutEffect). Dialog: Fade for backdrop and panel (MUI default). Menu: Grow from anchor with transformOrigin; exit animation before unmount. Motion tokens in theme.css; Transitions utility (Fade, Grow).
- **Utilities first** — Portal, Modal (Fade backdrop), Popover (Grow), ClickAwayListener, useMediaQuery, CSSBaseline, Transitions. Refactor Dialog to use Modal; Menu to use Popover + Grow.
- **Remaining catalog** — Inputs (IconButton, Checkbox, Switch, Select, …), Data display (Typography, Avatar, Badge, …), Feedback (Alert, Snackbar, …), Surface (Paper, Card, Accordion, …), Navigation (Tabs, Drawer, …), Layout (Box, Stack, …). Each uses theme tokens and documented transitions where applicable.

---

## Goals

- All material-ui components respond correctly to theme (light/dark) when the app toggles `.dark` on the document root.
- Overlays (Dialog, Menu, future Popover/Select) use MUI-consistent enter/exit animations.
- Full catalog per exploration [material-design-component-library](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/material-design-component-library.md) (57 core, excluding 4 deferrable).

---

## References

- Exploration: [material-design-component-library](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/material-design-component-library.md).
- Progress (phase 03): [03-material-component-library](../../../../progress/ux-and-stack-overhaul/03-material-component-library.md) (includes gap table).
- Plan: [phase-plans/03b-material-ui-catalog-and-polish.md](../phase-plans/03b-material-ui-catalog-and-polish.md).
