const router = require('express').Router()
const pool   = require('../db')

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const pg  = Math.max(1, Number(page))
    const lim = Math.min(100, Number(limit))
    const off = (pg - 1) * lim

    const [[{ total }], [rows]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM pembayaran'),
      pool.query(`SELECT py.*, t.no_tagihan, t.jumlah AS jumlah_tagihan, p.nama AS nama_pelanggan
                  FROM pembayaran py
                  JOIN tagihan t ON py.id_tagihan=t.id
                  JOIN pelanggan p ON t.id_pelanggan=p.id
                  ORDER BY py.created_at DESC LIMIT ? OFFSET ?`, [lim, off]),
    ])
    res.json({ data: rows, total, page: pg, limit: lim })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { id_tagihan, jumlah, metode, tgl_bayar, keterangan } = req.body
    if (!id_tagihan || !jumlah) return res.status(400).json({ error: 'id_tagihan dan jumlah wajib diisi' })

    const tglFormatted = tgl_bayar
      ? new Date(tgl_bayar).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)

    const [r] = await pool.query(
      'INSERT INTO pembayaran (id_tagihan,jumlah,metode,tgl_bayar,keterangan) VALUES (?,?,?,?,?)',
      [id_tagihan, jumlah, metode || 'Tunai', tglFormatted, keterangan || '']
    )
    await pool.query("UPDATE tagihan SET status='Lunas' WHERE id=?", [id_tagihan])
    res.status(201).json({ id: r.insertId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
