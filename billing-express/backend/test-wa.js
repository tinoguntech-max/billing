// Test script untuk kirim WhatsApp
// Jalankan dengan: node test-wa.js

const fetch = require('node-fetch')

async function testWhatsApp() {
  const phone = '08986355829'
  const message = `🎉 *Test WhatsApp Gateway*

Halo! Ini adalah pesan test dari sistem Billing Internet TamNet.

✅ WhatsApp Gateway berhasil terhubung!
📱 Nomor: ${phone}
⏰ Waktu: ${new Date().toLocaleString('id-ID')}

Jika Anda menerima pesan ini, berarti sistem notifikasi WhatsApp sudah berfungsi dengan baik.

_TamNet Internet Provider_`

  console.log('📱 Mengirim test WhatsApp...')
  console.log('Nomor:', phone)
  console.log('Pesan:', message)
  console.log('\n⏳ Mohon tunggu...\n')

  try {
    const response = await fetch('http://localhost:5000/api/whatsapp/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    })

    const result = await response.json()
    
    console.log('📊 Response dari server:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('\n✅ BERHASIL! Pesan WhatsApp telah dikirim!')
      console.log('📱 Cek WhatsApp Anda di nomor:', phone)
    } else {
      console.log('\n❌ GAGAL mengirim pesan')
      console.log('Error:', result.message)
      
      if (result.message.includes('not ready')) {
        console.log('\n💡 Solusi:')
        console.log('1. Pastikan backend sudah running')
        console.log('2. Scan QR code di: http://localhost:5000/api/whatsapp/qr')
        console.log('3. Tunggu sampai muncul "WhatsApp Gateway ready!"')
      } else if (result.message.includes('tidak terdaftar')) {
        console.log('\n💡 Solusi:')
        console.log('1. Pastikan nomor sudah terdaftar di WhatsApp')
        console.log('2. Coba format nomor: 628986355829')
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR:', error.message)
    console.log('\n💡 Pastikan:')
    console.log('1. Backend sudah running di http://localhost:5000')
    console.log('2. WhatsApp Gateway sudah di-scan QR code')
  }
}

// Jalankan test
testWhatsApp()
