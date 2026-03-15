# Phase plan: Storybook (developer-experience)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `developer-experience/03-storybook`.

---

## 2. Install and configure Storybook

- Install and configure Storybook for the frontend app (Next.js in `apps/frontend`). Align with React, Next.js App Router, theme tokens (theme-rules, ui-rules).
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): add Storybook for apps/frontend").

---

## 3. Initial stories

- Add stories for key UI components: editor, viewer, charts, auth (as many as practical in this phase). Use different props and states for isolation.
- **Checkpoint:** Add, commit, and push (e.g. "feat(frontend): Storybook stories for editor, viewer, charts, auth").

---

## 4. READMEs (on phase completion)

- Add or update project and frontend README to describe how to run Storybook.
- **Checkpoint:** Add, commit, and push (e.g. "docs: README for Storybook").

---

## 5. Progress documentation

- Add or update `_docs/progress/developer-experience/03-storybook.md` with a short summary of work done. Optionally link to this phase plan.

---

## 6. Final step (on user approval)

- When the user confirms the phase is complete: final pass on progress doc. Add any remaining changes, commit, and push (e.g. "chore(developer-experience): complete 03-storybook phase"), including the progress doc.
