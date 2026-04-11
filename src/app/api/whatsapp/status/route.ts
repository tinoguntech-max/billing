import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const r = await fetch(`${backendUrl}/api/whatsapp/status`, { cache: 'no-store' })
    const d = await r.json()
    return NextResponse.json(d)
  } catch {
    return NextResponse.json({ ready: false, hasQR: false, error: 'Backend tidak dapat dijangkau' })
  }
}
