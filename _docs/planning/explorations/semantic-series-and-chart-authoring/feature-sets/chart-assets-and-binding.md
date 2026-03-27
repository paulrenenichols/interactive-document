# Chart assets and binding

Updated with the **docs-driven-dev** skill (v1.2.0).

## Goal

Define **global chart assets** with typed slots, and ensure chart bindings are validated using the same grain/alignment contract as series and formulas.

## Chart asset vs placement

- **Chart asset**: global definition (type, bindings, default style/config).
- **Chart placement**: instance on a slide/page (layout + local overrides).

## Slot contracts (examples)

Each chart type defines slots with:

- accepted value types,
- accepted grain kinds,
- alignment requirements among bound series,
- multiplicity rules (single vs multi-series).

Example: bubble chart (index-grain)

- `label`: text, index-grain
- `x`, `y`, `size`: number, index-grain aligned to `label`’s index

## Binding validation

Binding must fail fast with user-facing errors for:

- grain mismatch,
- misaligned index (`aligned_index_id` mismatch),
- lineage mismatch (row-grain),
- unsupported value_type for a slot.

## Runtime adapter

If using Recharts (or similar), compile bound series into chart-ready rows, validating alignment first.

## References

- Original notes: [semantic-series-and-chart-authoring-notes.md](../supporting-docs/semantic-series-and-chart-authoring-notes.md)

