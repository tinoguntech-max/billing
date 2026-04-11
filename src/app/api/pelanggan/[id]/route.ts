import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung } = body
    await pool.query(
      `UPDATE pelanggan SET nama=?, email=?, telepon=?, alamat=?, ip_address=?, id_paket=?, status=?, tgl_bergabung=? WHERE id=?`,
      [nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung || null, params.id]
    )
    return NextResponse.json({ message: 'Pelanggan diperbarui' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM pelanggan WHERE id = ?', [params.id])
    return NextResponse.json({ message: 'Pelanggan dihapus' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
