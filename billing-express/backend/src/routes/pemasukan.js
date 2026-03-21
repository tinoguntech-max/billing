const router = require('express').Router()
const pool   = require('../db')

// GET - gabungan pembayaran tagihan + pemasukan manual
router.get('/', async (req, res) => {
  try {
    const { bulan, tahun, kategori } = req.query

    let wherePembayaran = 'WHERE 1=1'
    let wherePemasukan  = 'WHERE 1=1'
    const paramsPembayaran = []
    const paramsPemasukan  = []

    if (bulan) {
      wherePembayaran += ' AND MONTH(py.tgl_bayar)=?';    paramsPembayaran.push(bulan)
      wherePemasukan  += ' AND MONTH(pm.tgl_pemasukan)=?'; paramsPemasukan.push(bulan)
    }
    if (tahun) {
      wherePembayaran += ' AND YEAR(py.tgl_bayar)=?';    paramsPembayaran.push(tahun)
      wherePemasukan  += ' AND YEAR(pm.tgl_pemasukan)=?'; paramsPemasukan.push(tahun)
    }

    // Filter kategori: 'Pembayaran Tagihan' hanya ambil dari pembayaran, lainnya dari pemasukan
    const showPembayaran = !kategori || kategori === 'Pembayaran Tagihan'
    const showPemasukan  = !kategori || kategori !== 'Pembayaran Tagihan'

    const queries = []
    if (showPembayaran) {
      queries.push(pool.query(`
        SELECT py.id, 'Pembayaran Tagihan' AS kategori, py.jumlah,
               py.tgl_bayar AS tgl_pemasukan,
               CONCAT(p.nama, ' - ', t.no_tagihan) AS keterangan,
               py.created_at, 'pembayaran' AS sumber
        FROM pembayaran py
        JOIN tagihan t ON py.id_tagihan = t.id
        JOIN pelanggan p ON t.id_pelanggan = p.id
        ${wherePembayaran}
      `, paramsPembayaran))
    }
    if (showPemasukan) {
      queries.push(pool.query(`
        SELECT pm.id, pm.kategori, pm.jumlah,
               pm.tgl_pemasukan, pm.keterangan,
               pm.created_at, 'pemasukan' AS sumber
        FROM pemasukan pm
        ${wherePemasukan}
      `, paramsPemasukan))
    }

    const results = await Promise.all(queries)
    let rows = []
    results.forEach(([r]) => rows.push(...r))

    // Sort by tgl_pemasukan DESC
    rows.sort((a, b) => new Date(b.tgl_pemasukan) - new Date(a.tgl_pemasukan))

    const total = rows.reduce((s, r) => s + Number(r.jumlah), 0)

    // Summary per kategori
    const summaryMap = {}
    rows.forEach(r => {
      summaryMap[r.kategori] = (summaryMap[r.kategori] || 0) + Number(r.jumlah)
    })
    const summary = Object.entries(summaryMap).map(([kategori, total]) => ({ kategori, total }))
      .sort((a, b) => b.total - a.total)

    res.json({ data: rows, total, summary })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST - tambah pemasukan manual (bukan pembayaran tagihan)
router.post('/', async (req, res) => {
  try {
    const { kategori, jumlah, tgl_pemasukan, keterangan } = req.body
    if (!kategori || !jumlah || !tgl_pemasukan)
      return res.status(400).json({ error: 'Kategori, jumlah, dan tanggal wajib diisi' })
    if (kategori === 'Pembayaran Tagihan')
      return res.status(400).json({ error: 'Kategori ini otomatis dari pembayaran tagihan' })
    const [r] = await pool.query(
      'INSERT INTO pemasukan (kategori, jumlah, tgl_pemasukan, keterangan) VALUES (?,?,?,?)',
      [kategori, jumlah, tgl_pemasukan, keterangan || '']
    )
    res.status(201).json({ id: r.insertId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const { kategori, jumlah, tgl_pemasukan, keterangan } = req.body
    if (kategori === 'Pembayaran Tagihan')
      return res.status(400).json({ error: 'Tidak bisa edit pembayaran tagihan dari sini' })
    await pool.query(
      'UPDATE pemasukan SET kategori=?, jumlah=?, tgl_pemasukan=?, keterangan=? WHERE id=?',
      [kategori, jumlah, tgl_pemasukan, keterangan || '', req.params.id]
    )
    res.json({ message: 'OK' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pemasukan WHERE id=?', [req.params.id])
    res.json({ message: 'OK' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
