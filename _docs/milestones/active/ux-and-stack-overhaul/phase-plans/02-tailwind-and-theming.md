# Phase plan: Tailwind and theming (ux-and-stack-overhaul)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `ux-and-stack-overhaul/02-tailwind-and-theming`.
- Branch from main after phase 01 is merged.

---

## 2. Tailwind 4 integration

- Integrate Tailwind CSS v4 in frontend and Storybook using CSS-first `@theme` configuration. Incrementally migrate inline styles to utility classes where practical.
- **Checkpoint:** Add, commit, and push (e.g. "feat: add Tailwind 4 to frontend and Storybook").

---

## 3. Theming and color system

- Implement dark/light mode with M3 color tokens; dedicated chart palettes per mode. Persist theme preference (e.g. zustand or app state). Apply tokens in Tailwind/theme.
- **Checkpoint:** Add, commit, and push (e.g. "feat: M3 theming and chart color palettes").

---

## 4. READMEs and progress

- Update READMEs as needed. Add or update `_docs/progress/ux-and-stack-overhaul/02-tailwind-and-theming.md`.

---

## 5. Final step (on user approval)

- Final pass on progress doc; commit and push (e.g. "chore(ux-and-stack-overhaul): complete 02-tailwind-and-theming phase").
