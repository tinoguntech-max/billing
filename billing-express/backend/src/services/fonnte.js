const https = require('https')

async function sendWA(phone, message) {
  return new Promise((resolve) => {
    // Format nomor
    let nomor = String(phone).replace(/\D/g, '')
    if (nomor.startsWith('0')) nomor = '62' + nomor.substring(1)
    else if (!nomor.startsWith('62')) nomor = '62' + nomor

    const token = process.env.FONNTE_TOKEN
    if (!token) {
      console.error('❌ FONNTE_TOKEN tidak diset')
      return resolve({ success: false, message: 'Token tidak diset' })
    }

    const body = new URLSearchParams({ target: nomor, message, countryCode: '62' }).toString()

    const options = {
      hostname: 'api.fonnte.com',
      path: '/send',
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.status) {
            console.log(`✅ WA terkirim ke ${nomor}`)
            resolve({ success: true, message: 'Terkirim' })
          } else {
            console.error(`❌ Fonnte error ke ${nomor}:`, json.reason)
            resolve({ success: false, message: json.reason || 'Gagal' })
          }
        } catch (e) {
          resolve({ success: false, message: e.message })
        }
      })
    })

    req.on('error', (e) => {
      console.error('❌ Fonnte request error:', e.message)
      resolve({ success: false, message: e.message })
    })

    req.write(body)
    req.end()
  })
}

module.exports = { sendWA }
