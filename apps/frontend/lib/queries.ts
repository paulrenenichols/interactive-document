import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { fetchWithAuth, uploadWithAuth, getJsonNoRedirect } from './api';
import {
  DeckSchema,
  DataSourceSchema,
  DecksResponseSchema,
  SlidesResponseSchema,
  BlocksResponseSchema,
  DataSourcesResponseSchema,
  DataSourceRowsResponseSchema,
  type Deck,
  type Slide,
  type Block,
  type DataSource,
  type DataRow,
} from './schemas';
import { initDb, upsertRows, queryRows, getRowCount } from './local-db';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetchWithAuth(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetchWithAuth(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetchWithAuth(path, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
}

export const queryKeys = {
  decks: ['decks'] as const,
  deck: (id: string) => ['decks', id] as const,
  slides: (deckId: string) => ['decks', deckId, 'slides'] as const,
  slide: (deckId: string, slideId: string) =>
    ['decks', deckId, 'slides', slideId] as const,
  blocks: (deckId: string, slideId: string) =>
    ['decks', deckId, 'slides', slideId, 'blocks'] as const,
  block: (deckId: string, slideId: string, blockId: string) =>
    ['decks', deckId, 'slides', slideId, 'blocks', blockId] as const,
  dataSources: (deckId?: string) =>
    deckId ? ['dataSources', deckId] : ['dataSources'] as const,
  dataSource: (id: string) => ['dataSources', id] as const,
  dataSourceRows: (id: string, limit?: number, offset?: number) =>
    ['dataSources', id, 'rows', limit, offset] as const,
  /** Sync coordinator for chart data: API → Zod → sql.js → IndexedDB */
  dataSourceSync: (id: string) => ['dataSource', id, 'sync'] as const,
};

export type { Deck, Slide, Block, DataSource, DataRow };

export function useDecks(options?: Omit<UseQueryOptions<{ decks: Deck[] }>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.decks,
    queryFn: async () => {
      const data = await apiGet<unknown>('/decks');
      return DecksResponseSchema.parse(data);
    },
    ...options,
  });
}

export function useDeck(
  deckId: string | undefined,
  options?: Omit<UseQueryOptions<Deck>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.deck(deckId ?? ''),
    queryFn: async () => {
      const data = await apiGet<unknown>(`/decks/${deckId}`);
      return DeckSchema.parse(data);
    },
    enabled: !!deckId,
    ...options,
  });
}

export function useCreateDeck(
  options?: UseMutationOptions<{ id: string; owner_id: string }, Error, void>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ id: string; owner_id: string }>('/decks', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.decks });
    },
    ...options,
  });
}

export function useDeleteDeck(
  options?: UseMutationOptions<void, Error, string>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deckId: string) => apiDelete(`/decks/${deckId}`),
    onSuccess: (_, deckId) => {
      qc.invalidateQueries({ queryKey: queryKeys.decks });
      qc.removeQueries({ queryKey: queryKeys.deck(deckId) });
    },
    ...options,
  });
}

export function useSlides(
  deckId: string | undefined,
  options?: Omit<UseQueryOptions<{ slides: Slide[] }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.slides(deckId ?? ''),
    queryFn: async () => {
      const data = await apiGet<unknown>(`/decks/${deckId}/slides`);
      return SlidesResponseSchema.parse(data);
    },
    enabled: !!deckId,
    ...options,
  });
}

export function useCreateSlide(
  deckId: string,
  options?: UseMutationOptions<Slide, Error, { order?: number }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiPost<Slide>(`/decks/${deckId}/slides`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.slides(deckId) });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
    ...options,
  });
}

export function useReorderSlides(
  deckId: string,
  options?: UseMutationOptions<{ slides: Slide[] }, Error, { slideIds: string[] }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiPatch<{ slides: Slide[] }>(`/decks/${deckId}/slides/reorder`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.slides(deckId) });
    },
    ...options,
  });
}

export function useDeleteSlide(
  deckId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slideId: string) =>
      apiDelete(`/decks/${deckId}/slides/${slideId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.slides(deckId) });
    },
    ...options,
  });
}

export function useBlocks(
  deckId: string | undefined,
  slideId: string | undefined,
  options?: Omit<UseQueryOptions<{ blocks: Block[] }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.blocks(deckId ?? '', slideId ?? ''),
    queryFn: async () => {
      const data = await apiGet<unknown>(`/decks/${deckId}/slides/${slideId}/blocks`);
      return BlocksResponseSchema.parse(data);
    },
    enabled: !!deckId && !!slideId,
    ...options,
  });
}

export function useCreateBlock(
  deckId: string,
  slideId: string,
  options?: UseMutationOptions<Block, Error, Partial<CreateBlockBody>>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiPost<Block>(`/decks/${deckId}/slides/${slideId}/blocks`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.blocks(deckId, slideId) });
    },
    ...options,
  });
}

type CreateBlockBody = {
  type?: 'text' | 'chart';
  layout?: Record<string, unknown>;
  content?: string;
  data_source_id?: string;
  chart_type?: string;
  column_mapping?: Record<string, unknown>;
  order?: number;
};

export function useUpdateBlock(
  deckId: string,
  slideId: string,
  options?: UseMutationOptions<Block, Error, { blockId: string } & Partial<CreateBlockBody>>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, ...body }) =>
      apiPatch<Block>(`/decks/${deckId}/slides/${slideId}/blocks/${blockId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.blocks(deckId, slideId) });
    },
    ...options,
  });
}

