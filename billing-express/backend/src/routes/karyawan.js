const router = require('express').Router()
const pool   = require('../db')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const { auth, role } = require('../middleware/auth')

const uploadDir = path.join(__dirname, '../../uploads/foto')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, `foto-${Date.now()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } })

// GET list karyawan aktif (untuk dropdown pengeluaran gaji)
router.get('/aktif', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, gaji FROM karyawan WHERE aktif=1 ORDER BY nama'
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// GET semua karyawan — admin only
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, email, role, telepon, alamat, foto, gaji, aktif, created_at FROM karyawan ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST tambah karyawan — admin only
router.post('/', auth, role('admin'), upload.single('foto'), async (req, res) => {
  try {
    const { nama, email, password, role: userRole, telepon, alamat, gaji } = req.body
    if (!nama || !email || !password || !userRole)
      return res.status(400).json({ error: 'Nama, email, password, dan role wajib diisi' })

    const [[existing]] = await pool.query('SELECT id FROM karyawan WHERE email=?', [email])
    if (existing) return res.status(400).json({ error: 'Email sudah digunakan' })

    const hashed = await bcrypt.hash(password, 10)
    const foto   = req.file ? `/uploads/foto/${req.file.filename}` : null

    const [r] = await pool.query(
      'INSERT INTO karyawan (nama, email, password, role, telepon, alamat, foto, gaji) VALUES (?,?,?,?,?,?,?,?)',
      [nama, email, hashed, userRole, telepon || null, alamat || null, foto, gaji || 0]
    )
    res.status(201).json({ id: r.insertId, message: 'Karyawan berhasil ditambahkan' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// PUT edit karyawan — admin only
router.put('/:id', auth, role('admin'), upload.single('foto'), async (req, res) => {
  try {
    const { nama, email, password, role: userRole, telepon, alamat, aktif, gaji } = req.body
    const [[existing]] = await pool.query('SELECT * FROM karyawan WHERE id=?', [req.params.id])
    if (!existing) return res.status(404).json({ error: 'Karyawan tidak ditemukan' })

    let hashed = existing.password
    if (password) hashed = await bcrypt.hash(password, 10)

    let foto = existing.foto
    if (req.file) foto = `/uploads/foto/${req.file.filename}`

    await pool.query(
      'UPDATE karyawan SET nama=?, email=?, password=?, role=?, telepon=?, alamat=?, foto=?, gaji=?, aktif=? WHERE id=?',
      [nama || existing.nama, email || existing.email, hashed,
       userRole || existing.role, telepon ?? existing.telepon,
       alamat ?? existing.alamat, foto, gaji !== undefined ? gaji : existing.gaji,
       aktif !== undefined ? aktif : existing.aktif,
       req.params.id]
    )
    res.json({ message: 'Karyawan diperbarui' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// DELETE karyawan — admin only
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id))
      return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' })
    await pool.query('DELETE FROM karyawan WHERE id=?', [req.params.id])
    res.json({ message: 'Karyawan dihapus' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Upload foto profil sendiri
router.post('/foto', auth, upload.single('foto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' })
    const foto = `/uploads/foto/${req.file.filename}`
    await pool.query('UPDATE karyawan SET foto=? WHERE id=?', [foto, req.user.id])
    res.json({ foto, message: 'Foto berhasil diperbarui' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
