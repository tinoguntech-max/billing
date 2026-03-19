const router = require('express').Router()
const pool = require('../db')
const { connectMikrotik } = require('../mikrotik')

// GET /api/mikrotik/test - Test koneksi
router.get('/test', async (req, res) => {
  let conn
  try {
    conn = await connectMikrotik()
    const identity = await conn.write('/system/identity/print')
    res.json({ success: true, identity: identity[0].name })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  } finally {
    if (conn) {
      try { conn.close() } catch (e) {}
    }
  }
})

// POST /api/mikrotik/sync - Sync PPPoE users dari MikroTik
router.post('/sync', async (req, res) => {
  let conn
  try {
    conn = await connectMikrotik()
    const secrets = await conn.write('/ppp/secret/print')
    const active = await conn.write('/ppp/active/print')

    // Buat map untuk IP dari active connections
    const activeMap = {}
    active.forEach(a => {
      activeMap[a.name] = a.address // IP yang sedang digunakan
    })

    let synced = 0, updated = 0, created = 0

    for (const secret of secrets) {
      const username = secret.name
      const password = secret.password || ''
      const comment = secret.comment || ''
      const remoteAddress = secret['remote-address'] || '' // IP dari secret
      const localAddress = secret['local-address'] || ''
      
      // Prioritas: IP dari active connection > remote-address dari secret
      const ipAddress = activeMap[username] || remoteAddress
      
      const [[existing]] = await pool.query('SELECT id FROM pelanggan WHERE pppoe_username = ?', [username])
      
      if (existing) {
        await pool.query(
          'UPDATE pelanggan SET pppoe_password = ?, mikrotik_id = ?, ip_address = ? WHERE id = ?',
          [password, secret['.id'], ipAddress, existing.id]
        )
        updated++
      } else {
        await pool.query(
          `INSERT INTO pelanggan (nama, pppoe_username, pppoe_password, mikrotik_id, ip_address, telepon, status, tgl_bergabung)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [comment || username, username, password, secret['.id'], ipAddress, '-', 'Aktif', new Date().toISOString().split('T')[0]]
        )
        created++
      }
      synced++
    }

    res.json({ success: true, synced, updated, created })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  } finally {
    if (conn) {
      try { conn.close() } catch (e) {}
    }
  }
})

// POST /api/mikrotik/isolir/:id - Isolir pelanggan
router.post('/isolir/:id', async (req, res) => {
  let conn
  try {
    const [[pelanggan]] = await pool.query('SELECT pppoe_username, mikrotik_id FROM pelanggan WHERE id = ?', [req.params.id])
    if (!pelanggan || !pelanggan.pppoe_username) {
      return res.status(404).json({ error: 'Pelanggan tidak memiliki akun PPPoE' })
    }

    conn = await connectMikrotik()
    
    if (pelanggan.mikrotik_id) {
      await conn.write('/ppp/secret/disable', [`=.id=${pelanggan.mikrotik_id}`])
    } else {
      const secrets = await conn.write('/ppp/secret/print', [`?name=${pelanggan.pppoe_username}`])
      if (secrets.length > 0) {
        await conn.write('/ppp/secret/disable', [`=.id=${secrets[0]['.id']}`])
      }
    }
    
    await pool.query('UPDATE pelanggan SET status = ? WHERE id = ?', ['Nonaktif', req.params.id])
    
    res.json({ success: true, message: 'Pelanggan berhasil diisolir' })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  } finally {
    if (conn) {
      try { conn.close() } catch (e) {}
    }
  }
})

// POST /api/mikrotik/enable/:id - Aktifkan pelanggan
router.post('/enable/:id', async (req, res) => {
  let conn
  try {
    const [[pelanggan]] = await pool.query('SELECT pppoe_username, mikrotik_id FROM pelanggan WHERE id = ?', [req.params.id])
    if (!pelanggan || !pelanggan.pppoe_username) {
      return res.status(404).json({ error: 'Pelanggan tidak memiliki akun PPPoE' })
    }

    conn = await connectMikrotik()
    
    if (pelanggan.mikrotik_id) {
      await conn.write('/ppp/secret/enable', [`=.id=${pelanggan.mikrotik_id}`])
    } else {
      const secrets = await conn.write('/ppp/secret/print', [`?name=${pelanggan.pppoe_username}`])
      if (secrets.length > 0) {
        await conn.write('/ppp/secret/enable', [`=.id=${secrets[0]['.id']}`])
      }
    }
    
    await pool.query('UPDATE pelanggan SET status = ? WHERE id = ?', ['Aktif', req.params.id])
    
    res.json({ success: true, message: 'Pelanggan berhasil diaktifkan' })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  } finally {
    if (conn) {
      try { conn.close() } catch (e) {}
    }
  }
})

// GET /api/mikrotik/status - Cek status online semua pelanggan
router.get('/status', async (req, res) => {
  let conn
  try {
    conn = await connectMikrotik()
    const active = await conn.write('/ppp/active/print')

    const onlineUsers = active.map(a => a.name)
    
    // Update status offline untuk semua
    await pool.query('UPDATE pelanggan SET status_online = ?', ['Offline'])
    
    // Update status online dan IP address untuk yang aktif
    for (const user of active) {
      await pool.query(
        'UPDATE pelanggan SET status_online = ?, ip_address = ? WHERE pppoe_username = ?',
        ['Online', user.address, user.name]
      )
    }

    res.json({ success: true, online: onlineUsers.length, users: onlineUsers })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  } finally {
    if (conn) {
      try { conn.close() } catch (e) {}
    }
  }
})

// POST /api/mikrotik/disconnect/:id - Disconnect pelanggan yang sedang online
router.post('/disconnect/:id', async (req, res) => {
  let conn
  try {
    const [[pelanggan]] = await pool.query('SELECT pppoe_username FROM pelanggan WHERE id = ?', [req.params.id])
    if (!pelanggan || !pelanggan.pppoe_username) {
      return res.status(404).json({ error: 'Pelanggan tidak memiliki akun PPPoE' })
    }

    conn = await connectMikrotik()
    
    // Cari active connection
    const active = await conn.write('/ppp/active/print', [`?name=${pelanggan.pppoe_username}`])
    if (active.length > 0) {
      await conn.write('/ppp/active/remove', [`=.id=${active[0]['.id']}`])
      res.json({ success: true, message: 'Koneksi pelanggan diputus' })
    } else {
      res.json({ success: false, message: 'Pelanggan tidak sedang online' })
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  } finally {
    if (conn) {
      try { conn.close() } catch (e) {}
    }
  }
})

// GET /api/mikrotik/pelanggan/:id - Cek detail koneksi pelanggan
router.get('/pelanggan/:id', async (req, res) => {
  let conn
  try {
    const [[pelanggan]] = await pool.query('SELECT pppoe_username FROM pelanggan WHERE id = ?', [req.params.id])
    if (!pelanggan || !pelanggan.pppoe_username) {
      return res.status(404).json({ error: 'Pelanggan tidak memiliki akun PPPoE' })
    }

    conn = await connectMikrotik()
    
    // Cek active connection
    const active = await conn.write('/ppp/active/print', [`?name=${pelanggan.pppoe_username}`])
    
    if (active.length > 0) {
      const info = active[0]
      
      // Coba ambil interface stats untuk traffic data
      let bytesIn = '0'
      let bytesOut = '0'
      let rxRate = '0 bps'
      let txRate = '0 bps'
      
      try {
        // Cari interface pppoe untuk user ini dengan stats
        const interfaces = await conn.write('/interface/print', [
          `?name=<pppoe-${pelanggan.pppoe_username}>`,
          '=stats='
        ])
        
        console.log('=== Interface data with stats ===')
        console.log(JSON.stringify(interfaces, null, 2))
        console.log('=================================')
        
        if (interfaces.length > 0) {
          const iface = interfaces[0]
          const ifaceName = iface.name
          
          bytesIn = iface['rx-byte'] || iface['bytes-in'] || '0'
          bytesOut = iface['tx-byte'] || iface['bytes-out'] || '0'
          
          // Coba ambil traffic monitoring untuk rate real-time
          try {
            console.log('Monitoring traffic for interface:', ifaceName)
            const traffic = await conn.write('/interface/monitor-traffic', [
              `=interface=${ifaceName}`,
              '=once='
            ])
            
            console.log('=== Traffic monitor data ===')
            console.log(JSON.stringify(traffic, null, 2))
            console.log('============================')
            
            if (traffic && traffic.length > 0) {
              const t = traffic[0]
              // rx-bits-per-second dan tx-bits-per-second adalah field standar
              const rxBps = t['rx-bits-per-second'] || t['rx-bps'] || t['bps-in'] || '0'
              const txBps = t['tx-bits-per-second'] || t['tx-bps'] || t['bps-out'] || '0'
              
              console.log('Traffic rates:', { rxBps, txBps })
              
              // Format rate ke Kbps/Mbps
              const formatRate = (bps) => {
                const bits = parseInt(bps)
                if (isNaN(bits) || bits === 0) return '0 bps'
                if (bits < 1000) return bits + ' bps'
                if (bits < 1000000) return (bits / 1000).toFixed(1) + ' Kbps'
                return (bits / 1000000).toFixed(1) + ' Mbps'
              }
              
              rxRate = formatRate(rxBps)
              txRate = formatRate(txBps)
            }
          } catch (monitorErr) {
            console.log('Error monitoring traffic:', monitorErr.message)
          }
          
          console.log('Final stats:', { bytesIn, bytesOut, rxRate, txRate })
        } else {
          console.log('Interface not found, trying alternative method')
          // Alternatif: cari semua interface pppoe
          const allPppoe = await conn.write('/interface/print', [`?type=pppoe-out`])
          const matchingIface = allPppoe.find(i => i.name && i.name.includes(pelanggan.pppoe_username))
          if (matchingIface) {
            bytesIn = matchingIface['rx-byte'] || matchingIface['bytes-in'] || '0'
            bytesOut = matchingIface['tx-byte'] || matchingIface['bytes-out'] || '0'
            
            const rxBps = matchingIface['rx-bits-per-second'] || matchingIface['rx-rate'] || '0'
            const txBps = matchingIface['tx-bits-per-second'] || matchingIface['tx-rate'] || '0'
            
            const formatRate = (bps) => {
              const bits = parseInt(bps)
              if (isNaN(bits) || bits === 0) return '0 bps'
              if (bits < 1000) return bits + ' bps'
              if (bits < 1000000) return (bits / 1000).toFixed(1) + ' Kbps'
              return (bits / 1000000).toFixed(1) + ' Mbps'
            }
            
            rxRate = formatRate(rxBps)
            txRate = formatRate(txBps)
            
            console.log('Found via alternative method:', { bytesIn, bytesOut, rxRate, txRate })
          }
        }
      } catch (err) {
        console.log('Error getting interface stats:', err.message)
      }
      
      // Format bytes ke MB/GB
      const formatBytes = (bytes) => {
        if (!bytes || bytes === '0') return '0 B'
        const b = parseInt(bytes)
        if (isNaN(b)) return '0 B'
        if (b < 1024) return b + ' B'
        if (b < 1024 * 1024) return (b / 1024).toFixed(2) + ' KB'
        if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + ' MB'
        return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
      }
      
      res.json({
        success: true,
        online: true,
        username: info.name,
        ip: info.address,
        uptime: info.uptime,
        service: info.service,
        caller_id: info['caller-id'] || '-',
        bytes_in: formatBytes(bytesIn),
        bytes_out: formatBytes(bytesOut),
        bytes_in_raw: bytesIn,
        bytes_out_raw: bytesOut,
        rx_rate: rxRate,
        tx_rate: txRate
      })
    } else {
      res.json({ success: true, online: false })
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  } finally {
    if (conn) {
      try { conn.close() } catch (e) {}
    }
  }
})

module.exports = router
