# Phase: Slide model + editor (02-mvp)

Scope and goals for creating and editing slides and blocks (text and chart), with chart blocks wired to data source and column mapping. Persists via API; frontend uses mutations and query invalidation.

---

## Scope

- **Backend:** Blocks CRUD (create, update, delete, reorder); block has type (text | chart), layout, and type-specific config (text: content/formatting; chart: data_source_id, chart_type, column_mapping). Slides have ordered blocks; API enforces canEditDeck.
- **Frontend:** Editor layout per ui-rules: slide list (sidebar), canvas (current slide), properties panel. Add/remove/reorder slides and blocks. Select block → properties panel shows text content/formatting or chart data source picker and column mapping. Chart block uses chart pipeline component; config persisted to block. Mutations for slides/blocks; invalidate deck/slides queries on success.

---

## Goals

- User can create a deck, add slides, add text and chart blocks, configure chart data source and mapping, and see changes persisted.
- Selecting a block updates the properties panel; chart blocks render with correct data and tooltip.

---

## Out of scope

- View mode (viewer phase). This phase is edit-only.
