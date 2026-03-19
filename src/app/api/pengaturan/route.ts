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
    const nama_isp = formData.get('nama_isp') as string
    const telepon = formData.get('telepon') as string
    const email = formData.get('email') as string
    const website = formData.get('website') as string
    const alamat = formData.get('alamat') as string
    const logo_file = formData.get('logo_file') as File | null

    let logo_url = null
    if (logo_file) {
      const bytes = await logo_file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `logo-${Date.now()}.${logo_file.type.split('/')[1]}`

      // Save to public folder
      const fs = require('fs').promises
      const path = require('path').join(process.cwd(), 'public', 'uploads', fileName)

      // Create uploads folder if not exists
      const uploadDir = require('path').join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(uploadDir, { recursive: true })

      await fs.writeFile(path, buffer)
      logo_url = `/uploads/${fileName}`
    }

    // Check if pengaturan exists
    const [existing]: any = await pool.query("SELECT id FROM pengaturan LIMIT 1")

    if (existing.length > 0) {
      // Update
      const updateQuery = logo_url
        ? `UPDATE pengaturan SET nama_isp=?, telepon=?, email=?, website=?, alamat=?, logo_url=?`
        : `UPDATE pengaturan SET nama_isp=?, telepon=?, email=?, website=?, alamat=?`

      const params = logo_url
        ? [nama_isp, telepon, email, website, alamat, logo_url]
        : [nama_isp, telepon, email, website, alamat]

      await pool.query(updateQuery, params)
    } else {
      // Insert
      await pool.query(
        `INSERT INTO pengaturan (nama_isp, telepon, email, website, alamat, logo_url) VALUES (?,?,?,?,?,?)`,
        [nama_isp, telepon, email, website, alamat, logo_url]
      )
    }

    return NextResponse.json({ success: true, logo_url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
