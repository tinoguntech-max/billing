import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page   = Math.max(1, Number(searchParams.get('page') || 1))
    const limit  = Math.min(100, Number(searchParams.get('limit') || 50))
    const offset = (page - 1) * limit

    let where = 'WHERE 1=1'
    const params: any[] = []
    if (search) { where += ' AND (p.nama LIKE ? OR p.telepon LIKE ? OR p.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
    if (status) { where += ' AND p.status = ?'; params.push(status) }

    const [[{ total }], [rows]]: any = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pelanggan p ${where}`, params),
      pool.query(
        `SELECT p.*, pk.nama_paket, pk.harga, pk.kecepatan
         FROM pelanggan p
         LEFT JOIN paket pk ON p.id_paket = pk.id
         ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
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
    const body = await req.json()
    const { nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung } = body
    if (!nama || !telepon) return NextResponse.json({ error: 'Nama dan telepon wajib diisi' }, { status: 400 })

    const [result]: any = await pool.query(
      `INSERT INTO pelanggan (nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama, email, telepon, alamat, ip_address, id_paket || null, status || 'Aktif', tgl_bergabung || new Date().toISOString().split('T')[0]]
    )
    return NextResponse.json({ id: result.insertId, message: 'Pelanggan berhasil ditambahkan' }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
