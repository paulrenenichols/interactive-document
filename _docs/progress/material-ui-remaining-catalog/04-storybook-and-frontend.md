## Progress: 04 — Storybook base path and frontend migration (material-ui-remaining-catalog)

**Milestone:** [material-ui-remaining-catalog](../../milestones/active/material-ui-remaining-catalog/)  
**Branch:** `material-ui-remaining-catalog/04-storybook-and-frontend`

## Summary

- Frontend app (`apps/frontend`) migrated to use `@interactive-document/material-ui` components for layout, forms, feedback, and navigation.
- Global layout now uses `CSSBaseline`, `Container`, and `Stack` to apply theme tokens and `.dark` support.
- Auth, edit, and view flows adopt Material UI primitives for consistent styling.

## Completed

- [x] **Global layout** — Wrap root layout in `CSSBaseline` + `Container` + `Stack` so pages use Material UI spacing, typography, and theme tokens.
- [x] **Home** — Replaced inline styles with `Box`, `Paper`, `Stack`, `Typography`, and `Button` components for the landing screen.
- [x] **Auth pages** — Migrated login and register forms to `TextField`, `Button`, `Paper`, `Alert`, `Typography`, and `Stack`, with links using Material UI `Link` + Next `Link`.
- [x] **Edit dashboard** — Replaced raw HTML structure with `Box`, `Paper`, `Stack`, `Typography`, `Button`, `Alert`, and `Link` components for the "Edit" landing and decks list.
- [x] **View deck** — Updated presentation view to use `AppBar`, `Container`, `Box`, `Stack`, `Paper`, `Typography`, and `Button` for the top bar, slide content, empty states, and navigation controls.
- [x] **Error states** — Converted 404 and deck-related error/empty states to Material UI surfaces and typography.
- [ ] **Storybook base path** — Confirm and adjust `libs/material-ui/.storybook/main.ts` for GitHub Pages subpath if Storybook assets 404 after deployment.
- [ ] **Phase merged to main** — Pending PR and review.

## References

- Phase plan: [04-storybook-and-frontend](../../milestones/active/material-ui-remaining-catalog/phase-plans/04-storybook-and-frontend.md).
- Feature set: [remaining-material-ui-catalog](../../planning/explorations/completed/material-ui-remaining-catalog/feature-sets/remaining-material-ui-catalog.md).

