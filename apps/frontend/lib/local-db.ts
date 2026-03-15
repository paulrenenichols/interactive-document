'use client';

import initSqlJs, { type Database } from 'sql.js';
import { get, set } from 'idb-keyval';
import {
  DataRowArraySchema,
  DataRowWithSourceArraySchema,
  type DataRowWithSource,
} from './schemas';

const INDEXED_DB_KEY = 'interactive-document-local-db';

let db: Database | null = null;
let initPromise: Promise<void> | null = null;

const WASM_BASE = 'https://sql.js.org/dist';

async function ensureInit(): Promise<Database> {
  if (db) return db;
  if (initPromise) {
    await initPromise;
    return db!;
  }
  initPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => `${WASM_BASE}/${file}`,
    });
    const stored = await get<Uint8Array>(INDEXED_DB_KEY);
    if (stored && stored.length > 0) {
      try {
        db = new SQL.Database(stored);
      } catch {
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }
    runSchema(db);
  })();
  await initPromise;
  return db!;
}

function runSchema(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY,
      deck_id TEXT,
      name TEXT NOT NULL,
      last_synced INTEGER
    );
    CREATE TABLE IF NOT EXISTS data_rows (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      row_index INTEGER NOT NULL,
      row_data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_data_rows_source ON data_rows(source_id);
  `);
}

/**
 * Initialize the local sql.js database (load WASM, optionally rehydrate from IndexedDB).
 * Call once before any chart/sync usage (e.g. in a provider or first sync).
 */
export async function initDb(): Promise<void> {
  await ensureInit();
}

/**
 * Validate and upsert data rows for a data source. Replaces existing rows for that source.
 * Call after fetching from API; rows are validated with DataRowArraySchema and data_source_id is set here.
 */
export async function upsertRows(
  sourceId: string,
  rows: unknown
): Promise<void> {
  const parsed = DataRowArraySchema.parse(Array.isArray(rows) ? rows : []);
  const validated = DataRowWithSourceArraySchema.parse(
    parsed.map((r) => ({ ...r, data_source_id: sourceId }))
  );
  const database = await ensureInit();
  database.run('BEGIN');
  try {
    const delStmt = database.prepare('DELETE FROM data_rows WHERE source_id = ?');
    delStmt.run([sourceId]);
    delStmt.free();
    const stmt = database.prepare(
      'INSERT OR REPLACE INTO data_rows (id, source_id, row_index, row_data) VALUES (?, ?, ?, ?)'
    );
    for (const row of validated) {
      stmt.run([
        row.id,
        row.data_source_id,
        row.row_index,
        JSON.stringify(row.row_data),
      ]);
    }
    stmt.free();
    database.run('COMMIT');
    await persistToIndexedDB();
  } catch (e) {
    database.run('ROLLBACK');
    throw e;
  }
}

/**
 * Read all rows for a data source from the local database.
 * Returns array of { id, row_index, row_data } with row_data parsed from JSON.
 */
export function queryRows(sourceId: string): DataRowWithSource[] {
  if (!db) return [];
  const stmt = db.prepare(
    'SELECT id, source_id, row_index, row_data FROM data_rows WHERE source_id = ? ORDER BY row_index'
  );
  stmt.bind([sourceId]);
  const rows: DataRowWithSource[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as {
      id: string;
      source_id: string;
      row_index: number;
      row_data: string;
    };
    rows.push({
      id: row.id,
      data_source_id: row.source_id,
      row_index: row.row_index,
      row_data: JSON.parse(row.row_data) as Record<string, unknown>,
    });
  }
  stmt.free();
  return rows;
}

/**
 * Get row count for a source (for total).
 */
export function getRowCount(sourceId: string): number {
  if (!db) return 0;
  const stmt = db.prepare(
    'SELECT COUNT(*) as c FROM data_rows WHERE source_id = ?'
  );
  stmt.bind([sourceId]);
  let count = 0;
  if (stmt.step()) {
    const row = stmt.getAsObject() as { c: number };
    count = row.c ?? 0;
  }
  stmt.free();
  return count;
}

async function persistToIndexedDB(): Promise<void> {
  if (!db || typeof window === 'undefined') return;
  const data = db.export();
  await set(INDEXED_DB_KEY, data);
}

/**
 * Export current database as Uint8Array (for backup/debug).
 */
export async function exportDb(): Promise<Uint8Array> {
  const database = await ensureInit();
  return database.export();
}

/**
 * Replace database with imported data. Use after rehydration from IndexedDB is done in initDb.
 */
export async function importDb(data: Uint8Array): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
  const SQL = await initSqlJs({
    locateFile: (file) => `${WASM_BASE}/${file}`,
  });
  db = new SQL.Database(data);
  runSchema(db);
  await set(INDEXED_DB_KEY, data);
}
