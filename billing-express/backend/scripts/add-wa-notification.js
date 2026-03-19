require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mysql = require('mysql2/promise')

async function addColumns() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'billing_internet',
  })

  console.log('✅ Terhubung ke database')

  // Tambah kolom untuk tracking status offline
  await conn.query(`
    ALTER TABLE pelanggan 
    ADD COLUMN IF NOT EXISTS last_online_check DATETIME,
    ADD COLUMN IF NOT EXISTS offline_notified TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS offline_since DATETIME
  `).catch(() => {})

  // Tambah kolom konfigurasi WhatsApp di pengaturan
  await conn.query(`
    ALTER TABLE pengaturan
    ADD COLUMN IF NOT EXISTS wa_api_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS wa_api_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS wa_notif_enabled TINYINT(1) DEFAULT 0
  `).catch(() => {})

  console.log('✅ Kolom untuk notifikasi WA berhasil ditambahkan')
  
  await conn.end()
}

addColumns().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
