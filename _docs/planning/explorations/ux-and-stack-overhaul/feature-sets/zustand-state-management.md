# Zustand state management

## Summary

Zustand for ephemeral/reactive client-side UI state. Scoped to concerns that TanStack Query, sql.js, and React local state cannot efficiently handle: editor selection, drag/resize state, undo/redo, and theme preference.

See [data-architecture.md](data-architecture.md) for how zustand fits within the broader layered architecture.

## Current state

- All local UI state is managed via React `useState` within individual components.
- The editor (`apps/frontend/app/edit/[deckId]/page.tsx`) manages selected slide, selected block, and all editing state in a single 664-line component. State cannot be shared with child components without prop drilling.
- Theme preference is not stored anywhere -- light mode is hardcoded.
- No undo/redo capability exists.

## Why zustand over useState/context

The WYSIWYG editor requires shared state across deeply nested components:

- **Canvas** needs to know which block is selected (to render selection handles).
- **Toolbar** needs to know which block is selected (to enable/disable formatting options).
- **Sidebar** needs to know which slide is selected (to highlight the thumbnail).
- **Properties panel** needs to know which block is selected (to show its properties).

With React `useState`, this state lives in a common ancestor and is passed down via props. With React context, all consumers re-render when any part of the context changes.

Zustand solves both problems:
- State is global (no prop drilling).
- Components subscribe to specific slices via selectors. A change to `selectedBlockId` re-renders only the components that read `selectedBlockId`, not components that only read `zoomLevel`.

## Store architecture

Separate stores for separate concerns. Each store is independent and can be tested in isolation.

### `useEditorStore`

Manages the WYSIWYG editor's interactive state.

```typescript
interface EditorState {
  selectedSlideId: string | null;
  selectedBlockIds: string[];          // supports multi-select
  dragState: DragState | null;         // block being dragged, current position
  resizeState: ResizeState | null;     // block being resized, handle, dimensions
  zoomLevel: number;                   // 0.25 to 2.0
  canvasScrollPosition: { x: number; y: number };
  isPanelOpen: { properties: boolean; slides: boolean };

  // Actions
  selectSlide: (id: string) => void;
  selectBlock: (id: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  startDrag: (blockId: string, startPosition: Position) => void;
  updateDrag: (currentPosition: Position) => void;
  endDrag: () => void;
  setZoom: (level: number) => void;
  togglePanel: (panel: 'properties' | 'slides') => void;
}
```

### `useThemeStore`

Manages dark/light mode preference. Uses `persist` middleware to survive page refresh.

```typescript
interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  resolvedMode: 'light' | 'dark';     // computed from mode + system preference

  // Actions
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}
```

### `useHistoryStore`

Manages undo/redo for editor operations.

```typescript
interface HistoryState {
  past: EditorAction[];
  future: EditorAction[];
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  push: (action: EditorAction) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

type EditorAction =
  | { type: 'move-block'; blockId: string; from: Position; to: Position }
  | { type: 'resize-block'; blockId: string; from: Dimensions; to: Dimensions }
  | { type: 'edit-content'; blockId: string; from: string; to: string }
  | { type: 'delete-block'; blockId: string; snapshot: Block }
  | { type: 'add-block'; blockId: string }
  | { type: 'reorder-slides'; from: number[]; to: number[] };
```

## Middleware

| Middleware | Store | Purpose |
|-----------|-------|---------|
| `persist` | `useThemeStore` | Save mode preference to localStorage |
| `immer` | `useEditorStore` | Immutable updates to nested state (e.g., updating drag position within multi-select) |
| `devtools` | All stores | Inspect state in React DevTools during development |
| `temporal` | `useHistoryStore` | Alternative to custom undo/redo -- zustand-temporal provides this out of the box. Evaluate custom vs. middleware during implementation. |

## Boundaries

### Zustand does NOT store:

- **Server data** (decks, slides, blocks, data sources) -- that's TanStack Query.
- **Chart data rows** -- that's sql.js.
- **Form field values** -- that's React local state or a form library.
- **Route state** -- that's Next.js router.

### Zustand DOES store:

- What's selected, what's being dragged, what's visible.
- Theme preference (persisted).
- Undo/redo history (ephemeral -- cleared on page navigation).

## Dependencies

- [Data architecture](data-architecture.md) -- defines zustand's role in the layered architecture.
- [WYSIWYG deck editor](wysiwyg-deck-editor.md) -- the primary consumer of `useEditorStore` and `useHistoryStore`.
- [Theming and color system](theming-and-color-system.md) -- `useThemeStore` drives the dark/light mode toggle.

## Out of scope

- Server state caching (use TanStack Query).
- Global error/notification state (could be added later as `useNotificationStore`).
- Collaborative editing state (out of scope for the entire exploration).
