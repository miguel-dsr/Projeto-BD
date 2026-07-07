import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, getSession } from '@/lib/auth-server';

// GET /api/usuarios - restrito a administradores (Servidor) pelo middleware.
// Nunca devolve a coluna `senha` (mesmo sendo um hash).
export async function GET() {
  try {
    const usuarios = await query(`
      SELECT u.id_usuario, u.nome, u.email_institucional,
             e.curso,
             s.cargo, s.departamento_vinculo
      FROM Usuario u
      LEFT JOIN Estudante e ON e.id_usuario = u.id_usuario
      LEFT JOIN Servidor s ON s.id_usuario = u.id_usuario
      ORDER BY u.id_usuario DESC
    `);

    const telefones = await query(`SELECT id_usuario, telefone FROM Usuario_Telefone`);

    const withPhones = usuarios.map((u) => ({
      ...u,
      tipo: u.curso ? 'Estudante' : u.cargo ? 'Servidor' : 'Não definido',
      telefones: telefones.filter((t) => t.id_usuario === u.id_usuario).map((t) => t.telefone),
    }));

    return NextResponse.json(withPhones);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao listar usuários.' }, { status: 500 });
  }
}

// POST /api/usuarios - o middleware libera esta rota para qualquer
// visitante (cadastro público), mas SÓ para criar conta de Estudante.
// Criar conta de Servidor (administrador) exige uma sessão de admin.
export async function POST(request) {
  const body = await request.json();
  const { nome, email_institucional, senha, tipo, curso, cargo, departamento_vinculo, telefones } = body;

  if (!nome || !email_institucional || !senha || !tipo) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
  }

  if (tipo === 'Servidor') {
    const session = getSession();
    if (!session || session.tipo !== 'Servidor') {
      return NextResponse.json(
        { error: 'Apenas administradores podem cadastrar contas de Servidor.' },
        { status: 403 }
      );
    }
  } else if (tipo !== 'Estudante') {
    return NextResponse.json({ error: 'Tipo de usuário inválido.' }, { status: 400 });
  }

  try {
    const senhaHash = await hashPassword(senha);

    const result = await query(
      `INSERT INTO Usuario (nome, email_institucional, senha) VALUES (?, ?, ?)`,
      [nome, email_institucional, senhaHash]
    );
    const id_usuario = result.insertId;

    if (tipo === 'Estudante') {
      await query(`INSERT INTO Estudante (id_usuario, curso) VALUES (?, ?)`, [id_usuario, curso || '']);
    } else {
      await query(
        `INSERT INTO Servidor (id_usuario, cargo, departamento_vinculo) VALUES (?, ?, ?)`,
        [id_usuario, cargo || '', departamento_vinculo || '']
      );
    }

    if (Array.isArray(telefones)) {
      for (const telefone of telefones.filter(Boolean)) {
        await query(`INSERT INTO Usuario_Telefone (id_usuario, telefone) VALUES (?, ?)`, [
          id_usuario,
          telefone,
        ]);
      }
    }

    return NextResponse.json({ id_usuario }, { status: 201 });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 });
  }
}
