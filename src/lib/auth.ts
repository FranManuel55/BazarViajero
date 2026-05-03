import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'bv_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

export interface SessionPayload extends JWTPayload {
  sub: string;
  role: 'admin';
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET no está configurado o es demasiado corto (mínimo 32 caracteres). Generá uno con `node scripts/gen-secret.mjs`.'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(username: string): Promise<string> {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });
    if (payload.role !== 'admin' || typeof payload.sub !== 'string') {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * For use inside route handlers (Node runtime). Reads the session
 * cookie and returns the payload if valid, or null otherwise.
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return await verifySession(token);
}

/**
 * Helper for protecting API mutators. Throws a Response with 401 when
 * the session is missing or invalid.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getServerSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}
