# Feature set: nx-affected-ci

## Problem

- Running lint/test/build for **all** projects on every code change is slow and redundant.
- We already use Nx, but CI should lean on the **project graph** to decide what actually needs to run.

## Proposal

For changes that are **not** docs-only:

- Use `nx affected` to scope CI work:
  - `nx affected -t lint`
  - `nx affected -t test`
  - `nx affected -t build`

Key details:

- Base/head:
  - Default to comparing `origin/main...HEAD`.
  - Optionally pass `--base` / `--head` explicitly to control behavior in forks or non-standard flows.
- Parallelism:
  - Use `--parallel` / `--maxParallel` to balance speed vs. resource usage.
- Configurations:
  - Optionally use `--configuration=ci` for CI-specific variants of targets.

## Benefits

- CI only runs checks on projects that are actually impacted by the current diff.
- We avoid hand-maintained path maps for “what counts as code”.
- Behavior is consistent with how Nx understands dependencies across apps and libs.

## Risks / mitigations

- **Risk:** Misconfigured project graph could cause `nx affected` to skip a project that should run.
  - Mitigation: Validate the graph and dependency edges; start with parallel runs (Nx affected + legacy) if needed.
- **Risk:** Very broad shared libs may cause many projects to be considered affected.
  - Mitigation: Refine project boundaries or accept that changes to broad, central libs legitimately warrant more CI work.

