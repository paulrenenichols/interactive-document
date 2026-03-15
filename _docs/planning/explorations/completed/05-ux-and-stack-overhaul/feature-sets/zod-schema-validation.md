# Zod schema validation

## Summary

Zod for runtime validation at every data boundary: API responses, sql.js writes, and form inputs. Schemas serve as the single source of truth for TypeScript types, replacing the inline interfaces currently defined in `apps/frontend/lib/queries.ts`.

See [data-architecture.md](data-architecture.md) for how zod fits within the broader layered architecture.

## Current state

- TypeScript interfaces (`Deck`, `Slide`, `Block`, `DataSource`, `DataRow`) are defined inline in `apps/frontend/lib/queries.ts`.
- No runtime validation of API responses. The frontend trusts that the API returns correctly shaped data.
- No form validation library. Form fields use basic HTML validation or none at all.
- The Fastify API uses its own JSON Schema validation on request bodies, but that doesn't protect the frontend from malformed responses.

## Scope

### Boundary 1: API responses

Validate API responses in TanStack Query `queryFn` before data enters the frontend.

```typescript
import { z } from 'zod';

export const BlockSchema = z.object({
  id: z.string().uuid(),
  slide_id: z.string().uuid(),
  type: z.enum(['text', 'chart']),
  layout: z.string().nullable(),
  content: z.string().nullable(),
  data_source_id: z.string().uuid().nullable(),
  chart_type: z.enum(['bar', 'line', 'pie', 'area']).nullable(),
  column_mapping: z.record(z.string()).nullable(),
  order: z.number().int().nonnegative(),
  // WYSIWYG positioning (new fields)
  x: z.number().nonnegative().optional(),
  y: z.number().nonnegative().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export type Block = z.infer<typeof BlockSchema>;
```

Integration with TanStack Query:

```typescript
const useBlocks = (slideId: string) =>
  useQuery({
    queryKey: queryKeys.blocks(slideId),
    queryFn: async () => {
      const data = await api.get(`/slides/${slideId}/blocks`);
      return z.array(BlockSchema).parse(data);  // throws on invalid data
    },
  });
```

When `parse()` throws, TanStack Query treats it as a query error -- the error boundary catches it, and the user sees a clear error message instead of a cryptic rendering failure.

### Boundary 2: sql.js writes

Validate data rows before INSERT into the local sql.js database. Prevents corrupted cache from unexpected API data shapes.

```typescript
export const DataRowSchema = z.object({
  id: z.string().uuid(),
  data_source_id: z.string().uuid(),
  row_index: z.number().int().nonnegative(),
  row_data: z.record(z.unknown()),
});

export const DataRowArraySchema = z.array(DataRowSchema);

// In the sql.js service
async function upsertRows(sourceId: string, rows: unknown): Promise<void> {
  const validated = DataRowArraySchema.parse(rows);
  // INSERT OR REPLACE into sql.js...
}
```

### Boundary 3: form inputs

Validate user input in the WYSIWYG editor before triggering API mutations.

```typescript
export const BlockPositionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(20),   // minimum block size
  height: z.number().min(20),
});

export const ChartConfigSchema = z.object({
  chart_type: z.enum(['bar', 'line', 'pie', 'area']),
  data_source_id: z.string().uuid(),
  column_mapping: z.object({
    category: z.string().min(1),
    value: z.string().min(1),
    series: z.string().optional(),
  }),
});
```

Compatible with `react-hook-form` via `@hookform/resolvers/zod` if a form library is adopted.

### Schema as single source of truth

Replace the inline TypeScript interfaces in `apps/frontend/lib/queries.ts`:

| Current | Replacement |
|---------|-------------|
| `interface Deck { ... }` | `export const DeckSchema = z.object({ ... })` |
| `interface Slide { ... }` | `export const SlideSchema = z.object({ ... })` |
| `interface Block { ... }` | `export const BlockSchema = z.object({ ... })` |
| `interface DataSource { ... }` | `export const DataSourceSchema = z.object({ ... })` |
| `interface DataRow { ... }` | `export const DataRowSchema = z.object({ ... })` |

Types are derived: `export type Deck = z.infer<typeof DeckSchema>`. The schema and the type can never drift apart.

### Schema location

Schemas live in a dedicated file: `apps/frontend/lib/schemas.ts`. This keeps them separate from the query hooks in `queries.ts` and makes them importable by both the query layer and the sql.js service layer.

## Full schema catalog

| Schema | Used at | Validates |
|--------|---------|-----------|
| `DeckSchema` | API response | Deck CRUD responses |
| `SlideSchema` | API response | Slide CRUD responses |
| `BlockSchema` | API response, form input | Block CRUD responses, block position/size from editor |
| `DataSourceSchema` | API response | Data source metadata |
| `DataRowSchema` | API response, sql.js write | Individual data rows |
| `DataRowArraySchema` | API response, sql.js write | Array of data rows (bulk operations) |
| `BlockPositionSchema` | Form input | Block x/y/width/height from drag/resize |
| `ChartConfigSchema` | Form input | Chart type + column mapping from properties panel |
| `ThemeModeSchema` | Zustand persist | Theme preference (`'light' | 'dark' | 'system'`) |

## Dependencies

- [Data architecture](data-architecture.md) -- defines zod's role as a stateless validation layer at boundaries.
- [sql.js local data cache](sqljs-local-data-cache.md) -- zod validates data before sql.js writes.

## Future: shared schemas

Zod schemas could live in a monorepo `libs/schemas` package shared between the frontend and the Fastify API. The API could generate its Fastify JSON Schema validation from zod schemas using `zod-to-json-schema`. This would create a single source of truth for validation across the entire stack.

Out of scope for this exploration but documented as a natural next step.

## Out of scope

- Server-side zod usage (the Fastify API continues to use its own JSON Schema validation).
- Generating API documentation from zod schemas.
- Zod-based environment variable validation (e.g., `z.env()`).
