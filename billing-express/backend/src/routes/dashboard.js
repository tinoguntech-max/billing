const router = require('express').Router()
const pool   = require('../db')

router.get('/', async (req, res) => {
  try {
    const [
      [totalPelangganRows],
      [totalTagihanRows],
      [pendapatanRows],
      [tagihanTerbaru],
      [distribusiPaket],
      [pendapatan6],
      [saldoMasukRows],
      [saldoKeluarRows],
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, SUM(status='Aktif') AS aktif FROM pelanggan"),
      pool.query("SELECT COUNT(*) AS total, SUM(status='Lunas') AS lunas, SUM(status='Belum Bayar') AS belum FROM tagihan"),
      pool.query(`SELECT COALESCE(SUM(jumlah),0) AS bulan_ini FROM pembayaran
                  WHERE MONTH(tgl_bayar)=MONTH(NOW()) AND YEAR(tgl_bayar)=YEAR(NOW())`),
      pool.query(`SELECT t.*, p.nama AS nama_pelanggan, pk.nama_paket
                  FROM tagihan t
                  JOIN pelanggan p ON t.id_pelanggan=p.id
                  LEFT JOIN paket pk ON p.id_paket=pk.id
                  ORDER BY t.created_at DESC LIMIT 6`),
      pool.query(`SELECT pk.nama_paket, pk.kecepatan, COUNT(p.id) AS jumlah
                  FROM paket pk LEFT JOIN pelanggan p ON p.id_paket=pk.id
                  GROUP BY pk.id ORDER BY pk.kecepatan`),
      pool.query(`
        SELECT m.bulan, m.bln, m.thn, COALESCE(SUM(pb.jumlah), 0) AS total
        FROM (
          SELECT DATE_FORMAT(DATE_SUB(NOW(), INTERVAL n MONTH), '%b %Y') AS bulan,
                 MONTH(DATE_SUB(NOW(), INTERVAL n MONTH)) AS bln,
                 YEAR(DATE_SUB(NOW(), INTERVAL n MONTH))  AS thn
          FROM (SELECT 5 AS n UNION SELECT 4 UNION SELECT 3 UNION SELECT 2 UNION SELECT 1 UNION SELECT 0) nums
        ) m
        LEFT JOIN pembayaran pb
          ON MONTH(pb.tgl_bayar) = m.bln AND YEAR(pb.tgl_bayar) = m.thn
        GROUP BY m.thn, m.bln, m.bulan
        ORDER BY m.thn, m.bln
      `),
      pool.query(`SELECT COALESCE(SUM(jumlah),0) AS total_masuk FROM pembayaran`),
      pool.query(`SELECT COALESCE(SUM(jumlah),0) AS total_keluar FROM pengeluaran`),
    ])

    const saldo = Number(saldoMasukRows[0].total_masuk) - Number(saldoKeluarRows[0].total_keluar)

    res.json({
      pelanggan:      totalPelangganRows[0],
      tagihan:        totalTagihanRows[0],
      pendapatan:     pendapatanRows[0].bulan_ini,
      saldo,
      tagihanTerbaru,
      distribusiPaket,
      pendapatan6,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
