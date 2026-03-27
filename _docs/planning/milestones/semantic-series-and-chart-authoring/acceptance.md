# Acceptance (milestone-level)

Updated with the **docs-driven-dev** skill (v1.2.0).

## Primary acceptance test (happy path)

Using a sample “compensation” CSV (or similar tabular dataset), a user can:

1. import the file into the document,
2. see imported columns as **row-grain** series assets,
3. create an index series (e.g. `[idx.Job Family]`),
4. create grouped index-aligned series (e.g. median, sum, count) using `_BY` formulas,
5. bind those series into a bubble chart asset with typed slots,
6. place that chart on a slide/page,
7. re-import an updated CSV (same dataset identity) and see dependent series + chart update via lineage.

## Validation/error expectations

- Binding refuses incompatible series with clear errors (grain/alignment/lineage mismatch).
- `where=` rejects index-grain conditions; output filtering uses `FILTER_INDEX(...)`.

