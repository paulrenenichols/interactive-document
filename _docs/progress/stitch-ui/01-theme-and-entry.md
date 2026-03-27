# Phase 1 — Theme and entry (progress)

## Chunk 1 — Token audit (Stitch → product)

**Structure & Logic (light)** informed:

- Workspace secondary surface **#f4f7f9** (St HTML body / feature wells) → `--bg-secondary` / `--color-bg-secondary`.
- Primary text **#121619**, secondary **#525c67** (St “muted” body copy) → `--text-primary` / `--text-secondary`.
- Action / primary **#0f62fe** with hover **#0353e9**, active **#0043ce** (IBM-style blues; replaces legacy **#0066cc**).

**Enterprise Midnight (dark)** informed:

- Deep shell **#101022**, raised surface **#1b1b35**, borders **#3d3d5c**.
- Accent **#4589ff** with lighter hover/active for focus rings and controls.

**Deltas (explicit):**

- Stitch landing HTML uses **1px borders** on feature cards; milestone spec prefers **stepped surfaces + shadow** on live components to match “no harsh section borders” guidance—implemented on the marketing page via background steps and `shadow-md` instead of full card borders.
- Chart palette tokens in `globals.css` were **unchanged** in chunk 1 to avoid chart color drift; follow-up if charts need IBM-aligned series colors.

**Files:** `libs/material-ui/src/theme.css`, `apps/frontend/app/globals.css` (kept in sync for Next + Storybook consumers).

## Chunk 2 — Marketing landing

_(Implementation: `LandingPage` + root layout full-bleed.)_

## Chunk 3 — Authentication

_(Implementation: auth shell backdrop + card polish on `LoginScreen` / `RegisterScreen`.)_
