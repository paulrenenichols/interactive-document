# Semantic series and chart authoring

Updated with the **docs-driven-dev** skill (v1.2.0).

Exploration for a document-centric authoring model:

- import a tabular dataset,
- create reusable **global series assets**,
- derive new series with a lightweight **semantic formula language** (grain-aware),
- bind compatible series into **chart assets**, and
- place charts into a living slide/document workspace.

This is intentionally **not** “build all of Excel/Tableau/Power BI”. It is a focused model that keeps the document explicit and reusable:

- **Series are global first-class objects**
- **Charts are global first-class objects**
- Slides/pages hold **placements** of charts and text, not the canonical chart logic

Use [exploration-lifecycle.md](../../setup/exploration-lifecycle.md) to evaluate this exploration or turn it into a milestone.

Feature sets are in `feature-sets/` (see [feature-sets/README.md](feature-sets/README.md)). Supporting materials live in `supporting-docs/`.

