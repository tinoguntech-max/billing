import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { id_tagihan } = await req.json()
    if (!id_tagihan) return NextResponse.json({ error: 'id_tagihan wajib diisi' }, { status: 400 })

    // Ambil data tagihan + pelanggan
    const [[row]]: any = await pool.query(
      `SELECT t.*, p.nama AS nama_pelanggan, p.telepon, pk.nama_paket
       FROM tagihan t
       JOIN pelanggan p ON t.id_pelanggan = p.id
       LEFT JOIN paket pk ON p.id_paket = pk.id
       WHERE t.id = ?`,
      [id_tagihan]
    )
    if (!row) return NextResponse.json({ error: 'Tagihan tidak ditemukan' }, { status: 404 })
    if (!row.telepon) return NextResponse.json({ error: 'Pelanggan tidak memiliki nomor telepon' }, { status: 400 })

    const [[config]]: any = await pool.query('SELECT nama_isp FROM pengaturan LIMIT 1')
    const namaISP = config?.nama_isp || 'ISP'

    const jatuhTempo = String(row.tgl_jatuh_tempo || '').slice(0, 10)
    const jumlah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(row.jumlah)

    const message = `📋 *Tagihan Internet - ${namaISP}*

Halo *${row.nama_pelanggan}*,

Berikut informasi tagihan Anda:

• No. Tagihan : ${row.no_tagihan}
• Paket       : ${row.nama_paket || '-'}
• Periode     : ${row.periode || '-'}
• Jumlah      : ${jumlah}
• Jatuh Tempo : ${jatuhTempo}
• Status      : ${row.status}

Mohon segera lakukan pembayaran sebelum jatuh tempo.

Terima kasih 🙏
_${namaISP}_`

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const waRes = await fetch(`${backendUrl}/api/whatsapp/send-to-customer/${row.id_pelanggan}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    const waData = await waRes.json()
    if (!waData.success) return NextResponse.json({ error: waData.message || 'Gagal kirim WA' }, { status: 500 })

    return NextResponse.json({ success: true, message: `Notifikasi WA terkirim ke ${row.nama_pelanggan}` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
