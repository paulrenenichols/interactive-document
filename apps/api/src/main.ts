import Fastify from 'fastify';

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
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
