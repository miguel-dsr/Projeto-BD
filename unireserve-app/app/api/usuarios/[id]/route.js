import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, getSession } from '@/lib/auth-server';

export async function GET(_req, { params }) {
  const { id } = params;
  const rows = await query(
    `SELECT u.id_usuario, u.nome, u.email_institucional,
            e.curso, s.cargo, s.departamento_vinculo
     FROM Usuario u
     LEFT JOIN Estudante e ON e.id_usuario = u.id_usuario
     LEFT JOIN Servidor s ON s.id_usuario = u.id_usuario
     WHERE u.id_usuario = ?`,
    [id]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  }
  const telefones = await query(`SELECT telefone FROM Usuario_Telefone WHERE id_usuario = ?`, [id]);
  const u = rows[0];
  return NextResponse.json({
    ...u,
    tipo: u.curso ? 'Estudante' : u.cargo ? 'Servidor' : 'Não definido',
    telefones: telefones.map((t) => t.telefone),
  });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const isAdmin = session.tipo === 'Servidor';
  const isSelf = Number(id) === session.id_usuario;
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  const body = await request.json();
  const { nome, email_institucional, senha, tipo, curso, cargo, departamento_vinculo, telefones } = body;

  try {
    // Senha: se vier vazia, mantém a atual; se vier preenchida, gera novo hash.
    if (senha && senha.trim() !== '') {
      const senhaHash = await hashPassword(senha);
      await query(`UPDATE Usuario SET senha = ? WHERE id_usuario = ?`, [senhaHash, id]);
    }

    await query(`UPDATE Usuario SET nome = ? WHERE id_usuario = ?`, [nome, id]);

    // Apenas administradores podem alterar email e o TIPO (Estudante/Servidor).
    if (isAdmin) {
      if (email_institucional) {
        await query(`UPDATE Usuario SET email_institucional = ? WHERE id_usuario = ?`, [
          email_institucional,
          id,
        ]);
      }
      if (tipo === 'Estudante' || tipo === 'Servidor') {
        await query(`DELETE FROM Estudante WHERE id_usuario = ?`, [id]);
        await query(`DELETE FROM Servidor WHERE id_usuario = ?`, [id]);
        if (tipo === 'Estudante') {
          await query(`INSERT INTO Estudante (id_usuario, curso) VALUES (?, ?)`, [id, curso || '']);
        } else {
          await query(
            `INSERT INTO Servidor (id_usuario, cargo, departamento_vinculo) VALUES (?, ?, ?)`,
            [id, cargo || '', departamento_vinculo || '']
          );
        }
      }
    }

    if (Array.isArray(telefones)) {
      await query(`DELETE FROM Usuario_Telefone WHERE id_usuario = ?`, [id]);
      for (const telefone of telefones.filter(Boolean)) {
        await query(`INSERT INTO Usuario_Telefone (id_usuario, telefone) VALUES (?, ?)`, [id, telefone]);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const session = getSession();
  if (!session || session.tipo !== 'Servidor') {
    return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
  }
  try {
    await query(`DELETE FROM Usuario WHERE id_usuario = ?`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Erro ao excluir usuário. Verifique se ele possui reservas vinculadas.' },
      { status: 500 }
    );
  }
}
