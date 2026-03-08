# Statistics and charts

## Summary

Display **statistics** derived from the demo database (counts, aggregates, summaries) and **charts** (e.g. bar, line, or pie) whose data comes from the same sql.js database. This mirrors the "stats + charts" experience planned for rep-counter but with the DB in the browser.

## Scope

- **Statistics:** One or more summary views (e.g. total rows, counts by category, min/max/avg of a numeric column) driven by SQL queries or fixed queries against the demo DB.
- **Charts:** At least one chart type (e.g. Recharts bar or line) bound to query results; data fetched from sql.js and passed to the chart component.
- **Data flow:** Define how the app runs a query (fixed or configurable) and maps the result rows to the chart's expected shape (e.g. `{ name, value }` for a simple bar chart).
- Document the pattern so it can be reused for "SQL-driven charts" (user-written query → chart).

## Implementation options

- Use **Recharts** (or another lightweight chart lib) for consistency with rep-counter; alternatively a smaller chart library if bundle size is a concern for a static demo.
- Stats can be separate components that run predefined queries on load or on a refresh action.

## Dependencies

- sql.js and demo data (database and seed data must exist).
- Optional: SQL query interface pattern (same execution path, different source of SQL).
