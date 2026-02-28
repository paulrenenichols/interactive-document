#!/usr/bin/env node
/**
 * Run SQL migrations in order.
 * Usage: DATABASE_URL=postgres://... node scripts/run-migrations.mjs
 * Or: pnpm run migrate (from repo root)
 */
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const migrationsDir = join(repoRoot, 'apps', 'api', 'migrations');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Set DATABASE_URL to run migrations.');
  process.exit(1);
}

const files = await readdir(migrationsDir);
const sqlFiles = files
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (sqlFiles.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

const client = new pg.Client({ connectionString: databaseUrl });
try {
  await client.connect();
  // Ensure schema_migrations table exists to track applied versions
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await client.query('SELECT version FROM schema_migrations');
  const appliedVersions = new Set(rows.map((row) => row.version));

  const pendingMigrations = sqlFiles
    .map((file) => ({
      file,
      version: file.replace(/\\.sql$/, ''),
    }))
    .filter(({ version }) => !appliedVersions.has(version));

  if (pendingMigrations.length === 0) {
    console.log('No new migrations to apply.');
  } else {
    for (const { file, version } of pendingMigrations) {
      const path = join(migrationsDir, file);
      const sql = await readFile(path, 'utf8');
      console.log('Running', file);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version],
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('Migrations complete.');
  }
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
