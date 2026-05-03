#!/usr/bin/env node
/**
 * Generates a bcrypt hash for ADMIN_PASSWORD_HASH.
 *
 * Usage:
 *   node scripts/hash-password.mjs "miContraseñaSegura"
 *
 * Then copy the printed hash into .env.local:
 *   ADMIN_PASSWORD_HASH=$2b$12$....
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "<contraseña>"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
