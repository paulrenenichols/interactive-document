import { z } from 'zod';

const uuid = z.string().uuid();
const nonNegativeInt = z.number().int().nonnegative();

/** Coerce JSON/JSONB from API: accept object or string (parse string so layout survives serialization). */
const jsonbLike = z.union([
  z.record(z.unknown()).nullable(),
  z.string().transform((s) => {
    try {
      const v = JSON.parse(s);
      return typeof v === 'object' && v !== null ? v : null;
    } catch {
      return null;
    }
  }),
]);

/** API / CRUD response shapes */
export const DeckSchema = z.object({
  id: uuid,
  owner_id: uuid,
  visibility: z.string(),
  share_token: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Deck = z.infer<typeof DeckSchema>;

export const SlideSchema = z.object({
  id: uuid,
  deck_id: uuid,
  order: nonNegativeInt,
});
export type Slide = z.infer<typeof SlideSchema>;

export const BlockSchema = z.object({
  id: uuid,
  slide_id: uuid,
  type: z.enum(['text', 'chart']),
  layout: jsonbLike.default(null),
  content: z.string().nullable().optional(),
  data_source_id: uuid.nullable().optional(),
  chart_type: z.enum(['bar', 'line', 'pie', 'area']).nullable().optional(),
  column_mapping: jsonbLike.optional(),
  order: nonNegativeInt,
});
export type Block = z.infer<typeof BlockSchema>;

export const DataSourceSchema = z.object({
  id: uuid,
  owner_id: uuid,
  deck_id: uuid.optional(),
  name: z.string(),
  created_at: z.string(),
});
export type DataSource = z.infer<typeof DataSourceSchema>;

/** Data row from API (rows endpoint returns id, row_index, row_data) */
export const DataRowSchema = z.object({
  id: uuid,
  row_index: nonNegativeInt,
  row_data: z.record(z.unknown()),
});
export type DataRow = z.infer<typeof DataRowSchema>;

/** For sql.js writes we include data_source_id (added at sync time) */
export const DataRowWithSourceSchema = DataRowSchema.extend({
  data_source_id: uuid,
});
export type DataRowWithSource = z.infer<typeof DataRowWithSourceSchema>;

export const DataRowArraySchema = z.array(DataRowSchema);
export const DataRowWithSourceArraySchema = z.array(DataRowWithSourceSchema);

/** Wrapper responses */
export const DecksResponseSchema = z.object({ decks: z.array(DeckSchema) });
export const SlidesResponseSchema = z.object({ slides: z.array(SlideSchema) });
export const BlocksResponseSchema = z.object({ blocks: z.array(BlockSchema) });
export const DataSourcesResponseSchema = z.object({
  dataSources: z.array(DataSourceSchema),
});
export const DataSourceRowsResponseSchema = z.object({
  rows: DataRowArraySchema,
  total: nonNegativeInt,
});

/** Form / editor boundaries */
export const BlockPositionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(20),
  height: z.number().min(20),
});
export type BlockPosition = z.infer<typeof BlockPositionSchema>;

export const ChartConfigSchema = z.object({
  chart_type: z.enum(['bar', 'line', 'pie', 'area']),
  data_source_id: uuid,
  column_mapping: z.object({
    category: z.string().min(1),
    value: z.string().min(1),
    series: z.string().optional(),
  }),
});
export type ChartConfig = z.infer<typeof ChartConfigSchema>;

export const ThemeModeSchema = z.enum(['light', 'dark', 'system']);
export type ThemeMode = z.infer<typeof ThemeModeSchema>;
