# Phase plan: Quality tooling (ux-and-stack-overhaul)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `ux-and-stack-overhaul/01-quality-tooling`.

---

## 2. ESLint

- Add ESLint (e.g. Nx ESLint config) and lint targets for api, frontend; TypeScript and React rules where applicable. Add root `lint` script.
- **Checkpoint:** Add, commit, and push (e.g. "feat: add ESLint and root lint script").

---

## 3. Vitest

- Add Vitest for api, frontend; root `test` script. Add React Testing Library for frontend component tests. Add test target for material-ui when that library exists (or stub target).
- **Checkpoint:** Add, commit, and push (e.g. "feat: add Vitest and root test script").

---

## 4. GitHub Actions CI and PR gates

- Add workflow: on PR and push to main run lint, test, build (api, frontend, material-ui when present). Build and deploy Storybook to GitHub Pages (frontend; material-ui subpath when library exists). Document required status checks and branch protection.
- **Checkpoint:** Add, commit, and push (e.g. "feat: add CI workflow and Storybook deploy to GitHub Pages").

---

## 5. READMEs (on phase completion)

- Update project and app READMEs with lint/test/CI instructions and link to Storybook deploy.
- **Checkpoint:** Add, commit, and push (e.g. "docs: READMEs for lint, test, CI").

---

## 6. Progress documentation

- Add or update `_docs/progress/ux-and-stack-overhaul/01-quality-tooling.md` with a short summary of work done. Optionally link to this phase plan.

---

## 7. Final step (on user approval)

- When the user confirms the phase is complete: final pass on the progress doc. Add any remaining changes, commit, and push (e.g. "chore(ux-and-stack-overhaul): complete 01-quality-tooling phase").
