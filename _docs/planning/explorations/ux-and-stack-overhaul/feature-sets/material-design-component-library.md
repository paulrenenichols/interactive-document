# Material Design component library

Updated with the **docs-driven-dev** skill (v1.2.0).

## Summary

Build a custom component library using Tailwind that follows Material Design 3 (M3) principles. The library targets feature parity with MUI's component list (~50+ components), with our own API design. Components live in `libs/material-ui/` as a publishable Nx library with its own dedicated Storybook, designed for eventual ejection to a standalone repo and npm package.

This is a from-scratch library -- no dependency on `@mui/material` or Emotion. The trade-off is full control over styling, bundle size, and Tailwind-native design tokens vs. higher initial development effort.

## Current state

- No reusable UI components exist. Only chart components (12 files in `apps/frontend/components/`).
- All pages build their UI with inline styles and raw HTML elements (`<button>`, `<input>`, `<div>`).
- Storybook is configured for the frontend app but only has chart stories.
- No `libs/` directory exists in the monorepo.

## Component catalog

The catalog targets feature parity with MUI's full component list. Components are organized by MUI's category structure. Each entry notes whether it has a corresponding M3 spec or is a MUI-originated component without official M3 guidelines.

### Inputs

| Component | Variants | M3 spec | Notes |
|-----------|----------|---------|-------|
| Autocomplete | Standard, multiple, freeSolo, grouped | No | Combobox with search/filter. Built on TextField + Menu. |
| Button | Filled, outlined, tonal, text, elevated | Yes | M3 states: enabled, hovered, focused, pressed, disabled |
| ButtonGroup | Horizontal, vertical | No | Groups related buttons with shared styling |
| Checkbox | Standard, indeterminate | Yes | With optional label |
| FAB | Small, regular, large, extended | Yes | Floating action button with icon + optional label |
| IconButton | Standard, filled, filled-tonal, outlined | Yes | Icon-only variant of Button |
| NumberField | Standard | No | Numeric input with increment/decrement. Recently added to MUI. |
| Radio | Standard | Yes | Radio group wrapper |
| Rating | Standard, half, custom icons | No | Star-based rating input |
| Select | Filled, outlined | Yes | Dropdown menu with search/filter option |
| Slider | Continuous, discrete, range | Yes | With value label |
| Switch | Standard | Yes | With optional label |
| TextField | Filled, outlined | Yes | With leading/trailing icons, helper text, error state, character count |
| ToggleButton | Standard, exclusive, grouped | No | Button that toggles between on/off states |
| TransferList | Standard | No | **Deferrable.** Dual-list selection. Low priority for initial build. |

### Data display

| Component | Variants | M3 spec | Notes |
|-----------|----------|---------|-------|
| Avatar | Image, initials, icon fallback | No | Sizes: small, medium, large |
| Badge | Dot, count | Yes | Anchored to icon or avatar |
| Chip | Assist, filter, input, suggestion | Yes | Selectable, deletable |
| Divider | Horizontal, vertical | Yes | Full-width, inset, middle-inset |
| Icons | System/wrapper | Yes | Accepts icons as React nodes. Icon set (Material Symbols, Lucide, etc.) is a separate decision. |
| List | Single-line, two-line, three-line | Yes | Leading/trailing elements |
| ListItem | Text, icon, avatar, checkbox, switch | Yes | Composable sub-components |
| Table | Basic, sortable, selectable, paginated | Yes | DataTable variant with enhanced features |
| Tooltip | Plain, rich | Yes | Hover and focus triggered |
| Typography | Display, headline, title, body, label | Yes | All M3 type scale roles and sizes |

### Feedback

| Component | Variants | M3 spec | Notes |
|-----------|----------|---------|-------|
| Alert | Standard, filled, outlined | No | Severity levels: success, info, warning, error. With optional action. |
| Backdrop | Standard | No | Overlay behind modals/dialogs |
| CircularProgress | Determinate, indeterminate | Yes | |
| Dialog | Basic, full-screen | Yes | With title, content, actions area |
| LinearProgress | Determinate, indeterminate, buffer | Yes | |
| Skeleton | Text, rectangular, circular | No | Pulse animation |
| Snackbar | Standard, with action | Yes | Auto-dismiss with configurable duration |

### Surface

| Component | Variants | M3 spec | Notes |
|-----------|----------|---------|-------|
| Accordion | Standard, controlled | Yes (as "Expansion panel") | Expand/collapse sections. Header + content. |
| AppBar | Center-aligned, small, medium, large | Yes (as "Top app bar") | Scrolling behavior: fixed, scroll-off |
| Card | Elevated, filled, outlined | Yes | Clickable and non-clickable. Composable sub-components (CardHeader, CardContent, CardActions, CardMedia). |
| Paper | Elevation levels 0-5 | Yes | Base surface component. Foundation for Card, Dialog, Menu, etc. |

### Navigation

