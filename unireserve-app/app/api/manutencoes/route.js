import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/manutencoes - junta Manutencao com Recurso_Reservavel.
export async function GET() {
  const rows = await query(`
    SELECT m.id_manutencao, m.data, m.descricao, m.valor, m.id_recurso,
           rr.nome AS nome_recurso,
           (m.foto_estado_blob IS NOT NULL) AS tem_foto,
           LEFT(m.foto_estado_blob, 4) AS assinatura
    FROM Manutencao m
    JOIN Recurso_Reservavel rr ON rr.id_recurso = m.id_recurso
    ORDER BY m.id_manutencao DESC
  `);

  // Classifica o arquivo (imagem x pdf) pelos primeiros bytes, sem
  // trafegar o BLOB inteiro na listagem.
  const withTipo = rows.map((r) => {
    let foto_tipo = null;
    if (r.tem_foto && r.assinatura) {
      const b = Buffer.from(r.assinatura);
      if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) {
        foto_tipo = 'pdf'; // %PDF
      } else {
        foto_tipo = 'imagem';
      }
    }
    const { assinatura, ...rest } = r;
    return { ...rest, foto_tipo };
  });

  return NextResponse.json(withTipo);
}

// POST /api/manutencoes - recebe multipart/form-data para permitir o
// upload de um arquivo (foto/PDF) armazenado na coluna BLOB.
export async function POST(request) {
  try {
    const formData = await request.formData();
    const data = formData.get('data');
    const descricao = formData.get('descricao');
    const valor = formData.get('valor');
    const id_recurso = formData.get('id_recurso');
    const file = formData.get('foto');

    if (!data || !descricao || !valor || !id_recurso) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }

    let buffer = null;
    if (file && typeof file !== 'string' && file.size > 0) {
      if (file.size > 16 * 1024 * 1024) {
        return NextResponse.json({ error: 'Arquivo muito grande. O limite é 16 MB.' }, { status: 413 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
    }

    const result = await query(
      `INSERT INTO Manutencao (data, descricao, valor, foto_estado_blob, id_recurso) VALUES (?, ?, ?, ?, ?)`,
      [data, descricao, valor, buffer, id_recurso]
    );

    return NextResponse.json({ id_manutencao: result.insertId }, { status: 201 });
  } catch (err) {
    console.error(err);
    // Arquivo maior que o max_allowed_packet configurado no MySQL.
    if (err.code === 'ER_NET_PACKET_TOO_LARGE') {
      return NextResponse.json(
        {
          error:
            'Arquivo grande demais para a configuração atual do MySQL. Aumente o max_allowed_packet do servidor.',
        },
        { status: 413 }
      );
    }
    return NextResponse.json({ error: 'Erro ao registrar manutenção.' }, { status: 500 });
  }
}
