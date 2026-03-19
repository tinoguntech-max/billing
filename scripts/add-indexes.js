// Jalankan sekali: node scripts/add-indexes.js
require('dotenv').config({ path: '.env.local' })
const mysql = require('mysql2/promise')

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'billing_internet',
  })

  const indexes = [
    ['pelanggan', 'idx_pelanggan_status',   'status'],
    ['pelanggan', 'idx_pelanggan_id_paket', 'id_paket'],
    ['pelanggan', 'idx_pelanggan_nama',     'nama'],
    ['pelanggan', 'idx_pelanggan_telepon',  'telepon'],
    ['tagihan',   'idx_tagihan_id_pelanggan','id_pelanggan'],
    ['tagihan',   'idx_tagihan_status',     'status'],
    ['tagihan',   'idx_tagihan_created_at', 'created_at'],
    ['tagihan',   'idx_tagihan_pel_bulan',  'id_pelanggan, created_at'],
    ['pembayaran','idx_pembayaran_tagihan', 'id_tagihan'],
    ['pembayaran','idx_pembayaran_tgl',     'tgl_bayar'],
  ]

  for (const [table, name, cols] of indexes) {
    try {
      await conn.query(`ALTER TABLE \`${table}\` ADD INDEX \`${name}\` (${cols})`)
      console.log(`✅ Index ${name} ditambahkan`)
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') console.log(`⏭  Index ${name} sudah ada`)
      else console.error(`❌ ${name}: ${e.message}`)
    }
  }

  await conn.end()
  console.log('\nSelesai!')
}

run().catch(console.error)
