# Auth and Google Slides–style UX

Created with the **docs-driven-dev** skill (v1.5.0).

This exploration scopes **login/sign-up improvements** and **Google Slides–style UI** work. It builds on the existing [Google Slides–inspired UX](../completed/05-ux-and-stack-overhaul/feature-sets/google-slides-ux.md) from the ux-and-stack-overhaul milestone and adds a focus on authentication flows and entry experience.

**Goals:**

- **Login/sign up:** Improve onboarding, sign-up flow, and login UX (e.g. social login, password reset, session handling, first-time vs returning user).
- **Google Slides–style UI:** Refine or extend the Slides-like editor and viewer experience (layout, thumbnails, canvas, shortcuts, presenter view) beyond what was delivered in milestone 05.

Use [exploration-lifecycle.md](../../setup/exploration-lifecycle.md) to evaluate this exploration or turn it into a milestone.

## Structure

Feature sets are in `feature-sets/` (see [feature-sets/README.md](feature-sets/README.md)). **Supporting docs** in [supporting-docs/](supporting-docs/) include design specs and reference implementations: auth screens (login/sign up) with shared layout and form patterns, editor layout and keyboard shortcuts for the Google Slides–style experience, and semantic theme tokens (light/dark) for consistent UI. See [supporting-docs/README.md](supporting-docs/README.md) for the index.

## Scope

- **In scope:** Login and sign-up flows (UI, validation, errors, optional social/OAuth); session and “remember me” behavior; first-time vs returning user experience; Google Slides–style editor and viewer refinements (panels, thumbnails, canvas, keyboard shortcuts, presenter view) as follow-ups to the 05 UX work.
- **Out of scope (for this exploration):** Backend auth implementation details are only in scope insofar as they affect UX and flow design; full backend auth migration is not assumed here.

See the feature-set docs for detailed scope, dependencies, and open questions.
