import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json()
    await pool.query('UPDATE tagihan SET status=? WHERE id=?', [status, params.id])
    return NextResponse.json({ message: 'Tagihan diperbarui' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM tagihan WHERE id=?', [params.id])
    return NextResponse.json({ message: 'Tagihan dihapus' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
