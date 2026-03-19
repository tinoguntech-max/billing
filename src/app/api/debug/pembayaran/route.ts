import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 DEBUG API - Checking payment data...')

    // Check table exists
    const [tables]: any = await pool.query(`SHOW TABLES LIKE 'pembayaran'`)
    console.log('📋 Tables found:', tables.length > 0 ? 'YES' : 'NO')

    // Check raw pembayaran data
    const [rawPembayaran]: any = await pool.query(`SELECT COUNT(*) as total FROM pembayaran`)
    console.log('📊 Raw pembayaran count:', rawPembayaran[0].total)

    // Check all payments with joins
    const [pembayaran]: any = await pool.query(`
      SELECT py.id, py.id_tagihan, py.jumlah, py.metode, py.tgl_bayar, py.created_at,
             t.no_tagihan, t.status as status_tagihan, p.nama AS nama_pelanggan
      FROM pembayaran py
      LEFT JOIN tagihan t ON py.id_tagihan = t.id
      LEFT JOIN pelanggan p ON t.id_pelanggan = p.id
      ORDER BY py.created_at DESC
    `)

    console.log('📋 Total pembayaran di DB:', pembayaran.length)
    pembayaran.forEach((p: any, i: number) => {
      console.log(`  [${i+1}] ID: ${p.id}, Tgl: ${p.tgl_bayar}, Jumlah: ${p.jumlah}, Customer: ${p.nama_pelanggan}, Status Tagihan: ${p.status_tagihan}`)
    })

    // Check this month payments
    const [thisMonth]: any = await pool.query(`
      SELECT py.id, py.id_tagihan, py.jumlah, py.metode, py.tgl_bayar,
             t.no_tagihan, p.nama AS nama_pelanggan
      FROM pembayaran py
      LEFT JOIN tagihan t ON py.id_tagihan = t.id
      LEFT JOIN pelanggan p ON t.id_pelanggan = p.id
      WHERE MONTH(py.tgl_bayar) = MONTH(NOW())
        AND YEAR(py.tgl_bayar) = YEAR(NOW())
      ORDER BY py.created_at DESC
    `)

    console.log('📅 Pembayaran bulan ini:', thisMonth.length)
    thisMonth.forEach((p: any, i: number) => {
      console.log(`  [${i+1}] ${p.no_tagihan} - ${p.nama_pelanggan} - Rp ${p.jumlah}`)
    })

    // Check tagihan data
    const [allTagihan]: any = await pool.query(`SELECT COUNT(*) as total FROM tagihan`)
    const [tagihanLunas]: any = await pool.query(`SELECT COUNT(*) as total FROM tagihan WHERE status='Lunas'`)
    console.log(`📝 Tagihan - Total: ${allTagihan[0].total}, Lunas: ${tagihanLunas[0].total}`)

    return NextResponse.json({
      status: 'OK',
      totalPembayaran: pembayaran.length,
      bulanIni: thisMonth.length,
      allPayments: pembayaran,
      thisMonthPayments: thisMonth,
      tagihanStats: {
        total: allTagihan[0].total,
        lunas: tagihanLunas[0].total
      }
    })
  } catch (e: any) {
    console.error('❌ Error:', e.message)
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
  }
}
