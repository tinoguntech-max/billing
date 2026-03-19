const router = require('express').Router()
const pool   = require('../db')

router.get('/', async (req, res) => {
  try {
    const { status = '', id_pelanggan = '', page = 1, limit = 50 } = req.query
    const pg  = Math.max(1, Number(page))
    const lim = Math.min(100, Number(limit))
    const off = (pg - 1) * lim

    let where = 'WHERE 1=1'
    const params = []
    if (status)       { where += ' AND t.status=?';        params.push(status) }
    if (id_pelanggan) { where += ' AND t.id_pelanggan=?';  params.push(id_pelanggan) }

    const [[{ total }], [rows]] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM tagihan t ${where}`, params),
      pool.query(`SELECT t.*, p.nama AS nama_pelanggan, pk.nama_paket, pk.kecepatan
                  FROM tagihan t
                  JOIN pelanggan p ON t.id_pelanggan=p.id
                  LEFT JOIN paket pk ON p.id_paket=pk.id
                  ${where} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`, [...params, lim, off]),
    ])
    res.json({ data: rows, total, page: pg, limit: lim })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { id_pelanggan, periode, jumlah, tgl_jatuh_tempo } = req.body
    if (!id_pelanggan || !jumlah) return res.status(400).json({ error: 'id_pelanggan dan jumlah wajib diisi' })

    const now = new Date()
    const yy  = String(now.getFullYear()).slice(2)
    const mm  = String(now.getMonth() + 1).padStart(2, '0')
    const [[{ c }]] = await pool.query('SELECT COUNT(*) AS c FROM tagihan')
    const no_tagihan = `INV-${yy}${mm}-${String(c + 1).padStart(3, '0')}`

    const [r] = await pool.query(
      `INSERT INTO tagihan (no_tagihan,id_pelanggan,periode,jumlah,tgl_jatuh_tempo,status)
       VALUES (?,?,?,?,?,'Belum Bayar')`,
      [no_tagihan, id_pelanggan, periode, jumlah, tgl_jatuh_tempo]
    )
    res.status(201).json({ id: r.insertId, no_tagihan })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body
    await pool.query('UPDATE tagihan SET status=? WHERE id=?', [status, req.params.id])
    res.json({ message: 'Tagihan diperbarui' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tagihan WHERE id=?', [req.params.id])
    res.json({ message: 'Tagihan dihapus' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Generate otomatis — batch insert, no N+1
router.post('/generate-otomatis', async (req, res) => {
  try {
    const today        = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear  = today.getFullYear()
    const mmyy         = `${String(currentMonth).padStart(2,'0')}${currentYear}`

    const [pelanggan] = await pool.query(`
      SELECT p.id, p.nama, p.tgl_bergabung, pk.harga
      FROM pelanggan p JOIN paket pk ON p.id_paket=pk.id
      WHERE p.status='Aktif' AND p.tgl_bergabung IS NOT NULL
        AND p.id NOT IN (
          SELECT id_pelanggan FROM tagihan
          WHERE MONTH(created_at)=? AND YEAR(created_at)=?
        )
    `, [currentMonth, currentYear])

    if (!pelanggan.length) return res.json({ success: true, message: '0 tagihan dibuat (semua sudah ada)', created: 0 })

    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM tagihan WHERE MONTH(created_at)=? AND YEAR(created_at)=?',
      [currentMonth, currentYear]
    )

    const placeholders = []
    const values = []
    pelanggan.forEach((p, i) => {
      const tglBergabung    = new Date(p.tgl_bergabung)
      const tanggal         = tglBergabung.getDate()
      let jatuhTempo = new Date(today.getFullYear(), today.getMonth(), tanggal + 3)
      if (tanggal > today.getDate() && today.getMonth() === tglBergabung.getMonth())
        jatuhTempo = new Date(today.getFullYear(), today.getMonth() + 1, tanggal + 3)

      const periode   = new Intl.DateTimeFormat('id-ID', { year:'numeric', month:'long' }).format(jatuhTempo)
      const noTagihan = `INV-${mmyy}-${String(Number(count) + i + 1).padStart(3,'0')}`
      placeholders.push('(?,?,?,?,?,?)')
      values.push(noTagihan, p.id, periode, p.harga, jatuhTempo.toISOString().split('T')[0], 'Belum Bayar')
    })

    await pool.query(
      `INSERT INTO tagihan (no_tagihan,id_pelanggan,periode,jumlah,tgl_jatuh_tempo,status) VALUES ${placeholders.join(',')}`,
      values
    )
    res.status(201).json({ success: true, message: `${pelanggan.length} tagihan berhasil dibuat`, created: pelanggan.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
