# Dataset import and lineage

Updated with the **docs-driven-dev** skill (v1.2.0).

## Goal

Support importing a tabular dataset (CSV first) into the document, persisting raw rows in SQLite, and establishing a durable identity so future re-imports can be treated as updates rather than new datasets.

## Core requirements

- **Document-scoped dataset import** with:
  - schema,
  - row count,
  - import fingerprint / identity (for update semantics),
  - raw row persistence (SQLite table or equivalent).
- **Imported columns become series assets** so imported and derived data are handled consistently downstream.

## Non-goals (v1)

- Cross-dataset joins and relational modeling UX.
- External connectors (Sheets, warehouse, APIs).

## Key decisions to document in implementation

- How we compute and store import identity/fingerprint (what changes count as “same dataset updated”?).
- Row ordering contract for row-grain series (must be stable for lineage).

## References

- Original notes: [semantic-series-and-chart-authoring-notes.md](../supporting-docs/semantic-series-and-chart-authoring-notes.md)

