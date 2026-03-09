# Phase: Chart pipeline (02-mvp)

Scope and goals for one chart type (e.g. bar) with Recharts and a custom tooltip showing underlying data. Data comes from TanStack Query.

---

## Scope

- **Frontend:** Recharts bar chart (or single chosen type); component accepts data array and config (column mapping: category, value, series). Custom tooltip component that receives payload and displays underlying row/columns (e.g. full row or configured columns). Data supplied from TanStack Query (rows for a data source). Minimal dev/test route (e.g. `/dev/chart`) to select a data source, configure column mapping, and render the chart for testing.
- **Integration:** Chart component can be used wherever we need to show chart data (next: slide editor and viewer). No persistence of chart config to blocks yet if that is covered in slide-editor phase; otherwise stub or minimal block config.

---

## Goals

- A bar chart (or one type) renders from API data; hovering shows a tooltip with source row/column data.
- Chart is reusable and theme-aware (colors from theme tokens as per theme-rules).
- A dev/test page allows exercising the chart with any data source and column config; README documents how to access it.

---

## Out of scope

- Multiple chart types (line, pie, etc.) and slide/block persistence (slide-editor phase). Polish (axis/labels, extra types) is post-MVP.
