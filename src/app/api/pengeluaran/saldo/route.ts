import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [[masuk]]:    any = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pembayaran')
    const [[masukLain]]: any = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pemasukan')
    const [[keluar]]:   any = await pool.query('SELECT COALESCE(SUM(jumlah),0) AS total FROM pengeluaran')
    const saldo = Number(masuk.total) + Number(masukLain.total) - Number(keluar.total)
    return NextResponse.json({ saldo })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
