# Phase: Material component library (ux-and-stack-overhaul)

Custom Material Design 3 component library in `libs/material-ui` as a publishable Nx library with its own Storybook. Built with Tailwind; targets MUI feature parity (~57 core components). Designed for eventual ejection to a standalone repo/npm package.

---

## Scope

- **libs/material-ui** — Nx library with lint and test targets; Tailwind and M3 design tokens.
- **Core components** — Buttons, inputs, dialogs, menus, etc. per exploration scope; Storybook for each.
- **Dedicated Storybook** — Build and deploy (with phase 01 CI) to GitHub Pages (e.g. subpath for material-ui).

---

## Goals

- Frontend and future editor can consume `@<workspace>/material-ui` components.
- Component API and styling align with M3 and existing theme from phase 02.

---

## References

- Exploration: [material-design-component-library](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/material-design-component-library.md).
