# Semantic Series and Chart Authoring Spec

## 1. Purpose

This document summarizes current project notes for a milestone to implement the following user story:

1. import a tabular dataset,
2. create reusable global data series assets,
3. derive new series with a lightweight semantic formula language,
4. bind compatible series into chart assets, and
5. place those charts into a living slide/document workspace.

**Reader consumption:** How charts behave on slides in **Preview Mode** and in a future published standalone deck (tooltips, pointer events, planned filters/slicers) is specified in the slide deck document: [slide-deck-spec.md §1.2 Preview Mode](slide-deck-spec.md#12-preview-mode-in-app-presentation-view).

The goal is not to replicate all of Excel, Tableau, or Power BI. The goal is to create an explicit, reusable, document-centric authoring model that feels familiar to spreadsheet users while being structured enough to support semantic chart creation.

---

## 2. Product thesis

The key product idea is:

- **Data series are global first-class objects.**
- **Charts are global first-class objects.**
- **Slides hold placements of charts and text, not the canonical chart logic itself.**

This is a deliberate shift away from traditional BI tooling where a lot of grouping and aggregation logic is implicit inside a specific visual.

In this system, the user creates reusable named series such as:

- `idx.Job Family`
- `Median Salary by Job Family`
- `Comp Spend by Job Family`
- `Count by Job Family`
- `mask.Active Employees`

Then the user binds those series into a chart recipe.

The most important implementation consequence is:

> Compatibility between series is determined by **grain and alignment metadata**, not by matching lengths alone.

Two series with length `19` are not necessarily compatible. They are compatible only if they are aligned to the same output domain/index.

---

## 3. Core UX model

The authorship experience has two main modes.

### 3.1 Data Model

The Data Model is where the user:

- manages **data sources** (add, list, and connect tabular inputs — flat files or external SQL),
- imports CSV data (and other sources) against those data sources,
- sees globally available series assets,
- creates indexes, masks, formulas, and manual series,
- creates and edits global chart assets.

This mode combines ideas from:

- Excel: formulas, named objects, lightweight charting,
- BI semantic models: reusable derived fields and grouped logic.

### 3.2 Living Document

The Living Document is a lightweight slide/page editor where the user:

- adds text boxes and narrative content,
- places chart assets onto slides,
- resizes/repositions charts,
- applies local layout overrides without redefining the chart's underlying semantic logic.

The key boundary:

- **Chart asset** = reusable global chart definition
- **Chart placement** = chart on a specific slide with position/size/local overrides

---

## 4. Core first-class objects

### 4.1 Data source

A **data source** is a document-scoped asset describing *where* tabular input comes from. It is distinct from a **dataset import** (materialized rows/schema for a given load) and from **series** derived on top.

**Identity**

- `id` — stable UUID.
- `display_name` — user-facing label, **unique within the document** (enforced in product and persistence).

**Provenance (`provenance_kind`)**

- `flat_file` — upload from disk; supports **`csv`** or **`xlsx`** (see flat-file addressing below).
- `external_sql` — logical link to an external connection plus a SQL-defined query (warehouse / gateway). Persist enough metadata to disambiguate (e.g. connection id or label, query id or fingerprint). Full SQL editor / connection credential UX can evolve in later milestones.

**Flat-file addressing** (when `provenance_kind` is `flat_file`)

- `file_display_name` — user-visible file label (original filename or a renamed asset name).
- `file_format` — `csv` | `xlsx` (drives validation and icons).
- `sheet_name` — required for Excel workbooks. For **CSV**, which has a single implicit sheet, use the sentinel value **`__csv_default__`** in JSON/API so the shape is uniform. UI may render that as "—", "(default)", or omit a sheet column when `file_format` is `csv`.

**Relationship to imports**

- Each **dataset import** (§4.2) that loads data for this logical source should reference `data_source_id` so re-imports and fingerprint updates stay tied to the same data source asset.

### 4.2 Dataset import

A dataset import is a **materialized** tabular load: schema, rows, and lineage for a given point in time. It is typically associated with a **data source** (§4.1) via `data_source_id`.

It has:

- a document scope,
- optional `data_source_id` (UUID) linking to the data source asset,
- a schema,
- row count,
- a fingerprint so later re-imports can be treated as updates to the same source,
- persisted raw rows in SQLite.

Imported columns should also be surfaced as series assets so the app can treat imported and derived data consistently.

### 4.3 Series asset

A series asset is a named 1D vector or scalar that can be reused across charts and formulas.

Examples:

- imported column: `[Base Salary]`
- index: `[idx.Job Family]`
- grouped aggregate: `[Median Salary by Job Family]`
- boolean mask: `[mask.Active Employees]`
- manual label helper: `[Chart Title FY26]`

### 4.4 Chart asset

A chart asset is a reusable global object with:

- a chart type,
- a name,
- slot bindings to compatible series,
- chart styling/configuration,
- dependency references to bound series.

### 4.5 Slide placement

A slide placement is an instance of a chart asset or text block on a slide/page.

It stores:

- `slide_id`
- `element_type`
- `chart_id` or `text_content`
- layout box (`x`, `y`, `width`, `height`)
- local display overrides
- z-index

### 4.6 Data sources list (UI)

Tabular views of **data sources** (e.g. Data Model sidebar or full-width table) should expose at least:

| Column | Notes |
|--------|--------|
| **Source type** | Icon differentiation: **flat file** vs **external connection / gateway** (SQL) vs each other. |
| **Source name** | `display_name`; optional subtitle with file/sheet or connection label. |
| **Row count** | Integer; latest materialized import when applicable. |
| **Field count** | Column/schema count. |
| **Estimated memory (KB)** | Estimated size of a **CSV export** of the materialized table (or equivalent serialized snapshot), rounded for display. |

---

## 5. Data architecture and covenants

This section is the most important engineering contract in the system.

## 5.1 Separate four concepts: origin, liveness, role, and grain

To keep the model extensible, persistence should separate these concepts even if the initial UI exposes only three creation paths.

### Origin kind

How the series was created.

- `imported`
- `formula`
- `manual`

### Liveness kind

Whether the series still updates from dependencies.

- `live`
- `snapshot`

Notes:

- A formula series usually starts as `live`.
- A user may later detach/freeze it into a `snapshot`.
- An imported series may also be snapshotted if the user wants to override values.
- The UI can still present simple creation options while the backend keeps this richer model.

### Role kind

A semantic role, not a data type.

- `none`
- `index`
- `mask`
- future: `parameter`, `label`, `sort_key`, `scenario`

Important:

- A mask is **not** the same thing as “a boolean or 0/1 column.”
- A mask is a series explicitly intended for row selection/filtering logic.
- A raw imported `0/1/null` flag column can participate in conditions without automatically being classified as a mask.

### Grain kind

The alignment level at which the series lives.

- `scalar` - single value
- `row` - one value per source row in a dataset import
- `index` - one value per member of an index/domain series

This is critical. Grain is the real compatibility contract.

---

## 5.2 Series asset schema

Recommended canonical fields for `series_assets`:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Durable handle |
| `document_id` | uuid | Document scope |
| `name` | text unique within document | User-facing name |
| `origin_kind` | enum | `imported`, `formula`, `manual` |
| `liveness_kind` | enum | `live`, `snapshot` |
| `role_kind` | enum | `none`, `index`, `mask`, ... |
| `value_type` | enum | `numeric`, `text`, `boolean`, `date`, `json` |
| `grain_kind` | enum | `scalar`, `row`, `index` |
| `root_dataset_import_id` | uuid nullable | Required for row-grain imported/formula series |
| `source_column_name` | text nullable | For imported columns |
| `aligned_index_id` | uuid nullable | Required for index-grain non-index series |
| `index_source_series_id` | uuid nullable | Required for role=`index` |
| `length` | integer | Materialized vector length; `1` for scalar |
| `formula_text` | text nullable | Source formula string |
| `formula_ast_json` | json nullable | Parsed AST |
| `formula_version` | integer nullable | Useful for future parser evolution |
| `provenance_json` | json nullable | Source file metadata, import fingerprint, etc. |
| `sort_spec_json` | json nullable | Especially important for indexes |
| `null_policy_json` | json nullable | How blanks/nulls are treated |
| `default_display_format` | text nullable | E.g. `$0.0a`, `0.0%`, `0` |
| `status` | enum | `valid`, `stale`, `error`, `computing` |
| `error_text` | text nullable | Validation/evaluation message |
| `created_at` | datetime | Audit |
| `updated_at` | datetime | Audit |

Recommended companion tables:

- `series_dependencies(child_series_id, parent_series_id, dependency_kind)`
- `series_materializations(series_id, revision, values_json, value_hash, computed_at, input_fingerprint)`

For v1, `values_json` can be stored as a JSON array. Later, performance-sensitive revisions can use columnar caches.

---

## 5.3 Alignment covenants

These are hard rules that should be enforced in validation and chart binding.

### Covenant A: length is informative, not authoritative

Length helps users visually disambiguate series, but the app must not treat equal lengths as sufficient proof of compatibility.

### Covenant B: row-grain series align by source dataset lineage

Two row-grain series are compatible only if they share the same row lineage, usually the same `root_dataset_import_id` and row ordering contract.

V1 assumption:

- no cross-dataset joins in formulas,
- row-grain formulas operate only within one dataset import.

### Covenant C: index-grain series align by `aligned_index_id`

Any index-grain series that is not itself the index must declare the specific index it is aligned to.

Examples:

- `[idx.Job Family]` has `role_kind=index` and no `aligned_index_id`; it is its own domain.
- `[Median Salary by Job Family]` has `grain_kind=index` and `aligned_index_id = id(idx.Job Family)`.
- `[Count by Job Family]` must also align to the same index.

### Covenant D: scalar series broadcast

Scalars can be used anywhere a scalar broadcast makes sense, such as:

- formulas,
- titles,
- parameter-like comparisons,
- arithmetic with vectors.

### Covenant E: masks must evaluate at row grain or scalar grain

A mask is reusable row-selection logic.

Valid mask examples:

- `[Country] = "US"`
- `([Gender] = "F") * ([Level] >= 4)`
- `[Has_Standard_Contract] = 1`

Invalid mask example:

- `[Count by Job Family] > 20`

That last example is output-grain logic, not row-grain logic, and belongs in index filtering, not row masking.

### Covenant F: index series must be unique and ordered

Any series with `role_kind=index` must satisfy:

- values are unique after applying blank policy,
- order is stable and explicit,
- source lineage is known,
- `value_type` is typically `text`, `number`, or `date`.

Recommended blank policies:

- `exclude`
- `include_blank_token`
- `error_if_blank`

### Covenant G: manual series must declare their alignment

A manual series is not meaningful unless its grain is clear.

Examples:

- manual scalar: custom threshold value
- manual index-grain numeric series aligned to `[idx.Job Family]`
- manual standalone label series aligned to `[idx.Job Family]`

For v1, the creation UI should force the user to choose whether manual series are:

- scalar,
- row-aligned to a dataset,
- aligned to an existing index.

---

## 5.4 Index role

An index is a special series role representing an ordered unique domain derived from another series.

Typical properties:

- `role_kind = index`
- `grain_kind = index`
- `index_source_series_id` points to the source row-grain series
- `sort_spec_json` captures alphabetical/manual/metric sort
- `null_policy_json` captures blank handling

Canonical example (same **shorthand** as §14: name tied to a single saved expression; not multiple statements in one formula editor):

```text
[idx.Job Family] = INDEX([Job Family], order="alpha_asc", blanks="exclude")
```

### Index UX notes

Creating an index should be a first-class wizard path:

1. choose source series,
2. choose blank handling,
3. choose order,
4. preview output values and length,
5. save under a globally unique name.

Recommended default naming convention:

- `idx.Job Family`
- `idx.Business Title`
- `idx.Variance Band`

### Sorting

There should be two levels of sorting:

1. **index default order** - stored on the index asset itself
2. **chart-local display order override** - optional local override inside a specific chart

This lets a shared index remain stable while charts can sort visually by headcount, value, etc.

---

## 5.5 Mask role

A mask is an explicitly declared reusable boolean condition over row-grain data.

Examples (§14-style shorthand: each line is a series name and the **single expression** saved for that series; inner `=` is equality):

```text
[mask.Active Employees] = ([Employment Status] = "Active")
[mask.US Core Pop] = ([Country] = "US") * ([Employment Type] = "Full-Time")
[mask.Standard Contract] = ([Has_Standard_Contract] = 1)
```

### Important boundary

Do **not** automatically classify all boolean or 0/1 columns as masks.

Instead:

- any series may participate in a boolean condition,
- only explicitly created/tagged mask series should be surfaced in a “masks first” formula picker or filtered UI view.

This avoids polluting the mental model with raw imported flags that are descriptive but not necessarily reusable filters.

Recommended naming convention:

- `mask.Active Employees`
- `mask.US Employees`
- `mask.Comp Review Population`

Null rule for masks:

- only `TRUE` keeps the row,
- `FALSE` or `NULL` excludes the row.

---

## 5.6 Chart asset schema

Recommended canonical fields for `charts`:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Durable handle |
| `document_id` | uuid | Document scope |
| `name` | text unique within document | Global chart name |
| `chart_type` | enum | `bubble`, `bar_clustered_v`, ... |
| `spec_json` | json | Slot bindings, axes, layer config |
| `style_json` | json | Fonts, colors, labels, legend, etc. |
| `status` | enum | `valid`, `error`, `stale` |
| `error_text` | text nullable | Validation message |
| `created_at` | datetime | Audit |
| `updated_at` | datetime | Audit |

Recommended companion table:

- `chart_bindings(chart_id, slot_name, series_id, axis_group, layer_key, sort_override_json)`

### Placement schema

Recommended `slide_elements` or equivalent:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Durable handle |
| `slide_id` | uuid | Parent slide |
| `element_type` | enum | `chart`, `text`, `shape` |
| `chart_id` | uuid nullable | For chart placements |
| `text_content` | text nullable | For text blocks |
| `x` `y` `width` `height` | numbers | Layout box |
| `overrides_json` | json nullable | Local title override, hidden legend, etc. |
| `z_index` | integer | Stacking order |

For the **full slide deck** (rich text, images, tables, layouts, themes), this minimal row shape is superseded by [`slide-deck-spec.md`](slide-deck-spec.md): see **Relationship to this spec** there for mapping (e.g. semantic `text` → slide-deck `text_box` with `spec_json` instead of a bare `text_content` column).

---

## 5.7 Recharts data contract

Recharts wants row objects, not separate parallel arrays. The runtime adapter should compile bound series into chart-ready row objects.

Example for a bubble chart bound to:

- label = `[idx.Job Family]`
- x = `[Median Salary by Job Family]`
- y = `[Comp Spend by Job Family]`
- size = `[Count by Job Family]`

Compiled runtime rows:

```json
[
  { "__key": "Engineering", "label": "Engineering", "x": 215000, "y": 12450000, "size": 91 },
  { "__key": "Finance", "label": "Finance", "x": 181000, "y": 4600000, "size": 24 }
]
```

The compiler should validate alignment before compilation.

---

## 6. Formula language

This section defines the lightweight semantic business-logic formula syntax.

## 6.1 Design goals

The formula language should:

- feel familiar to spreadsheet users,
- support positional parameters for common cases,
- support keyword parameters where clarity matters,
- operate on named series, not individual cell addresses,
- be vectorized and grain-aware,
- support grouped aggregations by explicit index,
- avoid trying to be full Excel in v1.

The canonical syntax should be readable and explicit, even if the parser later supports some Excel-like sugar.

---

## 6.2 Basic syntax

### Single expression; no assignment operator

The formula editor captures **one expression** that defines the series. There is **no** assignment operator and **no** chaining of declarations in that surface: you do not write `[idx.Job Family] = INDEX(...)` inside the editor. (Elsewhere in this document, `Name = …` may appear as **authoring shorthand** for “the saved formula for series `Name` is …”; see §14.)

### Equality: `=` is always comparison (C-family `==`)

Wherever `=` appears **inside** the expression, it means **equality comparison**, like `==` in C, Java, JavaScript, etc. It is **not** assignment.

Examples:

```text
[Country] = "US"
[Has_Standard_Contract] = 1
```

### Optional leading `=` (spreadsheet habit)

Many users will start a formula with `=` out of spreadsheet habit. Implementations should accept an **optional** leading `=` at the very beginning of the stored string and **strip it before parsing** the expression. That leading character is not an operator and does not nest: only the prefix form is special-cased.

If the user omits the leading `=`, the expression is equally valid.

### Series references

Series are referenced in square brackets:

```text
[Base Salary]
[idx.Job Family]
[mask.Active Employees]
```

### Literals

```text
123
123.45
"US"
TRUE
FALSE
NULL
```

### Operators

Arithmetic:

- `+`
- `-`
- `*`
- `/`
- `^`

Comparison (binary `=` is equality only; see above):

- `=` (equality)
- `!=`
- `>`
- `>=`
- `<`
- `<=`

Text:

- `&` for concatenation

Boolean:

- `AND(...)`
- `OR(...)`
- `NOT(...)`

Compatibility sugar for Excel-like users:

- `*` may be accepted as boolean AND when both sides are boolean
- `+` may be accepted as boolean OR when both sides are boolean

### Function calls

```text
FUNC(arg1, arg2)
FUNC(arg1, kw=value)
FUNC(arg1, arg2, kw=value)
```

Support both:

- positional parameters for common use,
- keyword parameters for clarity where ordering becomes ambiguous.

The `=` in `kw=value` is **keyword-argument binding** inside an argument list, not equality comparison. The parser distinguishes `IDENT` followed by `=` **only** in argument position from binary `=` between two expressions.

### Recommended parser grammar (minimal)

After optional leading-prefix normalization (strip one leading `=` if present):

```text
expr        := literal | series_ref | unary_expr | binary_expr | function_call | "(" expr ")"
series_ref  := "[" name "]"
function_call := IDENT "(" args? ")"
args        := arg ("," arg)*
arg         := expr | IDENT "=" expr
unary_expr  := ("-" | "NOT") expr
binary_expr := expr op expr
op          := + | - | * | / | ^ | & | = | != | > | >= | < | <=
```

### Recommended AST node types

```ts
type ExprNode =
  | { kind: 'literal'; value: string | number | boolean | null }
  | { kind: 'series_ref'; name: string; seriesId?: string }
  | { kind: 'unary'; op: string; arg: ExprNode }
  | { kind: 'binary'; op: string; left: ExprNode; right: ExprNode }
  | { kind: 'call'; fn: string; args: ExprNode[]; kwargs: Record<string, ExprNode> }
```

### Recommended validation outputs per AST node

The validator should annotate each node with:

- inferred `value_type`
- inferred `grain_kind`
- dataset lineage or `aligned_index_id`
- nullability
- user-facing error state if invalid

That allows the editor to explain errors like:

- "`where=` must be row-grain or scalar"
- "Cannot add an index-grain series to a row-grain series outside a `_BY` function"
- "Series belong to different dataset lineages"

---

## 6.3 Canonical evaluation model

A formula can return one of three shapes:

- scalar
- row-grain vector
- index-grain vector

A function must declare its output grain.

### Grain rules

- scalar + vector => vector broadcast
- row-grain vector with row-grain vector => allowed if same dataset lineage
- index-grain vector with index-grain vector => allowed if same `aligned_index_id`
- row-grain vector with index-grain vector => not directly allowed unless inside a `_BY` function or another function that explicitly bridges grains

---

## 6.4 Core functions

### 6.4 Function signature summary

| Function | Signature | Output grain | Notes |
|---|---|---|---|
| `INDEX` | `INDEX(source, order?, blanks?)` | `index` | Creates ordered unique domain |
| `FILTER_INDEX` | `FILTER_INDEX(index, keep)` | `index` | `keep` must be index-grain aligned to `index` |
| `SORT_INDEX` | `SORT_INDEX(index, by, order?)` | `index` | Sort helper; often UI-driven instead |
| `SUM` | `SUM(values, where?)` | `scalar` | Ignores nulls |
| `AVG` | `AVG(values, where?)` | `scalar` | Ignores nulls |
| `MEDIAN` | `MEDIAN(values, where?)` | `scalar` | Ignores nulls |
| `PERCENTILE` | `PERCENTILE(values, p, where?)` | `scalar` | `p` in `[0,1]` |
| `MIN` / `MAX` | `MIN(values, where?)` | `scalar` | Ignores nulls |
| `COUNT` | `COUNT(values, where?)` | `scalar` | Counts non-null values |
| `COUNT_ROWS` | `COUNT_ROWS(where?)` | `scalar` | Counts rows regardless of field nulls |
| `LEN` | `LEN(series)` | `scalar` | Series length, not non-null count |
| `SUM_BY` | `SUM_BY(values, index, where?)` | `index` | Grouped aggregation |
| `AVG_BY` | `AVG_BY(values, index, where?)` | `index` | Grouped aggregation |
| `MEDIAN_BY` | `MEDIAN_BY(values, index, where?)` | `index` | Grouped aggregation |
| `PERCENTILE_BY` | `PERCENTILE_BY(values, index, p, where?)` | `index` | Grouped aggregation |
| `MIN_BY` / `MAX_BY` | `MIN_BY(values, index, where?)` | `index` | Grouped aggregation |
| `COUNT_BY` | `COUNT_BY(index, where?)` | `index` | Counts rows per index member |
| `IF` | `IF(condition, trueExpr, falseExpr)` | depends | Branches must be compatible |
| `AND` / `OR` / `NOT` | boolean helpers | row/index/scalar | Inputs must align |
| `IN` | `IN(value, option1, option2, ...)` | same as `value` | Membership test |
| `COALESCE` | `COALESCE(a, b, ...)` | promoted | First non-null |

### 6.4.1 Domain and index functions

#### `INDEX`

Creates an ordered unique index from a row-grain source series.

```text
=INDEX([Job Family])
=INDEX([Job Family], order="alpha_asc", blanks="exclude")
```

Output:

- grain: `index`
- role: typically `index`

#### `FILTER_INDEX`

Filters an existing index by an index-grain keep expression.

```text
=FILTER_INDEX([idx.Job Family], keep=[Count by Job Family] >= 20)
```

Output:

- grain: `index`
- role: usually `index`

This is the right tool for output-level filtering. Do not overload `where=` for this.

#### `SORT_INDEX`

Optional helper for formula-level index sorting.

```text
=SORT_INDEX([idx.Job Family], by=[Count by Job Family], order="desc")
```

In practice, sorting may often be easier to manage through UI metadata rather than formulas.

### 6.4.2 Scalar and vector aggregate functions

These functions aggregate over a row-grain input or a filtered subset of a row-grain input.

#### `SUM`
```text
=SUM([Base Salary])
=SUM([Base Salary], where=[mask.Active Employees])
```

#### `AVG`
```text
=AVG([Base Salary])
```

#### `MEDIAN`
```text
=MEDIAN([Base Salary])
=MEDIAN([Base Salary], where=([Country]="US")*([Gender]="F"))
```

#### `PERCENTILE`
```text
=PERCENTILE([Base Salary], 0.75)
=PERCENTILE([Base Salary], p=0.75, where=[mask.Active Employees])
```

#### `MIN`, `MAX`
```text
=MIN([Base Salary])
=MAX([Base Salary])
```

#### `COUNT`
Counts non-null values of a series after filtering.

```text
=COUNT([Base Salary])
=COUNT([Base Salary], where=[mask.Active Employees])
```

#### `COUNT_ROWS`
Counts raw rows after filtering.

```text
=COUNT_ROWS()
=COUNT_ROWS(where=[mask.Active Employees])
```

#### `LEN`
Returns the length of the series itself, not the count of non-null values.

```text
=LEN([idx.Job Family])
```

### 6.4.3 Grouped aggregation functions

These are the core semantic charting functions.

#### Canonical pattern

```text
AGG_BY(values, index, where=condition)
```

Meaning:

> For each member of `index`, aggregate `values` over raw rows whose source grouping series matches that index member, and that also satisfy `where=` if provided.

The index already stores:

- its source grouping series,
- its unique members,
- its order.

That means:

```text
=MEDIAN_BY([Base Salary], [idx.Job Family])
```

is conceptually equivalent to:

> For each job family in the order stored by `[idx.Job Family]`, compute the median of `[Base Salary]` for rows whose `[Job Family]` equals that member.

#### `SUM_BY`
```text
=SUM_BY([Target Total Pay], [idx.Job Family])
=SUM_BY([Target Total Pay], [idx.Job Family], where=[mask.Active Employees])
```

#### `AVG_BY`
```text
=AVG_BY([Base Salary], [idx.Job Family])
```

#### `MEDIAN_BY`
```text
=MEDIAN_BY([Base Salary], [idx.Job Family])
=MEDIAN_BY([Base Salary], [idx.Job Family], where=([Country]="US")*([Gender]="F"))
```

#### `PERCENTILE_BY`
```text
=PERCENTILE_BY([Base Salary], [idx.Job Family], 0.75)
=PERCENTILE_BY([Base Salary], [idx.Job Family], p=0.25, where=[mask.Active Employees])
```

#### `MIN_BY`, `MAX_BY`
```text
=MIN_BY([Base Salary], [idx.Job Family])
=MAX_BY([Base Salary], [idx.Job Family])
```

#### `COUNT_BY`
Counts raw rows per index member.

```text
=COUNT_BY([idx.Job Family])
=COUNT_BY([idx.Job Family], where=[mask.Active Employees])
```

Future extension:

- `COUNT_DISTINCT_BY(values, index, where=...)`

### 6.4.4 Boolean and control-flow helpers

#### `IF`

```text
=IF([Base Salary] > 200000, "High", "Other")
```

Returns a vector if the condition is a vector.

#### `AND`, `OR`, `NOT`

```text
=AND([Country]="US", [Employment Type]="Full-Time")
=NOT(ISBLANK([Job Family]))
```

#### `IN`

```text
=IN([Country], "US", "CA", "UK")
```

#### `ISBLANK`, `COALESCE`

```text
=ISBLANK([Base Salary])
=COALESCE([Bonus], 0)
```

### 6.4.5 Text helpers

#### Concatenation

```text
="FY '26 Total (n=" & COUNT([Base Salary], where=[mask.Active Employees]) & ")"
```

Optional text helpers:

- `CONCAT(...)`
- `TEXT(value, format)`
- `LEFT`, `RIGHT`, `MID`
- `STRING_LEN(text)`

---

## 6.5 `where=` rules

`where=` is the preferred replacement for many Excel array-formula filtering patterns.

### Allowed

- scalar boolean
- row-grain boolean vector
- explicit mask series

Examples:

```text
=MEDIAN([Base Salary], where=[Country]="US")
=MEDIAN_BY([Base Salary], [idx.Job Family], where=[mask.Active Employees])
```

### Not allowed

- index-grain conditions inside `where=`

Invalid example:

```text
=MEDIAN_BY([Base Salary], [idx.Job Family], where=[Count by Job Family] > 20)
```

That should produce a validation error such as:

> `where=` must evaluate at row grain or scalar grain. Use `FILTER_INDEX(...)` for output/index filtering.

---

## 6.6 Excel compatibility stance

The formula language should feel Excel-like, but v1 should define a smaller canonical syntax.

### Canonical preferred pattern

```text
=MEDIAN_BY([Salary], [idx.Job Family], where=([x]=1)*([y]=2)*([z]=4))
```

### Conceptual bridge to Excel array formulas

This should be documented as equivalent in spirit to:

```text
=MEDIAN(IF((x=1)*(y=2)*(z=4), Salary))
```

with the grouped index adding an implicit grouping condition.

### Recommended implementation stance

- **Canonical syntax**: explicit `where=`
- **Optional parser sugar later**: accept some Excel-like `AGG(IF(cond, values))` forms and rewrite internally

This keeps v1 simpler while still preserving a clear mental bridge for spreadsheet users.

---

## 6.7 Null semantics

Recommended v1 semantics:

- Arithmetic with `NULL` returns `NULL` unless wrapped with `COALESCE`
- Aggregates ignore `NULL` input values
- If an aggregate sees no non-null values, return `NULL`
- `COUNT(series)` counts non-null values
- `COUNT_ROWS()` counts rows after filtering regardless of nulls in any specific field
- In masks and `where=` expressions, only `TRUE` keeps the row; `FALSE` and `NULL` exclude it

---

## 6.8 Recommended naming conventions

These should be defaults, not hard requirements.

- `idx.*` for indexes
- `mask.*` for reusable masks
- `p.*` reserved for future scalar parameters

Examples:

- `idx.Job Family`
- `mask.Active Employees`
- `mask.US Core Population`
- `p.Min Headcount`

---

## 7. Chart contracts

Charts are reusable global objects with typed slots.

## 7.1 Slot compatibility rules

A chart slot should declare:

- accepted value types,
- accepted grain,
- whether multiple bindings are allowed,
- whether all bound series in the layer must align to the same index.

### Bubble chart contract

Required slots:

- `x`: numeric, index-grain or row-grain
- `y`: numeric, same alignment as `x`
- `size`: numeric, same alignment as `x`
- `label`: text/index, same alignment as `x`

Typical compensation-demographics usage:

- `label = [idx.Job Family]`
- `x = [Median Salary by Job Family]`
- `y = [Comp Spend by Job Family]`
- `size = [Count by Job Family]`

### Vertical clustered bar contract

- one category series: text/index
- one or more numeric series aligned to that category index
- optional primary/secondary y-axis assignment

### Vertical stacked bar contract

- one category series
- one or more numeric series aligned to the same category index
- single y-axis in v1

### Horizontal variants

Transpose of the vertical variants.

### Line 1D contract

- one category/index series, optional
- one or more numeric series aligned to that category/index
- optional dual y-axis

### Line 2D / scatter / bubble family

Treat these as multi-slot point layers rather than as simple category + series charts.

### Pie / donut contract

- one category/index series
- one numeric series aligned to the same index
- **No Cartesian axes** in the model: slices are driven by category + value only. Primary/secondary X/Y axis options do not apply.

### Indexed Cartesian secondary axes (scatter, bubble, line 2D)

For chart kinds that use **index-aligned plot layers** with numeric **x** and **y** slots (`scatter`, `bubble`, `line_2d` in the implementation):

- The chart binding may include optional **secondary X** and/or **secondary Y** Cartesian scales (in addition to the default primary X and primary Y).
- Each **plot group** (one bound tuple per layer: `x`, `y`, optional `size`, `label`, …) must be assigned to a **pair of axes**: which horizontal scale (primary vs secondary X) and which vertical scale (primary vs secondary Y) that layer uses. This maps to distinct axis instances at render time (e.g. Recharts `xAxisId` / `yAxisId`).
- If secondary X or Y is disabled, all layers use the primary scale on that dimension; assignments are effectively clamped to primary.
- **Pie** and **donut** do not participate in this mechanism (see above).

Persisted chart asset state stores these flags and per-layer assignments on the **`indexed_layers`** binding shape (`indexedAxes` covenant in TypeScript).

## 7.2 Chart asset vs chart placement

Global chart asset stores:

- type
- data bindings
- default style
- default title / axis settings

Placement stores:

- position and size
- optional local display overrides

This allows one chart asset to appear in multiple slides.

---

## 8. UI and workflow guidance

## 8.1 Global series list

Suggested columns:

- data type icon
- series name
- grain / alignment label
- length
- origin/liveness icon
- role badge
- status badge

Example display rows:

- `Text | idx.Job Family | index | 19 | formula/live | index`
- `Number | Median Salary by Job Family | by idx.Job Family | 19 | formula/live | none`
- `Number | Base Salary | row: Employees CSV | 796 | imported/live | none`
- `Boolean | mask.Active Employees | row: Employees CSV | 796 | formula/live | mask`

The grain/alignment column is more important than length alone.

## 8.2 Create-series wizard

The top-level `+` action should open a three-path wizard:

1. **Create an index from another series**
2. **Write a formula**
3. **Enter data manually**

### Index path

Inputs:

- source series
- blank handling
- order mode (`source`, `alpha asc`, `alpha desc`, `manual`, future `by linked series`)
- preview
- suggested name

### Formula path

Inputs:

- formula editor
- live validation
- dependency preview
- inferred output grain/type/length preview
- suggested name

### Manual path

Inputs:

- small spreadsheet-like editor
- choose alignment (`scalar`, row dataset, existing index)
- preview length and type
- suggested or manual name

### Save-time validation

Before save, validate:

- globally unique name within document
- parse success
- no circular dependency
- legal grain transitions
- legal mask/index invariants
- non-duplicate index values if `role=index`

## 8.3 Formula editor

Recommended editor behavior:

- square-bracket series autocomplete
- inline function docs
- syntax coloring
- dynamic pretty-printing / indentation
- preview pane showing inferred result type and sample output
- errors tied to grain/alignment, not just parser syntax

Especially important error classes:

- unknown series reference
- circular dependency
- row vs index grain mismatch
- invalid `where=` grain
- incompatible chart binding alignment

## 8.4 Chart creation wizard

Recommended flow:

1. choose chart type,
2. show typed slots,
3. drag/drop or select compatible series,
4. rank compatible series higher after key slots are filled,
5. name chart,
6. open chart in WYSIWYG editor.

Important UX detail:

Once the user binds a domain-defining series such as `[idx.Job Family]`, the picker for remaining slots should rank index-aligned candidate series to the top.

That is how the app repays the user for making grouping explicit.

---

## 9. Suggested SQLite persistence model

A practical v1 relational model:

**Slide deck schema:** The minimal `slides` / `slide_elements` rows below are a sketch for early milestones. For themes, slide layouts, rich text, and full element typing, the authoritative model is [`slide-deck-spec.md`](slide-deck-spec.md) (see that document’s **Relationship to this spec**). It extends this section and supersedes the minimal placement shape for deck authoring.

### `documents`
- `id`
- `name`
- `default_theme_id` (optional UUID, FK to `themes`) — single active theme per document when the slide deck layer is enabled; see `slide-deck-spec.md` §4 and §12
- timestamps

### `data_sources`
- `id` (UUID)
- `document_id`
- `display_name` (unique per document)
- `provenance_kind` (`flat_file` | `external_sql`)
- `provenance_json` (flat-file file/sheet metadata, or external connection + query metadata)
- timestamps

### `dataset_imports`
- `id`
- `document_id`
- `data_source_id` (optional UUID, FK to `data_sources` when this import materializes a given data source)
- `display_name`
- `source_fingerprint`
- `schema_json`
- `row_count`
- `raw_table_name`
- timestamps

### `series_assets`
- fields described in section 5.2

### `series_dependencies`
- `child_series_id`
- `parent_series_id`
- `dependency_kind`

### `series_materializations`
- `series_id`
- `revision`
- `values_json`
- `value_hash`
- `computed_at`
- `input_fingerprint`

### `charts`
- fields described in section 5.6

### `chart_bindings`
- `chart_id`
- `slot_name`
- `series_id`
- `axis_group`
- `layer_key`
- `sort_override_json`

### `slides`
- `id`
- `document_id`
- `name`
- `order_index`

Additional slide fields for the full deck (layouts, notes, thumbnails, etc.) are defined in `slide-deck-spec.md` §6 and §12.

### `slide_elements`
- fields described in section 5.6

For slide deck authoring, element types and `spec_json` payloads follow `slide-deck-spec.md` §6–11 (see that spec’s mapping from §5.6’s minimal `text` / `chart` / `shape` model).

### Practical v1 shortcut

If implementation speed matters, `series_materializations` can initially be folded into `series_assets.materialized_values_json`. Keep the schema abstraction in mind even if the first version is simplified.

---

## 10. Evaluation engine requirements

## 10.1 Dependency graph

When a formula series is saved:

1. normalize optional leading `=` (§6.2), then parse formula to AST,
2. resolve series references,
3. persist dependencies,
4. detect cycles,
5. infer output grain/type,
6. materialize value preview,
7. persist or cache values.

## 10.2 Invalidation rules

When an imported dataset is re-uploaded with matching schema/fingerprint identity:

1. update raw rows,
2. mark dependent series as `stale`,
3. lazily or eagerly recompute descendants in topological order,
4. mark dependent charts as `stale` until recomputed/validated.

## 10.3 Materialization strategy

For v1:

- materialize formula results as JSON arrays,
- compute on save and on dependency changes,
- cache previews for fast chart rendering.

Later optimization:

- incremental recompute,
- columnar cache,
- derived query planner that coalesces sibling grouped aggregates into one pass.

Example optimization opportunity:

These three formulas should ideally compile into one grouped aggregation pass over the raw data:

```text
=MEDIAN_BY([Base Salary], [idx.Job Family])
=SUM_BY([Target Total Pay], [idx.Job Family])
=COUNT_BY([idx.Job Family])
```

---

## 11. Milestone 1 recommendation

A good first milestone is the full user story of creating the compensation demographics bubble chart from an imported CSV.

### Milestone 1 scope

Implement:

- CSV import into SQLite
- imported columns surfaced as row-grain series assets
- create index flow
- create formula series flow
- formula parser for:
  - `INDEX`
  - `SUM_BY`
  - `MEDIAN_BY`
  - `COUNT_BY`
  - `COUNT`
  - `LEN`
  - basic arithmetic/comparison
  - string concatenation
  - `where=` with boolean conditions
- bubble chart asset with typed slots
- chart placement in living document
- minimal chart editor for title/axes/size

### Milestone 1 acceptance test

Using a compensation CSV, the user can:

1. import the file,
2. create `[idx.Job Family]`,
3. create `[Median Salary by Job Family]`,
4. create `[Comp Spend by Job Family]`,
5. create `[Count by Job Family]`,
6. bind them into a bubble chart,
7. place the chart on a slide,
8. re-import updated CSV values and see the chart update through lineage.

---

## 12. Deferred features / v2 candidates

These are important but should not block v1.

- chart combo layers and dual-axis mixed chart recipes
- chart-local tooltip/drillthrough design workflow
- `snapshot` / detach UX for editable frozen series
- optional Excel-compatibility parsing for `AGG(IF(cond, values))`
- `COUNT_DISTINCT_BY`
- percentile bands / binning helpers
- manual per-cell formulas (`piecemeal` formulas)
- multi-dataset joins
- role types beyond index/mask
- collaborative editing and cloud sync

---

## 13. Recommended implementation decisions

1. **Persist grain and alignment explicitly.** Do not infer compatibility from length.
2. **Separate origin from liveness in the schema.** That makes future snapshot/detach clean.
3. **Treat mask as an explicit role, not a boolean data type.**
4. **Treat `_BY` functions as the center of the formula language.**
5. **Use `where=` as the canonical filtered aggregation syntax.**
6. **Keep chart assets separate from slide placements.**
7. **Use index creation as a first-class wizard path.**
8. **Prefer clear, explicit formulas over trying to emulate full Excel immediately.**

---

## 14. Concrete examples

**Notation:** Lines below use `SeriesName = expression` as **documentation shorthand** for a set of named series and their saved formulas. In the product, each series is edited separately; each saved formula is a **single expression** (optionally prefixed with `=`). The `=` here is **not** formula syntax—it only ties a catalog name to the expression body in this spec.

### Example A: compensation bubble chart

```text
[idx.Job Family] = INDEX([Job Family], order="alpha_asc", blanks="exclude")
[Median Salary by Job Family] = MEDIAN_BY([Base Salary], [idx.Job Family])
[Comp Spend by Job Family] = SUM_BY([Target Total Pay], [idx.Job Family])
[Count by Job Family] = COUNT_BY([idx.Job Family])
```

Bubble chart bindings:

- label = `[idx.Job Family]`
- x = `[Median Salary by Job Family]`
- y = `[Comp Spend by Job Family]`
- size = `[Count by Job Family]`

### Example B: grouped median with business-rule filter

```text
[mask.Active US Employees] = ([Employment Status]="Active") * ([Country]="US")
[Median Salary by Job Family - Active US] = MEDIAN_BY([Base Salary], [idx.Job Family], where=[mask.Active US Employees])
```

### Example C: chart title with text concatenation

```text
[Bubble Title] = "FY '26 Compensation Demographics (n=" & COUNT_ROWS(where=[mask.Active Employees]) & ")"
```

### Example D: output-level filtering

```text
[idx.Job Family 20+] = FILTER_INDEX([idx.Job Family], keep=[Count by Job Family] >= 20)
[Median Salary by Job Family 20+] = MEDIAN_BY([Base Salary], [idx.Job Family 20+])
```

---

## 15. Open questions with tentative answers

1. Q: Should manual series be allowed to claim `role=index` in v1, or only series created through the index wizard? A: No manually created indices
2. Q: Should `COUNT(series)` count non-null values only, while `COUNT_ROWS()` counts rows, or should there be Excel-style aliases? A: Let Count be non-null count for now, allowing for the construction of SUM() with a mask for arbitrary "countif()" style logic
3. Q: Should boolean coercion from numeric `0/1` be allowed implicitly, or only through explicit comparisons like `= 1`? A: Implement implicity truthiness comparisons on bool operators
4. Q: Should sort-by-linked-series live in formula syntax, UI metadata, or both?  A: The index data series asset stores canonical order itself.  For v1, can use predefined manual or alphabetical order; eventually it would be good to extend formula syntax to allow for ordering logic For v1, store it like {"id": "idx_job_family","name": "idx.Job Family","role": "index","sourceSeriesId": "job_family","canonicalOrder": {"mode":"alphabetical"}}
5. Q: Should chart-local sort override be a pure presentation concern, or allowed to change the effective order of an index-aligned series at render time? A: For v1, entirely a presentation concern.
6. Q: Should the formula engine support date arithmetic in v1, or defer until later? A: not for v1

---

## 16. Summary

The clean mental model for the product is:

- imported fields become row-grain series assets,
- indexes define explicit output domains,
- masks define reusable row filters,
- `_BY` formulas transform row-grain data into index-grain series,
- charts bind compatible series into reusable global chart assets,
- slides place those chart assets into a narrative document.

This keeps the system explicit, reusable, and spreadsheet-friendly without collapsing into cell-level complexity.
