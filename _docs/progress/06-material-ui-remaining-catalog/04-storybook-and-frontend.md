## Progress: 04 — Storybook base path and frontend migration (material-ui-remaining-catalog)

**Milestone:** [06-material-ui-remaining-catalog](../../milestones/completed/06-material-ui-remaining-catalog/)  
**Branch:** `material-ui-remaining-catalog/04-storybook-and-frontend`

## Summary

- Frontend app (`apps/frontend`) migrated to use `@interactive-document/material-ui` components for layout, forms, feedback, and navigation.
- Global layout now uses `CSSBaseline`, `Container`, and `Stack` to apply theme tokens and `.dark` support.
- Auth, edit, and view flows adopt Material UI primitives for consistent styling. Login/register use real `<form>` elements so submit buttons work; nav links use Next `Link` with theme-aligned classes (single anchor, no nested MUI Link).

## Completed

- [x] **Global layout** — Wrap root layout in `CSSBaseline` + `Container` + `Stack` so pages use Material UI spacing, typography, and theme tokens.
- [x] **Home** — Replaced inline styles with `Box`, `Paper`, `Stack`, `Typography`, and `Button` components for the landing screen.
- [x] **Auth pages** — Migrated login and register forms to `TextField`, `Button`, `Paper`, `Alert`, `Typography`, and `Stack`; links use Next `Link` with accent styling (single anchor). Forms use real `<form>` so Sign in / Create account submit correctly.
- [x] **Edit dashboard** — Replaced raw HTML structure with `Box`, `Paper`, `Stack`, `Typography`, `Button`, `Alert`, and `Link` components for the "Edit" landing and decks list.
- [x] **View deck** — Updated presentation view to use `AppBar`, `Container`, `Box`, `Stack`, `Paper`, `Typography`, and `Button` for the top bar, slide content, empty states, and navigation controls.
- [x] **Error states** — Converted 404 and deck-related error/empty states to Material UI surfaces and typography.
- [x] **Storybook base path** — Set `base: '/material-ui/'` in `libs/material-ui/.storybook/main.ts` via `viteFinal` for GitHub Pages subpath deployment.
- [ ] **Phase merged to main** — Pending PR and review.

## References

- Phase plan: [04-storybook-and-frontend](../../milestones/completed/06-material-ui-remaining-catalog/phase-plans/04-storybook-and-frontend.md).
- Feature set: [remaining-material-ui-catalog](../../planning/explorations/completed/06-material-ui-remaining-catalog/feature-sets/remaining-material-ui-catalog.md).

