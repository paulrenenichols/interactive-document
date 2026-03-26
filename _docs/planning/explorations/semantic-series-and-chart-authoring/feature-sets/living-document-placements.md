# Living document placements

Updated with the **docs-driven-dev** skill (v1.2.0).

## Goal

Keep the living document editor lightweight by storing **placements** (layout + local overrides), while the canonical chart logic lives in reusable **global chart assets**.

## Placement model (concept)

A placement stores:

- `slide_id`
- `element_type` (`chart` | `text` | …)
- `chart_id` (for chart placements) or text content
- layout box (`x`, `y`, `width`, `height`)
- local overrides (`overrides_json`)
- z-index

## UX constraints

- Reusing one chart asset in multiple slides should be normal.
- Local overrides should be explicitly limited (title override, legend toggle, etc.) so we don’t “fork” chart assets accidentally.

## References

- Original notes: [semantic-series-and-chart-authoring-notes.md](../supporting-docs/semantic-series-and-chart-authoring-notes.md)

