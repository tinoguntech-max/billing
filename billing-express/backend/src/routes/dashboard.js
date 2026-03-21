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
      [pemasukanBulanIniRows],
      [totalPemasukanRows],
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
        SELECT m.bulan, m.bln, m.thn,
               COALESCE(pb.total, 0) + COALESCE(pm.total, 0) AS total
        FROM (
          SELECT DATE_FORMAT(DATE_SUB(NOW(), INTERVAL n MONTH), '%b %Y') AS bulan,
                 MONTH(DATE_SUB(NOW(), INTERVAL n MONTH)) AS bln,
                 YEAR(DATE_SUB(NOW(), INTERVAL n MONTH))  AS thn
          FROM (SELECT 5 AS n UNION SELECT 4 UNION SELECT 3 UNION SELECT 2 UNION SELECT 1 UNION SELECT 0) nums
        ) m
        LEFT JOIN (
          SELECT MONTH(tgl_bayar) AS bln, YEAR(tgl_bayar) AS thn, SUM(jumlah) AS total
          FROM pembayaran GROUP BY YEAR(tgl_bayar), MONTH(tgl_bayar)
        ) pb ON pb.bln = m.bln AND pb.thn = m.thn
        LEFT JOIN (
          SELECT MONTH(tgl_pemasukan) AS bln, YEAR(tgl_pemasukan) AS thn, SUM(jumlah) AS total
          FROM pemasukan GROUP BY YEAR(tgl_pemasukan), MONTH(tgl_pemasukan)
        ) pm ON pm.bln = m.bln AND pm.thn = m.thn
        ORDER BY m.thn, m.bln
      `),
      pool.query(`SELECT COALESCE(SUM(jumlah),0) AS total_masuk FROM pembayaran`),
      pool.query(`SELECT COALESCE(SUM(jumlah),0) AS total_keluar FROM pengeluaran`),
      pool.query(`SELECT COALESCE(SUM(jumlah),0) AS total FROM pemasukan
                  WHERE MONTH(tgl_pemasukan)=MONTH(NOW()) AND YEAR(tgl_pemasukan)=YEAR(NOW())`),
      pool.query(`SELECT COALESCE(SUM(jumlah),0) AS total FROM pemasukan`),
    ])

    const saldo = Number(saldoMasukRows[0].total_masuk) + Number(totalPemasukanRows[0].total) - Number(saldoKeluarRows[0].total_keluar)
    const pemasukanLain = Number(pemasukanBulanIniRows[0].total)
    const pendapatanBulanIni = Number(pendapatanRows[0].bulan_ini) + pemasukanLain

    res.json({
      pelanggan:      totalPelangganRows[0],
      tagihan:        totalTagihanRows[0],
      pendapatan:     pendapatanBulanIni,
      pemasukanLain,
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
