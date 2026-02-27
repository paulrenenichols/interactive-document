'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function ViewDeckPage() {
  const params = useParams();
  const deckId = params?.deckId as string | undefined;
  const [status, setStatus] = useState<'loading' | 'ok' | 'forbidden' | 'unauthorized'>('loading');

  useEffect(() => {
    if (!deckId) {
      setStatus('ok');
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetchWithAuth(`/decks/${deckId}`);
      if (cancelled) return;
      if (res.status === 401) setStatus('unauthorized');
      else if (res.status === 403) setStatus('forbidden');
      else setStatus('ok');
    })();
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  if (status === 'unauthorized') {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>Sign in required</h1>
        <p>This deck is restricted. <Link href={`/login?returnUrl=${encodeURIComponent(`/view/${deckId}`)}`}>Log in</Link> or use a share link.</p>
        <p><Link href="/">Go home</Link></p>
      </main>
    );
  }

  if (status === 'forbidden') {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>No view access</h1>
        <p>You don’t have permission to view this deck.</p>
        <p><Link href="/">Go home</Link></p>
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>View deck</h1>
      <p>Deck ID: {deckId}</p>
      <p><Link href="/">Home</Link></p>
    </main>
  );
}
