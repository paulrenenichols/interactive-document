'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDecks, useCreateDeck, type Deck } from '@/lib/queries';

export default function EditPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useDecks();
  const createDeck = useCreateDeck({
    onSuccess: (data) => {
      router.push(`/edit/${data.id}`);
    },
  });

  const forbidden =
    isError &&
    error instanceof Error &&
    (error.message.includes('no edit access') || error.message.includes('403'));

  if (forbidden) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>No edit access</h1>
        <p>You don&apos;t have permission to edit this content.</p>
        <p>
          <Link href="/">Go home</Link>
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <p>Loading…</p>
      </main>
    );
  }

  const decks: Deck[] = data?.decks ?? [];

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Edit</h1>

      <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>New document</h2>
        <button
          type="button"
          onClick={() => createDeck.mutate()}
          disabled={createDeck.isPending}
          style={{
            padding: '10px 20px',
            backgroundColor: createDeck.isPending ? '#999' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: '1rem',
            cursor: createDeck.isPending ? 'wait' : 'pointer',
          }}
        >
          {createDeck.isPending ? 'Creating…' : 'Create deck'}
        </button>
        {createDeck.isError && (
          <span style={{ color: 'crimson', marginLeft: '0.5rem' }}>
            {createDeck.error?.message}
          </span>
        )}
      </section>

      <h2>Your decks</h2>
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
