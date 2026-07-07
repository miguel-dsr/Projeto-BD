import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';

export async function GET() {
  return NextResponse.json({ session: getSession() });
}
