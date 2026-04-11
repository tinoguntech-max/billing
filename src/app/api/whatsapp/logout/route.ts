import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const r = await fetch(`${backendUrl}/api/whatsapp/logout`, { method: 'POST' })
    const d = await r.json()
    return NextResponse.json(d)
  } catch {
    return NextResponse.json({ success: false, error: 'Backend tidak dapat dijangkau' }, { status: 500 })
  }
}
