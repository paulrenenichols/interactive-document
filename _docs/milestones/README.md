# Milestones

Milestones are organized into **completed**, **active**, and **future**. Only completed milestones use number prefixes.

## Completed milestones

- **[01-setup](completed/01-setup/)** — Barebones runnable structure: Nx workspace, Next.js frontend, Fastify API, Docker Compose, Postgres schema.
- **[02-mvp](completed/02-mvp/)** — Auth and permissions, data layer, chart pipeline, slide editor, viewer.
- **[03-post-mvp](completed/03-post-mvp/)** — Polish: additional chart types, testing guides.
- **[04-developer-experience](completed/04-developer-experience/)** — Dev Docker with live reload, DB UI, seed data; API docs and log level; Storybook; Cursor rules and skills.
- **[05-ux-and-stack-overhaul](completed/05-ux-and-stack-overhaul/)** — Lint/test/CI, Tailwind 4 and theming, Material component library, data layers (zod/zustand/sql.js), WYSIWYG deck editor and Google Slides–inspired UX.
- **[06-material-ui-remaining-catalog](completed/06-material-ui-remaining-catalog/)** — Complete the material-ui component catalog (layout, data display, inputs, feedback, surface, navigation), Storybook base path for /material-ui/, and frontend migration to library components.
- **[07-ci-scope-optimization](completed/07-ci-scope-optimization/)** — CI scope optimization via docs-only guard + Nx affected, with clear contributor-facing behavior, rollout, and validation docs.
 - **[08-auth-and-slides-ux](completed/08-auth-and-slides-ux/)** — Auth login/sign-up UX improvements and Google Slides–style editor/viewer refinements, implemented Storybook-first and then wired into the Next.js app.

## Active milestones

_(none currently)_

## Future milestones

- **[stitch-ui](future/stitch-ui/)** — Align MUI/Tailwind with Stitch **Interactive Document** (light layout canon, dark tokens); landing, auth, editor, inspector, presentation mode. Source: [completed exploration](../planning/explorations/completed/stitch-ui/).

---

**Run a phase:** Open the phase plan in `completed/<milestone>/phase-plans/<phase>.md` (or `active/` / `future/` when applicable).
