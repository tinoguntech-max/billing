import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM pengaturan LIMIT 1"
    )

    if (rows.length === 0) {
      return NextResponse.json({
        nama_isp: 'NetBill Internet Provider',
        telepon: '(0355) 123-4567',
        email: 'info@netbill.id',
        website: 'https://netbill.id',
        alamat: 'Jl. Mawar No. 12, Tulungagung, Jawa Timur',
        logo_url: null
      })
    }

    return NextResponse.json(rows[0])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const nama_isp          = formData.get('nama_isp') as string
    const telepon           = formData.get('telepon') as string
    const email             = formData.get('email') as string
    const website           = formData.get('website') as string
    const alamat            = formData.get('alamat') as string
    const mikrotik_host     = formData.get('mikrotik_host') as string
    const mikrotik_user     = formData.get('mikrotik_user') as string
    const mikrotik_password = formData.get('mikrotik_password') as string
    const mikrotik_port     = formData.get('mikrotik_port') as string
    const olt_host          = formData.get('olt_host') as string
    const olt_port          = formData.get('olt_port') as string
    const olt_user          = formData.get('olt_user') as string
    const olt_password      = formData.get('olt_password') as string
    const logo_file         = formData.get('logo_file') as File | null

    let logo_url = null
    if (logo_file) {
      const bytes = await logo_file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `logo-${Date.now()}.${logo_file.type.split('/')[1]}`

      const fs = require('fs').promises
      const uploadDir = require('path').join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      await fs.writeFile(require('path').join(uploadDir, fileName), buffer)
      logo_url = `/uploads/${fileName}`
    }

    // Check if pengaturan exists
    const [existing]: any = await pool.query("SELECT id FROM pengaturan LIMIT 1")

    if (existing.length > 0) {
      const id = existing[0].id
      if (logo_url) {
        await pool.query(
          `UPDATE pengaturan SET nama_isp=?, telepon=?, email=?, website=?, alamat=?, logo_url=?,
           mikrotik_host=?, mikrotik_user=?, mikrotik_password=?, mikrotik_port=?,
           olt_host=?, olt_port=?, olt_user=?, olt_password=? WHERE id=?`,
          [nama_isp, telepon, email, website, alamat, logo_url,
           mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port,
           olt_host, olt_port, olt_user, olt_password, id]
        )
      } else {
        await pool.query(
          `UPDATE pengaturan SET nama_isp=?, telepon=?, email=?, website=?, alamat=?,
           mikrotik_host=?, mikrotik_user=?, mikrotik_password=?, mikrotik_port=?,
           olt_host=?, olt_port=?, olt_user=?, olt_password=? WHERE id=?`,
          [nama_isp, telepon, email, website, alamat,
           mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port,
           olt_host, olt_port, olt_user, olt_password, id]
        )
      }
    } else {
      await pool.query(
        `INSERT INTO pengaturan (nama_isp, telepon, email, website, alamat, logo_url,
         mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port,
         olt_host, olt_port, olt_user, olt_password)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [nama_isp, telepon, email, website, alamat, logo_url,
         mikrotik_host, mikrotik_user, mikrotik_password, mikrotik_port,
         olt_host, olt_port, olt_user, olt_password]
      )
    }

    return NextResponse.json({ success: true, logo_url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
