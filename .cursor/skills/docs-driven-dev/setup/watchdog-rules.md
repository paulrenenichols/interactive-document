# Watchdog rules (v2)

The docs-driven-dev skill runs a **watchdog** (background state checker) on key triggers: create, implement, upgrade, or after merge/PR. It does not poll constantly—only when you run one of those actions.

## When the watchdog runs

- After a create workflow (exploration, milestone, etc.)
- After phase execution (implement phase) or when you're in an active milestone context
- After upgrade docs
- After a merge or PR is closed

## What it checks and prompts

1. **Milestone complete**
   - **Check:** Is the active milestone done? (last phase merged, no open PRs for this milestone?)
   - **Prompt:** *"Milestone complete—finish now?"*  
   - **Action:** If yes, run "Mark milestone completed" (move to completed/, add number prefix, sync progress and exploration folders).

2. **Drift**
   - **Check:** Progress folders out of sync with milestones? Old branches still present? Skill version mismatch?
   - **Prompt:** *"Docs stale—validate?"*  
   - **Action:** If yes, run validation (report "All good" or "Fixes needed: …").

3. **Half-done phase**
   - **Check:** No commits on the current phase branch in ~30 minutes?
   - **Prompt:** On your next command: *"Phase open—continue or rollback?"*  
   - **Action:** User can say "implement phase" / "go" to continue, or "rollback phase" / "rollback chunk" to revert.

## No auto-actions

The watchdog only prompts. It does not auto-delete branches, auto-complete milestones, or auto-validate. The user must confirm.
