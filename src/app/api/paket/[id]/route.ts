import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nama_paket, kecepatan, harga, deskripsi } = await req.json()
    await pool.query(
      'UPDATE paket SET nama_paket=?, kecepatan=?, harga=?, deskripsi=? WHERE id=?',
      [nama_paket, kecepatan, harga, deskripsi, params.id]
    )
    return NextResponse.json({ message: 'Paket diperbarui' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM paket WHERE id=?', [params.id])
    return NextResponse.json({ message: 'Paket dihapus' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
