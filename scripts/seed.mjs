#!/usr/bin/env node
/**
 * Seed dev database with sample data.
 * Usage: DATABASE_URL=postgres://... node scripts/seed.mjs
 * Or: RUN_SEED=true in dev Docker Compose (runs after migrations).
 *
 * Idempotent: checks if seed user exists before inserting.
 */
import pg from 'pg';
import bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Set DATABASE_URL to run seed.');
  process.exit(1);
}

const SEED_USER_EMAIL = 'demo@example.com';
const SEED_USER_PASSWORD = 'demo1234';

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();

  // Check if seed data already exists
  const { rows: existingUsers } = await client.query(
    'SELECT id FROM users WHERE email = $1',
    [SEED_USER_EMAIL]
  );

  if (existingUsers.length > 0) {
    console.log('Seed data already exists, skipping.');
    process.exit(0);
  }

  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 10);
  const { rows: users } = await client.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
    [SEED_USER_EMAIL, passwordHash]
  );
  const userId = users[0].id;
  console.log('Created demo user:', SEED_USER_EMAIL);

  // Create a sample deck
  const { rows: decks } = await client.query(
    `INSERT INTO decks (owner_id, visibility) VALUES ($1, 'public') RETURNING id`,
    [userId]
  );
  const deckId = decks[0].id;
  console.log('Created sample deck');

  // Create slides
  const { rows: slides } = await client.query(
    `INSERT INTO slides (deck_id, "order") VALUES
      ($1, 0),
      ($1, 1),
      ($1, 2)
     RETURNING id`,
    [deckId]
  );
  console.log('Created', slides.length, 'slides');

  // Create a data source with sample sales data
  const { rows: dataSources } = await client.query(
    `INSERT INTO data_sources (owner_id, deck_id, name) VALUES ($1, $2, 'Monthly Sales') RETURNING id`,
    [userId, deckId]
  );
  const dataSourceId = dataSources[0].id;

  // Insert sample data rows
  const sampleData = [
    { month: 'Jan', sales: 4200, expenses: 2800, profit: 1400 },
    { month: 'Feb', sales: 3800, expenses: 2600, profit: 1200 },
    { month: 'Mar', sales: 5100, expenses: 3100, profit: 2000 },
    { month: 'Apr', sales: 4700, expenses: 2900, profit: 1800 },
    { month: 'May', sales: 5500, expenses: 3200, profit: 2300 },
    { month: 'Jun', sales: 6200, expenses: 3500, profit: 2700 },
  ];

  for (let i = 0; i < sampleData.length; i++) {
    await client.query(
      `INSERT INTO data_rows (data_source_id, row_index, row_data) VALUES ($1, $2, $3)`,
      [dataSourceId, i, JSON.stringify(sampleData[i])]
    );
  }
  console.log('Created data source with', sampleData.length, 'rows');

  // Create blocks: title text, chart, summary text
  await client.query(
    `INSERT INTO blocks (slide_id, type, content) VALUES ($1, 'text', $2)`,
    [slides[0].id, '# Welcome to Interactive Document\n\nA demo presentation with live data.']
  );

  await client.query(
    `INSERT INTO blocks (slide_id, type, data_source_id, chart_type, column_mapping) VALUES ($1, 'chart', $2, $3, $4)`,
    [
      slides[1].id,
      dataSourceId,
      'bar',
      JSON.stringify({ x: 'month', y: 'sales' }),
    ]
  );

  await client.query(
    `INSERT INTO blocks (slide_id, type, content) VALUES ($1, 'text', $2)`,
    [slides[2].id, '## Summary\n\nSales trending upward with healthy profit margins.']
  );

  console.log('Created sample blocks');
  console.log('Seed complete.');
  console.log(`\nDemo credentials:\n  Email: ${SEED_USER_EMAIL}\n  Password: ${SEED_USER_PASSWORD}`);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
