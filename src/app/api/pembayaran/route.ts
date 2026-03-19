import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT py.*, t.no_tagihan, t.jumlah AS jumlah_tagihan,
             p.nama AS nama_pelanggan
      FROM pembayaran py
      JOIN tagihan t  ON py.id_tagihan = t.id
      JOIN pelanggan p ON t.id_pelanggan = p.id
      ORDER BY py.created_at DESC
    `)
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id_tagihan, jumlah, metode, tgl_bayar, keterangan } = await req.json()
    if (!id_tagihan || !jumlah)
      return NextResponse.json({ error: 'id_tagihan dan jumlah wajib diisi' }, { status: 400 })

    // Insert pembayaran
    const [r]: any = await pool.query(
      'INSERT INTO pembayaran (id_tagihan, jumlah, metode, tgl_bayar, keterangan) VALUES (?,?,?,?,?)',
      [id_tagihan, jumlah, metode || 'Tunai', tgl_bayar || new Date(), keterangan || '']
    )
    // Update status tagihan → Lunas
    await pool.query("UPDATE tagihan SET status='Lunas' WHERE id=?", [id_tagihan])

    return NextResponse.json({ id: r.insertId }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
