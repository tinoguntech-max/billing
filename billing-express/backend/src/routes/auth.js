const router  = require('express').Router()
const pool    = require('../db')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const { auth } = require('../middleware/auth')

const SECRET = process.env.JWT_SECRET || 'netbill_secret_key'

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' })

    const [[user]] = await pool.query('SELECT * FROM karyawan WHERE email=? AND aktif=1', [email])
    if (!user) return res.status(401).json({ error: 'Email atau password salah' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Email atau password salah' })

    const token = jwt.sign(
      { id: user.id, nama: user.nama, email: user.email, role: user.role, foto: user.foto },
      SECRET,
      { expiresIn: '8h' }
    )
    const { password: _, ...userSafe } = user
    res.json({ token, user: userSafe })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const [[user]] = await pool.query(
      'SELECT id, nama, email, role, telepon, alamat, foto, created_at FROM karyawan WHERE id=?',
      [req.user.id]
    )
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })
    res.json(user)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Edit profil sendiri
router.put('/profile', auth, async (req, res) => {
  try {
    const { nama, telepon, alamat, password_baru, password_lama } = req.body
    const [[user]] = await pool.query('SELECT * FROM karyawan WHERE id=?', [req.user.id])
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })

    let hashedPassword = user.password
    if (password_baru) {
      if (!password_lama) return res.status(400).json({ error: 'Password lama wajib diisi' })
      const valid = await bcrypt.compare(password_lama, user.password)
      if (!valid) return res.status(400).json({ error: 'Password lama salah' })
      hashedPassword = await bcrypt.hash(password_baru, 10)
    }

    await pool.query(
      'UPDATE karyawan SET nama=?, telepon=?, alamat=?, password=? WHERE id=?',
      [nama || user.nama, telepon || user.telepon, alamat || user.alamat, hashedPassword, user.id]
    )
    res.json({ message: 'Profil berhasil diperbarui' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
