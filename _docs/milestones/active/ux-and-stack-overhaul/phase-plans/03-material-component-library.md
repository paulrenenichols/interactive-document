# Phase plan: Material component library (ux-and-stack-overhaul)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `ux-and-stack-overhaul/03-material-component-library`.
- Branch from main after phase 02 is merged.

---

## 2. Nx library and Storybook

- Create `libs/material-ui` as publishable Nx library with lint and test targets. Add dedicated Storybook for the library. Wire into CI (lint, test, Storybook build/deploy subpath).
- **Checkpoint:** Add, commit, and push (e.g. "feat: add material-ui library and Storybook").

---

## 3. Core components

- Implement core M3 components with Tailwind (buttons, inputs, dialogs, menus, etc. per exploration scope). Add stories for each. Ensure theme tokens from phase 02 are used.
- **Checkpoint:** Add, commit, and push (e.g. "feat: core M3 components in material-ui").

---

## 4. READMEs and progress

- Update library and project READMEs. Add or update `_docs/progress/ux-and-stack-overhaul/03-material-component-library.md`.

---

## 5. Final step (on user approval)

- Final pass on progress doc; commit and push (e.g. "chore(ux-and-stack-overhaul): complete 03-material-component-library phase").
