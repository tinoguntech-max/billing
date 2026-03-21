require('dotenv').config()
const mysql = require('mysql2/promise')

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'billing_internet',
  })

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS pemasukan (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      kategori        VARCHAR(50)    NOT NULL,
      jumlah          DECIMAL(15,2)  NOT NULL,
      tgl_pemasukan   DATE           NOT NULL,
      keterangan      TEXT,
      created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ Tabel pemasukan berhasil dibuat')
  await conn.end()
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
