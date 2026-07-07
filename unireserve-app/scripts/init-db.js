/* eslint-disable no-console */
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const files = ['01_schema.sql', '02_seed.sql', '03_view_procedure_trigger.sql'];

  for (const file of files) {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', file), 'utf8');
    console.log(`Executando ${file}...`);
    await connection.query(sql);
  }

  console.log('Banco unireserve criado e populado com sucesso.');
  await connection.end();
}

run().catch((err) => {
  console.error('Erro ao inicializar o banco:', err.message);
  process.exit(1);
});
