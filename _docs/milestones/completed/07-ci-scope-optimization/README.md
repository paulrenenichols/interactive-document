# Milestone: CI scope optimization

**Slug:** `ci-scope-optimization`  
**Status:** Completed milestone  
**Source exploration:** `_docs/planning/explorations/completed/07-ci-scope-optimization/`

## Purpose

Optimize CI scope so we only run expensive checks (lint, test, build) when code is actually impacted, while allowing docs-only and planning-only changes (like new explorations) to merge quickly.

## Goals

- Reduce unnecessary CI time for `_docs/`-only and similar changes.
- Use `nx affected` as the primary mechanism for deciding *what* to run on code changes.
- Keep the rules simple and explainable for contributors.
- Minimize risk of merging broken code due to over-aggressive skipping.

## Links

- Exploration: `_docs/planning/explorations/completed/07-ci-scope-optimization/README.md`
- Supporting design doc: `_docs/planning/explorations/completed/07-ci-scope-optimization/supporting-docs/ci-scope-design.md`

