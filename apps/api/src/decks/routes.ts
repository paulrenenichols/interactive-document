import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPool } from '../db.js';
import { canEditDeck, canViewDeck } from '../permissions.js';
import { jwtVerify, jwtOptional } from '../auth/jwtMiddleware.js';

type ParamsWithDeckId = { deckId?: string };
type CreateDeckBody = { title?: string };

export async function deckRoutes(fastify: FastifyInstance) {
  // List my decks (edit permission) — requires JWT
  fastify.get('/decks', { preHandler: [jwtVerify] }, async (request, reply) => {
    if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, owner_id, visibility, share_token, created_at, updated_at FROM decks WHERE owner_id = $1 ORDER BY updated_at DESC`,
      [request.userId]
    );
    return reply.send({ decks: result.rows });
  });

  // Create deck — requires JWT
  fastify.post<{ Body: CreateDeckBody }>(
    '/decks',
    { preHandler: [jwtVerify] },
    async (request, reply) => {
      if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
      const pool = getPool();
      const result = await pool.query<{ id: string }>(
        `INSERT INTO decks (owner_id) VALUES ($1) RETURNING id`,
        [request.userId]
      );
      const id = result.rows[0].id;
      return reply.status(201).send({ id, owner_id: request.userId });
    }
  );

  // Get one deck (view) — canViewDeck with optional JWT and optional ?token=
  fastify.get<{ Params: ParamsWithDeckId }>(
    '/decks/:deckId',
    { preHandler: [jwtOptional] },
    async (request, reply) => {
      const deckId = request.params.deckId;
      if (!deckId) return reply.status(400).send({ error: 'deckId required' });
      const shareToken = (request.query as { token?: string }).token;
      const allowed = await canViewDeck(deckId, request.userId ?? null, shareToken ?? null);
      if (!allowed) {
        if (request.userId) {
          return reply.status(403).send({ error: 'no view access' });
        }
        return reply.status(401).send({ error: 'authentication or share token required' });
      }
      const pool = getPool();
      const result = await pool.query(
        `SELECT id, owner_id, visibility, share_token, created_at, updated_at FROM decks WHERE id = $1`,
        [deckId]
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'deck not found' });
      return reply.send(result.rows[0]);
    }
  );

  // Update deck — requires JWT + canEditDeck
  fastify.patch<{ Params: ParamsWithDeckId }>(
    '/decks/:deckId',
    { preHandler: [jwtVerify] },
    async (request, reply) => {
      if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
      const deckId = request.params.deckId;
      if (!deckId) return reply.status(400).send({ error: 'deckId required' });
      const allowed = await canEditDeck(deckId, request.userId);
      if (!allowed) {
        return reply.status(403).send({ error: 'no edit access' });
      }
      const body = request.body as { visibility?: string; share_token?: string } | undefined;
      const updates: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      if (body?.visibility !== undefined) {
        updates.push(`visibility = $${i++}`);
        values.push(body.visibility);
      }
      if (body?.share_token !== undefined) {
        updates.push(`share_token = $${i++}`);
        values.push(body.share_token || null);
      }
      updates.push(`updated_at = now()`);
      if (values.length === 0) {
        const pool = getPool();
        const result = await pool.query(
          `SELECT id, owner_id, visibility, share_token, created_at, updated_at FROM decks WHERE id = $1`,
          [deckId]
        );
        if (result.rows.length === 0) return reply.status(404).send({ error: 'deck not found' });
        return reply.send(result.rows[0]);
      }
      values.push(deckId);
      const pool = getPool();
      const result = await pool.query(
        `UPDATE decks SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, owner_id, visibility, share_token, created_at, updated_at`,
        values
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'deck not found' });
      return reply.send(result.rows[0]);
    }
  );

  // Get deck slides (view) — canViewDeck
  fastify.get<{ Params: ParamsWithDeckId }>(
    '/decks/:deckId/slides',
    { preHandler: [jwtOptional] },
    async (request, reply) => {
      const deckId = request.params.deckId;
      if (!deckId) return reply.status(400).send({ error: 'deckId required' });
      const shareToken = (request.query as { token?: string }).token;
      const allowed = await canViewDeck(deckId, request.userId ?? null, shareToken ?? null);
      if (!allowed) {
        if (request.userId) {
          return reply.status(403).send({ error: 'no view access' });
        }
        return reply.status(401).send({ error: 'authentication or share token required' });
      }
      const pool = getPool();
      const result = await pool.query(
        `SELECT id, deck_id, "order" FROM slides WHERE deck_id = $1 ORDER BY "order"`,
        [deckId]
      );
      return reply.send({ slides: result.rows });
    }
  );
}
