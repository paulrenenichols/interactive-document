# Phase: Storybook (developer-experience)

Storybook for the frontend app so editor, viewer, charts, and auth components can be developed and reviewed in isolation.

---

## Scope

- Install and configure Storybook for the frontend app (Next.js in `apps/frontend`).
- Set up so UI components (editor, viewer, charts, auth) can be developed with different props and states in isolation.
- Align with existing stack: React, Next.js App Router, theme tokens (see theme-rules and ui-rules in 00-initial-milestones).

---

## Goals

- Components can be developed and reviewed in Storybook without running the full app.
- Stories reflect theme and UI conventions.

---

## Out of scope

- Changing production build or deployment; Storybook is dev-time only.
