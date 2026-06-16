#!/usr/bin/env node
/**
 * Creates the `categories` table and seeds it with the initial categories.
 * Safe to run multiple times (idempotent).
 *
 * Usage:
 *   node scripts/seed-categories.mjs
 */
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

// Parse .env.local manually (no dotenv dependency)
const envContent = readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex);
  const value = trimmed.slice(eqIndex + 1).replace(/\\\$/g, '$');
  process.env[key] = value;
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const INITIAL_CATEGORIES = ['Ropa', 'Comida', 'Electrónica', 'Cocina', 'Librería'];

async function main() {
  console.log('🔧 Creando tabla categories...');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tabla creada (o ya existía).');

  console.log('🌱 Seeding categorías iniciales...');
  for (const name of INITIAL_CATEGORIES) {
    try {
      await client.execute({
        sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)',
        args: [name],
      });
      console.log(`   ✓ ${name}`);
    } catch (err) {
      console.log(`   ⚠ ${name} — ${err.message}`);
    }
  }

  console.log('🎉 Seed completado.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
