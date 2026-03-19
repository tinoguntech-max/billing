const fs = require('fs')
const path = require('path')

console.log('🧹 Cleaning WhatsApp cache...')

const folders = [
  path.join(__dirname, '../whatsapp-session'),
  path.join(__dirname, '../.wwebjs_cache')
]

folders.forEach(folder => {
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true })
    console.log(`✅ Deleted: ${folder}`)
  } else {
    console.log(`⏭️  Not found: ${folder}`)
  }
})

console.log('\n✅ Cache cleaned!')
console.log('ℹ️  Next time you start the server, you will need to scan QR code again.')
