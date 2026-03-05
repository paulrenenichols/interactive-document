# Progress: 03-post-mvp / 01-polish

Summary of work done on branch `03-post-mvp/01-polish` (from commits).

## Deliverables

- **Frontend:** Additional chart types: line, pie, and area (Recharts), same data/config pattern as bar (data source + column mapping). Chart type selector in editor Properties panel for chart blocks; editor and viewer render the selected type (bar/line/pie/area). Axis labels and legend polish across chart types; tooltips and charts use theme tokens; accessibility (aria-label on charts, role="status" aria-live="polite" on tooltips).
- **Docs:** Phase scope updated with "Future work" noting export (PDF/image) deferred; phase plan updated to skip export this phase and document as future work. READMEs updated (root and frontend) for multiple chart types and chart type selector.
- **Export:** Skipped for this phase; documented as future work (see phase scope and phase plan).

## Key commits

- feat(frontend): line, pie, and area chart types
- feat(frontend): chart axis, labels, and legend polish
- docs: add/update READMEs for project and packages
- chore(03-post-mvp): complete polish phase

## Phase plan

See [_docs/milestones/03-post-mvp/phase-plans/01-polish.md](../../milestones/03-post-mvp/phase-plans/01-polish.md).

## Future work (deferred)

- **Export:** PDF or static image export of deck/slides; "Export" action in editor or viewer. Deferred from this phase.
