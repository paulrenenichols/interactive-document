import { getPool } from './db.js';

export async function canEditDeck(
  deckId: string,
  userId: string
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{ owner_id: string }>(
    `SELECT owner_id FROM decks WHERE id = $1`,
    [deckId]
  );
  if (result.rows.length === 0) return false;
  return result.rows[0].owner_id === userId;
}

export async function canViewDeck(
  deckId: string,
  userId?: string | null,
  shareToken?: string | null
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{
    owner_id: string;
    visibility: string;
    share_token: string | null;
  }>(`SELECT owner_id, visibility, share_token FROM decks WHERE id = $1`, [deckId]);
  if (result.rows.length === 0) return false;
  const row = result.rows[0];
  if (userId && row.owner_id === userId) return true;
  if (row.visibility === 'public') return true;
  if (shareToken && row.share_token && row.share_token === shareToken) return true;
  if (userId) {
    const viewer = await pool.query(
      `SELECT 1 FROM deck_viewers WHERE deck_id = $1 AND user_id = $2`,
      [deckId, userId]
    );
    if (viewer.rows.length > 0) return true;
  }
  return false;
}
