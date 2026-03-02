'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useDeck,
  useSlides,
  useCreateSlide,
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: deck, isLoading: deckLoading, isError: deckError, error: deckErr } = useDeck(deckId);
  const { data: slidesData, isLoading: slidesLoading } = useSlides(deckId);
  const createSlide = useCreateSlide(deckId ?? '');
  const { data: blocksData } = useBlocks(deckId, selectedSlideId ?? undefined);
  const createBlock = useCreateBlock(deckId ?? '', selectedSlideId ?? '');
  const { data: dataSourcesData } = useDataSources(deckId);
  const uploadCsv = useUploadDataSource();

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

  const slides: Slide[] = slidesData?.slides ?? [];
  const blocks: Block[] = blocksData?.blocks ?? [];
  const dataSources = dataSourcesData?.dataSources ?? [];

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

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Edit deck</h1>
      <p>Deck ID: {deckId}</p>

      <section style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Upload CSV</h2>
        <p style={{ marginBottom: '0.5rem' }}>
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
              padding: '8px 16px',
              backgroundColor: selectedFile && !uploadCsv.isPending ? '#0066cc' : '#ccc',
              color: selectedFile && !uploadCsv.isPending ? 'white' : '#666',
              border: 'none',
              borderRadius: 4,
              cursor: selectedFile && !uploadCsv.isPending ? 'pointer' : 'not-allowed',
            }}
          >
            {uploadCsv.isPending ? 'Uploading…' : 'Upload'}
          </button>
          {!selectedFile && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              Select a file first
            </span>
          )}
          {uploadCsv.isError && (
            <span style={{ color: 'crimson', marginLeft: '0.5rem' }}>{uploadCsv.error?.message}</span>
          )}
          {uploadCsv.isSuccess && uploadCsv.data && (
            <span style={{ color: 'green', marginLeft: '0.5rem' }}>
              Uploaded “{uploadCsv.data.name}” ({uploadCsv.data.rowCount} rows)
            </span>
          )}
        </p>
        {dataSources.length > 0 && (
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Data sources for this deck: {dataSources.map((ds) => ds.name).join(', ')}
          </p>
        )}
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>Slides</h2>
        {slidesLoading ? (
          <p>Loading slides…</p>
        ) : (
          <>
            <p>
              <button
                type="button"
                onClick={() => createSlide.mutate({ order: slides.length })}
                disabled={createSlide.isPending}
                style={{ padding: '6px 12px', marginBottom: '0.5rem' }}
              >
                {createSlide.isPending ? 'Adding…' : 'Add slide'}
              </button>
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {slides.map((s) => (
                <li key={s.id} style={{ marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlideId(s.id)}
                    style={{
                      padding: '6px 12px',
                      fontWeight: selectedSlideId === s.id ? 'bold' : 'normal',
                    }}
                  >
                    Slide {s.order + 1}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {selectedSlideId && (
        <section style={{ marginTop: '1.5rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
          <h2>Blocks</h2>
          <p>
            <button
              type="button"
              onClick={() => createBlock.mutate({ type: 'text' })}
              disabled={createBlock.isPending}
              style={{ padding: '6px 12px', marginRight: '0.5rem' }}
            >
              {createBlock.isPending ? 'Adding…' : 'Add text block'}
            </button>
            <button
              type="button"
              onClick={() => createBlock.mutate({ type: 'chart' })}
              disabled={createBlock.isPending}
              style={{ padding: '6px 12px' }}
            >
              Add chart block
            </button>
            {(createSlide.isError || createBlock.isError) && (
              <span style={{ color: 'crimson', marginLeft: '0.5rem' }}>
                {createSlide.error?.message ?? createBlock.error?.message}
              </span>
            )}
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {blocks.map((b) => (
              <li key={b.id} style={{ marginBottom: '0.5rem', padding: '8px', background: '#f5f5f5' }}>
                {b.type}: {b.content || '(empty)'}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p style={{ marginTop: '2rem' }}>
        <Link href="/edit">Back to decks</Link>
        {' — '}
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
