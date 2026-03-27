---
name: docs-driven-dev
version: "2.1.0"
description: Docs-driven development. Use when setting up docs, converting projects, upgrading, creating explorations, or managing milestones. Plan-first (say 'go' to apply). Accepts both "docs" and "_docs". Phase execution includes conditional Storybook stories when the workspace has Storybook. Ask "help" or "what can you do?" for capabilities.
---

# docs-driven-dev

Docs-driven development: planning, milestones, explorations, and documentation workflows. Plan-first by default—draft in memory, no disk writes until you say "go". Consolidates setup, conversion, upgrade, exploration creation/update, milestone lifecycle, phase execution (per-chunk Storybook when applicable, lint/test/commit), validation, rollback, and watchdog.

## When to use

**First step:** Determine which workflow the user wants from their message or context. Accept both "docs" and "_docs". If multiple could apply, ask the user to clarify.

### Workflow triggers (plan-first unless noted)

| Workflow | Trigger phrases |
|----------|------------------|
| **Setup docs** | "setup docs", "setup _docs", "scaffold docs", "scaffold _docs", "create docs", "create _docs", "init docs", "docs-driven setup", "new project with docs" |
| **Convert project** | "convert to docs", "convert to _docs", "add docs to project", "add _docs to project", "convert existing project", "docs-driven convert", "add docs to codebase" |
| **Upgrade docs** | "upgrade docs", "upgrade _docs", "update docs structure", "update _docs structure", "docs-driven upgrade", "bring docs up to date" |
| **Create exploration** | "create exploration", "add exploration", "new exploration", "scaffold exploration" |
| **Update exploration** | "update exploration", "add feature sets to exploration" |
| **Create milestone from exploration** | "turn exploration into milestone", "create milestone from exploration", "exploration to milestone", "evaluate exploration and create milestone" |
| **Make milestone active** | "make milestone active", "make active", "start milestone", "activate milestone", "move to active", "begin work on" |
| **Mark milestone completed** | "mark milestone completed", "finish milestone", "complete milestone", "move to completed"; also prompted when the last phase of an active milestone is merged |
| **Implement phase** | "implement phase", "go" (in active-milestone context) — run phase execution (chunks, lint, test, commit, push) |
| **Rollback** | "rollback phase" (revert last phase commits), "rollback chunk" (revert last chunk commit) |
| **Validate** | "validate", "validate state", "validate docs" — run validation only, report "All good" or "Fixes needed: …" |
| **Help** | "what can you do", "help", "what capabilities", "docs-driven-dev help" |

### Apply-plan triggers (v2)

After you show a plan and *"Plan ready—review/add docs. Say 'go' to apply."*:

- **Apply the plan (write to disk):** "go", "apply", "execute"

If the user edits or adds files after seeing the plan, say *"Updates detected—refine, or 'go'?"* — same apply triggers apply.

---

## Plan-first mode (default for setup, convert, upgrade, create exploration, update exploration, create milestone)

For the workflows above (except Implement phase, Rollback, Validate, Help):

1. **Build draft in memory/temp:** Folder structure, md skeletons, branch name suggestion. Do not write to disk.
2. **Prompt:** *"Plan ready—review/add docs. Say 'go' to apply."*
3. If the user adds or edits files: *"Updates detected—refine, or 'go'?"*
4. **No disk writes until** the user says "go", "apply", or "execute". Then perform the steps for that workflow (sections 1–8 below).

---

## Validation (every trigger)

On every workflow trigger, run a quick **validate state** check:

- Skill version match? _docs present and expected structure? Git healthy? Drift (e.g. progress folders out of sync, old branches)?
- Report: *"All good"* or *"Fixes needed: …"* with concrete items. If fixes needed, still proceed unless the user asks to fix first.

User can also run validation only by saying "validate", "validate state", or "validate docs".

---

## Git and branching

**Before any branch or commit step:** Check if the project is a git repository. If no git repo: *"No repo—init now?"* — if yes, run `git init` and create an initial commit; then proceed. If no: skip all branch creation and commit/push steps; still perform file changes.

