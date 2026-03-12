# Feature sets

For overview and structure, see [../README.md](../README.md).

## Styling and components

### Tailwind 4 integration

Bring Tailwind CSS v4 into the frontend and Storybook using the CSS-first `@theme` configuration model. See [tailwind-4-integration.md](tailwind-4-integration.md).

### Material Design component library

Custom full-catalog M3 component library built with Tailwind in `apps/frontend/components/material-ui/`. See [material-design-component-library.md](material-design-component-library.md).

### Theming and color system

Dark/light mode with M3 color tokens and dedicated chart color palettes for each mode. See [theming-and-color-system.md](theming-and-color-system.md).

## Data architecture

### Layered data architecture

How TanStack Query, zustand, zod, and sql.js coordinate. The architectural keystone document. See [data-architecture.md](data-architecture.md).

### sql.js local data cache

Read-through cache for chart data using in-browser SQLite with IndexedDB persistence. See [sqljs-local-data-cache.md](sqljs-local-data-cache.md).

### Zustand state management

Ephemeral UI state for the WYSIWYG editor: selection, drag/resize, undo/redo, theme preference. See [zustand-state-management.md](zustand-state-management.md).

### Zod schema validation

Runtime validation at every boundary (API, sql.js, forms). Single source of truth for TypeScript types. See [zod-schema-validation.md](zod-schema-validation.md).

## Editor and UX

### WYSIWYG deck editor

Canvas-based editor with drag-and-drop, resize, multi-select, snap-to-grid, and undo/redo. See [wysiwyg-deck-editor.md](wysiwyg-deck-editor.md).

### Google Slides-inspired UX

UX patterns borrowed from Google Slides: three-panel layout, slide thumbnails, canvas interactions, keyboard shortcuts, presenter view. See [google-slides-ux.md](google-slides-ux.md).
