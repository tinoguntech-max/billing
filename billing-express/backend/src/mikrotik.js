const RouterOSAPI = require('node-routeros').RouterOSAPI
const pool = require('./db')

async function getMikrotikConfig() {
  const [[config]] = await pool.query('SELECT mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port FROM pengaturan LIMIT 1')
  if (!config || !config.mikrotik_host) throw new Error('Konfigurasi MikroTik belum diatur')
  return config
}

async function connectMikrotik() {
  const config = await getMikrotikConfig()
  const conn = new RouterOSAPI({
    host: config.mikrotik_host,
    user: config.mikrotik_user,
    password: config.mikrotik_password,
    port: config.mikrotik_port || 8728,
    timeout: 30,
  })
  await conn.connect()
  return conn
}

module.exports = { connectMikrotik, getMikrotikConfig }
