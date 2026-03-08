# Overview

## Summary

This exploration defines a **static demo app** that validates sql.js integration, offline data caching, and SQL-driven charts before those ideas are adopted in the main interactive-document or rep-counter-style apps. The demo lives in `demo/sql-charts/` so the repo can host other demos under `demo/` later.

## Scope

- **Purpose:** Proof of concept for (1) adding sql.js to the project, (2) caching data in a local SQLite DB so documents can work offline, (3) charts driven by database data, and (4) charts driven by user-written SQL.
- **Relationship to rep-counter:** The rep-counter / interactive-presentation plan uses a backend (Fastify, Postgres), CSV uploads, and Recharts. This demo mirrors the "stats + charts + queryable data" idea in a static, client-only way with sql.js.
- **Artifact location:** Implemented app lives at `demo/sql-charts/` (static site; no server required).
- **Outcomes:** Document what works, what doesn't, and how SQL-driven charts could map to future milestones.

## Out of scope

- Production deployment or auth; this is a local/demo-only artifact.
- Full feature parity with rep-counter; the demo is intentionally minimal to explore specific technical questions.
