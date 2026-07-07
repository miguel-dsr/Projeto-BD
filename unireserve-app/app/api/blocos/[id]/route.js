import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req, { params }) {
  const rows = await query(`SELECT * FROM Bloco_Predio WHERE id_bloco = ?`, [params.id]);
  if (rows.length === 0) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(request, { params }) {
  const { nome_bloco, campus, horario_abertura, horario_fechamento } = await request.json();
  await query(
    `UPDATE Bloco_Predio SET nome_bloco = ?, campus = ?, horario_abertura = ?, horario_fechamento = ? WHERE id_bloco = ?`,
    [nome_bloco, campus, horario_abertura, horario_fechamento, params.id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  try {
    await query(`DELETE FROM Bloco_Predio WHERE id_bloco = ?`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Erro ao excluir. Existem recursos vinculados a este bloco.' },
      { status: 500 }
    );
  }
}
