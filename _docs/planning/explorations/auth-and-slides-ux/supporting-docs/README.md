# Supporting docs

Design specs, reference implementations, and theme guidance for the auth-and-slides-ux exploration.

## Auth screens (login & sign up)

- **[auth-screens-design-1.tsx](auth-screens-design-1.tsx)** — Login and sign-up design: shared decisions (centered card, MUI Card/TextField/Button, Fade animation, react-hook-form, TanStack Query), optional Google OAuth, and reference implementation for the **login** screen (`/login`).
- **[auth-screens-design-2.md](auth-screens-design-2.md)** — **Sign up** screen: purpose, fields (email, password, confirm password), secondary link to sign in, and reference implementation for the register page (`/register`).

Designs target a Google Workspace–style, minimalist auth experience with clear hierarchy, accessibility, and dark mode support. These specs are intended to be realized **first as Storybook screen components** (`LoginScreen`, `RegisterScreen`, shared `AuthLayout`), using a Next.js-aware Storybook setup and mocked auth APIs, before wiring into real routes.

## Editor (Google Slides–style)

- **[google-slides-ux.md](google-slides-ux.md)** — Editor layout and interactions: full-height layout with fixed AppBar/toolbar, left permanent Drawer (~256px) with `@dnd-kit` for draggable slide/block list, central Paper canvas (Recharts), right contextual Paper (~320px). Proposed keyboard shortcuts (Ctrl+M, Ctrl+D, Ctrl+Z/Y, Ctrl+Alt+C, F5/Ctrl+F5). Reference structure for `app/edit/[deckId]/page.tsx`.

These specs are likewise intended to drive a **Storybook-first** implementation of a `SlidesEditorScreen` (and optional `PresenterViewScreen`), built in Storybook with mocked deck data and the same theming and layout wrappers used by the Next.js app.

## Storybook setup

- **[storybook-setup.md](storybook-setup.md)** — How `apps/frontend` is configured for Storybook with `@storybook/nextjs`, where to place auth and Slides editor screen stories, and how to use mocks so stories run against realistic flows without a backend.

## Theming

- **[theme.md](theme.md)** — Theming approach for auth and app UI: Tailwind v4 CSS-first, Zustand for light/dark/system, `.dark` on `<html>`. Semantic tokens (Option A: Clean Professional) for background, surface, text, primary, and dark overrides. Usage examples and FOUC avoidance. Use these tokens so auth screens and editor panels share a consistent, accessible palette.
