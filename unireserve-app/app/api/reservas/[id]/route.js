import { NextResponse } from 'next/server';
import { query, rawQuery } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export async function GET(_req, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const rows = await query(`SELECT * FROM vw_reservas_detalhadas WHERE id_reserva = ?`, [params.id]);
  if (rows.length === 0) return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 });

  // Estudante só pode ver a própria reserva.
  if (session.tipo !== 'Servidor' && rows[0].id_usuario !== session.id_usuario) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }
  return NextResponse.json(rows);
}

// DELETE cancela a reserva usando a procedure sp_cancelar_reserva.
// - Estudante: só pode cancelar reservas próprias.
// - Servidor (admin): pode cancelar qualquer reserva.
export async function DELETE(_req, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const rows = await query(`SELECT id_usuario FROM Reserva WHERE id_reserva = ?`, [params.id]);
  if (rows.length === 0) return NextResponse.json({ error: 'Reserva não encontrada.' }, { status: 404 });

  if (session.tipo !== 'Servidor' && rows[0].id_usuario !== session.id_usuario) {
    return NextResponse.json({ error: 'Você só pode cancelar suas próprias reservas.' }, { status: 403 });
  }

  try {
    await rawQuery(`CALL sp_cancelar_reserva(?)`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao cancelar reserva.' }, { status: 500 });
  }
}
