import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [
      [totalPelangganRows],
      [totalTagihanRows],
      [pendapatanRows],
      [tagihanTerbaru],
      [distribusiPaket],
      [pendapatan6],
    ]: any = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, SUM(status='Aktif') AS aktif FROM pelanggan"),
      pool.query("SELECT COUNT(*) AS total, SUM(status='Lunas') AS lunas, SUM(status='Belum Bayar') AS belum FROM tagihan"),
      pool.query(
        `SELECT COALESCE(SUM(py.jumlah),0) AS bulan_ini
         FROM pembayaran py
         WHERE MONTH(py.tgl_bayar)=MONTH(NOW()) AND YEAR(py.tgl_bayar)=YEAR(NOW())`
      ),
      pool.query(`
        SELECT t.*, p.nama AS nama_pelanggan, pk.nama_paket
        FROM tagihan t
        JOIN pelanggan p ON t.id_pelanggan=p.id
        LEFT JOIN paket pk ON p.id_paket=pk.id
        ORDER BY t.created_at DESC LIMIT 6
      `),
      pool.query(`
        SELECT pk.nama_paket, pk.kecepatan, COUNT(p.id) AS jumlah
        FROM paket pk LEFT JOIN pelanggan p ON p.id_paket=pk.id
        GROUP BY pk.id ORDER BY pk.kecepatan
      `),
      pool.query(`
        SELECT DATE_FORMAT(tgl_bayar,'%b %Y') AS bulan,
               MONTH(tgl_bayar) AS bln, YEAR(tgl_bayar) AS thn,
               SUM(jumlah) AS total
        FROM pembayaran
        WHERE tgl_bayar >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY bln, thn ORDER BY thn, bln
      `),
    ])

    const response = {
      pelanggan:      totalPelangganRows?.[0] || { total: 0, aktif: 0 },
      tagihan:        totalTagihanRows?.[0] || { total: 0, lunas: 0, belum: 0 },
      pendapatan:     pendapatanRows?.[0]?.bulan_ini || 0,
      tagihanTerbaru: tagihanTerbaru || [],
      distribusiPaket: distribusiPaket || [],
      pendapatan6:    pendapatan6 || [],
    }

    return NextResponse.json(response)
  } catch (e: any) {
    console.error('Dashboard API Error:', e)
    return NextResponse.json({ 
      error: e.message,
      pelanggan: { total: 0, aktif: 0 },
      tagihan: { total: 0, lunas: 0, belum: 0 },
      pendapatan: 0,
      tagihanTerbaru: [],
      distribusiPaket: [],
      pendapatan6: []
    }, { status: 500 })
  }
}
