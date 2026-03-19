import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, COUNT(pl.id) AS jumlah_pelanggan
      FROM paket p
      LEFT JOIN pelanggan pl ON pl.id_paket = p.id
      GROUP BY p.id ORDER BY p.kecepatan ASC
    `)
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nama_paket, kecepatan, harga, deskripsi } = await req.json()
    if (!nama_paket || !kecepatan || !harga)
      return NextResponse.json({ error: 'Field wajib diisi' }, { status: 400 })
    const [r]: any = await pool.query(
      'INSERT INTO paket (nama_paket, kecepatan, harga, deskripsi) VALUES (?,?,?,?)',
      [nama_paket, kecepatan, harga, deskripsi]
    )
    return NextResponse.json({ id: r.insertId }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
