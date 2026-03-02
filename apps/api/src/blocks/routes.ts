import type { FastifyInstance } from 'fastify';
import { getPool } from '../db.js';
import { canEditDeck, canViewDeck } from '../permissions.js';
import { jwtVerify, jwtOptional } from '../auth/jwtMiddleware.js';

type ParamsWithBlockId = { deckId?: string; slideId?: string; blockId?: string };

type CreateBlockBody = {
  type?: 'text' | 'chart';
  layout?: Record<string, unknown>;
  content?: string;
  data_source_id?: string;
  chart_type?: string;
  column_mapping?: Record<string, unknown>;
  order?: number;
};

type UpdateBlockBody = {
  type?: 'text' | 'chart';
  layout?: Record<string, unknown>;
  content?: string;
  data_source_id?: string;
  chart_type?: string;
  column_mapping?: Record<string, unknown>;
  order?: number;
};

type ReorderBlocksBody = { blockIds: string[] };

export async function blockRoutes(fastify: FastifyInstance) {
  // List blocks (view) — canViewDeck
  fastify.get<{ Params: ParamsWithBlockId }>(
    '/decks/:deckId/slides/:slideId/blocks',
    { preHandler: [jwtOptional] },
    async (request, reply) => {
      const { deckId, slideId } = request.params;
      if (!deckId || !slideId) return reply.status(400).send({ error: 'deckId and slideId required' });
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
        `SELECT b.id, b.slide_id, b.type, b.layout, b.content, b.data_source_id, b.chart_type, b.column_mapping, b."order"
         FROM blocks b
         JOIN slides s ON b.slide_id = s.id AND s.deck_id = $1
         WHERE b.slide_id = $2 ORDER BY b."order"`,
        [deckId, slideId]
      );
      return reply.send({ blocks: result.rows });
    }
  );

  // Create block — requires JWT + canEditDeck
  fastify.post<{ Params: ParamsWithBlockId; Body: CreateBlockBody }>(
    '/decks/:deckId/slides/:slideId/blocks',
    { preHandler: [jwtVerify] },
    async (request, reply) => {
      if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
      const { deckId, slideId } = request.params;
      if (!deckId || !slideId) return reply.status(400).send({ error: 'deckId and slideId required' });
      const allowed = await canEditDeck(deckId, request.userId);
      if (!allowed) {
        return reply.status(403).send({ error: 'no edit access' });
      }
      const body = request.body ?? {};
      const type = body.type === 'chart' ? 'chart' : 'text';
      const layout = body.layout ? JSON.stringify(body.layout) : '{}';
      const content = body.content ?? null;
      const data_source_id = body.data_source_id ?? null;
      const chart_type = body.chart_type ?? null;
      const column_mapping = body.column_mapping ? JSON.stringify(body.column_mapping) : null;
      const order = body.order ?? 0;

      const pool = getPool();
      const slideCheck = await pool.query(
        `SELECT 1 FROM slides WHERE id = $1 AND deck_id = $2`,
        [slideId, deckId]
      );
      if (slideCheck.rows.length === 0) {
        return reply.status(404).send({ error: 'slide not found' });
      }

      const result = await pool.query<{ id: string }>(
        `INSERT INTO blocks (slide_id, type, layout, content, data_source_id, chart_type, column_mapping, "order")
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7::jsonb, $8) RETURNING id, slide_id, type, layout, content, data_source_id, chart_type, column_mapping, "order"`,
        [slideId, type, layout, content, data_source_id, chart_type, column_mapping, order]
      );
      return reply.status(201).send(result.rows[0]);
    }
  );

  // Reorder blocks — requires JWT + canEditDeck
  fastify.patch<{ Params: ParamsWithBlockId; Body: ReorderBlocksBody }>(
    '/decks/:deckId/slides/:slideId/blocks/reorder',
    { preHandler: [jwtVerify] },
    async (request, reply) => {
      if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
      const { deckId, slideId } = request.params;
      if (!deckId || !slideId) return reply.status(400).send({ error: 'deckId and slideId required' });
      const allowed = await canEditDeck(deckId, request.userId);
      if (!allowed) {
        return reply.status(403).send({ error: 'no edit access' });
      }
      const blockIds = request.body?.blockIds;
      if (!Array.isArray(blockIds) || blockIds.length === 0) {
        return reply.status(400).send({ error: 'blockIds array required' });
      }
      const pool = getPool();
      for (let i = 0; i < blockIds.length; i++) {
        await pool.query(
          `UPDATE blocks SET "order" = $1 WHERE id = $2 AND slide_id = $3`,
          [i, blockIds[i], slideId]
        );
      }
      const result = await pool.query(
        `SELECT id, slide_id, type, layout, content, data_source_id, chart_type, column_mapping, "order"
         FROM blocks WHERE slide_id = $1 ORDER BY "order"`,
        [slideId]
      );
      return reply.send({ blocks: result.rows });
    }
  );

  // Get one block (view) — canViewDeck
  fastify.get<{ Params: ParamsWithBlockId }>(
    '/decks/:deckId/slides/:slideId/blocks/:blockId',
    { preHandler: [jwtOptional] },
    async (request, reply) => {
      const { deckId, slideId, blockId } = request.params;
      if (!deckId || !slideId || !blockId) {
        return reply.status(400).send({ error: 'deckId, slideId and blockId required' });
      }
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
        `SELECT b.id, b.slide_id, b.type, b.layout, b.content, b.data_source_id, b.chart_type, b.column_mapping, b."order"
         FROM blocks b
         JOIN slides s ON b.slide_id = s.id AND s.deck_id = $1
         WHERE b.id = $2 AND b.slide_id = $3`,
        [deckId, blockId, slideId]
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'block not found' });
      return reply.send(result.rows[0]);
    }
  );

  // Update block — requires JWT + canEditDeck
  fastify.patch<{ Params: ParamsWithBlockId; Body: UpdateBlockBody }>(
    '/decks/:deckId/slides/:slideId/blocks/:blockId',
    { preHandler: [jwtVerify] },
    async (request, reply) => {
      if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
      const { deckId, slideId, blockId } = request.params;
      if (!deckId || !slideId || !blockId) {
        return reply.status(400).send({ error: 'deckId, slideId and blockId required' });
      }
      const allowed = await canEditDeck(deckId, request.userId);
      if (!allowed) {
        return reply.status(403).send({ error: 'no edit access' });
      }
      const body = request.body as UpdateBlockBody | undefined;
      const pool = getPool();

      const existing = await pool.query(
        `SELECT b.id FROM blocks b JOIN slides s ON b.slide_id = s.id AND s.deck_id = $1 WHERE b.id = $2 AND b.slide_id = $3`,
        [deckId, blockId, slideId]
      );
      if (existing.rows.length === 0) return reply.status(404).send({ error: 'block not found' });

      const updates: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      if (body?.type !== undefined) {
        updates.push(`type = $${i++}`);
        values.push(body.type === 'chart' ? 'chart' : 'text');
      }
      if (body?.layout !== undefined) {
        updates.push(`layout = $${i++}::jsonb`);
        values.push(JSON.stringify(body.layout));
      }
      if (body?.content !== undefined) {
        updates.push(`content = $${i++}`);
        values.push(body.content);
      }
      if (body?.data_source_id !== undefined) {
        updates.push(`data_source_id = $${i++}`);
        values.push(body.data_source_id || null);
      }
      if (body?.chart_type !== undefined) {
        updates.push(`chart_type = $${i++}`);
        values.push(body.chart_type || null);
      }
      if (body?.column_mapping !== undefined) {
        updates.push(`column_mapping = $${i++}::jsonb`);
        values.push(JSON.stringify(body.column_mapping));
      }
      if (body?.order !== undefined) {
        updates.push(`"order" = $${i++}`);
        values.push(body.order);
      }

      if (values.length === 0) {
        const result = await pool.query(
          `SELECT id, slide_id, type, layout, content, data_source_id, chart_type, column_mapping, "order"
           FROM blocks WHERE id = $1`,
          [blockId]
        );
        return reply.send(result.rows[0]);
      }

      values.push(blockId);
      const result = await pool.query(
        `UPDATE blocks SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, slide_id, type, layout, content, data_source_id, chart_type, column_mapping, "order"`,
        values
      );
      return reply.send(result.rows[0]);
    }
  );

  // Delete block — requires JWT + canEditDeck
  fastify.delete<{ Params: ParamsWithBlockId }>(
    '/decks/:deckId/slides/:slideId/blocks/:blockId',
    { preHandler: [jwtVerify] },
    async (request, reply) => {
      if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
      const { deckId, slideId, blockId } = request.params;
      if (!deckId || !slideId || !blockId) {
        return reply.status(400).send({ error: 'deckId, slideId and blockId required' });
      }
      const allowed = await canEditDeck(deckId, request.userId);
      if (!allowed) {
        return reply.status(403).send({ error: 'no edit access' });
      }
      const pool = getPool();
      const result = await pool.query(
        `DELETE FROM blocks WHERE id = $1 AND slide_id = $2 RETURNING id`,
        [blockId, slideId]
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'block not found' });
      return reply.status(204).send();
    }
  );
}
