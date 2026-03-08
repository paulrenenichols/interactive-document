# SQL query interface

## Summary

Provide a **UI for writing and running SQL** against the demo sql.js database: a text area (or editor), a run button, and a results table (or message area for errors). This gives a direct way to explore the data and feeds into the “SQL-driven charts” idea.

## Scope

- **Input:** Text area (or simple code editor) for entering one or more SQL statements.
- **Execution:** “Run” (or “Execute”) button that runs the query against the demo DB and returns result rows (or error message).
- **Output:** Table view of result set (columns and rows); clear display of errors (syntax, runtime) without exposing stack traces unnecessarily.
- **Safety and ergonomics:** In a static, client-only app the DB is local and not shared; document any constraints (e.g. read-only vs allow writes) and UX considerations (timeouts, large result sets).

## Implementation options

- Single-statement execution for simplicity; optionally support multiple statements or “run selected” if the editor supports selection.
- Pagination or row limit for large result sets to keep the UI responsive.

## Out of scope

- Multi-user or server-side query execution; this is strictly client-side against the local sql.js DB.
