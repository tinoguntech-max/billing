/**
 * Migration: tambah kolom konfigurasi OLT ke tabel pengaturan
 * Jalankan: node scripts/add-olt-config.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mysql = require('mysql2/promise')

async function run() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'billing_internet',
  })

  console.log('✅ Terhubung ke MySQL')

  const columns = [
    { name: 'olt_host',     def: 'VARCHAR(100)' },
    { name: 'olt_port',     def: "VARCHAR(10) DEFAULT '9100'" },
    { name: 'olt_user',     def: 'VARCHAR(100)' },
    { name: 'olt_password', def: 'VARCHAR(255)' },
  ]

  for (const col of columns) {
    try {
      await conn.query(`ALTER TABLE pengaturan ADD COLUMN ${col.name} ${col.def}`)
      console.log(`✅ Kolom '${col.name}' ditambahkan`)
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`ℹ️  Kolom '${col.name}' sudah ada, dilewati`)
      } else {
        throw e
      }
    }
  }

  console.log('\n🎉 Migration selesai!')
  await conn.end()
}

run().catch(err => { console.error('❌ Error:', err.message); process.exit(1) })
