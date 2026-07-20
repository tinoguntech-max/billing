const pool = require('../db')
const { sendWA } = require('./fonnte')

async function sendWhatsApp(phone, message) {
  try {
    const [[config]] = await pool.query(
      'SELECT wa_notif_enabled FROM pengaturan LIMIT 1'
    )

    if (!config || !config.wa_notif_enabled) {
      console.log('WhatsApp notification disabled')
      return { success: false, message: 'WhatsApp notification disabled' }
    }

    return await sendWA(phone, message)
  } catch (error) {
    console.error('Error sending WhatsApp:', error.message)
    return { success: false, message: error.message }
  }
}

async function sendOfflineNotification(pelanggan) {
  const [[config]] = await pool.query('SELECT nama_isp FROM pengaturan LIMIT 1')
  const namaISP = config?.nama_isp || 'ISP'

  const message = `🔴 *Notifikasi Koneksi*

Halo *${pelanggan.nama}*,

Kami mendeteksi koneksi internet Anda sedang *OFFLINE*.

📍 Detail:
• Username: ${pelanggan.pppoe_username || '-'}
• IP Address: ${pelanggan.ip_address || '-'}
• Waktu: ${new Date().toLocaleString('id-ID')}

Mohon periksa:
✓ Kabel modem terpasang dengan baik
✓ Lampu indikator modem menyala
✓ Tagihan sudah dibayar

Jika masalah berlanjut, hubungi kami.

_${namaISP}_`

  return await sendWA(pelanggan.telepon, message)
}

async function sendOnlineNotification(pelanggan) {
  const [[config]] = await pool.query('SELECT nama_isp FROM pengaturan LIMIT 1')
  const namaISP = config?.nama_isp || 'ISP'

  const message = `🟢 *Koneksi Kembali Normal*

Halo *${pelanggan.nama}*,

Koneksi internet Anda sudah *ONLINE* kembali.

📍 Detail:
• Username: ${pelanggan.pppoe_username || '-'}
• IP Address: ${pelanggan.ip_address || '-'}
• Waktu: ${new Date().toLocaleString('id-ID')}

Terima kasih atas kesabarannya.

_${namaISP}_`

  return await sendWA(pelanggan.telepon, message)
}

module.exports = {
  sendWhatsApp,
  sendOfflineNotification,
  sendOnlineNotification
}
