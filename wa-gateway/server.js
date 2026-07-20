require('dotenv').config()
const express = require('express')
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode   = require('qrcode')

const app  = express()
const PORT = process.env.PORT || 3001
const API_KEY = process.env.API_KEY || 'tamnet-gateway-key'

app.use(express.json())

// ── State ──────────────────────────────────────────────────────────────────
let isReady  = false
let qrData   = null
let client   = null

// ── Init WhatsApp ──────────────────────────────────────────────────────────
function initWA() {
  console.log('🚀 Initializing WhatsApp...')
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './wa-session' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu']
    }
  })

  client.on('qr', qr => {
    console.log('📱 QR Code siap — buka http://localhost:' + PORT + '/qr')
    qrData  = qr
    isReady = false
  })

  client.on('ready', () => {
    console.log('✅ WhatsApp siap!')
    isReady = true
    qrData  = null
  })

  client.on('authenticated', () => console.log('✅ Authenticated'))

  client.on('auth_failure', () => {
    console.log('❌ Auth failed, restart...')
    isReady = false
    setTimeout(initWA, 5000)
  })

  client.on('disconnected', reason => {
    console.log('⚠️ Disconnected:', reason)
    isReady = false
    setTimeout(initWA, 10000)
  })

  client.initialize().catch(err => {
    console.error('❌ Init error:', err.message)
    setTimeout(initWA, 15000)
  })
}

// ── Middleware auth ────────────────────────────────────────────────────────
function auth(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.key
  if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

// ── Routes ─────────────────────────────────────────────────────────────────

// Status
app.get('/status', (req, res) => {
  res.json({ ready: isReady, hasQR: !!qrData })
})

// QR Code halaman HTML
app.get('/qr', async (req, res) => {
  if (isReady) return res.send('<h2 style="font-family:sans-serif;color:green">✅ WhatsApp Terhubung!</h2>')
  if (!qrData) return res.send('<h2 style="font-family:sans-serif">⏳ Menunggu QR... refresh sebentar lagi</h2><meta http-equiv="refresh" content="3">')
  const img = await qrcode.toDataURL(qrData)
  res.send(`<!DOCTYPE html><html><head><title>WA Gateway QR</title><meta http-equiv="refresh" content="30"></head>
  <body style="font-family:sans-serif;text-align:center;padding:40px">
  <h2>📱 Scan QR dengan WhatsApp</h2>
  <img src="${img}" style="max-width:300px"><br>
  <p style="color:#666">Buka WA → Perangkat Tertaut → Tautkan Perangkat</p>
  <p style="color:#999;font-size:12px">Halaman refresh otomatis setiap 30 detik</p>
  </body></html>`)
})

// Kirim pesan
app.post('/send', auth, async (req, res) => {
  const { phone, message } = req.body
  if (!phone || !message) return res.status(400).json({ error: 'phone dan message wajib diisi' })
  if (!isReady) return res.status(503).json({ success: false, error: 'WhatsApp belum siap' })

  try {
    let nomor = String(phone).replace(/\D/g, '')
    if (nomor.startsWith('0')) nomor = '62' + nomor.substring(1)
    else if (!nomor.startsWith('62')) nomor = '62' + nomor
    const chatId = nomor + '@c.us'

    await client.sendMessage(chatId, message)
    console.log(`✅ Terkirim ke ${nomor}`)
    res.json({ success: true, message: 'Terkirim', phone: nomor })
  } catch (e) {
    console.error('❌ Error:', e.message)
    res.status(500).json({ success: false, error: e.message })
  }
})

// Logout
app.post('/logout', auth, async (req, res) => {
  try {
    await client.logout()
    isReady = false
    res.json({ success: true })
    setTimeout(initWA, 3000)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ WA Gateway running on http://localhost:${PORT}`)
  console.log(`🔑 API Key: ${API_KEY}`)
  console.log(`📱 QR Code: http://localhost:${PORT}/qr`)
  initWA()
})