export function useDeleteBlock(
  deckId: string,
  slideId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) =>
      apiDelete(`/decks/${deckId}/slides/${slideId}/blocks/${blockId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.blocks(deckId, slideId) });
    },
    ...options,
  });
}

export function useReorderBlocks(
  deckId: string,
  slideId: string,
  options?: UseMutationOptions<{ blocks: Block[] }, Error, { blockIds: string[] }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiPatch<{ blocks: Block[] }>(
        `/decks/${deckId}/slides/${slideId}/blocks/reorder`,
        body
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.blocks(deckId, slideId) });
    },
    ...options,
  });
}

export type UploadDataSourceResult = {
  id: string;
  name: string;
  deck_id: string | null;
  rowCount: number;
};

export function useUploadDataSource(
  options?: UseMutationOptions<
    UploadDataSourceResult,
    Error,
    { file: File; deckId?: string; name?: string }
  >
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, deckId, name }) => {
      const res = await uploadWithAuth('/data-sources/upload', file, {
        deckId,
        name: name || undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `Upload failed: ${res.status}`);
      }
      return res.json() as Promise<UploadDataSourceResult>;
    },
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.dataSources(variables.deckId) });
      qc.invalidateQueries({ queryKey: queryKeys.dataSources() });
      if (result?.id) {
        qc.invalidateQueries({ queryKey: queryKeys.dataSourceSync(result.id) });
      }
    },
    ...options,
  });
}

export function useDataSources(
  deckId?: string,
  options?: Omit<UseQueryOptions<{ dataSources: DataSource[] }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dataSources(deckId),
    queryFn: async () => {
      const data = await apiGet<unknown>(
        deckId ? `/data-sources?deckId=${deckId}` : '/data-sources'
      );
      return DataSourcesResponseSchema.parse(data);
    },
    ...options,
  });
}

export function useDataSource(
  id: string | undefined,
  options?: Omit<UseQueryOptions<DataSource>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dataSource(id ?? ''),
    queryFn: async () => {
      const data = await apiGet<unknown>(`/data-sources/${id}`);
      return DataSourceSchema.parse(data);
    },
    enabled: !!id,
    ...options,
  });
}

export type DataSourceRowsOptions = Omit<
  UseQueryOptions<{ rows: DataRow[]; total: number }>,
  'queryKey' | 'queryFn'
> & { shareToken?: string | null };

export function useDataSourceRows(
  id: string | undefined,
  limit?: number,
  offset?: number,
  options?: DataSourceRowsOptions
) {
  const { shareToken, ...queryOptions } = options ?? {};
  const params = new URLSearchParams();
  if (limit != null) params.set('limit', String(limit));
  if (offset != null) params.set('offset', String(offset));
  if (shareToken) params.set('token', shareToken);
  const qs = params.toString();
  const path = `/data-sources/${id}/rows${qs ? `?${qs}` : ''}`;
  return useQuery({
    queryKey: [...queryKeys.dataSourceRows(id ?? '', limit, offset), shareToken ?? null],
    queryFn: async () => {
      const data =
        shareToken != null
          ? await getJsonNoRedirect<unknown>(path)
          : await apiGet<unknown>(path);
      return DataSourceRowsResponseSchema.parse(data);
    },
    enabled: !!id,
    ...queryOptions,
  });
}

/** Sync chart data from API to sql.js + IndexedDB and return rows from local cache. Use for edit view (no share token). */
export type DataSourceSyncResult = {
  rows: DataRow[];
  total: number;
  lastSynced: number;
};

export function useDataSourceRowsSync(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<DataSourceSyncResult>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.dataSourceSync(id ?? ''),
    queryFn: async (): Promise<DataSourceSyncResult> => {
      if (!id) throw new Error('dataSource id required');
      await initDb();
      const path = `/data-sources/${id}/rows`;
      const data = await apiGet<unknown>(path);
      const parsed = DataSourceRowsResponseSchema.parse(data);
      await upsertRows(id, parsed.rows);
      const fromDb = queryRows(id);
      return {
        rows: fromDb.map(({ id: rowId, row_index, row_data }) => ({
          id: rowId,
          row_index,
          row_data,
        })),
        total: getRowCount(id),
        lastSynced: Date.now(),
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
