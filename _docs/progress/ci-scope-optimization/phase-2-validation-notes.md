# Phase 2 safety and validation notes (Nx affected CI)

## Assumptions about the Nx project graph

- Each app/lib that can be impacted by a change has an appropriate target (`lint`, `test`, `build`) configured in `project.json` / `nx.json`.
- Shared libraries that are widely depended on (e.g. design system libs) legitimately cause many projects to be marked as affected when they change.

## What to watch in CI

- For a sample of non-docs-only PRs:
  - Confirm that the set of affected projects matches expectations for the changed files.
  - If a project clearly depends on a changed lib but is not listed, investigate its dependency edges in the Nx graph.
- For changes that touch very central libs:
  - Expect a broad affected set; treat that as a signal to consider refactoring overly-broad dependencies, not as a CI bug.

## Temporary toggles and fallbacks

- If Nx affected behavior looks risky in a specific area:
  - Consider adding a temporary explicit target run (e.g. a one-off `nx run frontend:lint`) while the graph is corrected.
  - Document any such temporary safety rails and plan to remove them once dependencies are fixed.

