# @interactive-document/material-ui

Material Design 3 component library for the Interactive Presentation monorepo. Built with React, Tailwind CSS v4, and M3 design tokens. Publishable Nx library with its own Storybook.

## Usage

From the frontend or any app in the workspace:

```ts
import {
  Button,
  TextField,
  Dialog,
  Menu,
  MenuItem,
  Box,
  Stack,
  Typography,
  Paper,
  IconButton,
  Fade,
  Grow,
  Portal,
  Modal,
  Popover,
  ClickAwayListener,
  useMediaQuery,
  CSSBaseline,
  Container,
  Grid,
  Divider,
  Avatar,
  Badge,
  Chip,
  Icon,
  List,
  ListItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from '@interactive-document/material-ui';
```

Ensure the consuming app has Tailwind configured and includes the same theme tokens (or imports this library’s `theme.css`) so utility classes resolve correctly.

## Components and utilities

- **Button** — Filled, outlined, text variants; M3-style states; short transition for hover/focus.
- **TextField** — Outlined input with optional label, helper text, error state; transition-colors.
- **Dialog** — Modal (via Modal) with title, content, actions; Fade for backdrop and panel (225ms enter / 195ms exit); Escape to close.
- **Menu** / **MenuItem** — Popover-based dropdown with Grow from anchor (transformOrigin top-left); Fade backdrop.
- **Box** — Layout primitive with optional `component` prop.
- **Stack** — Flex layout with direction, spacing, align, justify.
- **Typography** — Text variants (h1–h6, body1, body2, caption, overline) using theme tokens.
- **Paper** — Surface with elevated, outlined, or filled variant.
- **IconButton** — Icon-sized button with small/medium/large.
- **Container** — Max-width layout with optional gutters; breakpoints xs–xl.
- **Grid** — CSS Grid layout with configurable columns, rows, and spacing.
- **Divider** — Horizontal or vertical separator (theme border color).
- **Avatar** — Circular or rounded avatar; image or initials; size prop.
- **Badge** — Badge overlay (count or dot) on children; default/primary/error.
- **Chip** — Compact pill (filled/outlined); optional onDelete.
- **Icon** — Wrapper for SVG icons with size and color (inherit/primary/secondary/muted).
- **List** / **ListItem** — List layout with optional dense padding.
- **Table** — Table, TableHead, TableBody, TableRow, TableCell (variant head/body).
- **Tooltip** — Hover tooltip with Fade; placement and enter/leave delay.
- **Transitions** — Fade and Grow (MUI-consistent timeouts: enter 225ms, exit 195ms).
- **Portal** — Render children into `document.body` or optional container.
- **Modal** — Backdrop (Fade), focus trap, scroll lock, semantic overlay token.
- **Popover** — Positioned overlay with anchorOrigin, Grow for content.
- **ClickAwayListener** — Click/touch outside detection.
- **useMediaQuery** — Hook returning boolean for a media query.
- **CSSBaseline** — Optional global reset and M3 body styles.

Theme and motion: All components respond to `.dark` on the document root (no flash in Storybook; theme applied with `useLayoutEffect`). Overlays use Fade (Dialog) or Grow (Menu/Popover) with documented durations. Motion tokens are in `theme.css` (`--duration-standard`, `--duration-leave`, etc.).

More components will be added in line with the [material-design-component-library](../../_docs/planning/explorations/completed/ux-and-stack-overhaul/feature-sets/material-design-component-library.md) exploration.

## Commands

- **Build:** `nx build material-ui`
- **Lint:** `nx lint material-ui`
- **Test:** `nx test material-ui`
- **Storybook (dev):** `nx storybook material-ui` — http://localhost:6007
- **Build Storybook:** `nx build-storybook material-ui` — output in `libs/material-ui/storybook-static`

## Structure

- `src/` — Component source and barrel export; each component has a folder with `Component.tsx`, `Component.stories.tsx`, and `index.ts`.
- `src/theme.css` — Tailwind v4 `@theme` and light/dark CSS variables used by components and Storybook.
- `.storybook/` — Storybook config (React + Vite); preview imports `theme.css` and provides theme toolbar.

## Building

Run `nx build material-ui` to compile the library. Output goes to `dist/libs/material-ui`. Stories and tests are excluded from the build.
