# Progress: 02-tailwind-and-theming (ux-and-stack-overhaul)

## Summary

Phase 02 adds Tailwind CSS v4 with CSS-first `@theme` configuration and a dark/light theming system using M3-style color tokens and dedicated chart palettes. Theme preference is persisted via zustand.

## Tailwind 4 integration

- Installed `tailwindcss@4` and `@tailwindcss/postcss@4` at workspace root.
- Added `apps/frontend/postcss.config.mjs` with `@tailwindcss/postcss` plugin so Next.js and Storybook process Tailwind.
- In `apps/frontend/app/globals.css`:
  - `@import 'tailwindcss'` to enable base, components, and utilities.
  - `@custom-variant dark` for class-based dark mode (`&:where(.dark, .dark *)`).
  - `@theme` block mapping design tokens to Tailwind theme (e.g. `--color-bg-primary`, `--color-text-primary`) for utility classes.
- Kept existing `:root` CSS custom properties so existing `var(--bg-primary)` etc. continue to work; charts and components did not require changes.

## Theming and color system

- **Theme store:** Added `apps/frontend/lib/theme-store.ts` using zustand with `persist` middleware (localStorage key `theme-preference`). Modes: `light`, `dark`, `system`. `getEffectiveTheme(mode)` resolves to `light` or `dark` (system uses `prefers-color-scheme`).
- **Theme application:** `apps/frontend/app/theme-provider.tsx` (client) subscribes to the store and adds/removes the `dark` class on `document.documentElement`; also listens to `prefers-color-scheme` when mode is `system`.
- **Dark mode CSS:** `.dark` block in `globals.css` overrides all semantic and chart variables (M3-style surfaces, text, borders, accents, status, and chart palettes).
- **Chart palettes:** Light and dark each have an 8-color palette (`--chart-1` … `--chart-8` and legacy `--chart-series-1` … `--chart-series-6`) so charts stay accessible in both modes without code changes.
- **Theme toggle:** `apps/frontend/components/ThemeToggle.tsx` cycles Light → Dark → System; placed in root layout (fixed top-right). Root layout uses `suppressHydrationWarning` on `<html>` to avoid hydration mismatch when the class is applied on the client.
- **Providers:** `ThemeProvider` wraps app children inside `Providers` so theme is applied before render.

## READMEs

- No README changes required for this phase; existing docs already describe the stack. Phase completion is recorded in this progress file.

## Branch and commits

- Branch: `ux-and-stack-overhaul/02-tailwind-and-theming`.
- Suggested checkpoint commits: (1) "feat: add Tailwind 4 to frontend and Storybook", (2) "feat: M3 theming and chart color palettes". Final commit on user approval: "chore(ux-and-stack-overhaul): complete 02-tailwind-and-theming phase".
