import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req, { params }) {
  const rows = await query(
    `SELECT rr.*, b.nome_bloco, b.campus, c.nome AS categoria,
            ef.capacidade, eq.numero_serie, eq.marca_modelo
     FROM Recurso_Reservavel rr
     JOIN Bloco_Predio b ON b.id_bloco = rr.id_bloco
     JOIN Categoria_Recurso c ON c.id_categoria = rr.id_categoria
     LEFT JOIN Espaco_Fisico ef ON ef.id_recurso = rr.id_recurso
     LEFT JOIN Equipamento eq ON eq.id_recurso = rr.id_recurso
     WHERE rr.id_recurso = ?`,
    [params.id]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({ ...r, tipo: r.capacidade != null ? 'Espaco_Fisico' : r.numero_serie != null ? 'Equipamento' : 'Genérico' });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const {
    nome,
    indicador_disponibilidade,
    descricao_regras,
    id_bloco,
    id_categoria,
    tipo,
    capacidade,
    numero_serie,
    marca_modelo,
  } = body;

  try {
    await query(
      `UPDATE Recurso_Reservavel
       SET nome = ?, indicador_disponibilidade = ?, descricao_regras = ?, id_bloco = ?, id_categoria = ?
       WHERE id_recurso = ?`,
      [nome, indicador_disponibilidade, descricao_regras, id_bloco, id_categoria, id]
    );

    await query(`DELETE FROM Espaco_Fisico WHERE id_recurso = ?`, [id]);
    await query(`DELETE FROM Equipamento WHERE id_recurso = ?`, [id]);

    if (tipo === 'Espaco_Fisico') {
      await query(`INSERT INTO Espaco_Fisico (id_recurso, capacidade) VALUES (?, ?)`, [id, capacidade || 0]);
    } else if (tipo === 'Equipamento') {
      await query(`INSERT INTO Equipamento (id_recurso, numero_serie, marca_modelo) VALUES (?, ?, ?)`, [
        id,
        numero_serie || 0,
        marca_modelo || '',
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao atualizar recurso.' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await query(`DELETE FROM Recurso_Reservavel WHERE id_recurso = ?`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Erro ao excluir. Existem reservas ou manutenções vinculadas a este recurso.' },
      { status: 500 }
    );
  }
}
