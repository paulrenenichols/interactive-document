# Feature sets — Demo: SQL + charts

For overview and structure, see [../README.md](../README.md).

## sql.js and demo data

Integrating sql.js into the project; loading or building a demo SQLite database; seed/sample schema and data that reflect realistic use (e.g. sessions, metrics, or document-like tables).

See [sqljs-and-demo-data.md](sqljs-and-demo-data.md).

## Offline caching

Caching data in the in-browser database so that document or chart data can be used offline; when to persist, what to cache, and how the app behaves when offline.

See [offline-caching.md](offline-caching.md).

## SQL query interface

UI for writing and running SQL against the demo database (e.g. text area + run button, results table); safety and ergonomics in a static, client-only app.

See [sql-query-interface.md](sql-query-interface.md).

## Statistics and charts

Displaying statistics derived from the database (counts, aggregates, summaries) and charts (e.g. Recharts or similar) whose data comes from the same database.

See [statistics-and-charts.md](statistics-and-charts.md).

## SQL-driven charts

Advanced chart behaviour: filtering what is shown in a chart, and using a **user-written SQL query** (e.g. in a text box) as the data source for a chart—exploring whether "type SQL → see chart" is viable and how to map query results to chart config (axes, series, tooltips).

See [sql-driven-charts.md](sql-driven-charts.md).
