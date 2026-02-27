#!/usr/bin/env node
/**
 * Run SQL migrations in order.
 * Usage: DATABASE_URL=postgres://... node scripts/run-migrations.mjs
 * Or: npm run migrate (if script is added to package.json)
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
  for (const file of sqlFiles) {
    const path = join(migrationsDir, file);
    const sql = await readFile(path, 'utf8');
    console.log('Running', file);
    await client.query(sql);
  }
  console.log('Migrations complete.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
