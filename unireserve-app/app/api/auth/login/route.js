import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { encodeSession, COOKIE_NAME } from '@/lib/session';
import { verifyPassword } from '@/lib/auth-server';

export async function POST(request) {
  const { email_institucional, senha } = await request.json();

  if (!email_institucional || !senha) {
    return NextResponse.json({ error: 'Informe email e senha.' }, { status: 400 });
  }

  const rows = await query(
    `SELECT u.id_usuario, u.nome, u.senha,
            e.id_usuario AS is_estudante, s.id_usuario AS is_servidor
     FROM Usuario u
     LEFT JOIN Estudante e ON e.id_usuario = u.id_usuario
     LEFT JOIN Servidor s ON s.id_usuario = u.id_usuario
     WHERE u.email_institucional = ?`,
    [email_institucional]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Email ou senha inválidos.' }, { status: 401 });
  }

  const user = rows[0];
  const ok = await verifyPassword(senha, user.senha);
  if (!ok) {
    return NextResponse.json({ error: 'Email ou senha inválidos.' }, { status: 401 });
  }

  // Servidor = administrador do sistema; Estudante = usuário comum.
  const tipo = user.is_servidor ? 'Servidor' : 'Estudante';
  const session = encodeSession({ id_usuario: user.id_usuario, nome: user.nome, tipo });

  const res = NextResponse.json({ ok: true, tipo });
  res.cookies.set(COOKIE_NAME, session, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
