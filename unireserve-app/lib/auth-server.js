import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { COOKIE_NAME, decodeSession } from './session';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

// Lê a sessão atual em Server Components e Route Handlers (app/).
export function getSession() {
  const cookie = cookies().get(COOKIE_NAME);
  if (!cookie) return null;
  return decodeSession(cookie.value);
}