**Branch pattern (v2):** `docs/<milestone-or-exploration>-<name>`. Check collision; if branch exists, append `-2`, `-3`, etc. **Fetch origin** before any branch check.

| Operation | Branch |
|-----------|--------|
| Setup | `docs/setup` |
| Convert | `docs/convert` |
| Upgrade | `docs/upgrade` |
| Create exploration | `docs/exploration-<name>` |
| Update exploration | `docs/exploration-<name>-update` |
| Create milestone | `docs/milestone-<name>` |
| Phase work (make active / implement phase) | `docs/<milestone>-phase-<phase_number>` (e.g. `docs/developer-experience-phase-1`) |
| Mark milestone completed | `docs/milestone-<name>-complete` |

**Activation:** On "make active", switch to or create the phase branch (e.g. `docs/<milestone>-phase-1`).

**Dead branches:** After a merge, scan for branches that look dead (SHA on main, no open PR; squash-aware). List: *"These look dead: <branches>. Delete any? (y/n per branch)"* — do not auto-delete.

---

## Phase execution (after "go" in active milestone)

Triggered by "implement phase" or "go" when an active milestone exists.

1. Load the active milestone's phase-plan (current phase from phase-plans/).
2. Break work into **logical chunks** (if the phase-plan is flat, suggest a chunk breakdown).
3. **Per chunk:**
   - Generate code/files.
   - **Storybook (when the workspace has Storybook):** If the chunk adds or materially changes user-facing UI, add or update colocated `*.stories.tsx` (or the repo pattern) in the **same project where the code lives** (`apps/<app>/`, `libs/<lib>/`, etc.). Prefer the **composed component** a framework page renders; skip helpers, API-only work, generated files, trivial re-exports, or non-isolatable UI. **Detection:** `.storybook/` under the app or lib you touched, `nx show project <name> --json` has a `storybook` target for that project, or package scripts document Storybook for it. If not applicable, skip and note.
   - Run `npm run lint` (or equivalent; if no script, skip and note).
   - Run `npm test` (skip if missing).
   - If lint/test pass: `git add . && git commit -m "phase <N> - <chunk title>" && git push`.
   - If fail: Pause → *"Lint/test broke on chunk <current>. Fix? Or rollback?"*
4. **End of phase:**
   - Run `npm run build` (if script exists; else skip).
   - Optional: Spot-check Storybook (`nx storybook <project>` or manual) for project(s) where UI changed.
   - Create PR: "Phase <N>: <phase name>" → merge (confirm with user).
   - If last phase: after merge, **auto-complete milestone** (section 8).
5. **Config (ask once at plan time):** "Build after every chunk? (slower)" — default: no.

Phase-plan template CTA: *"Ready? Say 'go' to start chunk 1."*

---

## Rollback

- **"rollback phase"**: Revert last commit(s) for the current phase (e.g. `git reset --hard HEAD~n`). Warn first: *"Revert last N commit(s)? y/n"*.
- **"rollback chunk"**: Same, but single chunk/commit. Warn first.

---

## Watchdog (background state checker)

Runs on triggers (create, implement, upgrade, etc.) or after merge/PR. See `setup/watchdog-rules.md` for what the watchdog checks and prompts.

- Active milestone done? (last phase merged, no open PRs) → *"Milestone complete—finish now?"*
- Drift? (progress folders out of sync, old branches, version mismatch) → *"Docs stale—validate?"*
- Half-done phase? (no commits in ~30 min) → next command nudge: *"Phase open—continue or rollback?"*

---

## Upgrade docs (v2)

Trigger: "upgrade docs" (and variants above).

