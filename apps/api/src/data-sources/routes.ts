import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Papa from 'papaparse';
import { getPool } from '../db.js';
import { canEditDeck, canViewDataSource } from '../permissions.js';
import { jwtVerify, jwtOptional } from '../auth/jwtMiddleware.js';

type ParamsWithDataSourceId = { dataSourceId?: string };

export async function dataSourceRoutes(fastify: FastifyInstance) {
  // List data sources — scoped to authenticated user (owner_id)
  fastify.get('/data-sources', { preHandler: [jwtVerify] }, async (request, reply) => {
    if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
    const deckId = (request.query as { deckId?: string }).deckId;
    const pool = getPool();
    let result;
    if (deckId) {
      result = await pool.query(
        `SELECT id, owner_id, deck_id, name, created_at FROM data_sources
         WHERE owner_id = $1 AND (deck_id = $2 OR deck_id IS NULL) ORDER BY created_at DESC`,
        [request.userId, deckId]
      );
    } else {
      result = await pool.query(
        `SELECT id, owner_id, deck_id, name, created_at FROM data_sources
         WHERE owner_id = $1 ORDER BY created_at DESC`,
        [request.userId]
      );
    }
    return reply.send({ dataSources: result.rows });
  });

  // Upload CSV — create data source and store rows
  // Query params: deckId (optional), name (optional). Body: multipart file.
  fastify.post(
    '/data-sources/upload',
    { preHandler: [jwtVerify] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'missing or invalid token' });
      const deckId = (request.query as { deckId?: string }).deckId;
      const nameOverride = (request.query as { name?: string }).name;
      if (deckId) {
        const allowed = await canEditDeck(deckId, request.userId);
        if (!allowed) {
          return reply.status(403).send({ error: 'no edit access to deck' });
        }
      }
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'file required' });
      }
      const buffer = await data.toBuffer();
      const csvText = buffer.toString('utf-8');
      const name = nameOverride || (data.filename || 'Untitled').replace(/\.csv$/i, '') || 'Untitled';

      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        return reply.status(400).send({
          error: 'invalid CSV',
          details: parsed.errors.map((e: { message: string }) => e.message),
        });
      }

      const rows = parsed.data;
      const pool = getPool();

      const dsResult = await pool.query<{ id: string }>(
        `INSERT INTO data_sources (owner_id, deck_id, name) VALUES ($1, $2, $3) RETURNING id`,
        [request.userId, deckId ?? null, name]
      );
      const dataSourceId = dsResult.rows[0].id;

      for (let i = 0; i < rows.length; i++) {
        await pool.query(
          `INSERT INTO data_rows (data_source_id, row_index, row_data) VALUES ($1, $2, $3)`,
          [dataSourceId, i, JSON.stringify(rows[i])]
        );
      }

      return reply.status(201).send({
        id: dataSourceId,
        name,
        deck_id: deckId || null,
        rowCount: rows.length,
      });
    }
  );

  // Get data source — canViewDataSource
  fastify.get<{ Params: ParamsWithDataSourceId }>(
    '/data-sources/:dataSourceId',
    { preHandler: [jwtOptional] },
    async (request, reply) => {
      const dataSourceId = request.params.dataSourceId;
      if (!dataSourceId) return reply.status(400).send({ error: 'dataSourceId required' });
      const shareToken = (request.query as { token?: string }).token;
      const allowed = await canViewDataSource(
        dataSourceId,
        request.userId ?? null,
        shareToken ?? null
      );
      if (!allowed) {
        if (request.userId) {
          return reply.status(403).send({ error: 'no view access' });
        }
        return reply.status(401).send({ error: 'authentication or share token required' });
      }
      const pool = getPool();
      const result = await pool.query(
        `SELECT id, owner_id, deck_id, name, created_at FROM data_sources WHERE id = $1`,
        [dataSourceId]
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'data source not found' });
      return reply.send(result.rows[0]);
    }
  );

  // Get rows — canViewDataSource, optional limit/offset for pagination
  fastify.get<{ Params: ParamsWithDataSourceId }>(
    '/data-sources/:dataSourceId/rows',
    { preHandler: [jwtOptional] },
    async (request, reply) => {
      const dataSourceId = request.params.dataSourceId;
      if (!dataSourceId) return reply.status(400).send({ error: 'dataSourceId required' });
      const shareToken = (request.query as { token?: string }).token;
      const allowed = await canViewDataSource(
        dataSourceId,
        request.userId ?? null,
        shareToken ?? null
      );
      if (!allowed) {
        if (request.userId) {
          return reply.status(403).send({ error: 'no view access' });
        }
        return reply.status(401).send({ error: 'authentication or share token required' });
      }
      const limit = Math.min(Number((request.query as { limit?: string }).limit) || 1000, 10000);
      const offset = Number((request.query as { offset?: string }).offset) || 0;

      const pool = getPool();
      const result = await pool.query(
        `SELECT id, row_index, row_data FROM data_rows
         WHERE data_source_id = $1 ORDER BY row_index LIMIT $2 OFFSET $3`,
        [dataSourceId, limit, offset]
      );
      const countResult = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM data_rows WHERE data_source_id = $1`,
        [dataSourceId]
      );
      const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

      return reply.send({
        rows: result.rows,
        total,
        limit,
        offset,
      });
    }
  );
}
