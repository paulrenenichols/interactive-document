# CI scope design: docs-only guard + Nx affected

_This file was moved from `_docs/planning/explorations/ci-scope-optimization/supporting-docs/ci-scope-design.md` when the exploration was converted into the **CI scope optimization** milestone. The content remains the same; links have been updated to point to the completed exploration path._

## Context

Current CI always runs lint, test, and build, even when a change is clearly non-code (for example, adding or editing `_docs/` explorations). This makes iteration on planning and documentation slower than necessary.

We want CI to:

- Be **fast** for docs-only / planning-only changes.
- Be **thorough** for any change that might impact running code.
- Stay **simple enough** that contributors can understand when CI will run.

## Chosen design

### 1. Docs-only guard (pre-check)

**Idea:** Short-circuit CI when every changed file is within a small allowlist of non-code paths.

- Compute changed files:
  - `git diff --name-only origin/main...HEAD`
- If all files match patterns like:
  - `_docs/**`
  - `docs/**` (if we treat these as non-code)
  - `*.md` in approved locations
- Then:
  - Mark the run as `docs_only = true`.
  - **Skip** heavy Nx tasks (lint/test/build) entirely.
  - Optionally run lightweight checks (e.g. markdown lint, link checks) in a separate job.

If **any** file falls outside this allowlist, we treat the change as potentially code-impacting and run full Nx-based CI.

### 2. Nx affected for code changes

When the change is not docs-only:

- Use `nx affected` instead of “all projects”:

  - `nx affected -t lint`
  - `nx affected -t test`
  - `nx affected -t build`

- Base/head configuration:
  - Default: compare against `origin/main...HEAD`
  - Optionally set `--base` / `--head` explicitly.

This scopes work to only the projects that are actually impacted by the change, according to the Nx project graph.

## Alternatives considered

### A. Pure path filters on jobs

**Description:** Use `paths` / `paths-ignore` on GitHub Actions jobs, or simple shell logic, to run or skip jobs based solely on paths.

- **Pros**
  - No extra tooling beyond Actions and git.
  - Easy to reason about for simple repos.

- **Cons**
  - Hand-maintained path lists for “code vs non-code”.
  - Easy to miss edge cases (e.g. a config file under a “docs” path that actually affects behavior).
  - No understanding of the project graph; a single path change may implicitly affect many projects.

- **Why not chosen as the primary mechanism**
  - We already use Nx; we’d rather lean on the project graph than maintain our own notion of “affected”.

### B. Separate “code CI” and “docs CI” workflows

**Description:** Two workflows:

- One for code changes (full Nx CI).
- One for docs-only changes (or just quick checks).

- **Pros**
  - Very explicit: you can point to two separate workflows.
  - Helps separate notifications and status checks if needed.

- **Cons**
  - More YAML and duplication.
  - Path triggers must be carefully kept in sync between workflows.
  - Still relies on path-based reasoning; does not leverage Nx’s graph.

- **Decision**
  - We can keep a single workflow and drive behavior via docs-only guard + Nx affected, avoiding duplication.

### C. Nx affected only (no explicit docs-only mode)

**Description:** Always run `nx affected` (possibly with `--base` / `--head`), regardless of what changed.

- **Pros**
  - Very simple mental model: CI always runs, just scoping work via Nx.
  - No path allowlist to maintain.

- **Cons**
  - For true docs-only changes, we still pay the cost of starting Nx, computing the graph, and running commands (even if they become no-ops).
  - Might still run some tasks if there are non-obvious connections or misconfigurations.

- **Decision**
  - Nx affected remains the core for *what* work to run, but we add a cheap docs-only guard to avoid starting the whole Nx pipeline when we clearly don’t need it.

## Tradeoffs summary

| Option                              | Complexity | Maintenance | Safety (avoid bad skips) | Notes                                      |
|-------------------------------------|-----------:|------------:|--------------------------:|--------------------------------------------|
| Path filters only                   |      Low   |      Medium | Medium                    | Simple, but hand-maintained paths          |
| Separate code/docs workflows       |   Medium   |      Medium | Medium                    | Clear but duplicated config                |
| Nx affected only                    |      Low   |       Low   | High                      | Good for code, still heavy for docs-only   |
| **Docs-only guard + Nx affected**  | **Medium** |   **Low**   | **High**                  | **Chosen**: cheap skip + graph-based scope |

## Open questions / future work

- **Docs-only allowlist**:
  - Exact patterns for this repo (e.g. `_docs/**` plus which Markdown files elsewhere).
  - Any “docs” directories that actually contain build-impacting config?

- **Lightweight docs checks**:
  - Do we want markdown lint or link checks on docs-only PRs?
  - If so, design a small job that runs even when we skip Nx.

- **Visibility**
  - How do we surface to contributors that a given run was “docs-only” and skipped heavy CI?
  - E.g. job names, output summaries, or status check descriptions.

- **Rollout**
  - Start in a non-blocking workflow or branch?
  - Add logging of detected patterns before enforcing the skip, to validate behavior.

