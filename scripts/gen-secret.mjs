#!/usr/bin/env node
/**
 * Generates a 64-byte random secret for JWT_SECRET.
 *
 * Usage:
 *   node scripts/gen-secret.mjs
 *
 * Then copy the printed value into .env.local:
 *   JWT_SECRET=...
 */
import { randomBytes } from 'node:crypto';

console.log(randomBytes(64).toString('base64url'));
