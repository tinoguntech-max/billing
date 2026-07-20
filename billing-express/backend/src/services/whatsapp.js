const pool = require('../db')
const { sendWhatsAppDirect, sendOfflineNotificationDirect, sendOnlineNotificationDirect } = require('./whatsapp-gateway')

async function sendWhatsApp(phone, message) {
  try {
    const [[config]] = await pool.query(
      'SELECT wa_notif_enabled FROM pengaturan LIMIT 1'
    )
    
    if (!config || !config.wa_notif_enabled) {
      console.log('WhatsApp notification disabled')
      return { success: false, message: 'WhatsApp notification disabled' }
    }
    
    return await sendWhatsAppDirect(phone, message)
  } catch (error) {
    console.error('Error sending WhatsApp:', error.message)
    return { success: false, message: error.message }
  }
}

async function sendOfflineNotification(pelanggan) {
  return await sendOfflineNotificationDirect(pelanggan)
}

async function sendOnlineNotification(pelanggan) {
  return await sendOnlineNotificationDirect(pelanggan)
}

module.exports = {
  sendWhatsApp,
  sendOfflineNotification,
  sendOnlineNotification
}
