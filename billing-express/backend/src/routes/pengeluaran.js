const router = require('express').Router()
const pool   = require('../db')

router.get('/saldo', async (req, res) => {
  try {
    const [[masuk]]  = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pembayaran')
    const [[keluar]] = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pengeluaran')
    res.json({ saldo: Number(masuk.total) - Number(keluar.total) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/', async (req, res) => {
  try {
    const { bulan, tahun, kategori, page = 1, limit = 50 } = req.query
    const pg  = Math.max(1, Number(page))
    const lim = Math.min(100, Number(limit))
    const off = (pg - 1) * lim
    let where = 'WHERE 1=1'
    const params = []
    if (bulan)    { where += ' AND MONTH(tgl_pengeluaran)=?'; params.push(bulan) }
    if (tahun)    { where += ' AND YEAR(tgl_pengeluaran)=?';  params.push(tahun) }
    if (kategori) { where += ' AND kategori=?';               params.push(kategori) }
    const [[{ total }], [rows], [summary]] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pengeluaran ${where}`, params),
      pool.query(`SELECT * FROM pengeluaran ${where} ORDER BY tgl_pengeluaran DESC LIMIT ? OFFSET ?`, [...params, lim, off]),
      pool.query(`SELECT kategori, SUM(jumlah) AS total FROM pengeluaran ${where} GROUP BY kategori`, params),
    ])
    res.json({ data: rows, total, page: pg, limit: lim, summary })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { kategori, jumlah, tgl_pengeluaran, keterangan, id_karyawan } = req.body
    if (!kategori || !jumlah || !tgl_pengeluaran)
      return res.status(400).json({ error: 'Kategori, jumlah, dan tanggal wajib diisi' })
    const [[masuk]]  = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pembayaran')
    const [[keluar]] = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pengeluaran')
    const saldo = Number(masuk.total) - Number(keluar.total)
    if (Number(jumlah) > saldo)
      return res.status(400).json({ error: 'Saldo tidak cukup' })
    const [r] = await pool.query(
      'INSERT INTO pengeluaran (kategori, jumlah, tgl_pengeluaran, keterangan, id_karyawan) VALUES (?,?,?,?,?)',
      [kategori, jumlah, tgl_pengeluaran, keterangan || '', id_karyawan || null]
    )
    res.status(201).json({ id: r.insertId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const { kategori, jumlah, tgl_pengeluaran, keterangan, id_karyawan } = req.body
    await pool.query(
      'UPDATE pengeluaran SET kategori=?, jumlah=?, tgl_pengeluaran=?, keterangan=?, id_karyawan=? WHERE id=?',
      [kategori, jumlah, tgl_pengeluaran, keterangan || '', id_karyawan || null, req.params.id]
    )
    res.json({ message: 'OK' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pengeluaran WHERE id=?', [req.params.id])
    res.json({ message: 'OK' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router