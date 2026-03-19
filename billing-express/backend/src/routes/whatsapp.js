const router = require('express').Router()
const { getStatus, logout, sendWhatsAppDirect } = require('../services/whatsapp-gateway')

// GET /api/whatsapp/status - Cek status WhatsApp gateway
router.get('/status', (req, res) => {
  const status = getStatus()
  res.json(status)
})

// GET /api/whatsapp/qr - Tampilkan QR code untuk scan
router.get('/qr', (req, res) => {
  const status = getStatus()
  
  if (status.ready) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Gateway</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
          .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .success { color: #10b981; font-size: 24px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅ WhatsApp Connected!</div>
          <p>WhatsApp gateway sudah terhubung dan siap digunakan.</p>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh</button>
        </div>
      </body>
      </html>
    `)
  } else if (status.hasQR && status.qrCode) {
    // Generate QR code image
    const QRCode = require('qrcode')
    QRCode.toDataURL(status.qrCode, (err, url) => {
      if (err) {
        res.status(500).send('Error generating QR code')
        return
      }
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>WhatsApp Gateway - Scan QR</title>
          <meta http-equiv="refresh" content="5">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
            .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .qr-code { margin: 20px 0; }
            .instructions { text-align: left; margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
            .instructions li { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 Scan QR Code</h1>
            <p>Scan QR code ini dengan WhatsApp Anda</p>
            <div class="qr-code">
              <img src="${url}" alt="QR Code" style="max-width: 300px;">
            </div>
            <div class="instructions">
              <strong>Cara scan:</strong>
              <ol>
                <li>Buka WhatsApp di HP Anda</li>
                <li>Tap menu (⋮) > Perangkat Tertaut</li>
                <li>Tap "Tautkan Perangkat"</li>
                <li>Scan QR code di atas</li>
              </ol>
            </div>
            <p style="color: #666; font-size: 12px;">Halaman akan refresh otomatis setiap 5 detik</p>
          </div>
        </body>
        </html>
      `)
    })
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Gateway</title>
        <meta http-equiv="refresh" content="3">
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
          .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .loading { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loading">⏳ Initializing WhatsApp Gateway...</div>
          <p>Mohon tunggu, sedang memuat QR code...</p>
        </div>
      </body>
      </html>
    `)
  }
})

// POST /api/whatsapp/logout - Logout dari WhatsApp
router.post('/logout', async (req, res) => {
  try {
    await logout()
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/whatsapp/test - Test kirim pesan
router.post('/test', async (req, res) => {
  try {
    const { phone, message } = req.body
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message required' })
    }
    
    const result = await sendWhatsAppDirect(phone, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/whatsapp/send-to-customer/:id - Kirim pesan ke pelanggan
router.post('/send-to-customer/:id', async (req, res) => {
  try {
    const { message } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' })
    }
    
    // Ambil data pelanggan
    const pool = require('../db')
    const [[pelanggan]] = await pool.query(
      'SELECT nama, telepon FROM pelanggan WHERE id = ?',
      [req.params.id]
    )
    
    if (!pelanggan) {
      return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' })
    }
    
    if (!pelanggan.telepon || pelanggan.telepon === '-' || !pelanggan.telepon.trim()) {
      return res.status(400).json({ success: false, message: 'Pelanggan tidak memiliki nomor telepon yang valid' })
    }
    
    // Kirim pesan
    const result = await sendWhatsAppDirect(pelanggan.telepon, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
