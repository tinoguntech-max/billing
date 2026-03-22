const router = require('express').Router()
const pool   = require('../db')

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc', metode = '' } = req.query
    const pg  = Math.max(1, Number(page))
    const lim = Math.min(100, Number(limit))
    const off = (pg - 1) * lim

    const allowedSort = { created_at: 'py.created_at', tgl_bayar: 'py.tgl_bayar', jumlah: 'py.jumlah', nama_pelanggan: 'p.nama', metode: 'py.metode', no_tagihan: 't.no_tagihan' }
    const orderCol = allowedSort[sortBy] || 'py.created_at'
    const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC'

    let where = 'WHERE 1=1'
    const params = []
    if (search) { where += ' AND (p.nama LIKE ? OR t.no_tagihan LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
    if (metode) { where += ' AND py.metode=?'; params.push(metode) }

    const [[{ total }], [rows]] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pembayaran py
                  JOIN tagihan t ON py.id_tagihan=t.id
                  JOIN pelanggan p ON t.id_pelanggan=p.id ${where}`, params),
      pool.query(`SELECT py.*, t.no_tagihan, t.jumlah AS jumlah_tagihan, p.nama AS nama_pelanggan
                  FROM pembayaran py
                  JOIN tagihan t ON py.id_tagihan=t.id
                  JOIN pelanggan p ON t.id_pelanggan=p.id
                  ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`, [...params, lim, off]),
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

    // Kirim notifikasi WA ke pelanggan
    try {
      const [[tagihan]] = await pool.query(`
        SELECT t.*, p.nama, p.telepon, pk.nama_paket
        FROM tagihan t
        JOIN pelanggan p ON t.id_pelanggan = p.id
        LEFT JOIN paket pk ON p.id_paket = pk.id
        WHERE t.id = ?
      `, [id_tagihan])

      const [[config]] = await pool.query('SELECT nama_isp, wa_notif_enabled FROM pengaturan LIMIT 1')

      if (tagihan?.telepon && tagihan.telepon !== '-' && config?.wa_notif_enabled) {
        const { sendWhatsAppDirect } = require('../services/whatsapp-gateway')
        const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
        
        const message = `✅ *Konfirmasi Pembayaran*

Halo *${tagihan.nama}*,

Pembayaran Anda telah kami terima.

📋 *Detail Pembayaran:*
• No. Tagihan: ${tagihan.no_tagihan || '-'}
• Paket: ${tagihan.nama_paket || '-'}
• Jumlah: *${fmt(jumlah)}*
• Metode: ${metode || 'Tunai'}
• Tanggal: ${new Date(tglFormatted).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

Terima kasih telah membayar tepat waktu! 🙏

_${config?.nama_isp || 'TamNet Internet Provider'}_`

        sendWhatsAppDirect(tagihan.telepon, message).catch(() => {})
      }
    } catch (waErr) {
      // Jangan gagalkan pembayaran jika WA error
      console.error('WA notification error:', waErr.message)
    }

    res.status(201).json({ id: r.insertId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    // Ambil id_tagihan dulu sebelum hapus
    const [[py]] = await pool.query('SELECT id_tagihan FROM pembayaran WHERE id=?', [req.params.id])
    if (!py) return res.status(404).json({ error: 'Pembayaran tidak ditemukan' })
    await pool.query('DELETE FROM pembayaran WHERE id=?', [req.params.id])
    // Kembalikan status tagihan ke Belum Bayar
    await pool.query("UPDATE tagihan SET status='Belum Bayar' WHERE id=?", [py.id_tagihan])
    res.json({ message: 'Pembayaran dihapus' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
