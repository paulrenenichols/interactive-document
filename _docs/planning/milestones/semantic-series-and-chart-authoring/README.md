# Semantic series and chart authoring — Milestone planning

Updated with the **docs-driven-dev** skill (v1.2.0).

## Summary

Add a reusable, document-centric authoring model for **series assets** and **chart assets**:

- import a dataset,
- surface imported columns as series assets,
- create indexes/masks/formula series (grain-aware),
- bind aligned series into chart assets, and
- place chart assets into the slide/document editor as placements.

## Scope and constraints (v1)

- **Do not** infer compatibility from length. Use explicit grain/alignment rules.
- **Do not** attempt multi-dataset joins in formulas.
- Keep “chart asset” separate from “placement” so the same chart can appear on multiple slides.

## References

- Exploration: [_docs/planning/explorations/semantic-series-and-chart-authoring/](../../explorations/semantic-series-and-chart-authoring/)
- Feature sets index: [_docs/planning/explorations/semantic-series-and-chart-authoring/feature-sets/](../../explorations/semantic-series-and-chart-authoring/feature-sets/)
- Original notes: [_docs/planning/explorations/semantic-series-and-chart-authoring/supporting-docs/semantic-series-and-chart-authoring-notes.md](../../explorations/semantic-series-and-chart-authoring/supporting-docs/semantic-series-and-chart-authoring-notes.md)

## Proposed phases (draft)

These phase names are intended to map directly to `_docs/milestones/future/semantic-series-and-chart-authoring/phases/` and `phase-plans/`.

| Phase | Outcome |
|-------|---------|
| **01-series-assets** | Dataset import → imported columns as row-grain series assets; basic series list UI + persistence contracts |
| **02-index-and-formulas** | Index + mask creation and a minimal formula language + validation engine (grain-aware) |
| **03-chart-assets** | Chart assets with typed slots, binding UI, and binding validation/compilation |
| **04-placements** | Place chart assets into slides/pages as placements with layout + local overrides |

