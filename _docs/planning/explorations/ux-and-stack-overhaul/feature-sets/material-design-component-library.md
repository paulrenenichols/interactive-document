# Material Design component library

## Summary

Build a custom component library using Tailwind that follows Material Design 3 (M3) principles. Full catalog approach. Components live in `apps/frontend/components/material-ui/` with Storybook stories alongside each component. All components support dark/light mode via Tailwind's `dark:` variant.

This is a from-scratch library -- no dependency on `@mui/material` or Emotion. The trade-off is full control over styling and bundle size vs. higher initial development effort.

## Current state

- No reusable UI components exist. Only chart components (12 files in `apps/frontend/components/`).
- All pages build their UI with inline styles and raw HTML elements (`<button>`, `<input>`, `<div>`).
- Storybook is configured but only has chart stories.

## Component catalog

### Core inputs

| Component | Variants | Notes |
|-----------|----------|-------|
| Button | Filled, outlined, tonal, text, elevated | M3 states: enabled, hovered, focused, pressed, disabled |
| FAB | Small, regular, large, extended | Floating action button with icon + optional label |
| IconButton | Standard, filled, filled-tonal, outlined | Icon-only variant of Button |
| TextField | Filled, outlined | With leading/trailing icons, helper text, error state, character count |
| Select | Filled, outlined | Dropdown menu with search/filter option |
| Checkbox | Standard, indeterminate | With optional label |
| Radio | Standard | Radio group wrapper |
| Switch | Standard | With optional label |
| Slider | Continuous, discrete | With value label, range variant |

### Navigation

| Component | Notes |
|-----------|-------|
| TopAppBar | Center-aligned, small, medium, large. Scrolling behavior (fixed, scroll-off). |
| NavigationDrawer | Modal and standard variants. Collapsible sections. |
| NavigationRail | Vertical icon+label nav for desktop. |
| Tabs | Primary and secondary. Scrollable tab row. |
| BottomSheet | Modal and standard. Drag handle. |

### Containment

| Component | Variants | Notes |
|-----------|----------|-------|
| Card | Elevated, filled, outlined | Clickable and non-clickable |
| Dialog | Basic, full-screen | With title, content, actions area |
| Menu | Standard, cascading | Anchored to trigger element |
| Snackbar | Standard, with action | Auto-dismiss with configurable duration |
| Tooltip | Plain, rich | Hover and focus triggered |

### Layout

| Component | Notes |
|-----------|-------|
| Divider | Horizontal, vertical. Full-width, inset, middle-inset. |
| List | Single-line, two-line, three-line items. Leading/trailing elements. |
| ListItem | Text, icon, avatar, checkbox, switch, trailing text. |

### Data display

| Component | Notes |
|-----------|-------|
| DataTable | Sortable columns, row selection, pagination. |
| Chip | Assist, filter, input, suggestion. Selectable, deletable. |
| Badge | Dot, count. Anchored to icon or avatar. |
| Avatar | Image, initials, icon fallback. Sizes: small, medium, large. |

### Feedback

| Component | Notes |
|-----------|-------|
| CircularProgress | Determinate, indeterminate. |
| LinearProgress | Determinate, indeterminate, buffer. |
| Skeleton | Text, rectangular, circular variants. Pulse animation. |

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

## Directory structure

```
apps/frontend/components/material-ui/
  Button/
    Button.tsx
    Button.stories.tsx
  TextField/
    TextField.tsx
    TextField.stories.tsx
  Card/
    Card.tsx
    Card.stories.tsx
  ...
  index.ts              # barrel export
```

Each component folder contains the component implementation and its Storybook stories. A barrel `index.ts` re-exports all components for convenient imports.

## Development approach

- **Storybook-first:** Every component is built and reviewed in Storybook before being used in application pages.
- **Accessibility:** All components follow WAI-ARIA patterns. Keyboard navigation, focus management, screen reader labels.
- **Composition over configuration:** Prefer composable sub-components (e.g., `<Card><CardHeader /><CardContent /></Card>`) over prop-heavy monoliths.
- **Ref forwarding:** All components forward refs for integration with form libraries and focus management.

## Dependencies

- [Tailwind 4 integration](tailwind-4-integration.md) -- components are built with Tailwind utility classes.
- [Theming and color system](theming-and-color-system.md) -- components consume M3 color and design tokens.

## Out of scope

- Date picker, time picker -- complex components that can be added as a follow-up.
- Rich text editor component -- handled separately in the WYSIWYG editor feature set.
- Icon library selection -- the component library will accept icons as React nodes; the specific icon set (Material Symbols, Lucide, etc.) is a separate decision.
