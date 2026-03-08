# SQL-driven charts

## Summary

Explore **advanced chart behaviour**: filtering what is shown in a chart, and using a **user-written SQL query** (e.g. in a text box) as the data source for a chart—i.e. “type SQL → see chart.” We want to see if this is viable and how to map query results to chart config (axes, series, tooltips).

## Scope

- **Filtering:** Ways to restrict or transform the data shown in a chart (e.g. WHERE clause in a predefined query, or a separate “filter” UI that builds a query).
- **Query-as-source:** A text box (or shared SQL query interface) where the user writes a SELECT; the result set is passed to a chart component. Define expectations: column names or positions (e.g. first column = category, second = value), and how the chart library consumes that.
- **Mapping results to chart config:** Document how we go from arbitrary result columns to axes, series, and tooltips; what conventions or heuristics work (e.g. “first two columns = x, y” or “columns named X, Y, series”).
- **Viability:** Capture what works well, what’s fragile (e.g. wrong column types, empty results), and whether “SQL → chart” is a pattern we’d recommend for the main app.

## Implementation options

- Reuse the same SQL query UI: “Run” shows a table; “Chart” (or a toggle) uses the same result set to drive a chart, with a simple convention for column roles.
- Optional: chart type selector (bar, line, pie) so one query can be visualized in different ways.

## Dependencies

- SQL query interface (to run user SQL).
- Statistics and charts (same chart components and data-binding pattern).

## Out of scope

- Full visual query builder or schema introspection UI; this exploration focuses on “text SQL → chart” only.
