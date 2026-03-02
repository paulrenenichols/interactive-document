import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { authRoutes } from './auth/routes.js';
import { deckRoutes } from './decks/routes.js';
import { dataSourceRoutes } from './data-sources/routes.js';

const fastify = Fastify({ logger: true });

const PORT = Number(process.env.PORT ?? 3000);
const DATABASE_URL = process.env.DATABASE_URL ?? '';

fastify.get('/', async () => ({ ok: true, message: 'API' }));

fastify.get('/health', async () => {
  return {
    ok: true,
    database: DATABASE_URL ? 'configured' : 'not configured',
  };
});

async function start() {
  try {
    await fastify.register(cors, { origin: true });
    await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
    await fastify.register(authRoutes);
    await fastify.register(deckRoutes);
    await fastify.register(dataSourceRoutes);
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
