# Feature set: workflow-clarity

## Problem

- Contributors may not understand why some PRs run full CI and others skip heavy checks.
- Surprising CI behavior makes it harder to trust the system and debug issues.

## Proposal

Make the CI scope rules **visible and explainable**:

- **Job naming and outputs**
  - Name jobs clearly, e.g. `detect-changes (docs-only guard)` and `ci (nx affected)`.
  - Echo the list of changed files and the docs-only decision in logs.
  - Optionally set a summary note when a run was treated as docs-only.

- **Documentation**
  - Document the behavior in:
    - `_docs/planning/explorations/ci-scope-optimization/supporting-docs/ci-scope-design.md`
    - Contributor docs (e.g. CONTRIBUTING or CI README).
  - Explain:
    - What counts as docs-only.
    - When Nx affected runs and what it does.

- **Rollout**
  - Consider a validation period where:
    - The docs-only guard only logs what it *would* do, without skipping.
    - We confirm there are no surprising patterns before enforcing the skip.

## Goals

- Any contributor should be able to look at a CI run and understand:
  - “This was treated as docs-only, so heavy tasks were skipped.”
  - “This ran Nx affected for these targets because code paths changed.”
- Reduce confusion and make CI scope decisions auditable.
