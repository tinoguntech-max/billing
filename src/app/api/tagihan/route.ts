import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status       = searchParams.get('status') || ''
    const id_pelanggan = searchParams.get('id_pelanggan') || ''
    const page         = Math.max(1, Number(searchParams.get('page') || 1))
    const limit        = Math.min(100, Number(searchParams.get('limit') || 50))
    const offset       = (page - 1) * limit

    let where = 'WHERE 1=1'
    const params: any[] = []
    if (status)       { where += ' AND t.status = ?';        params.push(status) }
    if (id_pelanggan) { where += ' AND t.id_pelanggan = ?';  params.push(id_pelanggan) }

    const [[{ total }], [rows]]: any = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM tagihan t ${where}`,
        params
      ),
      pool.query(
        `SELECT t.*, p.nama AS nama_pelanggan, pk.nama_paket, pk.kecepatan
         FROM tagihan t
         JOIN pelanggan p  ON t.id_pelanggan = p.id
         LEFT JOIN paket pk ON p.id_paket = pk.id
         ${where} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
    ])

    return NextResponse.json({ data: rows, total, page, limit })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id_pelanggan, periode, jumlah, tgl_jatuh_tempo } = await req.json()
    if (!id_pelanggan || !jumlah)
      return NextResponse.json({ error: 'id_pelanggan dan jumlah wajib diisi' }, { status: 400 })

    // Generate no_tagihan
    const now = new Date()
    const yy  = String(now.getFullYear()).slice(2)
    const mm  = String(now.getMonth() + 1).padStart(2, '0')
    const [countRows]: any = await pool.query('SELECT COUNT(*) AS c FROM tagihan')
    const seq = String((countRows[0].c ?? 0) + 1).padStart(3, '0')
    const no_tagihan = `INV-${yy}${mm}-${seq}`

    const [r]: any = await pool.query(
      `INSERT INTO tagihan (no_tagihan, id_pelanggan, periode, jumlah, tgl_jatuh_tempo, status)
       VALUES (?, ?, ?, ?, ?, 'Belum Bayar')`,
      [no_tagihan, id_pelanggan, periode, jumlah, tgl_jatuh_tempo]
    )
    return NextResponse.json({ id: r.insertId, no_tagihan }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
