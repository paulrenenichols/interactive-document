import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPool } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
const SALT_ROUNDS = 10;

type RegisterBody = { email?: string; password?: string };
type LoginBody = { email?: string; password?: string };

function signToken(userId: string): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign(
    { sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, // 24h
    JWT_SECRET
  );
}

export async function register(
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body ?? {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return reply.status(400).send({ error: 'email and password are required' });
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return reply.status(400).send({ error: 'email is required' });
  }
  if (password.length < 8) {
    return reply.status(400).send({ error: 'password must be at least 8 characters' });
  }

  const pool = getPool();
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
      [trimmedEmail, password_hash]
    );
    const userId = result.rows[0].id;
    const token = signToken(userId);
    return reply.status(201).send({ token, user: { id: userId, email: trimmedEmail } });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === '23505') {
      return reply.status(409).send({ error: 'email already registered' });
    }
    throw err;
  }
}

export async function login(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body ?? {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return reply.status(400).send({ error: 'email and password are required' });
  }
  const trimmedEmail = email.trim().toLowerCase();

  const pool = getPool();
  const result = await pool.query<{ id: string; password_hash: string }>(
    `SELECT id, password_hash FROM users WHERE email = $1`,
    [trimmedEmail]
  );
  if (result.rows.length === 0) {
    return reply.status(401).send({ error: 'invalid email or password' });
  }
  const row = result.rows[0];
  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    return reply.status(401).send({ error: 'invalid email or password' });
  }
  const token = signToken(row.id);
  return reply.send({ token, user: { id: row.id, email: trimmedEmail } });
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', register);
  fastify.post('/auth/login', login);
}
