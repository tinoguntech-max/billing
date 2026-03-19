const pool = require('../db')

async function sendWhatsApp(phone, message) {
  try {
    const [[config]] = await pool.query(
      'SELECT wa_api_url, wa_api_token, wa_notif_enabled FROM pengaturan LIMIT 1'
    )
    
    if (!config || !config.wa_notif_enabled) {
      console.log('WhatsApp notification disabled')
      return { success: false, message: 'WhatsApp notification disabled' }
    }
    
    if (!config.wa_api_url || !config.wa_api_token) {
      console.log('WhatsApp API not configured')
      return { success: false, message: 'WhatsApp API not configured' }
    }
    
    // Format nomor telepon (hapus karakter non-digit, tambah 62 jika perlu)
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone
    }
    
    // Kirim via Fonnte API (atau API lain yang kompatibel)
    const response = await fetch(config.wa_api_url, {
      method: 'POST',
      headers: {
        'Authorization': config.wa_api_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        countryCode: '62'
      })
    })
    
    const result = await response.json()
    console.log('WhatsApp sent:', { phone: formattedPhone, success: response.ok })
    
    return {
      success: response.ok,
      message: result.message || 'Message sent',
      data: result
    }
  } catch (error) {
    console.error('Error sending WhatsApp:', error.message)
    return {
      success: false,
      message: error.message
    }
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

  return await sendWhatsApp(pelanggan.telepon, message)
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

  return await sendWhatsApp(pelanggan.telepon, message)
}

module.exports = {
  sendWhatsApp,
  sendOfflineNotification,
  sendOnlineNotification
}
