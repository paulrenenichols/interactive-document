# Google Slides-inspired UX

## Summary

Adopt UX patterns from Google Slides where they make sense for this project. The goal is not feature parity with Google Slides -- it's to borrow well-established interaction patterns that users already understand, while keeping the product focused on its core use case (interactive data-driven documents).

## Current state

- Three-panel layout exists: left sidebar (slide list), center (block list), right (properties panel).
- Slide list shows plain text entries, not visual thumbnails.
- No canvas -- blocks are rendered as a vertical list.
- No presenter view beyond the basic `/view/[deckId]` page.
- No keyboard shortcuts for editing operations.
- No context menus.

## Patterns to adopt

### Three-panel layout

Mirrors the current layout structure but with WYSIWYG canvas replacing the block list:

| Panel | Google Slides | This project |
|-------|--------------|-------------|
| Left | Slide thumbnails (sortable) | Slide thumbnails with mini-preview (sortable via drag) |
| Center | Editable slide canvas | WYSIWYG canvas with block drag/resize |
| Right | Format options panel | Contextual properties panel (block type, position, chart config) |

The properties panel should be collapsible to give more canvas space. Panel state (open/closed) lives in `useEditorStore` (zustand).

### Slide thumbnails

- Show a scaled-down rendering of the actual slide content (not just a text label).
- The currently selected slide has a highlighted border.
- Drag to reorder slides. Visual feedback during drag (insertion line between slides).
- Right-click context menu with actions:
  - Duplicate slide
  - Delete slide
  - Skip slide (exclude from presentation but keep in deck)
- Slide count and current position indicator (e.g., "3 / 12").

### Canvas interactions

| Interaction | Behavior |
|-------------|----------|
| Click block | Select block. Show resize handles. Show properties in right panel. |
| Click empty canvas | Deselect all blocks. Properties panel shows slide-level properties. |
| Double-click text block | Enter inline text edit mode. Cursor appears in text. |
| Escape (while editing text) | Exit text edit mode. Block remains selected. |
| Escape (while block selected) | Deselect block. |
| Right-click block | Context menu: Cut, Copy, Paste, Duplicate, Delete, Bring to Front, Send to Back. |
| Right-click empty canvas | Context menu: Paste, Insert Text, Insert Chart. |
| Scroll wheel | Scroll canvas vertically (or zoom if Ctrl/Cmd held). |
| Pinch (trackpad) | Zoom canvas. |

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Delete / Backspace | Delete selected block(s) |
| Ctrl+Z / Cmd+Z | Undo |
| Ctrl+Shift+Z / Cmd+Shift+Z | Redo |
| Ctrl+Y / Cmd+Y | Redo (alternative) |
| Ctrl+D / Cmd+D | Duplicate selected block(s) |
| Ctrl+C / Cmd+C | Copy selected block(s) |
| Ctrl+V / Cmd+V | Paste |
| Ctrl+X / Cmd+X | Cut selected block(s) |
| Ctrl+A / Cmd+A | Select all blocks on current slide |
| Arrow keys | Nudge selected block(s) by 1 unit |
| Shift+Arrow keys | Nudge selected block(s) by 10 units |
| Tab | Cycle selection to next block |
| Ctrl+= / Cmd+= | Zoom in |
| Ctrl+- / Cmd+- | Zoom out |
| Ctrl+0 / Cmd+0 | Zoom to fit |

### Insert menu

A toolbar or dropdown menu for inserting new blocks:

| Action | Result |
|--------|--------|
| Insert Text Box | Creates a text block at a default position/size. Enters edit mode immediately. |
| Insert Chart | Creates a chart block at a default position/size. Properties panel opens with chart configuration. |
| Insert Image | (Future) Opens file picker, creates image block. |
| Insert Shape | (Future) Submenu with shape options. |

The insert menu pattern is more discoverable than requiring users to know keyboard shortcuts or find hidden UI elements.

### Presenter view

The existing `/view/[deckId]` page serves as the foundation. Enhancements inspired by Google Slides:

| Feature | Notes |
|---------|-------|
| Full-screen mode | Use the Fullscreen API. Escape to exit. |
| Slide navigation | Arrow keys, click to advance. |
| Slide counter | "Slide 3 of 12" overlay. |
| Progress bar | Thin bar at the bottom showing presentation progress. |
| Zoom to fit | Slides scale to fill the viewport regardless of screen size. |

### Zoom controls

- Zoom level displayed as a percentage (e.g., "100%").
- Zoom in/out buttons in the canvas toolbar.
- Dropdown with preset zoom levels: 25%, 50%, 75%, 100%, 125%, 150%, 200%, Fit.
- Zoom state lives in `useEditorStore` (zustand).
- Canvas content scales via CSS `transform: scale()` applied to the canvas container.

## Patterns to intentionally skip

These Google Slides features are explicitly out of scope for this project:

| Feature | Reason for skipping |
|---------|-------------------|
| Collaborative editing | Requires WebSocket infrastructure, conflict resolution, presence indicators. Massive scope. |
| Comments and suggestions | Requires a comment data model, threading, notifications. |
| Master slides / layouts | Requires a template system with inheritance. Adds significant data model complexity. |
| Animations and transitions editor | Requires a timeline UI, animation preview, per-element animation config. |
| Speaker notes | Requires a notes data model and a presenter view with dual-screen support. |
| Version history | Requires versioning infrastructure (snapshots, diffs, restore). |
| Theme gallery | Requires a curated set of themes. The custom theming system covers the need. |
| Import/export (PPT, PDF) | Requires file format parsing/generation. Could be a future exploration. |
| Rulers and guides (persistent) | Smart guides during drag cover the need. Persistent ruler UI is low value. |
| Tables | Complex component. Could be added as a block type in a future iteration. |

## Patterns to adapt (not copy)

| Google Slides pattern | Adaptation for this project |
|----------------------|---------------------------|
| Format menu with many options | Simplified properties panel focused on the block types we support (text, chart). |
| Shape library with dozens of shapes | Start with basic shapes only (rectangle, circle) if implemented at all. |
| Slide sorter view | The left panel thumbnails serve this purpose. No need for a separate view. |
| Explore/AI suggestions | Not applicable. |
| Linked slides/objects | Not applicable for the current data model. |

## Dependencies

- [WYSIWYG deck editor](wysiwyg-deck-editor.md) -- implements the canvas, drag/drop, resize that this UX depends on.
- [Zustand state management](zustand-state-management.md) -- `useEditorStore` manages zoom, panel visibility, selection.
- [Material Design component library](material-design-component-library.md) -- menus, tooltips, buttons for the editor chrome.

## Out of scope

- Everything listed in "Patterns to intentionally skip" above.
- Mobile/touch-optimized editing (the editor targets desktop browsers).
- Accessibility audit of the full editor workflow (important but a separate effort).
