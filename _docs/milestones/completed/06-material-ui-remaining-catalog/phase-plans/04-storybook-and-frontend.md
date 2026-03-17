# Phase plan: Storybook base path and frontend migration (material-ui-remaining-catalog)

Step-by-step execution plan. Branch from main after phase 03 is merged. Commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `material-ui-remaining-catalog/04-storybook-and-frontend`.
- Branch from main after phase 03 is merged.

---

## 2. Storybook base path (if needed)

- If material-ui Storybook assets 404 at `/material-ui/` on GitHub Pages: set `base` (or Vite `base`) in `libs/material-ui/.storybook/main.ts` (or preview) to `/material-ui/` (or `/<repo>/material-ui/` for project site). Verify build and deploy.
- **Checkpoint:** Commit and push if changed (e.g. "fix(material-ui): Storybook base path for GitHub Pages subpath").

---

## 3. Frontend migration

- Audit `apps/frontend` for UI to replace (forms, layout, navigation, surfaces, typography). Replace with `@interactive-document/material-ui` components (Button, TextField, Typography, Box, Stack, Paper, etc.). Ensure theme provider applies `.dark` for library tokens. Add frontend dependency on `@interactive-document/material-ui` if not present.
- **Checkpoint:** Commit and push (e.g. "feat(frontend): migrate to @interactive-document/material-ui components").

---

## 4. Progress doc and final step

- Add or update `_docs/progress/06-material-ui-remaining-catalog/04-storybook-and-frontend.md`. Update project-root README if needed.
- On user approval: final commit and push (e.g. "chore(material-ui-remaining-catalog): complete 04-storybook-and-frontend phase").
