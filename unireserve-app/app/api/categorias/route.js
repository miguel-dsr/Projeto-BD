import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const rows = await query(`SELECT * FROM Categoria_Recurso ORDER BY id_categoria DESC`);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { nome } = await request.json();
  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  const result = await query(`INSERT INTO Categoria_Recurso (nome) VALUES (?)`, [nome]);
  return NextResponse.json({ id_categoria: result.insertId }, { status: 201 });
}
