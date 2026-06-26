const pool = require('../db')
const { sendWA } = require('./fonnte')

function fmt(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

async function kirimNotifJatuhTempo() {
  try {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

    const [[config]] = await pool.query('SELECT nama_isp FROM pengaturan LIMIT 1')
    const namaISP = config?.nama_isp || 'ISP'

    // Tagihan jatuh tempo hari ini
    const [jatuhTempo] = await pool.query(`
      SELECT t.id, t.no_tagihan, t.periode, t.jumlah, t.tgl_jatuh_tempo,
             p.nama, p.telepon
      FROM tagihan t
      JOIN pelanggan p ON t.id_pelanggan = p.id
      WHERE t.status != 'Lunas'
        AND DATE(t.tgl_jatuh_tempo) = ?
        AND p.telepon IS NOT NULL
    `, [todayStr])

    console.log(`📅 Notif jatuh tempo: ${jatuhTempo.length} tagihan`)

    for (const t of jatuhTempo) {
      const msg = `📋 *Tagihan Jatuh Tempo - ${namaISP}*

Halo *${t.nama}*,

Tagihan Anda jatuh tempo *hari ini*.

• No. Tagihan : ${t.no_tagihan}
• Periode     : ${t.periode}
• Jumlah      : ${fmt(t.jumlah)}
• Jatuh Tempo : ${todayStr}

💳 *Pembayaran via Transfer:*
Bank BCA : *0482276308*
a.n : *Tiko Setiawan*

Mohon segera lakukan pembayaran.

Terima kasih 🙏
_${namaISP}_`

      const result = await sendWA(t.telepon, msg)
      console.log(`${result.success ? '✅' : '❌'} Notif jatuh tempo → ${t.nama} (${t.telepon}): ${result.message}`)
    }

    // Tagihan terlambat (lewat jatuh tempo, belum bayar)
    const [terlambat] = await pool.query(`
      SELECT t.id, t.no_tagihan, t.periode, t.jumlah, t.tgl_jatuh_tempo,
             p.nama, p.telepon,
             DATEDIFF(CURDATE(), t.tgl_jatuh_tempo) AS hari_terlambat
      FROM tagihan t
      JOIN pelanggan p ON t.id_pelanggan = p.id
      WHERE t.status != 'Lunas'
        AND DATE(t.tgl_jatuh_tempo) < ?
        AND p.telepon IS NOT NULL
    `, [todayStr])

    console.log(`⚠️ Notif terlambat: ${terlambat.length} tagihan`)

    for (const t of terlambat) {
      const msg = `⚠️ *Tagihan Terlambat - ${namaISP}*

Halo *${t.nama}*,

Tagihan Anda sudah *terlambat ${t.hari_terlambat} hari*.

• No. Tagihan : ${t.no_tagihan}
• Periode     : ${t.periode}
• Jumlah      : ${fmt(t.jumlah)}
• Jatuh Tempo : ${String(t.tgl_jatuh_tempo).slice(0,10)}

💳 *Pembayaran via Transfer:*
Bank BCA : *0482276308*
a.n : *Tiko Setiawan*

Mohon segera lakukan pembayaran untuk menghindari pemutusan layanan.

Terima kasih 🙏
_${namaISP}_`

      const result = await sendWA(t.telepon, msg)
      console.log(`${result.success ? '✅' : '❌'} Notif terlambat → ${t.nama} (${t.telepon}): ${result.message}`)
    }

    return { jatuhTempo: jatuhTempo.length, terlambat: terlambat.length }
  } catch (e) {
    console.error('❌ Error kirim notif WA:', e.message)
  }
}

function startWANotifScheduler() {
  console.log('🔔 WA Notif Scheduler started')

  // Jalankan setiap hari jam 08:00 pagi
  const jadwalNotif = () => {
    const now = new Date()
    const jam8 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0)
    let delay = jam8 - now
    if (delay < 0) delay += 24 * 60 * 60 * 1000 // besok jam 8

    console.log(`⏰ Notif WA dijadwalkan dalam ${Math.round(delay/1000/60)} menit`)

    setTimeout(async () => {
      await kirimNotifJatuhTempo()
      jadwalNotif() // jadwalkan lagi untuk besok
    }, delay)
  }

  jadwalNotif()
}

module.exports = { startWANotifScheduler, kirimNotifJatuhTempo }