1. **Fetch latest** from GitHub (skill repo). No local clone check.
2. **Compare** versions and content (SKILL.md + key files hash).
3. If same: *"You're current—no upgrade needed."* Exit.
4. If newer: Show what's new (e.g. auto-checkpoints, watchdog). *"Your version: X."* → *"Overwrite skill files? Yes/No."*
5. **If Yes:** Copy new skill files into project `.cursor/skills/docs-driven-dev/`. Then **evaluate project:** Scan _docs for outdated structures (e.g. phase-plans without Execution Rules, old branch names in README). List: *"Project needs: <list>. Apply? Yes/No."* If Yes, apply migrations (add Execution Rules to phase-plans, align branch names in README, etc.). If No, skip project changes.
6. **If No:** *"Upgrade skipped—staying current."*

Binary: full overwrite of skill files or nothing. No partial upgrade.

---

## Help / What this skill can do

When the user asks "what can you do?", "help", or similar, respond with:

- **Setup docs** — Create _docs in an empty folder (plan-first; say "go" to apply).
- **Convert project** — Add _docs to an existing codebase (plan-first; say "go" to apply).
- **Upgrade docs** — Update _docs to latest skill version; fetch from GitHub, overwrite or skip.
- **Create exploration** — New exploration folder with feature-sets and supporting-docs (plan-first).
- **Update exploration** — Update an existing exploration (plan-first).
- **Create milestone from exploration** — Turn exploration into milestone in milestones/future/; move exploration to explorations/completed/ (plan-first).
- **Make milestone active** — Move future milestone to active/; switch/create phase branch.
- **Mark milestone completed** — Move active to completed/, add number prefix, align progress and exploration folders (prompted when last phase merges).
- **Implement phase** — Run phase execution (chunks; Storybook when workspace has it; lint, test, commit, push; PR at end).
- **Rollback** — "rollback phase" or "rollback chunk" to revert commits.
- **Validate** — "validate" or "validate docs" to run state check only.

---

## 1. Setup docs (empty folder)

**Plan-first:** Build draft (folder structure, skeletons, branch `docs/setup`). Prompt *"Plan ready—review/add docs. Say 'go' to apply."* No disk writes until "go"/"apply"/"execute".

**On apply:**

1. Create branch `docs/setup` from main (after fetch). Collision → append `-2` etc.
2. Create `_docs/` structure: `README.md`, `planning/setup/`, `planning/milestones/00-initial-milestones/`, `planning/explorations/`, `planning/explorations/completed/`, `milestones/completed/`, `milestones/active/`, `milestones/future/`, `progress/`, `progress/miscellaneous/`.
3. Copy setup files from this skill's `setup/` to `_docs/planning/setup/`: `project-lifecycle.md`, `milestone-lifecycle.md`, `exploration-lifecycle.md`, `watchdog-rules.md`.
4. Add `Created with the **docs-driven-dev** skill (vX.Y.Z).` to `_docs/README.md` (read version from this SKILL.md frontmatter).
5. **Embed skill:** Copy this skill folder to project `.cursor/skills/docs-driven-dev/`.
6. **Project README:** Add or update project root `README.md` with the full "Docs-driven development" section from `templates/readme-docs-section.md` (including **How to use the skill** with trigger phrases).
7. Run discussion → draft 00-initial-milestones README → run project-lifecycle flow from `_docs/planning/setup/project-lifecycle.md`.
8. Create `milestones/README.md` with Completed / Active / Future sections.
9. Commit: "chore: add docs-driven-dev _docs structure" (if git).

---

## 2. Convert existing project

**Plan-first:** Draft structure, branch `docs/convert`. No disk until "go".

**On apply:**

1. Create branch `docs/convert` from main (fetch first).
2. Create full `_docs/` structure (same as setup).
3. Copy setup files to `_docs/planning/setup/` (including `watchdog-rules.md`).
4. Create `_docs/planning/milestones/00-initial-milestones/` with **inferred docs**: README.md, definition docs (user-flow, auth, tech-stack, ui-rules, theme-rules, project-rules). Omit what doesn't apply; add non-standard docs as needed.
5. Empty `milestones/` and `progress/` structure. No milestone content yet.
6. **Embed skill** to `.cursor/skills/docs-driven-dev/`.
7. **Project README** from `templates/readme-docs-section.md`.
8. Add `Converted with the **docs-driven-dev** skill (vX.Y.Z).` to `_docs/README.md`.
9. Commit (if git).

