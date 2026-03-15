# WYSIWYG deck editor

## Summary

Replace the current vertical-list block editor with a full WYSIWYG canvas where blocks can be dragged, dropped, resized, and edited in place. This feature set is the primary consumer of the data architecture layers (zustand for editor state, sql.js for chart data, zod for validation, TanStack Query for API sync).

## Current state

- The editor lives in a single 664-line component at `apps/frontend/app/edit/[deckId]/page.tsx`.
- Three-panel layout: left sidebar (slide list), center area (block list), right panel (block properties).
- Blocks render as a vertical stack ordered by an `order` field.
- Repositioning is done via "move up" / "move down" buttons -- no drag-and-drop.
- No resize capability. Blocks take the full width of the center area.
- No canvas concept. Blocks are not positioned freely -- they are stacked vertically.
- Text editing is done in a textarea in the properties panel, not inline on the canvas.
- No undo/redo.
- No multi-select.
- No keyboard shortcuts for editing operations.

## Scope

### Canvas model

- Each slide is a fixed-ratio canvas. Default aspect ratio: 16:9.
- The canvas has a defined coordinate space (e.g., 960x540 logical units) that scales to the viewport.
- Blocks have absolute position (`x`, `y`) and size (`width`, `height`) within the canvas coordinate space.
- The canvas renders at the actual viewport size with CSS transforms to maintain the coordinate space mapping.
- Zoom controls allow the user to zoom in/out of the canvas (0.25x to 2.0x). Zoom state lives in `useEditorStore` (zustand).

### Block positioning and layout

- Blocks are positioned absolutely within the canvas using CSS `position: absolute` with `left`, `top`, `width`, `height` derived from the block's coordinate data.
- New blocks are inserted at a default position (e.g., centered on the canvas) with a default size appropriate to their type.
- Blocks can overlap. Z-ordering is determined by a `z_index` or `order` field.

### Drag and drop

- **Library:** `@dnd-kit/core` for drag-and-drop within the canvas.
- **Block dragging:** Click and drag a block to reposition it. During drag, the block follows the cursor with a visual indicator (shadow, opacity change).
- **Slide reordering:** Slide thumbnails in the left sidebar support drag-to-reorder via `@dnd-kit/sortable`.
- **Drop zones:** The canvas is the drop zone for block repositioning. The sidebar is the drop zone for slide reordering.
- **Drag state:** Managed by `useEditorStore` (zustand). Includes: block being dragged, drag start position, current drag position.

### Resize

- Selected blocks show resize handles at corners and edge midpoints (8 handles total).
- Dragging a handle resizes the block. Corner handles resize in both dimensions; edge handles resize in one dimension.
- Optional aspect ratio lock for chart blocks (toggled via properties panel or by holding Shift).
- Minimum block size enforced (e.g., 20x20 logical units) to prevent blocks from becoming invisible.
- Resize state managed by `useEditorStore` (zustand).
- **Library options:** Custom resize handle implementation, `re-resizable`, or `react-rnd` (combines drag + resize in one library).

### Selection

- **Single select:** Click a block to select it. The selected block shows resize handles and a blue border.
- **Multi-select:** Shift+click to add/remove blocks from selection. All selected blocks show selection indicators.
- **Rubber-band select:** Click and drag on empty canvas area to draw a selection rectangle. All blocks within the rectangle are selected.
- **Deselect:** Click on empty canvas area (without dragging) to deselect all.
- **Selection state:** `selectedBlockIds: string[]` in `useEditorStore` (zustand). Components subscribe to this via selectors.

### Snap and guides

- **Snap-to-grid:** Optional grid overlay on the canvas. Blocks snap to grid intersections during drag/resize. Grid spacing configurable (e.g., 10px, 20px).
- **Smart guides:** When dragging a block near another block's edge or the canvas center, show alignment lines (horizontal/vertical). Snap to these lines within a configurable threshold (e.g., 5px).
- **Guide types:** Center alignment (block center to canvas center), edge alignment (block edge to other block edge), distribution (equal spacing between blocks).

### Block types

| Type | Behavior on canvas | Edit mode |
|------|-------------------|-----------|
| Text | Renders text content at specified position/size. | Double-click to enter inline edit mode. Text is editable directly on the canvas. Escape or click outside to exit edit mode. |
| Chart | Renders the chart (bar, line, pie, area) at specified position/size. Data read from sql.js. | Single-click selects. Properties panel shows chart configuration (type, data source, column mapping). |
| Image | (Future) Renders an image at specified position/size. | Properties panel shows image source, fit mode. |
| Shape | (Future) Renders a shape (rectangle, circle, line, arrow). | Properties panel shows fill, stroke, corner radius. |

### Toolbar

