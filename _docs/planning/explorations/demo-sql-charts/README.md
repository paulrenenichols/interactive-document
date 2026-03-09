# Demo: SQL + charts

Updated with the **docs-driven-dev** skill (v1.0.0). (Previously: scaffold-exploration v1.1.0.)

A static demo app (lives in `demo/sql-charts/`) that proves out **sql.js** in the browser, **caching data in a local SQLite DB** for offline-capable documents, and **charts driven by database data**—including the idea of **driving charts from user-written SQL** (e.g. type a query in a text box and render the result set as a chart). The demo is intentionally similar in spirit to the rep-counter / interactive-presentation plan (stats, charts, queryable data) but with no backend: everything runs in the browser against an in-memory or persisted sql.js database.

Use [exploration-lifecycle.md](../../setup/exploration-lifecycle.md) to evaluate this exploration or turn it into a milestone.

Feature sets are in `feature-sets/` (see [feature-sets/README.md](feature-sets/README.md)). Supporting materials (screenshots, extra docs) are in [supporting-docs/](supporting-docs/) with a short index in [supporting-docs/README.md](supporting-docs/README.md).

---

## sql.js and demo data

Integrating sql.js into the project; loading or building a demo SQLite database; seed/sample schema and data that reflect realistic use (e.g. sessions, metrics, or document-like tables).

See [sqljs-and-demo-data.md](feature-sets/sqljs-and-demo-data.md) for details.

## Offline caching

Caching data in the in-browser database so that document or chart data can be used offline; when to persist, what to cache, and how the app behaves when offline.

See [offline-caching.md](feature-sets/offline-caching.md) for details.

## SQL query interface

UI for writing and running SQL against the demo database (e.g. text area + run button, results table); safety and ergonomics in a static, client-only app.

See [sql-query-interface.md](feature-sets/sql-query-interface.md) for details.

## Statistics and charts

Displaying statistics derived from the database (counts, aggregates, summaries) and charts (e.g. Recharts or similar) whose data comes from the same database.

See [statistics-and-charts.md](feature-sets/statistics-and-charts.md) for details.

## SQL-driven charts

Advanced chart behaviour: filtering what is shown in a chart, and using a **user-written SQL query** (e.g. in a text box) as the data source for a chart—exploring whether "type SQL → see chart" is viable and how to map query results to chart config (axes, series, tooltips).

See [sql-driven-charts.md](feature-sets/sql-driven-charts.md) for details.
