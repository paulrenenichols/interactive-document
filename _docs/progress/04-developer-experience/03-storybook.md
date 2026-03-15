# Progress: Storybook (developer-experience)

Phase 3 of the developer-experience milestone.

## Deliverables

- **Storybook 8.6.14** — Configured for Next.js App Router via @nx/storybook
  - addon-essentials for docs, controls, actions
  - addon-interactions for testing
  - Imports globals.css for theme consistency

- **Nx integration** — `nx storybook frontend` and `nx build-storybook frontend` targets

- **pnpm storybook script** — Run from repo root

- **Chart stories** — BarChart, LineChart, PieChart, AreaChart with:
  - Default configurations
  - Multi-series data
  - Various datasets (sales, users, budget, etc.)

## Key changes

| File | Change |
|------|--------|
| `apps/frontend/.storybook/main.ts` | Storybook config with Next.js framework |
| `apps/frontend/.storybook/preview.ts` | Preview config with globals.css import |
| `apps/frontend/project.json` | Added storybook and build-storybook targets |
| `apps/frontend/components/*.stories.tsx` | Stories for all chart components |
| `package.json` | Added storybook script, Storybook dependencies |
| `apps/frontend/README.md` | Storybook docs |
| `README.md` | Storybook link |

## Phase plan

See [`_docs/milestones/active/developer-experience/phase-plans/03-storybook.md`](../../milestones/active/developer-experience/phase-plans/03-storybook.md)
