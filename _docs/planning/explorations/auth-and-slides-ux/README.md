# Auth and Google Slides–style UX

Created with the **docs-driven-dev** skill (v1.5.0).

This exploration scopes **login/sign-up improvements** and **Google Slides–style UI** work. It builds on the existing [Google Slides–inspired UX](../completed/05-ux-and-stack-overhaul/feature-sets/google-slides-ux.md) from the ux-and-stack-overhaul milestone and adds a focus on authentication flows and entry experience.

**Goals:**

- **Login/sign up:** Improve onboarding, sign-up flow, and login UX (e.g. social login, password reset, session handling, first-time vs returning user).
- **Google Slides–style UI:** Refine or extend the Slides-like editor and viewer experience (layout, thumbnails, canvas, shortcuts, presenter view) beyond what was delivered in milestone 05.

Both of these areas will be driven **Storybook-first**: build full-screen UI **screen components** (auth and Slides editor) in Storybook, iterate interactively on states and theming, then wire them to real data/routes in the Next.js app.

Use [exploration-lifecycle.md](../../setup/exploration-lifecycle.md) to evaluate this exploration or turn it into a milestone.

## Structure

Feature sets are in `feature-sets/` (see [feature-sets/README.md](feature-sets/README.md)). **Supporting docs** in [supporting-docs/](supporting-docs/) include design specs and reference implementations: auth screens (login/sign up) with shared layout and form patterns, editor layout and keyboard shortcuts for the Google Slides–style experience, and semantic theme tokens (light/dark) for consistent UI. See [supporting-docs/README.md](supporting-docs/README.md) for the index.

## Scope

- **In scope:** Login and sign-up flows (UI, validation, errors, optional social/OAuth); session and “remember me” behavior; first-time vs returning user experience; Google Slides–style editor and viewer refinements (panels, thumbnails, canvas, keyboard shortcuts, presenter view) as follow-ups to the 05 UX work.
- **Out of scope (for this exploration):** Backend auth implementation details are only in scope insofar as they affect UX and flow design; full backend auth migration is not assumed here.

Storybook and Next.js integration details (e.g. `@storybook/nextjs`, mocks for API and router, theme providers) are considered **supporting implementation details** and will be documented in feature sets and supporting docs rather than here.

## Storybook approach in this repo

For this exploration, Storybook work is anchored in the existing frontend app:

- **Location:** `apps/frontend` uses `@storybook/nextjs` with stories loaded from `apps/frontend/**/*.stories.@(js|jsx|ts|tsx|mdx)`.
- **Framework config:** `.storybook/main.ts` is already configured with `framework: '@storybook/nextjs'`, and `.storybook/preview.tsx`:
  - Imports `app/globals.css`.
  - Adds a `ThemeDecorator` that syncs Storybook’s theme toolbar with the app’s `.dark` class (leveraging the CSS variables defined in `libs/material-ui/src/theme.css` and described in `supporting-docs/theme.md`).
  - Enables `nextjs.appDirectory: true` so stories run in Next.js app-dir mode.
- **Screen stories for this exploration:**
  - Auth screens: add stories under `apps/frontend/components/auth/` (or similar) for `LoginScreen` and `RegisterScreen`, using the shared theme tokens and layout rules.
  - Slides editor: add stories under `apps/frontend/components/editor/` (or similar) for `SlidesEditorScreen` (and optional `PresenterViewScreen`), using mock deck data.
- **Mocking/data strategy:** Use Storybook-level mocks (e.g. MSW or simple in-memory mocks) to simulate auth and deck APIs so stories exercise realistic flows without depending on the backend.

See the feature-set docs for detailed scope, dependencies, and open questions.
