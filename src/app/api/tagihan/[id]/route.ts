import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, tgl_jatuh_tempo, periode } = await req.json()
    await pool.query(
      'UPDATE tagihan SET status=?, tgl_jatuh_tempo=COALESCE(?,tgl_jatuh_tempo), periode=COALESCE(NULLIF(?,\'\'),periode) WHERE id=?',
      [status, tgl_jatuh_tempo || null, periode || null, params.id]
    )
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
