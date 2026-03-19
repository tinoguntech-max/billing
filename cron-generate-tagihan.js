// cron-generate-tagihan.js
// Jalankan dengan: node cron-generate-tagihan.js
// Atau setup di PM2 untuk production

require('dotenv').config({ path: '.env.local' })
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billing_internet',
  enableKeepAlive: true,
  connectionLimit: 1,
})

async function generateTagihan() {
  try {
    console.log(`[${new Date().toLocaleString('id-ID')}] Memulai generate tagihan otomatis...`)

    const conn = await pool.getConnection()

    // Ambil semua pelanggan aktif dengan tgl_bergabung
    const [pelanggan] = await conn.query(`
      SELECT p.id, p.nama, p.tgl_bergabung, p.id_paket, pk.harga
      FROM pelanggan p
      JOIN paket pk ON p.id_paket = pk.id
      WHERE p.status = 'Aktif' AND p.tgl_bergabung IS NOT NULL
    `)

    let created = 0
    const today = new Date()
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0')
    const currentYear = String(today.getFullYear())

    for (const p of pelanggan) {
      const tglBergabung = new Date(p.tgl_bergabung)
      const tanggalBergabung = tglBergabung.getDate()

      // Tentukan tanggal jatuh tempo (3 hari setelah tanggal billing)
      let tglJatuhTempo = new Date(today.getFullYear(), today.getMonth(), tanggalBergabung + 3)

      // Jika tanggal bergabung > hari ini di bulan ini, gunakan bulan depan
      if (tanggalBergabung > today.getDate() && today.getMonth() === tglBergabung.getMonth()) {
        tglJatuhTempo = new Date(today.getFullYear(), today.getMonth() + 1, tanggalBergabung + 3)
      }

      const periode = new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long'
      }).format(tglJatuhTempo)

      // Generate nomor tagihan
      const [[{ count }]] = await conn.query(`
        SELECT COUNT(*) as count FROM tagihan
        WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
      `, [today.getMonth() + 1, today.getFullYear()])

      const seqNum = String(count + 1).padStart(3, '0')
      const noTagihan = `INV-${currentMonth}${currentYear}-${seqNum}`

      // Check apakah tagihan bulan ini sudah ada
      const [[existing]] = await conn.query(`
        SELECT id FROM tagihan
        WHERE id_pelanggan = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
      `, [p.id, today.getMonth() + 1, today.getFullYear()])

      if (!existing) {
        await conn.query(`
          INSERT INTO tagihan (no_tagihan, id_pelanggan, periode, jumlah, tgl_jatuh_tempo, status)
          VALUES (?, ?, ?, ?, ?, 'Belum Bayar')
        `, [noTagihan, p.id, periode, p.harga, tglJatuhTempo.toISOString().split('T')[0]])
        created++
        console.log(`  ✔ Tagihan ${noTagihan} untuk ${p.nama}`)
      }
    }

    conn.release()
    console.log(`[${new Date().toLocaleString('id-ID')}] Generate selesai: ${created} tagihan baru dibuat\n`)
  } catch (e) {
    console.error('❌ Error:', e.message)
  }
}

// Setup interval - jalankan setiap hari pukul 00:00 (tengah malam)
function scheduleNextRun() {
  const now = new Date()
  const nextRun = new Date()
  nextRun.setDate(nextRun.getDate() + 1)
  nextRun.setHours(0, 0, 0, 0)

  const timeUntilNextRun = nextRun - now
  console.log(`⏰ Jadwal: Generate tagihan akan berjalan setiap hari pukul 00:00`)
  console.log(`⏳ Waktu sampai eksekusi berikutnya: ${(timeUntilNextRun / 1000 / 60).toFixed(0)} menit\n`)

  setTimeout(() => {
    generateTagihan()
    setInterval(generateTagihan, 24 * 60 * 60 * 1000) // Setiap 24 jam
  }, timeUntilNextRun)
}

// Generate pertama kali
generateTagihan()
scheduleNextRun()

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await pool.end()
  process.exit(0)
})
