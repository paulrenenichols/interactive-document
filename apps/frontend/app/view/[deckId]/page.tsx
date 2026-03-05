'use client';

import { Suspense, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { queryKeys, type Deck, type Slide, type Block } from '@/lib/queries';
import { apiUrl } from '@/lib/api';
import { getToken, getUserId } from '@/lib/auth';
import { DataBarChart } from '@/components/DataBarChart';
import type { ChartConfig } from '@/components/BarChart';

async function fetchDeck(deckId: string, shareToken?: string | null): Promise<Deck> {
  const path = `/decks/${deckId}${shareToken ? `?token=${encodeURIComponent(shareToken)}` : ''}`;
  const url = `${apiUrl()}${path}`;
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: string }).error ?? `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

async function fetchSlides(deckId: string, shareToken?: string | null): Promise<{ slides: Slide[] }> {
  const path = `/decks/${deckId}/slides${shareToken ? `?token=${encodeURIComponent(shareToken)}` : ''}`;
  const url = `${apiUrl()}${path}`;
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: string }).error ?? `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

async function fetchBlocks(
  deckId: string,
  slideId: string,
  shareToken?: string | null
): Promise<{ blocks: Block[] }> {
  const path = `/decks/${deckId}/slides/${slideId}/blocks${shareToken ? `?token=${encodeURIComponent(shareToken)}` : ''}`;
  const url = `${apiUrl()}${path}`;
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: string }).error ?? `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

function is401(msg: string): boolean {
  return msg.includes('401') || /authentication|sign in|required/i.test(msg);
}

function is403(msg: string): boolean {
  return msg.includes('403') || /no view access|forbidden|permission/i.test(msg);
}

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

function ViewDeckContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const deckId = params?.deckId as string | undefined;
  const shareToken = searchParams.get('token');

  const [currentIndex, setCurrentIndex] = useState(0);

  const deckQuery = useQuery({
    queryKey: [...queryKeys.deck(deckId ?? ''), shareToken ?? null],
    queryFn: () => fetchDeck(deckId!, shareToken),
    enabled: !!deckId,
  });

  const slidesQuery = useQuery({
    queryKey: [...queryKeys.slides(deckId ?? ''), shareToken ?? null],
    queryFn: () => fetchSlides(deckId!, shareToken),
    enabled: !!deckId && deckQuery.isSuccess,
  });

  const deck = deckQuery.data;
  const slides: Slide[] = slidesQuery.data?.slides ?? [];
  const currentSlide = slides[currentIndex] ?? null;

  const blocksQuery = useQuery({
    queryKey: [...queryKeys.blocks(deckId ?? '', currentSlide?.id ?? ''), shareToken ?? null],
    queryFn: () => fetchBlocks(deckId!, currentSlide!.id, shareToken),
    enabled: !!deckId && !!currentSlide?.id,
  });

  const blocks: Block[] = blocksQuery.data?.blocks ?? [];

  // Keep index in range when slides change
  useEffect(() => {
    if (slides.length > 0 && currentIndex >= slides.length) {
      setCurrentIndex(Math.max(0, slides.length - 1));
    }
  }, [slides.length, currentIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1 < slides.length ? i + 1 : i));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const canGoNext = currentIndex + 1 < slides.length;
  const canGoPrev = currentIndex > 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (canGoNext) goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (canGoPrev) goPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        router.back();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canGoNext, canGoPrev, goNext, goPrev, router, deckId, shareToken]);

  const deckError = deckQuery.error ?? slidesQuery.error;
  const errMsg = deckError instanceof Error ? deckError.message : '';
  const unauthorized = deckQuery.isError && is401(errMsg);
  const forbidden = (deckQuery.isError || slidesQuery.isError) && is403(errMsg);

  const userId = getUserId();
  const canEdit = !!(deck && userId && deck.owner_id === userId);

  if (unauthorized) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>Sign in required</h1>
        <p>
          This deck is restricted.{' '}
          <Link href={`/login?returnUrl=${encodeURIComponent(`/view/${deckId}${shareToken ? `?token=${shareToken}` : ''}`)}`}>
            Log in
          </Link>{' '}
          or use a share link.
        </p>
        <p><Link href="/">Go home</Link></p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>No view access</h1>
        <p>You don&apos;t have permission to view this deck.</p>
        <p><Link href="/">Go home</Link></p>
      </main>
    );
  }

  if (deckQuery.isLoading || !deckId) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <p>Loading…</p>
      </main>
    );
  }

  if (deckQuery.isError) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>Error</h1>
        <p>{deckError instanceof Error ? deckError.message : 'Failed to load deck.'}</p>
        <p><Link href="/">Go home</Link></p>
      </main>
    );
  }

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Top bar: progress, Edit link */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontSize: '0.875rem', color: '#0066cc' }}>
            Home
          </Link>
          {deckId && canEdit && (
            <Link href={`/edit/${deckId}`} style={{ fontSize: '0.875rem', color: '#0066cc' }}>
              Edit
            </Link>
          )}
        </div>
        <span style={{ fontSize: '0.875rem', color: '#666' }}>
          {slides.length > 0 ? `${currentIndex + 1} / ${slides.length}` : '—'}
        </span>
      </div>

      {/* Slide area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'auto',
        }}
      >
        {!currentSlide ? (
          <p style={{ color: '#666' }}>No slides in this deck.</p>
        ) : (
          <div style={{ width: '100%', maxWidth: 800 }}>
            {blocks.length === 0 ? (
              <p style={{ color: '#666' }}>This slide has no content.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {blocks.map((b) => {
                  const chartConfig = b.type === 'chart' ? blockColumnMappingToConfig(b.column_mapping) : null;
                  const chartReady =
                    b.type === 'chart' &&
                    b.data_source_id &&
                    chartConfig?.categoryKey &&
                    chartConfig?.valueKey;
                  return (
                    <li
                      key={b.id}
                      style={{
                        marginBottom: '16px',
                        padding: '16px',
                        background: '#f9f9f9',
                        border: '1px solid #eee',
                        borderRadius: 8,
                      }}
                    >
                      {b.type === 'text' && (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{b.content || ''}</div>
                      )}
                      {b.type === 'chart' &&
                        (chartReady ? (
                          <DataBarChart
                            dataSourceId={b.data_source_id}
                            config={chartConfig!}
                            height={280}
                            shareToken={shareToken}
                          />
                        ) : (
                          <div
                            style={{
                              padding: '24px',
                              background: '#eee',
                              borderRadius: 8,
                              color: '#666',
                              fontSize: '0.875rem',
                            }}
                          >
                            Chart not configured
                          </div>
                        ))}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Next / Prev */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '16px',
          borderTop: '1px solid #eee',
          backgroundColor: '#fafafa',
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
          }}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
          }}
        >
          Next
        </button>
      </div>
    </main>
  );
}

export default function ViewDeckPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
          <p>Loading…</p>
        </main>
      }
    >
      <ViewDeckContent />
    </Suspense>
  );
}
