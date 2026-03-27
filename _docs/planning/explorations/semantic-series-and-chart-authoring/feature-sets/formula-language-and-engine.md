# Formula language and engine

Updated with the **docs-driven-dev** skill (v1.2.0).

## Goal

Provide a lightweight, spreadsheet-friendly, **series-based** formula language that is:

- vectorized,
- grain-aware (scalar/row/index),
- explicit about filtering (`where=`),
- centered around grouped aggregation (`*_BY(...)`).

## Syntax surface (v1)

- Formulas start with `=`.
- Series references: `[Series Name]`.
- Literals: numbers, strings, booleans, NULL.
- Operators: arithmetic, comparisons, concat (`&`).
- Function calls: `FUNC(arg1, kw=value)`.

## Grain rules (validator contract)

- scalar + vector => vector (broadcast)
- row with row => ok only if same dataset lineage
- index with index => ok only if same `aligned_index_id`
- row with index => disallowed except within explicit grain-bridging functions (e.g. `_BY`)

## Core functions (v1 set)

- Domain: `INDEX`, `FILTER_INDEX` (output filtering), `SORT_INDEX` (optional)
- Scalar aggregates: `SUM`, `AVG`, `MEDIAN`, `PERCENTILE`, `MIN`, `MAX`, `COUNT`, `COUNT_ROWS`, `LEN`
- Grouped aggregates: `SUM_BY`, `AVG_BY`, `MEDIAN_BY`, `PERCENTILE_BY`, `MIN_BY`, `MAX_BY`, `COUNT_BY`
- Helpers: `IF`, `AND`, `OR`, `NOT`, `IN`, `COALESCE`

## `where=` rule

`where=` must evaluate to **row-grain** or **scalar** boolean.

Index/output filtering belongs in `FILTER_INDEX(...)`, not inside `where=`.

## Engine requirements (v1)

On save:

- parse to AST,
- resolve series references,
- persist dependencies,
- detect cycles,
- infer output grain/type/alignment,
- materialize preview values (and/or cache/materialize).

On upstream changes:

- invalidate downstream (`stale`),
- recompute in topological order (lazy or eager).

## References

- Original notes: [semantic-series-and-chart-authoring-notes.md](../supporting-docs/semantic-series-and-chart-authoring-notes.md)

