# Phase plan: Rules and skills (developer-experience)

Step-by-step execution plan. Branch first; commit/push at logical points; final commit on user approval.

---

## 1. Create and check out branch

- Create and check out branch: `developer-experience/04-rules-and-skills`.

---

## 2. Phase execution skill

- Create or update skill (e.g. `.cursor/skills/execute-phase-plan/SKILL.md` or equivalent): when executing a milestone phase, read phase plan from `_docs/milestones/.../phase-plans/<phase>.md`; first step = create/checkout branch; do tasks; commit/push at checkpoints; on completion do README step and progress doc; final step only after user approval.
- **Checkpoint:** Add, commit, and push (e.g. "chore: add execute-phase-plan skill").

---

## 3. Exploration evaluation and milestone creation skills

- Create or update skills for exploration evaluation and new milestone creation per _docs (planning mode; read exploration; output scope/feasibility/risks; turn into milestone per milestone-lifecycle).
- **Checkpoint:** Add, commit, and push (e.g. "chore: add exploration and milestone skills").

---

## 4. Project / code convention rules

- Add or update rules (e.g. `.cursor/rules/*.mdc`): when editing `apps/frontend/**` follow ui-rules and theme-rules; when editing `apps/api/**` and `apps/frontend/**` follow project-rules and tech-stack. Reference definition docs in 00-initial-milestones.
- **Checkpoint:** Add, commit, and push (e.g. "chore: add rules for frontend/api conventions").

---

## 5. Docs workflow rule

- Add or update rule: phase plans in `_docs/milestones/.../phase-plans/`; progress in `_docs/progress/...`; completion = READMEs + progress doc + final commit on approval.
- **Checkpoint:** Add, commit, and push (e.g. "chore: add docs workflow rule").

---

## 6. READMEs (on phase completion)

- Update project README if needed to mention rules and skills location/usage.
- **Checkpoint:** Add, commit, and push (e.g. "docs: README for rules and skills").

---

## 7. Progress documentation

- Add or update `_docs/progress/developer-experience/04-rules-and-skills.md` with a short summary of work done. Optionally link to this phase plan.

---

## 8. Final step (on user approval)

- When the user confirms the phase is complete: final pass on progress doc. Add any remaining changes, commit, and push (e.g. "chore(developer-experience): complete 04-rules-and-skills phase"), including the progress doc.
