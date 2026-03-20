const router = require('express').Router()
const pool   = require('../db')
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } })

router.get('/', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM pengaturan LIMIT 1')
    res.json(row || {})
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', upload.single('logo_file'), async (req, res) => {
  try {
    const { nama_isp, telepon, email, website, alamat, mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port,
            wa_api_url, wa_api_token, wa_notif_enabled } = req.body
    let logo_url = req.body.logo_url || null
    if (req.file) logo_url = `/uploads/${req.file.filename}`

    const waEnabled = wa_notif_enabled === 'true' || wa_notif_enabled === true || wa_notif_enabled === '1' ? 1 : 0

    const [[existing]] = await pool.query('SELECT id FROM pengaturan LIMIT 1')
    if (existing) {
      await pool.query(
        `UPDATE pengaturan SET nama_isp=?,telepon=?,email=?,website=?,alamat=?,logo_url=COALESCE(?,logo_url),
         mikrotik_host=?,mikrotik_user=?,mikrotik_password=?,mikrotik_port=?,
         wa_api_url=?,wa_api_token=?,wa_notif_enabled=? WHERE id=?`,
        [nama_isp, telepon, email, website, alamat, logo_url, mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port || 8728,
         wa_api_url || '', wa_api_token || '', waEnabled, existing.id]
      )
    } else {
      await pool.query(
        `INSERT INTO pengaturan (nama_isp,telepon,email,website,alamat,logo_url,mikrotik_host,mikrotik_user,mikrotik_password,mikrotik_port,wa_api_url,wa_api_token,wa_notif_enabled)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [nama_isp, telepon, email, website, alamat, logo_url, mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port || 8728,
         wa_api_url || '', wa_api_token || '', waEnabled]
      )
    }
    res.json({ message: 'Pengaturan disimpan' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
