import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

// Force Node runtime so bcryptjs works.
export const runtime = 'nodejs';

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_SECONDS = 10 * 60; // 10 minutes

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_SECONDS);
  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Demasiados intentos. Esperá ${Math.ceil(
          rl.resetInSeconds / 60
        )} minuto(s) antes de volver a intentar.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.resetInSeconds),
        },
      }
    );
  }

  let username: string;
  let password: string;
  try {
    const body = await request.json();
    username = String(body.username ?? '');
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json(
      { success: false, error: 'Cuerpo inválido' },
      { status: 400 }
    );
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !passwordHash) {
    console.error(
      '[auth] ADMIN_USERNAME o ADMIN_PASSWORD_HASH no están configurados.'
    );
    return NextResponse.json(
      { success: false, error: 'Servidor mal configurado' },
      { status: 500 }
    );
  }

  // Always run bcrypt to keep timing similar between "user not found"
  // and "wrong password" — avoids username enumeration via timing.
  const passwordOk = await verifyPassword(password, passwordHash);
  const userOk = username === expectedUsername;

  if (!userOk || !passwordOk) {
    return NextResponse.json(
      { success: false, error: 'Credenciales inválidas' },
      { status: 401 }
    );
  }

  const token = await signSession(username);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ success: true });
}
