import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM pengeluaran WHERE id = ?', [params.id])
    return NextResponse.json({ message: 'OK' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { kategori, jumlah, tgl_pengeluaran, keterangan, id_karyawan } = await req.json()
    await pool.query(
      'UPDATE pengeluaran SET kategori=?, jumlah=?, tgl_pengeluaran=?, keterangan=?, id_karyawan=? WHERE id=?',
      [kategori, jumlah, tgl_pengeluaran, keterangan || '', id_karyawan || null, params.id]
    )
    return NextResponse.json({ message: 'OK' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
