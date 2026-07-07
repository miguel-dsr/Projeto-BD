import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req, { params }) {
  const rows = await query(`SELECT * FROM Categoria_Recurso WHERE id_categoria = ?`, [params.id]);
  if (rows.length === 0) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(request, { params }) {
  const { nome } = await request.json();
  await query(`UPDATE Categoria_Recurso SET nome = ? WHERE id_categoria = ?`, [nome, params.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  try {
    await query(`DELETE FROM Categoria_Recurso WHERE id_categoria = ?`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Erro ao excluir. Existem recursos vinculados a esta categoria.' },
      { status: 500 }
    );
  }
}
