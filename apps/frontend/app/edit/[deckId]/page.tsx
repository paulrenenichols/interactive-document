'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDeck,
  useSlides,
  useCreateSlide,
  useDeleteSlide,
  useReorderSlides,
  useBlocks,
  useCreateBlock,
  useDeleteBlock,
  useReorderBlocks,
  useUpdateBlock,
  useDataSources,
  useDataSourceRows,
  useUploadDataSource,
  queryKeys,
  type Slide,
  type Block,
} from '@/lib/queries';
import { useEditorStore } from '@/lib/stores/editor-store';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getBlockPosition,
  layoutFromPosition,
} from '@/lib/canvas-model';
import { DataBarChart } from '@/components/DataBarChart';
import { DataLineChart } from '@/components/DataLineChart';
import { DataPieChart } from '@/components/DataPieChart';
import { DataAreaChart } from '@/components/DataAreaChart';
import type { ChartConfig } from '@/components/BarChart';

const CHART_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'pie', label: 'Pie' },
  { value: 'area', label: 'Area' },
] as const;

function renderChartByType(
  chartType: string | undefined,
  dataSourceId: string | undefined,
  config: ChartConfig,
  height: number,
  shareToken?: string | null
) {
  const type = (chartType === 'line' || chartType === 'pie' || chartType === 'area' ? chartType : 'bar') as 'bar' | 'line' | 'pie' | 'area';
  const props = { dataSourceId, config, height, shareToken };
  switch (type) {
    case 'line':
      return <DataLineChart {...props} />;
    case 'pie':
      return <DataPieChart {...props} />;
    case 'area':
      return <DataAreaChart {...props} />;
    default:
      return <DataBarChart {...props} />;
  }
}

