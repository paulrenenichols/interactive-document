'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useDeck,
  useSlides,
  useCreateSlide,
  useDeleteSlide,
  useReorderSlides,
  useBlocks,
  useCreateBlock,
  useDataSources,
  useUploadDataSource,
  type Slide,
  type Block,
} from '@/lib/queries';

export default function EditDeckPage() {
  const params = useParams();
  const deckId = params?.deckId as string | undefined;
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: deck, isLoading: deckLoading, isError: deckError, error: deckErr } = useDeck(deckId);
  const { data: slidesData, isLoading: slidesLoading } = useSlides(deckId);
  const createSlide = useCreateSlide(deckId ?? '');
  const deleteSlide = useDeleteSlide(deckId ?? '');
  const reorderSlides = useReorderSlides(deckId ?? '');
  const { data: blocksData } = useBlocks(deckId, selectedSlideId ?? undefined);
  const createBlock = useCreateBlock(deckId ?? '', selectedSlideId ?? '');
  const { data: dataSourcesData } = useDataSources(deckId);
  const uploadCsv = useUploadDataSource();

  const slides: Slide[] = slidesData?.slides ?? [];
  const blocks: Block[] = blocksData?.blocks ?? [];
  const dataSources = dataSourcesData?.dataSources ?? [];

  // Auto-select first slide when slides load and none selected
  useEffect(() => {
    if (slides.length > 0 && !selectedSlideId) {
      setSelectedSlideId(slides[0].id);
    }
  }, [slides, selectedSlideId]);

  // Clear block selection when changing slide
  useEffect(() => {
    setSelectedBlockId(null);
  }, [selectedSlideId]);

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

  if (deckLoading || !deckId) {
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
          setSelectedSlideId(newSlide.id);
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
        setSelectedSlideId(nextSlide?.id ?? null);
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

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        fontFamily: 'system-ui',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar: slide list */}
      <aside
        style={{
          flex: '0 0 240px',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
          <Link href="/edit" style={{ fontSize: '0.875rem', color: '#0066cc' }}>
            ← Decks
          </Link>
          {deckId && (
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#666' }}>
              <Link href={`/view/${deckId}`}>View</Link>
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
            <p style={{ fontSize: '0.875rem', color: '#666' }}>Loading…</p>
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
                    onClick={() => setSelectedSlideId(s.id)}
                    style={{
                      flex: 1,
                      padding: '8px 8px',
                      textAlign: 'left',
                      fontWeight: selectedSlideId === s.id ? 600 : 400,
                      backgroundColor: selectedSlideId === s.id ? '#e6f0ff' : 'transparent',
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
                    style={{ padding: '4px 6px', fontSize: '0.75rem', color: '#c00' }}
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
        }}
      >
        <div style={{ padding: '12px', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
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
              <span style={{ color: '#666' }}>Data: {dataSources.map((ds) => ds.name).join(', ')}</span>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {!selectedSlideId ? (
            <p style={{ color: '#666' }}>Select a slide or add one.</p>
          ) : (
            <>
              <p style={{ marginBottom: '12px', fontSize: '0.875rem', color: '#666' }}>
                Slide {slides.findIndex((s) => s.id === selectedSlideId) + 1} of {slides.length}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => createBlock.mutate({ type: 'text' })}
                  disabled={createBlock.isPending}
                  style={{ padding: '6px 12px', marginRight: '8px' }}
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
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {blocks.map((b) => (
                  <li
                    key={b.id}
                    style={{
                      marginBottom: '8px',
                      padding: '12px',
                      background: selectedBlockId === b.id ? '#e6f0ff' : '#f5f5f5',
                      border: selectedBlockId === b.id ? '2px solid #0066cc' : '1px solid #ddd',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedBlockId(b.id)}
                  >
                    {b.type}: {b.content ?? '(empty)'}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* Properties panel (step 4 will fill when block selected) */}
      <aside
        style={{
          flex: '0 0 280px',
          borderLeft: '1px solid #ddd',
          padding: '12px',
          overflow: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 600 }}>Properties</h2>
        {selectedBlockId ? (
          <p style={{ fontSize: '0.875rem', color: '#666' }}>Block selected. (Config in step 4.)</p>
        ) : (
          <p style={{ fontSize: '0.875rem', color: '#666' }}>Select a block to edit.</p>
        )}
      </aside>
    </main>
  );
}
