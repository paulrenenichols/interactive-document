'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function EditDeckPage() {
  const params = useParams();
  const deckId = params?.deckId as string | undefined;
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetchWithAuth(`/decks/${deckId}`);
      if (cancelled) return;
      if (res.status === 403) {
        setForbidden(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  if (forbidden) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>No edit access</h1>
        <p>You don’t have permission to edit this deck.</p>
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

  if (loading) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Edit deck</h1>
      <p>Deck ID: {deckId}</p>
      <p>
        <Link href="/edit">Back to decks</Link>
        {' — '}
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
