import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bulan    = searchParams.get('bulan') || ''
    const tahun    = searchParams.get('tahun') || ''
    const kategori = searchParams.get('kategori') || ''
    const page     = Math.max(1, Number(searchParams.get('page') || 1))
    const limit    = Math.min(100, Number(searchParams.get('limit') || 50))
    const offset   = (page - 1) * limit

    let where = 'WHERE 1=1'
    const params: any[] = []
    if (bulan)    { where += ' AND MONTH(tgl_pengeluaran) = ?'; params.push(bulan) }
    if (tahun)    { where += ' AND YEAR(tgl_pengeluaran) = ?';  params.push(tahun) }
    if (kategori) { where += ' AND kategori = ?';               params.push(kategori) }

    const [[{ total }], [rows], [summary]]: any = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pengeluaran ${where}`, params),
      pool.query(`SELECT * FROM pengeluaran ${where} ORDER BY tgl_pengeluaran DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      pool.query(`SELECT kategori, SUM(jumlah) AS total FROM pengeluaran ${where} GROUP BY kategori`, params),
    ])

    return NextResponse.json({ data: rows, total, page, limit, summary })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { kategori, jumlah, tgl_pengeluaran, keterangan, id_karyawan } = await req.json()
    if (!kategori || !jumlah || !tgl_pengeluaran)
      return NextResponse.json({ error: 'Kategori, jumlah, dan tanggal wajib diisi' }, { status: 400 })

    // Cek saldo sebelum simpan
    const [[masuk]]:    any = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pembayaran')
    const [[masukLain]]: any = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pemasukan')
    const [[keluar]]:   any = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pengeluaran')
    const saldo = Number(masuk.total) + Number(masukLain.total) - Number(keluar.total)
    if (Number(jumlah) > saldo)
      return NextResponse.json({ error: 'Saldo tidak cukup' }, { status: 400 })

    const [r]: any = await pool.query(
      'INSERT INTO pengeluaran (kategori, jumlah, tgl_pengeluaran, keterangan, id_karyawan) VALUES (?,?,?,?,?)',
      [kategori, jumlah, tgl_pengeluaran, keterangan || '', id_karyawan || null]
    )
    return NextResponse.json({ id: r.insertId }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
