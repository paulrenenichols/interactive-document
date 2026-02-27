import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? '';

export async function jwtVerify(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;
  if (!token) {
    return reply.status(401).send({ error: 'missing or invalid token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (payload.sub) {
      request.userId = payload.sub;
    }
  } catch {
    return reply.status(401).send({ error: 'missing or invalid token' });
  }
}

/** Optional JWT: attach userId if valid token present; do not 401 if missing. */
export async function jwtOptional(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;
  if (!token || !JWT_SECRET) return;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (payload.sub) {
      request.userId = payload.sub;
    }
  } catch {
    // ignore invalid token for optional auth
  }
}
