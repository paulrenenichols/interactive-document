# Progress: 03-material-component-library (ux-and-stack-overhaul)

## Summary

Phase 03 adds a custom M3 component library in `libs/material-ui` as a publishable Nx library with dedicated Storybook, and wires it into CI (lint, test, build, Storybook deploy subpath).

## Library and Storybook

- Created `libs/material-ui` with `@nx/js:library` (publishable, TypeScript, ESLint). Configured for React (JSX, peer deps), Vitest (jsdom), and Storybook (React + Vite) on port 6007.
- Added `libs/material-ui/src/theme.css` with Tailwind v4 `@import 'tailwindcss'`, `@custom-variant dark`, and `@theme` tokens aligned with phase 02 (M3 backgrounds, text, borders, accents, status, shape radii). `:root` and `.dark` CSS variables for `var()` usage.
- Added `libs/material-ui/postcss.config.mjs` with `@tailwindcss/postcss` so Storybook processes Tailwind.
- Storybook: `libs/material-ui/.storybook/main.ts` uses `@storybook/react-vite`; `preview.tsx` imports `theme.css` and provides theme toolbar (light/dark). Targets: `storybook` (port 6007), `build-storybook` (output `libs/material-ui/storybook-static`).
- Library build excludes `*.stories.*` and `*.test.*` / `*.spec.*` so only component source is compiled.

## Core components

- **Button** — Variants: filled, outlined, text. M3-style accent primary for filled; focus ring; disabled state. Ref-forwarding. Stories: Filled, Outlined, Text, Disabled, AllVariants.
- **TextField** — Outlined input with optional label, helper text, error state, fullWidth. Uses theme tokens for border and text. Stories: Default, WithLabel, WithHelperText, Error, FullWidth, Disabled.
- **Dialog** — Modal with optional title, content, and actions slot. Backdrop click and Escape close. Role dialog, aria-modal. Stories: Default, WithTrigger, NoTitle.
- **Menu** / **MenuItem** — Menu anchored to trigger ref; position from getBoundingClientRect. Backdrop and Escape close. MenuItem as button with hover state. Stories: Default, WithDisabledItem.

All components use Tailwind utility classes and theme tokens from `theme.css`; dark mode via `dark:` variant.

## CI and root scripts

- Root `pnpm lint` and `pnpm test` include `material-ui`. Root `pnpm build` includes `material-ui` build.
- `.github/workflows/ci.yml`: `storybook-pages` job builds both frontend and material-ui Storybooks, merges into a single `storybook-static` (frontend at `/`, material-ui at `material-ui/`), and uploads that artifact for GitHub Pages deploy. Library Storybook is available at the `/material-ui/` subpath when Pages is configured.

## READMEs

- `libs/material-ui/README.md` — Usage, component list, commands (build, lint, test, storybook), structure, theme.
- Root `README.md` — Lint/test/CI updated to mention material-ui; Storybook section lists both frontend (6006) and material-ui (6007).

## Branch and commits

- Branch: `ux-and-stack-overhaul/03-material-component-library`.
- Suggested checkpoint commits: (1) "feat: add material-ui library and Storybook", (2) "feat: core M3 components (Button, TextField, Dialog, Menu)". Final commit on user approval: "chore(ux-and-stack-overhaul): complete 03-material-component-library phase".
