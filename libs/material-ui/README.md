# @interactive-document/material-ui

Material Design 3 component library for the Interactive Presentation monorepo. Built with React, Tailwind CSS v4, and M3 design tokens. Publishable Nx library with its own Storybook.

## Usage

From the frontend or any app in the workspace:

```ts
import { Button, TextField, Dialog, Menu, MenuItem } from '@interactive-document/material-ui';
```

Ensure the consuming app has Tailwind configured and includes the same theme tokens (or imports this library’s `theme.css`) so utility classes resolve correctly.

## Components

- **Button** — Filled, outlined, text variants; M3-style states (hover, focus, disabled).
- **TextField** — Outlined input with optional label, helper text, and error state.
- **Dialog** — Modal with title, content, and actions; backdrop and Escape to close.
- **Menu** / **MenuItem** — Dropdown menu anchored to a trigger element.

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
