const router = require('express').Router()
const { sendWA } = require('../services/fonnte')

// GET /api/whatsapp/status - Status gateway (selalu ready karena pakai Fonnte API)
router.get('/status', (req, res) => {
  const token = process.env.FONNTE_TOKEN
  res.json({
    ready: !!token,
    provider: 'fonnte',
    message: token ? 'Fonnte API aktif' : 'FONNTE_TOKEN belum dikonfigurasi'
  })
})

// GET /api/whatsapp/qr - Tidak diperlukan untuk Fonnte (API based)
router.get('/qr', (req, res) => {
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
        <div class="success">✅ WhatsApp via Fonnte API</div>
        <p>Gateway menggunakan Fonnte API — tidak perlu scan QR.</p>
        <p>Pastikan <strong>FONNTE_TOKEN</strong> sudah dikonfigurasi di file <code>.env</code>.</p>
      </div>
    </body>
    </html>
  `)
})

// POST /api/whatsapp/logout - Tidak diperlukan untuk Fonnte
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Fonnte API tidak memerlukan logout' })
})

// POST /api/whatsapp/test - Test kirim pesan
router.post('/test', async (req, res) => {
  try {
    const { phone, message } = req.body
    if (!phone || !message) return res.status(400).json({ error: 'Phone and message required' })
    const result = await sendWA(phone, message)
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

    const result = await sendWA(pelanggan.telepon, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/whatsapp/kirim-notif - Trigger notif manual
router.post('/kirim-notif', async (req, res) => {
  try {
    const { kirimNotifJatuhTempo } = require('../services/wa-notif')
    const result = await kirimNotifJatuhTempo()
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
