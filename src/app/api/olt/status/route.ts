import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'
import http from 'http'

function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex')
}

function oltRequest(
  host: string,
  port: number,
  path: string,
  method: 'GET' | 'POST',
  body: Record<string, unknown> | null,
  token: string | null
): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null

    const options: http.RequestOptions = {
      hostname: host,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        ...(token ? { token } : {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    }

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8')
        try { resolve(JSON.parse(raw)) }
        catch { reject(new Error(`Invalid JSON: ${raw.slice(0, 100)}`)) }
      })
    })

    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', (err) => reject(err))
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      'SELECT olt_host, olt_port, olt_user, olt_password FROM pengaturan LIMIT 1'
    )

    const cfg = rows?.[0]
    if (!cfg?.olt_host) {
      return NextResponse.json({ connected: false, message: 'OLT belum dikonfigurasi' })
    }

    const host     = String(cfg.olt_host).trim()
    const port     = Number(cfg.olt_port) || 8181
    const user     = String(cfg.olt_user).trim()
    const password = String(cfg.olt_password).trim()

    const result = await oltRequest(
      host, port,
      '/cgi-bin/h.cgi?module=sys_login',
      'POST',
      { Usrname: user, Password: md5(password) },
      null
    )

    if (result?.code !== 0) {
      return NextResponse.json({
        connected: false,
        message: result?.description || `Login gagal (code: ${result?.code})`
      })
    }

    const token: string | undefined = result?.data?.token
    if (!token) {
      return NextResponse.json({
        connected: false,
        message: 'Server tidak mengembalikan token — periksa kredensial OLT'
      })
    }

    return NextResponse.json({
      connected: true,
      message: `OLT terhubung — ${host}:${port}`,
      host,
      port
    })
  } catch (e: any) {
    return NextResponse.json({ connected: false, message: e.message })
  }
}
