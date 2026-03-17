# Phase 1 rollout and validation (CI scope optimization)

## Rollout plan

- **Stage 1 — Observe (non-breaking):**
  - Enable the `Detect changes (docs-only guard)` job and nx affected CI, but treat the configuration as provisional.
  - Rely on the CI scope summary (docs-only decision + changed files) to spot surprising decisions.
- **Stage 2 — Enforce (when stable):**
  - Keep the current docs-only allowlist conservative (`_docs/**` and Markdown-only changes).
  - Only broaden the allowlist once we have confidence from Stage 1 that no risky files are being skipped.

## Validation steps

- For the first few weeks:
  - Skim CI runs that are marked docs-only and confirm that:
    - All changed files are in `_docs/**` or clearly non-code Markdown locations.
    - No config, build, or runtime-affecting files are being treated as docs-only.
  - Skim a sample of full Nx affected runs and confirm:
    - Affected projects align with expectations for the changed files.
    - No obviously-impacted project is missing from the affected set.

## Adjustments and guardrails

- If a file type or path is mistakenly treated as docs-only, remove it from the allowlist and document the decision in this folder.
- If Nx affected proves too broad for certain shared libs, adjust project boundaries or accept the additional CI work as intentional.

