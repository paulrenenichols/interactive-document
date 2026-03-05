import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { fetchWithAuth, uploadWithAuth } from './api';

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
};

export type Deck = {
  id: string;
  owner_id: string;
  visibility: string;
  share_token?: string;
  created_at: string;
  updated_at: string;
};

export type Slide = { id: string; deck_id: string; order: number };

export type Block = {
  id: string;
  slide_id: string;
  type: 'text' | 'chart';
  layout: Record<string, unknown>;
  content?: string;
  data_source_id?: string;
  chart_type?: string;
  column_mapping?: Record<string, unknown>;
  order: number;
};

export type DataSource = {
  id: string;
  owner_id: string;
  deck_id?: string;
  name: string;
  created_at: string;
};

export type DataRow = {
  id: string;
  row_index: number;
  row_data: Record<string, unknown>;
};

export function useDecks(options?: Omit<UseQueryOptions<{ decks: Deck[] }>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.decks,
    queryFn: () => apiGet<{ decks: Deck[] }>('/decks'),
    ...options,
  });
}

export function useDeck(
  deckId: string | undefined,
  options?: Omit<UseQueryOptions<Deck>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.deck(deckId ?? ''),
    queryFn: () => apiGet<Deck>(`/decks/${deckId}`),
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
    queryFn: () => apiGet<{ slides: Slide[] }>(`/decks/${deckId}/slides`),
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
    queryFn: () =>
      apiGet<{ blocks: Block[] }>(`/decks/${deckId}/slides/${slideId}/blocks`),
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
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.dataSources(variables.deckId) });
      qc.invalidateQueries({ queryKey: queryKeys.dataSources() });
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
    queryFn: () =>
      apiGet<{ dataSources: DataSource[] }>(
        deckId ? `/data-sources?deckId=${deckId}` : '/data-sources'
      ),
    ...options,
  });
}

export function useDataSource(
  id: string | undefined,
  options?: Omit<UseQueryOptions<DataSource>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dataSource(id ?? ''),
    queryFn: () => apiGet<DataSource>(`/data-sources/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useDataSourceRows(
  id: string | undefined,
  limit?: number,
  offset?: number,
  options?: Omit<
    UseQueryOptions<{ rows: DataRow[]; total: number }>,
    'queryKey' | 'queryFn'
  >
) {
  const params = new URLSearchParams();
  if (limit != null) params.set('limit', String(limit));
  if (offset != null) params.set('offset', String(offset));
  const qs = params.toString();
  return useQuery({
    queryKey: queryKeys.dataSourceRows(id ?? '', limit, offset),
    queryFn: () =>
      apiGet<{ rows: DataRow[]; total: number }>(
        `/data-sources/${id}/rows${qs ? `?${qs}` : ''}`
      ),
    enabled: !!id,
    ...options,
  });
}
