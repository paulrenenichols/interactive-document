# Phase: Storybook base path and frontend migration (material-ui-remaining-catalog)

Ensure the material-ui Storybook works when served from the `/material-ui/` subpath on GitHub Pages (base path fix if assets 404). Then migrate the frontend app to use `@interactive-document/material-ui` components instead of ad-hoc HTML and inline styles.

---

## Scope

- **Storybook:** If the material-ui Storybook has broken assets at `https://<org>.github.io/<repo>/material-ui/`, set `base` (or Vite `base`) in `libs/material-ui/.storybook` to `/material-ui/` or `/<repo>/material-ui/` for project sites.
- **Frontend migration:** Audit `apps/frontend` for replaceable UI (forms, layout, navigation, surfaces, typography). Replace with library components (Button, TextField, Typography, Box, Stack, Paper, Dialog, Menu, etc.); use existing library components first, then adopt new catalog components as implemented. Ensure theme provider applies `.dark` so library tokens and dark mode stay in sync. Scope: `apps/frontend` only.

---

## References

- Exploration: [material-ui-remaining-catalog](../../../../planning/explorations/completed/material-ui-remaining-catalog/) — Storybook publishing and Frontend migration sections.