export default function EditDeckPage() {
  const params = useParams();
  const deckId = params?.deckId as string | undefined;
  const selectedSlideId = useEditorStore((s) => s.selectedSlideId);
  const selectSlide = useEditorStore((s) => s.selectSlide);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const resetForDeck = useEditorStore((s) => s.resetForDeck);
  const selectedBlockId = selectedBlockIds[0] ?? null;
  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const setZoom = useEditorStore((s) => s.setZoom);
  const canvasScrollPosition = useEditorStore((s) => s.canvasScrollPosition);
  const setCanvasScroll = useEditorStore((s) => s.setCanvasScroll);
  const dragState = useEditorStore((s) => s.dragState);
  const startDrag = useEditorStore((s) => s.startDrag);
  const updateDrag = useEditorStore((s) => s.updateDrag);
  const endDrag = useEditorStore((s) => s.endDrag);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const canvasInnerRef = useRef<HTMLDivElement>(null);
  const dragStartMouseRef = useRef<{ x: number; y: number } | null>(null);

  const { data: deckData, isLoading: deckLoading, isError: deckError, error: deckErr } = useDeck(deckId);
  const { data: slidesData, isLoading: slidesLoading } = useSlides(deckId);
  const createSlide = useCreateSlide(deckId ?? '');
  const deleteSlide = useDeleteSlide(deckId ?? '');
  const reorderSlides = useReorderSlides(deckId ?? '');
  const { data: blocksData } = useBlocks(deckId, selectedSlideId ?? undefined);
  const createBlock = useCreateBlock(deckId ?? '', selectedSlideId ?? '');
  const deleteBlock = useDeleteBlock(deckId ?? '', selectedSlideId ?? '');
  const reorderBlocks = useReorderBlocks(deckId ?? '', selectedSlideId ?? '');
  const updateBlock = useUpdateBlock(deckId ?? '', selectedSlideId ?? '');
  const queryClient = useQueryClient();
  const { data: dataSourcesData } = useDataSources(deckId);
  const uploadCsv = useUploadDataSource();

  const slides: Slide[] = slidesData?.slides ?? [];
  const blocks: Block[] = blocksData?.blocks ?? [];
  const dataSources = dataSourcesData?.dataSources ?? [];
  const selectedBlock = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null;

  const dataSourceIdForColumns =
    selectedBlock?.type === 'chart' ? selectedBlock.data_source_id : undefined;
  const { data: rowsData } = useDataSourceRows(dataSourceIdForColumns);
  const columnKeys = useMemo(() => {
    const rows = rowsData?.rows ?? [];
    const first = rows[0]?.row_data;
    return first ? Object.keys(first) : [];
  }, [rowsData?.rows]);

  // Reset editor state when deck changes (but preserve persisted slide for same deck)
  useEffect(() => {
    if (deckId) resetForDeck();
  }, [deckId, resetForDeck]);

  // Restore or set slide when slides load: prefer sessionStorage so reload shows same slide
  useEffect(() => {
    if (slides.length === 0 || selectedSlideId) return;
    const storageKey = deckId ? `edit-selected-slide-${deckId}` : null;
    const stored = storageKey && typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
    const validStored = stored && slides.some((s) => s.id === stored);
    selectSlide(validStored ? stored : slides[0].id);
  }, [slides, selectedSlideId, deckId, selectSlide]);

  // Persist selected slide per deck so reload shows same slide and its blocks
  useEffect(() => {
    if (deckId && selectedSlideId) {
      try {
        sessionStorage.setItem(`edit-selected-slide-${deckId}`, selectedSlideId);
      } catch {
        // ignore quota or private mode
      }
    }
  }, [deckId, selectedSlideId]);

  // Clear block selection when changing slide
  useEffect(() => {
    selectBlock(null);
  }, [selectedSlideId, selectBlock]);

  // Sync canvas scroll from container to store
  const handleCanvasScroll = () => {
    const el = canvasScrollRef.current;
    if (el) setCanvasScroll(el.scrollLeft, el.scrollTop);
  };

  // Convert client coordinates to canvas (logical) coordinates
  const clientToCanvas = (clientX: number, clientY: number) => {
    const el = canvasInnerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoomLevel,
      y: (clientY - rect.top) / zoomLevel,
    };
  };

  const dragStartPosRef = useRef<{ width: number; height: number } | null>(null);
  const justDraggedBlockIdRef = useRef<string | null>(null);

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string, pos: { x: number; y: number; width: number; height: number }) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const canvas = clientToCanvas(e.clientX, e.clientY);
    dragStartMouseRef.current = canvas;
    dragStartPosRef.current = { width: pos.width, height: pos.height };
    startDrag(blockId, pos.x, pos.y);

    const handleDocMouseMove = (moveEvent: MouseEvent) => {
      const start = dragStartMouseRef.current;
      if (!start) return;
      const state = useEditorStore.getState().dragState;
      if (!state || state.blockId !== blockId) return;
      const canvasPos = clientToCanvas(moveEvent.clientX, moveEvent.clientY);
      const w = dragStartPosRef.current?.width ?? pos.width;
      const h = dragStartPosRef.current?.height ?? pos.height;
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - w, state.startX + (canvasPos.x - start.x)));
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT - h, state.startY + (canvasPos.y - start.y)));
      updateDrag(newX, newY);
    };
    const handleDocMouseUp = () => {
      const state = useEditorStore.getState().dragState;
      const posRef = dragStartPosRef.current;
      dragStartMouseRef.current = null;
      dragStartPosRef.current = null;
      document.removeEventListener('mousemove', handleDocMouseMove);
      document.removeEventListener('mouseup', handleDocMouseUp);

      if (state && state.blockId === blockId && posRef && (state.currentX !== state.startX || state.currentY !== state.startY)) {
        justDraggedBlockIdRef.current = blockId;
        const newLayout = { x: state.currentX, y: state.currentY, width: posRef.width, height: posRef.height };
        // Optimistic update: write new layout into cache so block stays where we dropped it
        if (deckId && selectedSlideId) {
          const key = queryKeys.blocks(deckId, selectedSlideId);
          queryClient.setQueryData(key, (old: { blocks: Block[] } | undefined) => {
            if (!old?.blocks) return old;
            return {
              blocks: old.blocks.map((b) =>
                b.id === state.blockId ? { ...b, layout: newLayout } : b
              ),
            };
          });
        }
        endDrag();
        updateBlock.mutate({
          blockId: state.blockId,
          layout: layoutFromPosition(newLayout),
        });
      } else {
        endDrag();
      }
    };
    document.addEventListener('mousemove', handleDocMouseMove);
    document.addEventListener('mouseup', handleDocMouseUp);
  };

  const forbidden =
    deckError &&
    deckErr instanceof Error &&
    (deckErr.message.includes('no edit access') || deckErr.message.includes('403'));

  if (forbidden) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>No edit access</h1>
        <p>You don&apos;t have permission to edit this deck.</p>
        <p>
          {deckId && (
            <>
              <Link href={`/view/${deckId}`}>View deck</Link>
              {' — '}
            </>
          )}
          <Link href="/">Go home</Link>
        </p>
      </main>
    );
  }

  if (!deckId || (deckLoading && !deckData)) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <p>Loading…</p>
      </main>
    );
  }

  const handleCsvUpload = () => {
    if (!selectedFile) return;
    uploadCsv.mutate(
      { file: selectedFile, deckId, name: selectedFile.name.replace(/\.csv$/i, '') },
      {
        onSuccess: () => {
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      }
    );
  };

  const handleAddSlide = () => {
    createSlide.mutate(
      { order: slides.length },
      {
        onSuccess: (newSlide) => {
          selectSlide(newSlide.id);
        },
      }
    );
  };

  const handleDeleteSlide = (slideId: string) => {
    const idx = slides.findIndex((s) => s.id === slideId);
    if (idx < 0) return;
    const nextSlide = slides[idx + 1] ?? slides[idx - 1];
    deleteSlide.mutate(slideId, {
      onSuccess: () => {
        selectSlide(nextSlide?.id ?? null);
      },
    });
  };

  const handleMoveSlide = (slideId: string, direction: 'up' | 'down') => {
    const idx = slides.findIndex((s) => s.id === slideId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const newOrder = [...slides];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    reorderSlides.mutate({ slideIds: newOrder.map((s) => s.id) });
  };

  const handleDeleteBlock = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = blocks.findIndex((b) => b.id === blockId);
    const nextBlock = blocks[idx + 1] ?? blocks[idx - 1];
    deleteBlock.mutate(blockId, {
      onSuccess: () => {
        selectBlock(selectedBlockId === blockId ? (nextBlock?.id ?? null) : selectedBlockId);
      },
    });
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newOrder = [...blocks];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    reorderBlocks.mutate({ blockIds: newOrder.map((b) => b.id) });
  };

  function blockColumnMappingToConfig(mapping: Record<string, unknown> | undefined): ChartConfig | null {
    if (!mapping || typeof mapping.categoryKey !== 'string' || typeof mapping.valueKey !== 'string')
      return null;
    return {
      categoryKey: mapping.categoryKey,
      valueKey: mapping.valueKey,
      ...(typeof mapping.seriesKey === 'string' && mapping.seriesKey
        ? { seriesKey: mapping.seriesKey }
        : {}),
    };
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        fontFamily: 'system-ui',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sidebar: slide list */}
      <aside
        style={{
          flex: '0 0 240px',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div
          style={{
            padding: '12px',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <Link
            href="/edit"
            style={{ fontSize: '0.875rem', color: 'var(--accent-primary)' }}
          >
            ← Decks
          </Link>
          {deckId && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Link href={`/view/${deckId}`}>View</Link>
              {' · '}
              <Link href={`/view/${deckId}`}>Present</Link>
            </p>
          )}
        </div>
        <div style={{ padding: '8px', flex: '1 1 0', overflow: 'auto' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 600 }}>Slides</h2>
          <button
            type="button"
            onClick={handleAddSlide}
            disabled={createSlide.isPending}
            style={{
              padding: '6px 12px',
              marginBottom: '8px',
              width: '100%',
              cursor: createSlide.isPending ? 'wait' : 'pointer',
            }}
          >
            {createSlide.isPending ? 'Adding…' : '+ Add slide'}
          </button>
          {slidesLoading ? (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              Loading…
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {slides.map((s, i) => (
                <li
                  key={s.id}
                  style={{
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectSlide(s.id)}
                    style={{
                      flex: 1,
                      padding: '8px 8px',
                      textAlign: 'left',
                      fontWeight: selectedSlideId === s.id ? 600 : 400,
                      backgroundColor:
                        selectedSlideId === s.id
                          ? 'var(--bg-selected)'
                          : 'transparent',
                      border: '1px solid transparent',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Slide {s.order + 1}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(s.id, 'up')}
                    disabled={i === 0 || reorderSlides.isPending}
                    title="Move up"
                    style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(s.id, 'down')}
                    disabled={i === slides.length - 1 || reorderSlides.isPending}
                    title="Move down"
                    style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(s.id)}
                    disabled={slides.length <= 1 || deleteSlide.isPending}
                    title="Delete slide"
                    style={{
                      padding: '4px 6px',
                      fontSize: '0.75rem',
                      color: 'var(--error)',
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Canvas: current slide + blocks (step 3 will fill blocks) */}
      <section
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            padding: '12px',
            borderBottom: '1px solid var(--border-default)',
            flexShrink: 0,
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1rem' }}>Edit deck</h1>
          <div style={{ marginTop: '8px', fontSize: '0.875rem' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              style={{ marginRight: '0.5rem' }}
            />
            <button
              type="button"
              onClick={handleCsvUpload}
              disabled={uploadCsv.isPending || !selectedFile}
              style={{
                padding: '6px 12px',
                marginRight: '8px',
                cursor: selectedFile && !uploadCsv.isPending ? 'pointer' : 'not-allowed',
              }}
            >
              {uploadCsv.isPending ? 'Uploading…' : 'Upload CSV'}
            </button>
            {dataSources.length > 0 && (
              <span style={{ color: 'var(--text-secondary)' }}>
                Data: {dataSources.map((ds) => ds.name).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {!selectedSlideId ? (
            <div style={{ padding: '16px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Select a slide or add one.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Slide {slides.findIndex((s) => s.id === selectedSlideId) + 1} of {slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => createBlock.mutate({ type: 'text' })}
                  disabled={createBlock.isPending}
                  style={{ padding: '6px 12px' }}
                >
                  Add text block
                </button>
                <button
                  type="button"
                  onClick={() => createBlock.mutate({ type: 'chart' })}
                  disabled={createBlock.isPending}
                  style={{ padding: '6px 12px' }}
                >
                  Add chart block
                </button>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setZoom(zoomLevel - 0.25)}
                    disabled={zoomLevel <= 0.25}
                    style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                    title="Zoom out"
                  >
                    −
                  </button>
                  <span style={{ fontSize: '0.875rem', minWidth: '3rem', textAlign: 'center' }}>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom(zoomLevel + 0.25)}
                    disabled={zoomLevel >= 2}
                    style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                    title="Zoom in"
                  >
                    +
                  </button>
                </span>
              </div>
              <div
                ref={canvasScrollRef}
                onScroll={handleCanvasScroll}
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <div
                  style={{
                    width: CANVAS_WIDTH * zoomLevel,
                    height: CANVAS_HEIGHT * zoomLevel,
                    position: 'relative',
                  }}
                >
                  <div
                    ref={canvasInnerRef}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: CANVAS_WIDTH,
                      height: CANVAS_HEIGHT,
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: '0 0',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                    }}
                  >
                    {blocks.map((b, i) => {
                      const isSelected = selectedBlockId === b.id;
                      const pos = getBlockPosition(b, i);
                      const isDragging = dragState?.blockId === b.id;
                      const displayX = isDragging ? dragState.currentX : pos.x;
                      const displayY = isDragging ? dragState.currentY : pos.y;
                      const chartConfig = b.type === 'chart' ? blockColumnMappingToConfig(b.column_mapping) : null;
                      const chartReady = b.type === 'chart' && b.data_source_id && chartConfig?.categoryKey && chartConfig?.valueKey;
                      return (
                        <div
                          key={b.id}
                          style={{
                            position: 'absolute',
                            left: displayX,
                            top: displayY,
                            width: pos.width,
                            height: pos.height,
                            padding: '8px',
                            boxSizing: 'border-box',
                            background: isSelected ? 'var(--bg-selected)' : 'var(--bg-secondary)',
                            border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                            borderRadius: 8,
                            cursor: isDragging ? 'grabbing' : 'grab',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          onMouseDown={(e) => handleBlockMouseDown(e, b.id, pos)}
                          onClick={() => {
                            if (justDraggedBlockIdRef.current === b.id) {
                              justDraggedBlockIdRef.current = null;
                              return;
                            }
                            selectBlock(b.id);
                          }}
                        >
                          <div style={{ flex: 1, minHeight: 0 }} onClick={(e) => e.stopPropagation()}>
                            {b.type === 'text' && (
                              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{b.content || '(empty text)'}</div>
                            )}
                            {b.type === 'chart' && (
                              chartReady ? (
                                renderChartByType(
                                  b.chart_type,
                                  b.data_source_id,
                                  chartConfig!,
                                  Math.max(120, pos.height - 24)
                                )
                              ) : (
                                <div
                                  style={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--border-default)',
                                    borderRadius: 6,
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Configure chart (Properties panel)
                                </div>
                              )
                            )}
                          </div>
                          <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleMoveBlock(b.id, 'up', e)}
                              disabled={i === 0 || reorderBlocks.isPending}
                              title="Move up"
                              style={{ padding: '2px 4px', fontSize: '0.75rem', marginRight: '2px' }}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleMoveBlock(b.id, 'down', e)}
                              disabled={i === blocks.length - 1 || reorderBlocks.isPending}
                              title="Move down"
                              style={{ padding: '2px 4px', fontSize: '0.75rem', marginRight: '2px' }}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBlock(b.id, e)}
                              disabled={deleteBlock.isPending}
                              title="Delete block"
                              style={{ padding: '2px 4px', fontSize: '0.75rem', color: 'var(--error)' }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Properties panel */}
      <aside
        style={{
          flex: '0 0 280px',
          borderLeft: '1px solid var(--border-default)',
          padding: '12px',
          overflow: 'auto',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 600 }}>Properties</h2>
        {!selectedBlock ? (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}
          >
            Select a block to edit.
          </p>
        ) : selectedBlock.type === 'text' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="block-content" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Content
            </label>
            <textarea
              id="block-content"
              defaultValue={selectedBlock.content ?? ''}
              onBlur={(e) => {
                const value = e.target.value;
                if (value !== (selectedBlock.content ?? '')) {
                  updateBlock.mutate({ blockId: selectedBlock.id, content: value });
                }
              }}
              rows={6}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border-default)',
                borderRadius: 4,
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
            {updateBlock.isError && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--error)',
                }}
              >
                {updateBlock.error?.message}
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label htmlFor="chart-type" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                Chart type
              </label>
              <select
                id="chart-type"
                value={selectedBlock.chart_type ?? 'bar'}
                onChange={(e) => {
                  const v = e.target.value as 'bar' | 'line' | 'pie' | 'area';
                  updateBlock.mutate({ blockId: selectedBlock.id, chart_type: v });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 4,
                }}
              >
                {CHART_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="chart-data-source" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                Data source
              </label>
              <select
                id="chart-data-source"
                value={selectedBlock.data_source_id ?? ''}
                onChange={(e) => {
                  const v = e.target.value || undefined;
                  updateBlock.mutate({
                    blockId: selectedBlock.id,
                    data_source_id: v,
                    column_mapping: v ? selectedBlock.column_mapping : undefined,
                  });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 4,
                }}
              >
                <option value="">— Select —</option>
                {dataSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))}
              </select>
            </div>
            {columnKeys.length > 0 && selectedBlock.data_source_id && (
              <>
                <div>
                  <label htmlFor="chart-category" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                    Category (X axis)
                  </label>
                  <select
                    id="chart-category"
                    value={(selectedBlock.column_mapping?.categoryKey as string) ?? columnKeys[0]}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateBlock.mutate({
                        blockId: selectedBlock.id,
                        column_mapping: {
                          ...selectedBlock.column_mapping,
                          categoryKey: v,
                          valueKey: (selectedBlock.column_mapping?.valueKey as string) ?? columnKeys[1] ?? columnKeys[0],
                          ...((selectedBlock.column_mapping?.seriesKey as string) && {
                            seriesKey: selectedBlock.column_mapping?.seriesKey,
                          }),
                        },
                      });
                    }}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 4 }}
                  >
                    {columnKeys.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="chart-value" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                    Value (Y axis)
                  </label>
                  <select
                    id="chart-value"
                    value={(selectedBlock.column_mapping?.valueKey as string) ?? columnKeys[1] ?? columnKeys[0]}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateBlock.mutate({
                        blockId: selectedBlock.id,
                        column_mapping: {
                          ...selectedBlock.column_mapping,
                          categoryKey: (selectedBlock.column_mapping?.categoryKey as string) ?? columnKeys[0],
                          valueKey: v,
                          ...((selectedBlock.column_mapping?.seriesKey as string) && {
                            seriesKey: selectedBlock.column_mapping?.seriesKey,
                          }),
                        },
                      });
                    }}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 4 }}
                  >
                    {columnKeys.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="chart-series" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                    Series (optional)
                  </label>
                  <select
                    id="chart-series"
                    value={(selectedBlock.column_mapping?.seriesKey as string) ?? ''}
                    onChange={(e) => {
                      const v = e.target.value || undefined;
                      updateBlock.mutate({
                        blockId: selectedBlock.id,
                        column_mapping: {
                          ...selectedBlock.column_mapping,
                          categoryKey: (selectedBlock.column_mapping?.categoryKey as string) ?? columnKeys[0],
                          valueKey: (selectedBlock.column_mapping?.valueKey as string) ?? columnKeys[1] ?? columnKeys[0],
                          ...(v && { seriesKey: v }),
                        },
                      });
                    }}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 4 }}
                  >
                    <option value="">— None —</option>
                    {columnKeys.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {updateBlock.isError && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--error)',
                }}
              >
                {updateBlock.error?.message}
              </span>
            )}
          </div>
        )}
      </aside>
    </main>
  );
}
