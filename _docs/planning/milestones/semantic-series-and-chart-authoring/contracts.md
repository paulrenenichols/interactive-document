# Contracts (data + formulas + charts)

Updated with the **docs-driven-dev** skill (v1.2.0).

This milestone depends on a few hard “contracts” that must be implemented and enforced consistently across UI, validation, and persistence.

## Series compatibility

- Compatibility is based on **grain** and **alignment metadata**, not length.
- Grain kinds: `scalar`, `row`, `index`.
- Row-grain alignment is by dataset lineage and row ordering contract.
- Index-grain alignment is by `aligned_index_id` (or itself when role=index).

## Masks

- Masks are explicit reusable row-selection logic (role=mask).
- Masks must be scalar or row-grain boolean; only `TRUE` keeps a row.

## Formula validation

- scalar broadcasts into vectors where meaningful
- row + row ok only with same lineage
- index + index ok only with same `aligned_index_id`
- row + index disallowed except within explicit grain-bridging functions (e.g. `_BY`)

## Filtering contract

- `where=` accepts scalar or row-grain boolean only
- output/index filtering uses `FILTER_INDEX(...)`

## Chart binding contract

- Each chart type declares typed slots
- Binding validates grain/alignment/value_type before render
- Runtime compilation should produce chart-ready rows only after passing validation

## Reference

- Exploration notes: [_docs/planning/explorations/semantic-series-and-chart-authoring/supporting-docs/semantic-series-and-chart-authoring-notes.md](../../explorations/semantic-series-and-chart-authoring/supporting-docs/semantic-series-and-chart-authoring-notes.md)

