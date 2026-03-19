import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST() {
  try {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear  = today.getFullYear()
    const mmyy = `${String(currentMonth).padStart(2,'0')}${currentYear}`

    // Ambil semua pelanggan aktif sekaligus dengan id yang sudah punya tagihan bulan ini
    const [pelanggan]: any = await pool.query(`
      SELECT p.id, p.nama, p.tgl_bergabung, pk.harga
      FROM pelanggan p
      JOIN paket pk ON p.id_paket = pk.id
      WHERE p.status = 'Aktif' AND p.tgl_bergabung IS NOT NULL
        AND p.id NOT IN (
          SELECT id_pelanggan FROM tagihan
          WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        )
    `, [currentMonth, currentYear])

    if (pelanggan.length === 0) {
      return NextResponse.json({ success: true, message: '0 tagihan dibuat (semua sudah ada)', created: 0 })
    }

    // Ambil count sekali saja di luar loop
    const [[{ count }]]: any = await pool.query(
      'SELECT COUNT(*) as count FROM tagihan WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?',
      [currentMonth, currentYear]
    )

    // Bangun batch insert
    const values: any[] = []
    const placeholders: string[] = []

    pelanggan.forEach((p: any, i: number) => {
      const tglBergabung    = new Date(p.tgl_bergabung)
      const tanggalBergabung = tglBergabung.getDate()
      let tglJatuhTempo = new Date(today.getFullYear(), today.getMonth(), tanggalBergabung + 3)
      if (tanggalBergabung > today.getDate() && today.getMonth() === tglBergabung.getMonth()) {
        tglJatuhTempo = new Date(today.getFullYear(), today.getMonth() + 1, tanggalBergabung + 3)
      }

      const periode   = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long' }).format(tglJatuhTempo)
      const seqNum    = String(Number(count) + i + 1).padStart(3, '0')
      const noTagihan = `INV-${mmyy}-${seqNum}`

      placeholders.push('(?, ?, ?, ?, ?, ?)')
      values.push(noTagihan, p.id, periode, p.harga, tglJatuhTempo.toISOString().split('T')[0], 'Belum Bayar')
    })

    await pool.query(
      `INSERT INTO tagihan (no_tagihan, id_pelanggan, periode, jumlah, tgl_jatuh_tempo, status)
       VALUES ${placeholders.join(', ')}`,
      values
    )

    return NextResponse.json({
      success: true,
      message: `${pelanggan.length} tagihan otomatis berhasil dibuat`,
      created: pelanggan.length,
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
