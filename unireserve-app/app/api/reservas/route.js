import { NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

// GET /api/reservas
// - Estudante (usuário comum): vê apenas as PRÓPRIAS reservas.
// - Servidor (admin): vê TODAS as reservas.
export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  let rows;
  if (session.tipo === 'Servidor') {
    rows = await query(`SELECT * FROM vw_reservas_detalhadas ORDER BY id_reserva DESC`);
  } else {
    rows = await query(
      `SELECT * FROM vw_reservas_detalhadas WHERE id_usuario = ? ORDER BY id_reserva DESC`,
      [session.id_usuario]
    );
  }
  return NextResponse.json(rows);
}

// POST /api/reservas
// A reserva é SEMPRE criada para o usuário logado (o estudante não pode
// reservar em nome de outra pessoa). Toda a operação roda em uma única
// transação com um SELECT ... FOR UPDATE bloqueador para evitar double
// booking (sobreposição de horário para o mesmo recurso).
export async function POST(request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { id_recurso, data_inicio, duracao_reserva, data_devolucao } = await request.json();

  if (!id_recurso || !data_inicio || !duracao_reserva || !data_devolucao) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
  }

  if (data_devolucao < data_inicio) {
    return NextResponse.json(
      { error: 'A data de devolução não pode ser anterior à data de início.' },
      { status: 400 }
    );
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1) Trava a linha do recurso e valida existência/disponibilidade.
    const [recursoRows] = await conn.execute(
      `SELECT indicador_disponibilidade FROM Recurso_Reservavel WHERE id_recurso = ? FOR UPDATE`,
      [id_recurso]
    );
    if (recursoRows.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 });
    }
    if (recursoRows[0].indicador_disponibilidade === 'N') {
      await conn.rollback();
      return NextResponse.json(
        { error: 'Este recurso está indisponível (desabilitado pelo administrador).' },
        { status: 400 }
      );
    }

    // 2) SELECT BLOQUEADORA: verifica se já existe reserva do mesmo recurso
    //    cujo intervalo [data_inicio, data_devolucao] se sobrepõe ao solicitado.
    //    Regra de sobreposição de intervalos:
    //      novo_inicio <= existente_fim  E  novo_fim >= existente_inicio
    //    O FOR UPDATE mantém o bloqueio até o COMMIT/ROLLBACK, impedindo
    //    que duas requisições concorrentes reservem o mesmo período.
    const [conflitos] = await conn.execute(
      `SELECT r.id_reserva
       FROM Reserva r
       JOIN Reserva_Recurso rr ON rr.id_reserva = r.id_reserva
       WHERE rr.id_recurso = ?
         AND r.data_inicio <= ?
         AND r.data_devolucao >= ?
       FOR UPDATE`,
      [id_recurso, data_devolucao, data_inicio]
    );

    if (conflitos.length > 0) {
      await conn.rollback();
      return NextResponse.json(
        { error: 'Este recurso já está reservado neste período' },
        { status: 400 }
      );
    }

    // 3) Sem conflito: cria a Reserva e o vínculo Reserva_Recurso.
    const [reservaResult] = await conn.execute(
      `INSERT INTO Reserva
         (data_solicitacao, aceitou_termo_solicitacao, TS_aceitacao_termo,
          data_inicio, duracao_reserva, data_devolucao, id_usuario)
       VALUES (NOW(), TRUE, NOW(), ?, ?, ?, ?)`,
      [data_inicio, duracao_reserva, data_devolucao, session.id_usuario]
    );
    const id_reserva = reservaResult.insertId;

    await conn.execute(
      `INSERT INTO Reserva_Recurso (id_reserva, id_recurso) VALUES (?, ?)`,
      [id_reserva, id_recurso]
    );

    await conn.commit();
    return NextResponse.json({ id_reserva }, { status: 201 });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar reserva.' }, { status: 500 });
  } finally {
    conn.release();
  }
}
