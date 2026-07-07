import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req, { params }) {
  const rows = await query(
    `SELECT id_manutencao, data, descricao, valor, id_recurso, (foto_estado_blob IS NOT NULL) AS tem_foto
     FROM Manutencao WHERE id_manutencao = ?`,
    [params.id]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req, { params }) {
  try {
    await query(`DELETE FROM Manutencao WHERE id_manutencao = ?`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao excluir manutenção.' }, { status: 500 });
  }
}
