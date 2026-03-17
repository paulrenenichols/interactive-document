# Milestone: CI scope optimization

**Slug:** `ci-scope-optimization`  
**Status:** Active milestone  
**Source exploration:** `_docs/planning/explorations/completed/ci-scope-optimization/`

## Purpose

Optimize CI scope so we only run expensive checks (lint, test, build) when code is actually impacted, while allowing docs-only and planning-only changes (like new explorations) to merge quickly.

## Goals

- Reduce unnecessary CI time for `_docs/`-only and similar changes.
- Use `nx affected` as the primary mechanism for deciding *what* to run on code changes.
- Keep the rules simple and explainable for contributors.
- Minimize risk of merging broken code due to over-aggressive skipping.

## Phases

1. **Phase 1 – Workflow clarity**
   - Make CI scope behavior explainable and visible in logs and docs.
   - Ensure contributors can tell when a run was treated as docs-only vs full Nx affected CI.
   - See `phase-plans/phase-1-workflow-clarity.md`.
2. **Phase 2 – Nx affected CI**
   - Implement Nx-affected-based lint/test/build for non-docs-only changes.
   - Wire base/head configuration, parallelism, and CI-specific configurations.
   - See `phase-plans/phase-2-nx-affected-ci.md`.
3. **Phase 3 – Docs-only guard & polish**
   - Implement and refine the docs-only guard behavior.
   - Tighten documentation, examples, and rollout guidance.
   - See `phase-plans/phase-3-docs-only-guard.md`.

## Links

- Exploration: `_docs/planning/explorations/completed/ci-scope-optimization/README.md`
- Supporting design doc: `_docs/planning/explorations/completed/ci-scope-optimization/supporting-docs/ci-scope-design.md`

