const pool = require('../db')
const { connectMikrotik } = require('../mikrotik')
const { sendOfflineNotification, sendOnlineNotification } = require('./whatsapp')
const { sendOfflineNotificationDirect, sendOnlineNotificationDirect } = require('./whatsapp-gateway')

async function monitorConnections() {
  console.log('🔍 Monitoring connections...')
  
  try {
    // Ambil semua pelanggan yang punya PPPoE dan status Aktif
    const [pelanggan] = await pool.query(`
      SELECT id, nama, telepon, pppoe_username, ip_address, status_online, 
             offline_notified, offline_since, last_online_check
      FROM pelanggan 
      WHERE pppoe_username IS NOT NULL 
        AND pppoe_username != '' 
        AND status = 'Aktif'
    `)
    
    if (!pelanggan.length) {
      console.log('No active PPPoE customers to monitor')
      return
    }
    
    // Koneksi ke MikroTik
    let conn
    let active = []
    try {
      conn = await connectMikrotik()
      active = await conn.write('/ppp/active/print')
    } catch (mikrotikError) {
      console.error('❌ MikroTik connection error:', mikrotikError.message)
      return // Skip monitoring jika MikroTik tidak bisa diakses
    } finally {
      if (conn) conn.close()
    }
    
    // Buat map username yang online
    const onlineUsers = new Set(active.map(a => a.name))
    
    const now = new Date()
    
    for (const p of pelanggan) {
      const isOnline = onlineUsers.has(p.pppoe_username)
      const wasOnline = p.status_online === 'Online'
      
      // Update status online di database
      await pool.query(
        'UPDATE pelanggan SET status_online = ?, last_online_check = ? WHERE id = ?',
        [isOnline ? 'Online' : 'Offline', now, p.id]
      )
      
      // Deteksi perubahan status: Online -> Offline
      if (wasOnline && !isOnline && !p.offline_notified) {
        console.log(`📴 ${p.nama} went OFFLINE, sending notification...`)
        
        await pool.query(
          'UPDATE pelanggan SET offline_notified = 1, offline_since = ? WHERE id = ?',
          [now, p.id]
        )
        
        // Kirim notifikasi WA - cek apakah pakai gateway sendiri atau API
        if (p.telepon && p.telepon !== '-' && p.telepon.trim()) {
          try {
            const [[config]] = await pool.query('SELECT wa_notif_enabled, wa_api_url FROM pengaturan LIMIT 1')
            
            if (config && config.wa_notif_enabled) {
              // Jika ada API URL, pakai API eksternal, jika tidak pakai gateway sendiri
              if (config.wa_api_url && config.wa_api_url.trim()) {
                await sendOfflineNotification(p)
              } else {
                await sendOfflineNotificationDirect(p)
              }
            }
          } catch (waError) {
            console.error(`❌ Failed to send offline notification to ${p.nama}:`, waError.message)
          }
        }
      }
      
      // Deteksi perubahan status: Offline -> Online
      if (!wasOnline && isOnline && p.offline_notified) {
        console.log(`✅ ${p.nama} is back ONLINE, sending notification...`)
        
        await pool.query(
          'UPDATE pelanggan SET offline_notified = 0, offline_since = NULL WHERE id = ?',
          [p.id]
        )
        
        // Kirim notifikasi WA
        if (p.telepon && p.telepon !== '-' && p.telepon.trim()) {
          try {
            const [[config]] = await pool.query('SELECT wa_notif_enabled, wa_api_url FROM pengaturan LIMIT 1')
            
            if (config && config.wa_notif_enabled) {
              if (config.wa_api_url && config.wa_api_url.trim()) {
                await sendOnlineNotification(p)
              } else {
                await sendOnlineNotificationDirect(p)
              }
            }
          } catch (waError) {
            console.error(`❌ Failed to send online notification to ${p.nama}:`, waError.message)
          }
        }
      }
    }
    
    console.log(`✅ Monitored ${pelanggan.length} customers, ${onlineUsers.size} online`)
  } catch (error) {
    console.error('❌ Monitor error:', error.message)
  }
}

// Jalankan monitoring setiap 5 menit
function startMonitoring() {
  console.log('🚀 Starting connection monitoring service...')
  
  // Jalankan pertama kali
  monitorConnections()
  
  // Jalankan setiap 5 menit
  setInterval(monitorConnections, 5 * 60 * 1000)
}

module.exports = { monitorConnections, startMonitoring }