| Component | Variants | M3 spec | Notes |
|-----------|----------|---------|-------|
| BottomNavigation | Standard | Yes | 3-5 destinations with icons + labels |
| BottomSheet | Modal, standard | Yes | Drag handle. Snap points. |
| Breadcrumbs | Standard, with separator | No | Collapsed state for deep hierarchies |
| Drawer | Modal, standard, persistent | Yes (as "Navigation drawer") | Collapsible sections |
| Link | Standard, button-like | No | Styled anchor with underline variants |
| Menu | Standard, cascading | Yes | Anchored to trigger element |
| NavigationRail | Standard | Yes | Vertical icon+label nav for desktop |
| Pagination | Standard, outlined, rounded | No | Page count, prev/next, boundary/sibling count |
| SpeedDial | Standard | No | **Deferrable.** FAB that expands to reveal actions. Low priority. |
| Stepper | Horizontal, vertical, linear, non-linear | No | Step labels, optional step content, error states |
| Tabs | Primary, secondary, scrollable | Yes | With indicator animation |

### Layout

| Component | Variants | M3 spec | Notes |
|-----------|----------|---------|-------|
| Box | Standard | No | Generic container with Tailwind class passthrough. Convenience wrapper. |
| Container | Fixed, fluid | No | Max-width responsive container |
| Grid | Standard | No | CSS Grid-based responsive layout. Not the legacy flexbox grid. |
| ImageList | Standard, masonry, quilted | Yes | Grid of images with optional titles/captions |
| Stack | Horizontal, vertical | No | Flexbox-based linear layout with spacing |

### Utilities

Non-visual components and hooks that support the component library.

| Utility | Type | Notes |
|---------|------|-------|
| ClickAwayListener | Component | Detects clicks outside a wrapped element. Used by Menu, Select, Autocomplete. |
| CSSBaseline | Component | Global CSS reset + M3 defaults (typography, background, text color). |
| Modal | Component | Unstyled overlay manager. Focus trap, scroll lock, backdrop. Foundation for Dialog, Drawer, BottomSheet. |
| Popover | Component | Positioned overlay anchored to a trigger. Foundation for Menu, Tooltip, Select dropdown. |
| Portal | Component | Renders children into a DOM node outside the parent hierarchy. Used by Modal, Popover. |
| Transitions | Components | Fade, Grow, Slide, Collapse, Zoom. CSS transition wrappers for enter/exit animations. |
| useMediaQuery | Hook | Reactive media query matching. Breakpoint detection. |

### Lab (experimental / future)

| Component | M3 spec | Notes |
|-----------|---------|-------|
| Masonry | No | **Deferrable.** Pinterest-style layout. |
| Timeline | No | **Deferrable.** Vertical timeline with alternating content. |

## Component count summary

| Category | Count | Deferrable |
|----------|-------|------------|
| Inputs | 15 | 1 (TransferList) |
| Data display | 10 | 0 |
| Feedback | 7 | 0 |
| Surface | 4 | 0 |
| Navigation | 11 | 1 (SpeedDial) |
| Layout | 5 | 0 |
| Utilities | 7 | 0 |
| Lab | 2 | 2 (Masonry, Timeline) |
| **Total** | **61** | **4** |

Core build: **57 components/utilities.** Deferrable 4 can be added later without affecting the rest of the library.

## Design tokens

Defined as Tailwind `@theme` tokens (see [theming-and-color-system.md](theming-and-color-system.md) for the full color system).

### Elevation

M3 elevation levels mapped to CSS box-shadow values:

| Level | Usage |
|-------|-------|
| 0 | Flat surfaces |
| 1 | Cards, app bars |
| 2 | Buttons (resting), navigation drawers |
| 3 | FABs, dialogs, menus |
| 4 | Navigation drawers (elevated) |
| 5 | Modals, bottom sheets |

### Shape (corner radius)

M3 shape scale:

| Token | Value | Usage |
|-------|-------|-------|
| none | 0px | Full-bleed surfaces |
| extra-small | 4px | Badges |
| small | 8px | Chips, small cards |
| medium | 12px | Cards, text fields |
| large | 16px | FABs, large cards |
| extra-large | 28px | Dialogs, bottom sheets |
| full | 9999px | Pills, circular buttons |

### Typography

M3 type scale using Google Fonts (specific font selections TBD during implementation):

| Role | Sizes |
|------|-------|
| Display | Large, Medium, Small |
| Headline | Large, Medium, Small |
| Title | Large, Medium, Small |
| Body | Large, Medium, Small |
| Label | Large, Medium, Small |

### Motion

M3 easing and duration tokens:

| Token | Value | Usage |
|-------|-------|-------|
| emphasized | cubic-bezier(0.2, 0, 0, 1) | Most transitions |
| emphasized-decelerate | cubic-bezier(0.05, 0.7, 0.1, 1) | Enter/appear |
| emphasized-accelerate | cubic-bezier(0.3, 0, 0.8, 0.15) | Exit/disappear |
| standard | cubic-bezier(0.2, 0, 0, 1) | Simple state changes |
| duration-short | 150ms | Hover, focus |
| duration-medium | 250ms | Open/close |
| duration-long | 400ms | Page transitions |

