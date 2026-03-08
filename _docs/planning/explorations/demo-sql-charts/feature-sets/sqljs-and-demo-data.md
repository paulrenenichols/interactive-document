# sql.js and demo data

## Summary

Integrate **sql.js** into the project and provide a demo SQLite database with schema and seed data that reflect realistic use (e.g. sessions, metrics, or document-like tables), so the rest of the demo (query UI, stats, charts) has a consistent data source.

## Scope

- Add sql.js as a dependency and load it in the demo app (e.g. via npm package or CDN; consider async init for larger builds).
- Create or load a **demo database**: either a pre-built `.sqlite` file or SQL scripts that create tables and insert seed data.
- Schema should support: multiple tables, typical types (integers, text, dates), and queries that are useful for stats and charts (aggregates, time series, categories).
- Document how the demo DB is built and where it lives (e.g. in `demo/sql-charts/public/` or generated at build time).

## Implementation options

- **Pre-built DB file:** Ship a static `.sqlite` (or `.db`) and load it with sql.js; simple but less flexible.
- **SQL init script:** Run a `.sql` file on first load to create schema and insert data; easier to version and tweak without binary DB files.

## Dependencies

- None; this is the foundation the other feature sets (query UI, stats, charts) depend on.