---

## 3. Upgrade docs project

See **Upgrade docs (v2)** above. Branch for upgrade work: `docs/upgrade`. After overwriting skill files, run "evaluate project" and optionally apply migrations (phase-plan Execution Rules, README branch names, etc.).

Existing migration steps (v1.x) still apply when evaluating: progress structure flattening, progress folder prefixes, milestones structure, setup files, explorations/completed/, exploration READMEs. Preserve prior attribution where useful.

---

## 4. Create exploration

**Plan-first:** Draft from `templates/exploration-template.md`; branch `docs/exploration-<name>`. No disk until "go".

**On apply:** Create `_docs/planning/explorations/<name>/` with README.md (from template), `feature-sets/`, `supporting-docs/`. Use docs-driven-dev attribution and version. Commit (if git).

---

## 5. Update exploration

**Plan-first:** Draft updates; branch `docs/exploration-<name>-update`. No disk until "go".

**On apply:** Follow scaffold-exploration update flow. Attribution and version.

---

## 6. Create milestone from exploration

**Plan-first:** Draft milestone from exploration; branch `docs/milestone-<name>`. No disk until "go".

**On apply:**

1. Run evaluation per `exploration-lifecycle.md`.
2. Follow `milestone-lifecycle.md`: create milestone in `_docs/milestones/future/<name>/` (no number prefix). Use `templates/phase-plan-template.md` per phase in `phase-plans/`.
3. Create `_docs/progress/<name>/` with README.md.
4. Move exploration from `_docs/planning/explorations/<name>/` to `_docs/planning/explorations/completed/<name>/`. Update relative links (e.g. `../../setup/` → `../../../setup/`).
5. Commit (if git).

---

## 7. Make milestone active

**Ask user:** (a) Activation only (branch `docs/milestone-<name>-activate`, move to active, update index; no phase work), or (b) Start first phase (create `docs/<milestone>-phase-1`, move to active, then begin phase execution).

**If (a):** Create branch, move folder future → active, update path refs in phase-plans, update `milestones/README.md`, accuracy pass, commit "chore: activate <name> milestone".

**If (b):** Create branch `docs/<milestone>-phase-1`, move folder to active, update path refs and README, accuracy pass, commit "chore: activate <name> milestone", then run **phase execution** (Phase execution section above).

---

## 8. Mark milestone completed

Do this when the milestone's **last phase** is finished (PR merged). Prompt at that time; do not leave milestone in active.

1. Move folder from `milestones/active/<name>/` to `milestones/completed/`.
2. Add number prefix = max(completed numbers) + 1 (e.g. `04-<name>`).
3. **Rename progress folder:** `progress/<name>/` → `progress/<NN>-<name>/` (same prefix).
4. **Rename exploration folder:** `planning/explorations/completed/<name>/` → `planning/explorations/completed/<NN>-<name>/`. Update links in _docs.
5. Update `milestones/README.md`. Use `templates/progress-sync-template.md` if updating project README progress table.
6. Branch: `docs/milestone-<name>-complete`. Commit (if git).

---

## Templates and structure

All generation uses this skill's **templates/** and **setup/**:

- **templates/** — `phase-plan-template.md`, `exploration-template.md`, `milestone-template.md`, `readme-docs-section.md`, `progress-sync-template.md`. Phase plans are created from `phase-plan-template.md` (chunks, Execution Rules, conditional Storybook). README updates use `readme-docs-section.md` and `progress-sync-template.md`.
- **setup/** — `project-lifecycle.md`, `exploration-lifecycle.md`, `milestone-lifecycle.md`, `watchdog-rules.md`. Copied to `_docs/planning/setup/` on setup, convert, or upgrade.

On upgrade, re-apply templates to migrate old files (e.g. add Execution Rules to existing phase-plans).

---

## Attribution (version)

Read `version` from this skill's SKILL.md frontmatter at time of run. Use for Created/Converted/Updated/Upgraded lines.
