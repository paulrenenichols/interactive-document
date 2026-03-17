<!-- Phase Plan Template -->

# Phase {{phase_number}}: {{phase_name}}

**Goal:** {{brief_goal_description}}  
**Estimated effort:** {{low/medium/high}} hours  
**Branch:** docs/{{milestone_slug}}-phase-{{phase_number}}

## Logical Chunks

Break work into bite-sized steps. Agent will handle one at a time.

1. **Chunk 1: {{chunk_1_title}}**
   - Tasks: {{list_tasks_here}}
   - Output: {{expected_files_or_changes}}

2. **Chunk 2: {{chunk_2_title}}**
   - Tasks: ...
   - Output: ...

3. **Chunk 3: {{chunk_3_title}}**
   - (add as many as needed)

## Execution Rules (Agent follows these strictly)

- **Per chunk:**
  1. Generate code/files.
  2. Run `npm run lint` (or equivalent—if no script, skip + note).
  3. Run `npm test` (skip if missing).
  4. If lint/test pass: `git add . && git commit -m "phase {{phase_number}} - {{chunk_title}}" && git push`.
  5. If fail: Pause → "Lint/test broke on chunk {{current}}. Fix? Or rollback?"
- **End of phase:**
  1. Run `npm run build` (if script exists—otherwise skip).
  2. Create PR: "Phase {{phase_number}}: {{phase_name}}" → merge (confirm with user).
  3. If last phase: Auto-complete milestone after merge.
- **Build config:** (set during plan) Build after every chunk? — default: no

## Notes / Dependencies

- {{any_prereqs_or_warnings}}
- Tests failing? Prioritize fixes before commit.
- Conflicts? Pause and ask: "Merge conflict—resolve manually?"

**Ready?** Say "go" to start chunk 1.
