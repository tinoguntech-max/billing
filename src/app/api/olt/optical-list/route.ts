import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'
import http from 'http'

function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex')
}

/**
 * OLT C-Data HTTP request helper.
 *
 * lighttpd/1.4.79 pada OLT ini mengembalikan body yang bisa datang dalam
 * beberapa chunk. Node.js http.request sudah menangani ini dengan benar
 * selama kita mengumpulkan semua 'data' event sebelum 'end' — yang memang
 * sudah dilakukan di sini. Tidak perlu raw TCP; masalah sebelumnya adalah
 * curl di Windows yang memotong response.
 */
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
        try {
          const parsed = JSON.parse(raw)
          resolve(parsed)
        } catch {
          reject(new Error(`Invalid JSON from OLT (${raw.length} bytes): ${raw.slice(0, 200)}`))
        }
      })
    })

    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error('OLT request timeout (15s)'))
    })

    req.on('error', (err) => reject(new Error(`OLT connection error: ${err.message}`)))

    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

async function loginOlt(host: string, port: number, user: string, password: string): Promise<string> {
  const result = await oltRequest(
    host, port,
    '/cgi-bin/h.cgi?module=sys_login',
    'POST',
    { Usrname: user, Password: md5(password) },
    null
  )

  // code 0 = sukses, data.token berisi token string
  if (result?.code !== 0) {
    throw new Error(result?.description || `Login gagal (code: ${result?.code})`)
  }

  const token: string | undefined = result?.data?.token
  if (!token) {
    throw new Error('Login berhasil tapi server tidak mengembalikan token')
  }

  return token
}

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      'SELECT olt_host, olt_port, olt_user, olt_password FROM pengaturan LIMIT 1'
    )

    const cfg = rows?.[0]
    if (!cfg?.olt_host) {
      return NextResponse.json({ error: 'OLT belum dikonfigurasi di Pengaturan' }, { status: 400 })
    }

    const host     = String(cfg.olt_host).trim()
    const port     = Number(cfg.olt_port) || 8181
    const user     = String(cfg.olt_user).trim()
    const password = String(cfg.olt_password).trim()

    // Login → dapat token
    const token = await loginOlt(host, port, user, password)

    // Ambil semua data optik ONT
    const result = await oltRequest(
      host, port,
      '/cgi-bin/h.cgi?module=ont_optical_list_get',
      'GET',
      null,
      token
    )

    if (result?.code !== 0) {
      throw new Error(result?.description || `Gagal ambil data optik (code: ${result?.code})`)
    }

    const list: any[] = result?.data?.list ?? []
    const total: number = result?.data?.PageTotal ?? list.length

    return NextResponse.json({ data: list, total })
  } catch (e: any) {
    console.error('[OLT optical-list]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
