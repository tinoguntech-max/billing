const router = require('express').Router()
const pool   = require('../db')
const multer = require('multer')
const xlsx   = require('xlsx')

const upload = multer({ storage: multer.memoryStorage() })

router.get('/', async (req, res) => {
  try {
    const { search = '', status = '', online = '', sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 50 } = req.query
    const pg  = Math.max(1, Number(page))
    const lim = Math.min(100, Number(limit))
    const off = (pg - 1) * lim

    let where = 'WHERE 1=1'
    const params = []
    if (search) { where += ' AND (p.nama LIKE ? OR p.telepon LIKE ? OR p.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
    if (status) { where += ' AND p.status = ?'; params.push(status) }
    if (online) { where += ' AND p.status_online = ?'; params.push(online) }

    // Validasi sortBy untuk keamanan
    const allowedSortColumns = ['id', 'nama', 'status', 'status_online', 'id_paket', 'created_at', 'tgl_bergabung']
    const sortColumn = allowedSortColumns.includes(sortBy) ? `p.${sortBy}` : 'p.created_at'
    const sortDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

    const [countResult, dataResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pelanggan p ${where}`, params),
      pool.query(`SELECT p.*, pk.nama_paket, pk.harga, pk.kecepatan
                  FROM pelanggan p LEFT JOIN paket pk ON p.id_paket=pk.id
                  ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT ? OFFSET ?`, [...params, lim, off]),
    ])
    const total = countResult[0][0].total
    const rows = dataResult[0]
    res.json({ data: rows, total, page: pg, limit: lim })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung } = req.body
    if (!nama || !telepon) return res.status(400).json({ error: 'Nama dan telepon wajib diisi' })
    const [r] = await pool.query(
      `INSERT INTO pelanggan (nama,email,telepon,alamat,ip_address,id_paket,status,tgl_bergabung)
       VALUES (?,?,?,?,?,?,?,?)`,
      [nama, email, telepon, alamat, ip_address, id_paket || null, status || 'Aktif',
       tgl_bergabung || new Date().toISOString().split('T')[0]]
    )
    res.status(201).json({ id: r.insertId, message: 'Pelanggan berhasil ditambahkan' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const { nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung } = req.body
    await pool.query(
      `UPDATE pelanggan SET nama=?,email=?,telepon=?,alamat=?,ip_address=?,id_paket=?,status=?,tgl_bergabung=? WHERE id=?`,
      [nama, email, telepon, alamat, ip_address, id_paket || null, status, tgl_bergabung, req.params.id]
    )
    res.json({ message: 'Pelanggan diperbarui' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pelanggan WHERE id=?', [req.params.id])
    res.json({ message: 'Pelanggan dihapus' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/pelanggan/import - Import from Excel
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File Excel tidak ditemukan' })
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)
    
    if (!data.length) return res.status(400).json({ error: 'File Excel kosong' })
    
    let success = 0, failed = 0
    const errors = []
    
    for (const row of data) {
      try {
        const nama = row.Nama || row.nama
        const email = row.Email || row.email || ''
        const telepon = row.Telepon || row.telepon || row.HP || row.hp
        const alamat = row.Alamat || row.alamat || ''
        const ip_address = row.IP || row.ip || row.ip_address || ''
        const id_paket = row.ID_Paket || row.id_paket || row.Paket || null
        const status = row.Status || row.status || 'Aktif'
        const tgl_bergabung = row.Tanggal || row.tgl_bergabung || new Date().toISOString().split('T')[0]
        
        if (!nama || !telepon) {
          failed++
          errors.push(`Baris ${success + failed + 1}: Nama dan telepon wajib diisi`)
          continue
        }
        
        await pool.query(
          `INSERT INTO pelanggan (nama,email,telepon,alamat,ip_address,id_paket,status,tgl_bergabung)
           VALUES (?,?,?,?,?,?,?,?)`,
          [nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung]
        )
        success++
      } catch (err) {
        failed++
        errors.push(`Baris ${success + failed + 1}: ${err.message}`)
      }
    }
    
    res.json({ 
      message: `Import selesai: ${success} berhasil, ${failed} gagal`,
      success, 
      failed,
      errors: errors.slice(0, 10)
    })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
