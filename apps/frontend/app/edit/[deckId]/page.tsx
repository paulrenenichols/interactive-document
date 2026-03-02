'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useDeck,
  useSlides,
  useCreateSlide,
  useBlocks,
  useCreateBlock,
  type Slide,
  type Block,
} from '@/lib/queries';

export default function EditDeckPage() {
  const params = useParams();
  const deckId = params?.deckId as string | undefined;
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

  const { data: deck, isLoading: deckLoading, isError: deckError, error: deckErr } = useDeck(deckId);
  const { data: slidesData, isLoading: slidesLoading } = useSlides(deckId);
  const createSlide = useCreateSlide(deckId ?? '');
  const { data: blocksData } = useBlocks(deckId, selectedSlideId ?? undefined);
  const createBlock = useCreateBlock(deckId ?? '', selectedSlideId ?? '');

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

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Edit deck</h1>
      <p>Deck ID: {deckId}</p>

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
