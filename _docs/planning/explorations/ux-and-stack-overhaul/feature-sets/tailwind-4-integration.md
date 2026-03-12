# Tailwind 4 integration

## Summary

Bring Tailwind CSS v4 into the frontend app and Storybook. Tailwind v4 replaces the JavaScript config file (`tailwind.config.js`) with a CSS-first configuration model using `@theme` directives, making it a natural fit alongside the existing CSS custom properties in `globals.css`.

## Current state

- All styling is inline React `style={{}}` props. Zero `className` usage across all `.tsx` files.
- Theme tokens exist as CSS custom properties in `apps/frontend/app/globals.css` (25 lines, light mode only).
- No PostCSS configuration exists.
- Storybook imports `globals.css` in `preview.ts` for theme variables.

## Scope

### Installation and configuration

- Install `@tailwindcss/postcss` and `tailwindcss` v4 as dev dependencies.
- Create `postcss.config.mjs` at the frontend app root with the `@tailwindcss/postcss` plugin.
- Next.js 15 supports PostCSS natively -- no additional bundler config needed.
- Add `@import "tailwindcss"` to `globals.css` to activate Tailwind's base, components, and utilities layers.

### Tailwind v4 theme configuration

- Define custom design tokens using `@theme` directives in `globals.css` (or a dedicated `theme.css` imported by `globals.css`).
- Map existing CSS custom properties (`--bg-primary`, `--text-primary`, `--accent-primary`, etc.) to Tailwind theme tokens so they're available as utility classes.
- Define the M3 color system tokens (see [theming-and-color-system.md](theming-and-color-system.md)) as Tailwind theme extensions.

### Storybook integration

- Update `.storybook/main.ts` to process Tailwind via PostCSS. For webpack-based Storybook (`@storybook/nextjs`), this may require adding the PostCSS loader or switching to the Vite builder.
- Verify that Tailwind utilities render correctly in Storybook stories.
- Storybook already imports `globals.css` in `preview.ts`, so theme tokens will propagate automatically.

### Migration plan

- Migrate inline styles to Tailwind utility classes **incrementally** -- no big-bang rewrite.
- Start with new components (the Material Design component library) which will be built Tailwind-first.
- Migrate existing chart components and editor pages as they are refactored for the WYSIWYG editor.
- During the migration period, inline styles and Tailwind classes can coexist on the same element without conflict.

## Implementation options

- **CSS-only theme file:** Define all `@theme` tokens in a single `theme.css` file imported by `globals.css`. Keeps theme configuration separate from base styles.
- **Inline in globals.css:** Define `@theme` tokens directly in `globals.css`. Simpler for a small project but less organized as the token set grows.

## Dependencies

- None -- this is foundational infrastructure. The Material Design component library and theming system build on top of it.

## Out of scope

- Tailwind plugins beyond `@tailwindcss/postcss` (e.g., `@tailwindcss/typography`, `@tailwindcss/forms`). These can be added later if needed.
- Purge/content configuration -- Tailwind v4 handles content detection automatically.
