# Semantic series and chart authoring spec (notes)

This file preserves the original “free form notes” version of the spec so we can link to it from feature-set docs and milestone planning.

Source: moved from `_docs/planning/explorations/exhibit-authorship-flow/sample-files/markdown spec from free form notes.md`.

---

## 1. Purpose

Implement an authoring workflow where a user can:

1. import a tabular dataset,
2. create reusable global data series assets,
3. derive new series with a lightweight semantic formula language,
4. bind compatible series into chart assets, and
5. place those charts into a living slide/document workspace.

---

## 2. Product thesis

- **Data series are global first-class objects.**
- **Charts are global first-class objects.**
- **Slides hold placements of charts and text, not the canonical chart logic itself.**

Key contract: compatibility between series is determined by **grain and alignment metadata**, not by length alone.

---

## 3. Core UX model

### 3.1 Data Model

The Data Model is where the user imports CSV, sees globally available series assets, creates indexes/masks/formulas/manual series, and creates/edits global chart assets.

### 3.2 Living Document

The Living Document is a lightweight slide/page editor where the user adds narrative content and places chart assets onto slides, with local layout overrides.

Boundary:

- **Chart asset** = reusable global chart definition
- **Chart placement** = chart on a specific slide with position/size/local overrides

---

## 4. Core first-class objects

- **Dataset import**: tabular source loaded from CSV, with schema, fingerprint, persisted raw rows (SQLite).
- **Series asset**: named reusable 1D vector or scalar (imported column, index, mask, grouped aggregate, manual helper).
- **Chart asset**: chart type + typed slot bindings to compatible series + styling/config.
- **Slide placement**: instance of chart/text on a slide, storing layout box and local overrides.

---

## 5. Data architecture and covenants

### 5.1 Separate: origin, liveness, role, grain

- **origin_kind**: `imported` | `formula` | `manual`
- **liveness_kind**: `live` | `snapshot`
- **role_kind**: `none` | `index` | `mask` | (future: `parameter`, `label`, …)
- **grain_kind**: `scalar` | `row` | `index`

### 5.2 Suggested `series_assets` fields (canonical)

Includes: `id`, `document_id`, `name`, `origin_kind`, `liveness_kind`, `role_kind`, `value_type`, `grain_kind`,
dataset lineage fields, alignment fields (`aligned_index_id`), `formula_text`, `formula_ast_json`, provenance, status + errors, timestamps.

### 5.3 Alignment covenants (enforce in validation + chart binding)

- **A**: length is informative, not authoritative
- **B**: row-grain aligns by dataset lineage
- **C**: index-grain aligns by `aligned_index_id`
- **D**: scalars broadcast
- **E**: masks evaluate at row grain (or scalar)
- **F**: index series must be unique and ordered
- **G**: manual series must declare alignment

### 5.4 Index role

Index creation should be a first-class wizard.

Naming convention: `idx.*`

### 5.5 Mask role

Masks are reusable row-selection logic; not all boolean columns are masks.

Naming convention: `mask.*`

### 5.6 Chart + placement schema

Charts: global assets with bindings table.

Placements: slide elements with layout + overrides.

### 5.7 Recharts data contract

Runtime adapter compiles bound series into row objects, validating alignment first.

---

## 6. Formula language

Design goals: spreadsheet-friendly, series-based refs (`[Name]`), vectorized + grain-aware, `_BY` functions as the center, explicit `where=`.

Core functions list includes:

- `INDEX`, `FILTER_INDEX`, `SORT_INDEX`
- scalar aggregates: `SUM`, `AVG`, `MEDIAN`, `PERCENTILE`, `MIN`, `MAX`, `COUNT`, `COUNT_ROWS`, `LEN`
- grouped: `SUM_BY`, `AVG_BY`, `MEDIAN_BY`, `PERCENTILE_BY`, `MIN_BY`, `MAX_BY`, `COUNT_BY`
- helpers: `IF`, `AND`, `OR`, `NOT`, `IN`, `COALESCE`

Key rule: `where=` must be row-grain or scalar. Output/index filtering belongs in `FILTER_INDEX(...)`.

---

## 7. Chart contracts

Charts bind typed slots; slot compatibility is grain/alignment-aware.

---

## 8. UI workflow guidance

Series list emphasizes grain/alignment.

Create-series wizard paths: Index / Formula / Manual.

Chart creation wizard: choose type → fill typed slots → name → edit.

---

## 9. SQLite persistence model (suggested)

`documents`, `dataset_imports`, `series_assets`, `series_dependencies`, `series_materializations`, `charts`, `chart_bindings`, `slides`, `slide_elements`.

---

## 10. Evaluation engine requirements

Parse to AST, resolve refs, persist deps, detect cycles, infer output grain/type, materialize preview, invalidate/recompute on upstream changes.

---

## 11. Milestone 1 recommendation (from notes)

Acceptance test: import compensation CSV → create `idx.Job Family` → create grouped series (median/sum/count) → bind to bubble chart → place on slide → reimport updates and see lineage update.

---

## 12. Deferred / v2 candidates

Combo charts, drillthrough, snapshot/detach UX, Excel-compat parsing sugar, distinct count, joins, collaboration, etc.