- **Insert toolbar:** Positioned above the canvas or as a floating bar. Buttons for: Insert Text Block, Insert Chart Block. Clicking a button creates a new block at a default position.
- **Formatting toolbar:** Appears when a text block is in edit mode. Options TBD but could include: bold, italic, font size, text alignment, text color.
- **Canvas toolbar:** Zoom in/out, zoom to fit, toggle grid, toggle guides.

### Data model changes

The `Block` model gains spatial positioning fields:

| Field | Type | Current | New |
|-------|------|---------|-----|
| `x` | number | Does not exist | Position from left edge of canvas |
| `y` | number | Does not exist | Position from top edge of canvas |
| `width` | number | Does not exist | Block width in canvas units |
| `height` | number | Does not exist | Block height in canvas units |
| `z_index` | number | Does not exist | Stacking order (higher = on top) |
| `order` | number | Vertical stacking order | Deprecated or repurposed for accessibility/tab order |

These fields are validated by the zod `BlockSchema` (see [zod-schema-validation.md](zod-schema-validation.md)).

**Migration:** Existing blocks (which have `order` but no `x`/`y`/`width`/`height`) need a migration strategy. Options:
- Assign default positions based on `order` (e.g., stack vertically with fixed spacing).
- Add the new fields as nullable with fallback to order-based layout if missing.

### Chart blocks and sql.js

Chart blocks read data from the local sql.js database rather than from TanStack Query cache. The flow:

1. Chart block knows its `data_source_id` and `column_mapping`.
2. TanStack Query ensures the data source is synced to sql.js (see [data-architecture.md](data-architecture.md)).
3. Chart component queries sql.js directly: `SELECT ... FROM data_rows WHERE source_id = ?`.
4. Chart renders with the query result. Instant, offline-capable.

### Undo/redo

All undoable operations are tracked in `useHistoryStore` (zustand):

| Action | Undo behavior | Redo behavior |
|--------|--------------|---------------|
| Move block | Restore previous position | Reapply new position |
| Resize block | Restore previous dimensions | Reapply new dimensions |
| Edit text content | Restore previous content | Reapply new content |
| Delete block | Restore block (from snapshot) | Re-delete |
| Add block | Delete the added block | Re-add |
| Reorder slides | Restore previous order | Reapply new order |

Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z or Ctrl+Y (redo).

History stack has a configurable maximum depth (e.g., 50 actions) to bound memory usage.

### Component decomposition

The 664-line monolith editor needs to be decomposed into focused components:

```
EditorPage
├── SlidePanel (left sidebar)
│   ├── SlideThumbnail (per slide, drag-sortable)
│   └── AddSlideButton
├── CanvasArea (center)
│   ├── Canvas (scaled coordinate space)
│   │   ├── BlockRenderer (per block)
│   │   │   ├── TextBlock
│   │   │   ├── ChartBlock
│   │   │   └── SelectionHandles (resize handles)
│   │   ├── SnapGuides
│   │   └── RubberBandSelector
│   └── CanvasToolbar (zoom, grid, guides)
├── PropertiesPanel (right sidebar)
│   ├── TextProperties
│   ├── ChartProperties
│   └── PositionProperties (x, y, width, height)
└── InsertToolbar (top)
```

Each component subscribes to only the zustand state it needs via selectors.

## Libraries to evaluate

| Library | Purpose | Pros | Cons |
|---------|---------|------|------|
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag and drop | Modular, accessible, well-maintained, React-first | Resize not included -- need separate solution |
| `react-rnd` | Drag + resize combined | Single library for both concerns | Less modular, may conflict with dnd-kit |
| `re-resizable` | Resize only | Lightweight, focused | Need separate drag solution |
| Custom implementation | Both | Full control, no dependencies | Higher development effort, accessibility concerns |

Recommended: `@dnd-kit/core` for drag-and-drop (covers both block positioning and slide reordering) with custom resize handles. This gives the most control and avoids library conflicts.

## Dependencies

- [Data architecture](data-architecture.md) -- defines how chart data flows through the layers.
- [Zustand state management](zustand-state-management.md) -- `useEditorStore` and `useHistoryStore` power the editor.
- [Zod schema validation](zod-schema-validation.md) -- `BlockSchema` validates block position/size.
- [sql.js local data cache](sqljs-local-data-cache.md) -- chart blocks read data from sql.js.
- [Material Design component library](material-design-component-library.md) -- editor chrome uses M3 components.

## Out of scope

- Rich text editing (bold, italic, etc.) -- may be explored as a follow-up. Initial implementation uses plain text blocks.
- Animations and transitions between slides.
- Collaborative real-time editing.
- Block grouping (select multiple blocks and move/resize as a unit).
- Master slides / layout templates.
