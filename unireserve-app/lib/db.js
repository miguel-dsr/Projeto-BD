import mysql from 'mysql2/promise';

// Pool único reaproveitado entre requisições (camada de persistência).
// Todas as rotas de API (app/api/**) usam esta pool para falar com o MySQL
// via SQL puro (sem ORM), conforme decisão do projeto.
let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'unireserve',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// Retorna uma conexão dedicada da pool. Usada quando precisamos de uma
// TRANSAÇÃO explícita com SELECT ... FOR UPDATE (ex.: criação de reserva
// com verificação de conflito de horário), garantindo atomicidade.
export async function getConnection() {
  return getPool().getConnection();
}

// Necessário para chamar procedures com parâmetros OUT (não suportado
// diretamente pelo modo "execute" com placeholders nomeados no mysql2,
// usamos query() aqui em vez de execute()).
export async function rawQuery(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}
