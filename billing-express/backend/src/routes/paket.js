const router = require('express').Router()
const pool   = require('../db')

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, COUNT(pl.id) AS jumlah_pelanggan
      FROM paket p LEFT JOIN pelanggan pl ON pl.id_paket=p.id
      GROUP BY p.id ORDER BY p.kecepatan ASC
    `)
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { nama_paket, kecepatan, harga, deskripsi } = req.body
    if (!nama_paket || !kecepatan || !harga) return res.status(400).json({ error: 'Field wajib diisi' })
    const [r] = await pool.query(
      'INSERT INTO paket (nama_paket,kecepatan,harga,deskripsi) VALUES (?,?,?,?)',
      [nama_paket, kecepatan, harga, deskripsi]
    )
    res.status(201).json({ id: r.insertId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const { nama_paket, kecepatan, harga, deskripsi } = req.body
    await pool.query(
      'UPDATE paket SET nama_paket=?,kecepatan=?,harga=?,deskripsi=? WHERE id=?',
      [nama_paket, kecepatan, harga, deskripsi, req.params.id]
    )
    res.json({ message: 'Paket diperbarui' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM paket WHERE id=?', [req.params.id])
    res.json({ message: 'Paket dihapus' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
