import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const rows = await query(`SELECT * FROM Bloco_Predio ORDER BY id_bloco DESC`);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { nome_bloco, campus, horario_abertura, horario_fechamento } = await request.json();
  if (!nome_bloco || !campus || !horario_abertura || !horario_fechamento) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
  }
  const result = await query(
    `INSERT INTO Bloco_Predio (nome_bloco, campus, horario_abertura, horario_fechamento) VALUES (?, ?, ?, ?)`,
    [nome_bloco, campus, horario_abertura, horario_fechamento]
  );
  return NextResponse.json({ id_bloco: result.insertId }, { status: 201 });
}
