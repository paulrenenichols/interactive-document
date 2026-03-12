# UX and stack overhaul

Created with the **docs-driven-dev** skill (v1.2.0).

A comprehensive exploration of modernizing the frontend stack and editor UX. Covers styling infrastructure (Tailwind 4, custom Material Design component library, dark/light theming), a layered data architecture (TanStack Query + zustand + zod + sql.js), and a WYSIWYG deck editor inspired by Google Slides.

Use [exploration-lifecycle.md](../../setup/exploration-lifecycle.md) to evaluate this exploration or turn it into a milestone.

## Structure

Feature sets are in `feature-sets/` (see [feature-sets/README.md](feature-sets/README.md)). Supporting materials (screenshots, extra docs) are in [supporting-docs/](supporting-docs/) with a short index in [supporting-docs/README.md](supporting-docs/README.md).

---

## Tailwind 4 integration

Bring Tailwind CSS v4 into the frontend app and Storybook using the new CSS-first configuration model (`@theme` directives). Incrementally migrate inline `style={{}}` props to utility classes.

See [tailwind-4-integration.md](feature-sets/tailwind-4-integration.md) for details.

## Material Design component library

Build a custom, full-catalog component library in `apps/frontend/components/material-ui/` using Tailwind, following Material Design 3 (M3) principles. Covers core inputs, navigation, containment, layout, data display, and feedback components with M3 design tokens (elevation, shape, typography, motion).

See [material-design-component-library.md](feature-sets/material-design-component-library.md) for details.

## Theming and color system

Dark mode and light mode with M3 color tokens, plus dedicated 8-color chart palettes optimized for each mode. Theme preference persisted via zustand.

See [theming-and-color-system.md](feature-sets/theming-and-color-system.md) for details.

## Data architecture

The architectural keystone: how TanStack Query, zustand, zod, and sql.js coordinate without overlap. Defines layer responsibilities, data flows for chart data and deck CRUD, the sync pattern between API and local cache, and why each library earns its place.

See [data-architecture.md](feature-sets/data-architecture.md) for details.

## sql.js local data cache

Use sql.js as the local data layer for chart data. Read-through caching strategy with IndexedDB persistence, offline capability, and local SQL aggregations. Builds on prior research in the [demo-sql-charts](../demo-sql-charts/README.md) exploration.

See [sqljs-local-data-cache.md](feature-sets/sqljs-local-data-cache.md) for details.

## Zustand state management

Zustand for ephemeral/reactive UI state scoped to concerns that TanStack Query, sql.js, and React local state cannot efficiently handle: editor selection, drag/resize, undo/redo, and theme preference.

See [zustand-state-management.md](feature-sets/zustand-state-management.md) for details.

## Zod schema validation

Zod for runtime validation at every data boundary: API responses, sql.js writes, and form inputs. Schemas serve as the single source of truth for TypeScript types.

See [zod-schema-validation.md](feature-sets/zod-schema-validation.md) for details.

## WYSIWYG deck editor

Replace the vertical-list block editor with a full WYSIWYG canvas. Drag-and-drop positioning, resize handles, multi-select, snap-to-grid, smart guides, and undo/redo. The primary consumer of the data architecture layers.

See [wysiwyg-deck-editor.md](feature-sets/wysiwyg-deck-editor.md) for details.

## Google Slides-inspired UX

Adopt UX patterns from Google Slides where they make sense: three-panel layout, slide thumbnails with drag reorder, canvas interactions, keyboard shortcuts, and presenter view. Documents what to match and what to intentionally skip.

See [google-slides-ux.md](feature-sets/google-slides-ux.md) for details.
