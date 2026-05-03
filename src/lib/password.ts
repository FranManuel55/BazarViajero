import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

/**
 * Hash a plaintext password. Use this to generate the value stored in
 * ADMIN_PASSWORD_HASH (see scripts/hash-password.mjs).
 */
export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Constant-time comparison via bcrypt. Returns false on any error
 * (e.g. invalid hash format) so callers can treat falsy as "no match".
 */
export async function verifyPassword(
  plain: string,
  hash: string | undefined | null
): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
