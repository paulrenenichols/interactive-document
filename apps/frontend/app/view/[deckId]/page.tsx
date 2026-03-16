'use client';

import { Suspense, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@/lib/material-ui-shim';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { queryKeys, type Deck, type Slide, type Block } from '@/lib/queries';
import { apiUrl } from '@/lib/api';
import { getToken, getUserId } from '@/lib/auth';
import { DataBarChart } from '@/components/DataBarChart';
import { DataLineChart } from '@/components/DataLineChart';
import { DataPieChart } from '@/components/DataPieChart';
import { DataAreaChart } from '@/components/DataAreaChart';
import type { ChartConfig } from '@/components/BarChart';

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
      <Box component="main" sx={{ py: 4 }}>
        <Container maxWidth="sm">
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">
              Sign in required
            </Typography>
            <Typography>
              This deck is restricted.{' '}
              <Link
                href={`/login?returnUrl=${encodeURIComponent(`/view/${deckId}${shareToken ? `?token=${shareToken}` : ''}`)}`}
                className="cursor-pointer text-accent-primary no-underline hover:underline hover:text-accent-primary-hover dark:text-accent-primary dark:hover:text-accent-primary-hover"
              >
                Log in
              </Link>{' '}
              or use a share link.
            </Typography>
            <Typography variant="body2">
              <Link href="/" className="cursor-pointer text-accent-primary no-underline hover:underline hover:text-accent-primary-hover dark:text-accent-primary dark:hover:text-accent-primary-hover">
                Go home
              </Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (forbidden) {
    return (
      <Box component="main" sx={{ py: 4 }}>
        <Container maxWidth="sm">
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">
              No view access
            </Typography>
            <Typography>
              You don&apos;t have permission to view this deck.
            </Typography>
            <Typography variant="body2">
              <Link href="/" className="cursor-pointer text-accent-primary no-underline hover:underline hover:text-accent-primary-hover dark:text-accent-primary dark:hover:text-accent-primary-hover">
                Go home
              </Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (deckQuery.isLoading || !deckId) {
    return (
      <Box component="main" sx={{ py: 4 }}>
        <Container maxWidth="sm">
          <Typography>Loading…</Typography>
        </Container>
      </Box>
    );
  }

  if (deckQuery.isError) {
    return (
      <Box component="main" sx={{ py: 4 }}>
        <Container maxWidth="sm">
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">
              Error
            </Typography>
            <Typography>
              {deckError instanceof Error ? deckError.message : 'Failed to load deck.'}
            </Typography>
            <Typography variant="body2">
              <Link href="/" className="cursor-pointer text-accent-primary no-underline hover:underline hover:text-accent-primary-hover dark:text-accent-primary dark:hover:text-accent-primary-hover">
                Go home
              </Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <AppBar position="static" elevation={0}>
        <Container
          sx={{
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Link href="/" className="text-inherit no-underline hover:underline">
              Home
            </Link>
            {deckId && canEdit && (
              <Link href={`/edit/${deckId}`} className="text-inherit no-underline hover:underline">
                Edit
              </Link>
            )}
          </Stack>
          <Typography variant="body2" color="textSecondary">
            {slides.length > 0 ? `${currentIndex + 1} / ${slides.length}` : '—'}
          </Typography>
        </Container>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          py: 3,
        }}
      >
        <Container maxWidth="md">
          {!currentSlide ? (
            <Typography color="textSecondary">No slides in this deck.</Typography>
          ) : (
            <Stack spacing={2}>
              {blocks.length === 0 ? (
                <Typography color="textSecondary">
                  This slide has no content.
                </Typography>
              ) : (
                blocks.map((b) => {
                  const chartConfig =
                    b.type === 'chart'
                      ? blockColumnMappingToConfig(b.column_mapping)
                      : null;
                  const chartReady =
                    b.type === 'chart' &&
                    b.data_source_id &&
                    chartConfig?.categoryKey &&
                    chartConfig?.valueKey;
                  return (
                    <Paper
                      key={b.id}
                      elevation={1}
                      sx={{
                        p: 2,
                      }}
                    >
                      {b.type === 'text' && (
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                          {b.content || ''}
                        </Typography>
                      )}
                      {b.type === 'chart' &&
                        (chartReady ? (
                          renderChartByType(
                            b.chart_type,
                            b.data_source_id,
                            chartConfig!,
                            280,
                            shareToken
                          )
                        ) : (
                          <Box
                            sx={{
                              p: 3,
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2" color="textSecondary">
                              Chart not configured
                            </Typography>
                          </Box>
                        ))}
                    </Paper>
                  );
                })
              )}
            </Stack>
          )}
        </Container>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            variant="outlined"
          >
            Previous
          </Button>
          <Button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            variant="filled"
          >
            Next
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default function ViewDeckPage() {
  return (
    <Suspense
      fallback={
        <Box component="main" sx={{ py: 4 }}>
          <Container maxWidth="sm">
            <Typography>Loading…</Typography>
          </Container>
        </Box>
      }
    >
      <ViewDeckContent />
    </Suspense>
  );
}