## Library location and structure

The library lives in `libs/material-ui/` as a **publishable Nx library project**, separate from the frontend application.

```
libs/material-ui/
  src/
    Button/
      Button.tsx
      Button.stories.tsx
      index.ts
    TextField/
      TextField.tsx
      TextField.stories.tsx
      index.ts
    Card/
      Card.tsx
      CardHeader.tsx
      CardContent.tsx
      CardActions.tsx
      CardMedia.tsx
      Card.stories.tsx
      index.ts
    ...
    index.ts              # barrel export
  .storybook/
    main.ts               # library-specific Storybook config
    preview.ts            # imports library theme CSS
  package.json            # @interactive-document/material-ui
  tsconfig.json
  tsconfig.lib.json
  project.json            # Nx project config (build, test, storybook, lint targets)
  README.md
```

### Package configuration

- **Package name:** `@interactive-document/material-ui` (scoped, ready for npm publish)
- **Peer dependencies:** `react`, `react-dom`, `tailwindcss` (consumers provide these)
- **No dependencies on:** `apps/frontend`, Next.js, or any app-specific code
- **TypeScript path alias:** Configured in root `tsconfig.base.json` so the frontend app imports as `import { Button } from '@interactive-document/material-ui'`

### Nx project targets

| Target | Command | Purpose |
|--------|---------|---------|
| `build` | Compiles library for publishing | Produces dist output for npm |
| `test` | Runs component unit tests | Vitest or Jest |
| `storybook` | `storybook dev -p 6007` | Library Storybook (port 6007 to avoid conflict with frontend on 6006) |
| `build-storybook` | Static Storybook build | For deployment/documentation |
| `lint` | ESLint | Code quality |

## Dedicated Storybook

The library has its own Storybook, independent of the frontend app's Storybook.

| Aspect | Library Storybook | Frontend App Storybook |
|--------|------------------|----------------------|
| Location | `libs/material-ui/.storybook/` | `apps/frontend/.storybook/` |
| Run command | `nx storybook material-ui` | `nx storybook frontend` |
| Port | 6007 | 6006 |
| Content | Component API docs, variants, states, accessibility | Chart stories, composed views, page-level stories |
| Theme | Imports library's own theme CSS | Imports app's `globals.css` |
| Ships with library | Yes (on ejection) | No |

Stories live alongside components (`Button/Button.stories.tsx`). Every component has stories covering all variants, states, and interactive controls via Storybook args.

## Ejection strategy

The library is designed for incremental ejection:

1. **Current: Nx library** (`libs/material-ui/`) -- consumed via TypeScript path alias within the monorepo. Full Nx integration (caching, affected, dependency graph).

2. **Intermediate: internal package** (`packages/material-ui/`) -- move to `packages/` directory, add to `pnpm-workspace.yaml`. Still in the monorepo but structured as a standalone npm package. Consumed via workspace protocol (`"@interactive-document/material-ui": "workspace:*"`).

3. **Final: separate repo + npm** -- extract to its own git repository. Publish to npm (public or private registry). Consumed as a normal npm dependency.

Each step is non-breaking. The import path (`@interactive-document/material-ui`) stays the same across all three stages.

## Development approach

- **Storybook-first:** Every component is built and reviewed in the library's dedicated Storybook before being used in application pages.
- **Accessibility:** All components follow WAI-ARIA patterns. Keyboard navigation, focus management, screen reader labels.
- **Composition over configuration:** Prefer composable sub-components (e.g., `<Card><CardHeader /><CardContent /></Card>`) over prop-heavy monoliths.
- **Ref forwarding:** All components forward refs for integration with form libraries and focus management.
- **Dark mode:** All components support dark/light mode via Tailwind's `dark:` variant. No component-level theme prop needed.
- **MUI as reference, M3 as spec:** Use MUI's component list and behaviors as a reference for *what to build*. Use the M3 design spec as the authority for *how it should look and behave*. Where M3 has no spec (e.g., Autocomplete, Rating), follow established UX patterns.

## Dependencies

- [Tailwind 4 integration](tailwind-4-integration.md) -- components are built with Tailwind utility classes.
- [Theming and color system](theming-and-color-system.md) -- components consume M3 color and design tokens.

## Out of scope

- Date picker, time picker -- complex components that can be added as a follow-up after the core catalog is built.
- Rich text editor component -- handled separately in the WYSIWYG editor feature set.
- Icon library selection -- the component library provides an `Icon` wrapper component; the specific icon set (Material Symbols, Lucide, etc.) is a separate decision.
- Data grid (advanced) -- the `Table` component covers basic data display. A full-featured data grid (virtual scrolling, column resize, cell editing) is a separate consideration.
