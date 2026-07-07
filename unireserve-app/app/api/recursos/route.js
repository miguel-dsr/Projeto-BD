import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/recursos - junta Recurso_Reservavel com Bloco_Predio, Categoria_Recurso
// e os subtipos Espaco_Fisico / Equipamento (mais de uma tabela no mesmo CRUD).
export async function GET() {
  const rows = await query(`
    SELECT rr.*, b.nome_bloco, b.campus, c.nome AS categoria,
           ef.capacidade,
           eq.numero_serie, eq.marca_modelo
    FROM Recurso_Reservavel rr
    JOIN Bloco_Predio b ON b.id_bloco = rr.id_bloco
    JOIN Categoria_Recurso c ON c.id_categoria = rr.id_categoria
    LEFT JOIN Espaco_Fisico ef ON ef.id_recurso = rr.id_recurso
    LEFT JOIN Equipamento eq ON eq.id_recurso = rr.id_recurso
    ORDER BY rr.id_recurso DESC
  `);
  const withTipo = rows.map((r) => ({
    ...r,
    tipo: r.capacidade != null ? 'Espaco_Fisico' : r.numero_serie != null ? 'Equipamento' : 'Genérico',
  }));
  return NextResponse.json(withTipo);
}

export async function POST(request) {
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

  if (!nome || !id_bloco || !id_categoria || !tipo) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO Recurso_Reservavel (nome, indicador_disponibilidade, descricao_regras, id_bloco, id_categoria)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, indicador_disponibilidade || 'S', descricao_regras || '', id_bloco, id_categoria]
    );
    const id_recurso = result.insertId;

    if (tipo === 'Espaco_Fisico') {
      await query(`INSERT INTO Espaco_Fisico (id_recurso, capacidade) VALUES (?, ?)`, [
        id_recurso,
        capacidade || 0,
      ]);
    } else if (tipo === 'Equipamento') {
      await query(`INSERT INTO Equipamento (id_recurso, numero_serie, marca_modelo) VALUES (?, ?, ?)`, [
        id_recurso,
        numero_serie || 0,
        marca_modelo || '',
      ]);
    }

    return NextResponse.json({ id_recurso }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar recurso.' }, { status: 500 });
  }
}
