# Phase: Tailwind and theming (ux-and-stack-overhaul)

Tailwind CSS v4 with CSS-first `@theme` configuration and a dark/light theming system using M3 color tokens and chart palettes. Theme preference persisted via zustand (minimal store for this phase or app state).

---

## Scope

- **Tailwind 4** — Integrate Tailwind v4 in frontend and Storybook; migrate inline `style={{}}` toward utility classes where practical.
- **Theming and color system** — Light and dark mode with M3 tokens; dedicated 8-color chart palettes per mode; theme preference persistence.

---

## Goals

- Frontend and Storybook use Tailwind 4 with a single source of theme tokens.
- Users can switch light/dark; chart colors stay accessible in both modes.

---

## References

- Exploration: [tailwind-4-integration](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/tailwind-4-integration.md), [theming-and-color-system](../../../planning/explorations/completed/ux-and-stack-overhaul/feature-sets/theming-and-color-system.md).
