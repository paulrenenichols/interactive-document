# Series assets and alignment

Updated with the **docs-driven-dev** skill (v1.2.0).

## Goal

Define the canonical “series asset” model and the alignment rules that make charts and formulas safe and composable.

## Series asset (concept)

A **series asset** is a named, reusable 1D vector or scalar in a document:

- imported column series (row-grain),
- index series (index-grain, role=index),
- mask series (row-grain boolean, role=mask),
- grouped aggregates (index-grain aligned to an index),
- manual helpers (scalar / row / index as chosen).

## Compatibility contract (must be enforced)

Compatibility is based on **grain and alignment metadata**, not length.

### Grain kinds

- **scalar**: single value (broadcastable)
- **row**: one value per source row of a dataset import (must share lineage)
- **index**: one value per member of an index domain (must share `aligned_index_id`)

### Alignment covenants (summary)

- Length is *informative* only.
- Row-grain aligns by dataset lineage and row ordering contract.
- Index-grain aligns by `aligned_index_id` (or itself when role=index).
- Scalars broadcast where meaningful.
- Masks must evaluate at row (or scalar) grain.
- Index series must be unique and ordered.
- Manual series must declare alignment explicitly.

## Suggested persisted fields (v1-friendly)

Track at minimum:

- identity: `id`, `document_id`, `name`
- semantics: `origin_kind`, `liveness_kind`, `role_kind`, `value_type`
- compatibility: `grain_kind`, lineage/alignment references
- formula: `formula_text` (+ optional AST), dependencies
- state: `status`, `error_text`

## References

- Original notes: [semantic-series-and-chart-authoring-notes.md](../supporting-docs/semantic-series-and-chart-authoring-notes.md)

