require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')

const app = express()

app.use(cors({ origin: true, credentials: true })) // Allow all origins
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Serve frontend static files (production)
const frontendPath = path.join(__dirname, '../frontend/dist')
if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath))
  console.log('📦 Serving frontend from:', frontendPath)
}

// API Routes
app.use('/api/auth',       require('./src/routes/auth'))
app.use('/api/karyawan',   require('./src/routes/karyawan'))
app.use('/api/dashboard',  require('./src/routes/dashboard'))
app.use('/api/pelanggan',  require('./src/routes/pelanggan'))
app.use('/api/paket',      require('./src/routes/paket'))
app.use('/api/tagihan',    require('./src/routes/tagihan'))
app.use('/api/pembayaran', require('./src/routes/pembayaran'))
app.use('/api/pengaturan',  require('./src/routes/pengaturan'))
app.use('/api/pengeluaran', require('./src/routes/pengeluaran'))
app.use('/api/pemasukan',  require('./src/routes/pemasukan'))
app.use('/api/mikrotik',   require('./src/routes/mikrotik'))
app.use('/api/whatsapp',   require('./src/routes/whatsapp'))

// Handle React Router - serve index.html for all non-API routes
if (require('fs').existsSync(frontendPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`)
  
  // WhatsApp via Fonnte API
  console.log('✅ WhatsApp notifications via Fonnte API')
  
  // Start connection monitoring service
  try {
    const { startMonitoring } = require('./src/services/monitor')
    startMonitoring()
  } catch (error) {
    console.error('⚠️ Monitoring service failed to start:', error.message)
  }

  // Start WA notification scheduler
  try {
    const { startWANotifScheduler } = require('./src/services/wa-notif')
    startWANotifScheduler()
  } catch (error) {
    console.error('⚠️ WA Notif Scheduler failed to start:', error.message)
  }

  // Auto generate tagihan setiap tanggal 1
  try {
    const scheduleAutoGenerate = () => {
      const now  = new Date()
      const next = new Date(now.getFullYear(), now.getMonth() + (now.getDate() === 1 && now.getHours() < 1 ? 0 : 1), 1, 0, 1, 0)
      const delay = next - now
      
      // Batasi delay agar tidak melebihi batas 32-bit signed integer (maksimal ~24.8 hari).
      // Kita jalankan interval pengecekan maksimal setiap 1 jam (3600000 ms) agar aman.
      const MAX_DELAY = 3600000 
      const isActualRun = delay <= MAX_DELAY
      const currentDelay = Math.min(delay, MAX_DELAY)
      
      if (isActualRun) {
        console.log(`📅 Auto generate tagihan dijadwalkan dalam ${Math.round(delay/1000/60)} menit`)
      }
      
      setTimeout(async () => {
        try {
          if (isActualRun) {
            const pool = require('./src/db')
            const today = new Date()
            const periode = new Intl.DateTimeFormat('id-ID', { year:'numeric', month:'long' }).format(today)
            const [existing] = await pool.query('SELECT COUNT(*) AS c FROM tagihan WHERE periode=?', [periode])
            if (existing[0].c === 0) {
              const axios = require('axios')
              const PORT = process.env.PORT || 5000
              await axios.post(`http://localhost:${PORT}/api/tagihan/generate-otomatis`)
              console.log('✅ Auto generate tagihan berhasil')
            }
          }
        } catch(e) { console.error('❌ Auto generate error:', e.message) }
        scheduleAutoGenerate()
      }, currentDelay)
    }
    scheduleAutoGenerate()
  } catch (error) {
    console.error('⚠️ Auto generate scheduler failed:', error.message)
  }
})
