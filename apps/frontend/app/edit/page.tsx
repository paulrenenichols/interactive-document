'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';

type Deck = { id: string; owner_id: string; visibility: string };

export default function EditPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchWithAuth('/decks');
      if (cancelled) return;
      if (res.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDecks(data.decks ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (forbidden) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>No edit access</h1>
        <p>You don’t have permission to edit this content.</p>
        <p>
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
      <h1>Edit</h1>
      <p>Your decks:</p>
      <ul>
        {decks.length === 0 && <li>No decks yet.</li>}
        {decks.map((d) => (
          <li key={d.id}>
            <Link href={`/edit/${d.id}`}>Deck {d.id.slice(0, 8)}…</Link>
            {' — '}
            <Link href={`/view/${d.id}`}>View</Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
