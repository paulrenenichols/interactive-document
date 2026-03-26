# Tailwind + MUI alignment (Stitch → interactive-document)

Compare vendored Stitch reference (`stitch-reference/`) with the shared library theme in [`libs/material-ui/src/theme.css`](../../../../libs/material-ui/src/theme.css) and components from `@interactive-document/material-ui`.

## Product tokens today

- **Tailwind v4** `@theme` / CSS variables: light defaults in `:root`, dark overrides in `.dark` (see `ThemeProvider` toggling `dark` on `<html>` in `apps/frontend/app/theme-provider.tsx`).
- **Brand / accent:** App uses `--color-accent-primary` **#0066cc** family vs Stitch **#0F62FE** / **#004CCD** (IBM-style blues in Structure & Logic).
- **Surfaces / neutrals:** App uses compact token set (`bg-primary`, `text-primary`, …); Stitch uses **full Material-style named color maps** in JSON (`surface_container_low`, `on_surface`, …).

## Stitch assets to read during implementation

- **Light palette & behavior:** `design-systems/theme-5f390537afc848a5bfbb4d1b9e2db319.json` + `design-md-…-light.md` (no 1px section borders; tonal surfaces; underline inputs).
- **Dark palette & behavior:** `design-systems/theme-49c7f87088fb4385a90ab547b9d465e7.json` + `design-md-…-dark.md` (void/slate base **#101417**; glow traces; ghost borders).

## Alignment decision (for milestone phase)

Choose explicitly:

1. **Keep product tokens** and map Stitch **roles** (surface levels, on-surface text) into existing CSS variables + MUI theme overrides, **or**
2. **Adjust** `theme.css` keys toward Stitch blues/neutrals (requires design sign-off and regression pass on Storybook / app).

This exploration recommends documenting the mapping table in the milestone PRD; it does **not** change `theme.css` by itself.

## Typography

- Stitch: **Plus Jakarta Sans** + **IBM Plex Sans** (light narrative); **Manrope** + **Inter** (dark narrative).
- App / library: confirm loaded fonts in frontend `layout` / Storybook — may need **`next/font`** (or equivalent) additions to match Stitch before pixel-level polish.

## MUI mapping reminders

- Prefer existing primitives: `AppBar`, `Drawer`, `Paper`, `TextField`, `Button`, `Dialog`, `Tabs`, `List`, inspector-style forms.
- Stitch HTML is **Tailwind-class-heavy** in export; **reimplement** with MUI + design tokens — do not iframe Stitch HTML in production.

## Gaps to track

- **Data inspector** density vs our `TextField` / `Select` patterns — may need a composed “inspector shell” pattern in the component library.
- **Slide canvas** “safe zone” (light spec) vs current editor layout — check aspect ratio and resize behavior.
