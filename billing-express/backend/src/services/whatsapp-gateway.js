const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const pool = require('../db')

let whatsappClient = null
let isReady = false
let qrCodeData = null

function initializeWhatsApp() {
  console.log('🚀 Initializing WhatsApp Gateway...')
  
  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: './whatsapp-session'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  })

  whatsappClient.on('qr', (qr) => {
    console.log('📱 Scan QR Code untuk login WhatsApp:')
    qrcode.generate(qr, { small: true })
    qrCodeData = qr
    console.log('\n💡 Atau buka http://localhost:5000/api/whatsapp/qr di browser')
  })

  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Gateway ready!')
    isReady = true
    qrCodeData = null
  })

  whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated')
  })

  whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failed:', msg)
    isReady = false
  })

  whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp disconnected:', reason)
    isReady = false
    qrCodeData = null
    
    // Auto-restart setelah 10 detik
    console.log('🔄 Will restart WhatsApp Gateway in 10 seconds...')
    setTimeout(() => {
      console.log('🔄 Restarting WhatsApp Gateway...')
      initializeWhatsApp()
    }, 10000)
  })

  // Handle error untuk mencegah crash
  whatsappClient.on('error', (error) => {
    console.error('❌ WhatsApp Gateway error:', error.message)
  })

  whatsappClient.initialize().catch(err => {
    console.error('❌ Failed to initialize WhatsApp:', err.message)
    isReady = false
    
    // Retry setelah 15 detik
    console.log('🔄 Will retry initialization in 15 seconds...')
    setTimeout(() => {
      console.log('🔄 Retrying WhatsApp initialization...')
      initializeWhatsApp()
    }, 15000)
  })
}

async function sendWhatsAppDirect(phone, message) {
  try {
    if (!whatsappClient || !isReady) {
      return {
        success: false,
        message: 'WhatsApp gateway not ready. Please scan QR code first.'
      }
    }

    // Format nomor telepon
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone
    }

    // Tambahkan @c.us untuk WhatsApp ID
    const chatId = formattedPhone + '@c.us'

    // Cek apakah nomor terdaftar di WhatsApp
    try {
      const isRegistered = await whatsappClient.isRegisteredUser(chatId)
      
      if (!isRegistered) {
        console.log('⚠️ Number not registered on WhatsApp:', formattedPhone)
        return {
          success: false,
          message: 'Nomor tidak terdaftar di WhatsApp',
          phone: formattedPhone
        }
      }
    } catch (checkError) {
      console.log('⚠️ Could not verify number, trying to send anyway:', formattedPhone)
    }

    // Kirim pesan
    await whatsappClient.sendMessage(chatId, message)
    
    console.log('✅ WhatsApp sent to:', formattedPhone)
    
    return {
      success: true,
      message: 'Message sent successfully',
      phone: formattedPhone
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error.message)
    
    // Handle specific errors
    let errorMessage = error.message
    if (error.message.includes('No LID')) {
      errorMessage = 'Nomor tidak terdaftar di WhatsApp atau format nomor salah'
    } else if (error.message.includes('not registered')) {
      errorMessage = 'Nomor tidak terdaftar di WhatsApp'
    }
    
    return {
      success: false,
      message: errorMessage,
      originalError: error.message
    }
  }
}

async function sendOfflineNotificationDirect(pelanggan) {
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

  return await sendWhatsAppDirect(pelanggan.telepon, message)
}

async function sendOnlineNotificationDirect(pelanggan) {
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

  return await sendWhatsAppDirect(pelanggan.telepon, message)
}

function getStatus() {
  return {
    ready: isReady,
    hasQR: qrCodeData !== null,
    qrCode: qrCodeData
  }
}

async function logout() {
  if (whatsappClient) {
    await whatsappClient.logout()
    await whatsappClient.destroy()
    whatsappClient = null
    isReady = false
    qrCodeData = null
    console.log('✅ WhatsApp logged out')
  }
}

module.exports = {
  initializeWhatsApp,
  sendWhatsAppDirect,
  sendOfflineNotificationDirect,
  sendOnlineNotificationDirect,
  getStatus,
  logout
}
