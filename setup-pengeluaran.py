import os
import pathlib

# Create directories
dirs = [
    'src/app/pengeluaran',
    'src/app/api/pengeluaran'
]

for d in dirs:
    os.makedirs(d, exist_ok=True)
    print(f'Created: {d}')

# Create files
files_content = {
    'src/app/pengeluaran/page.tsx': '''\'use client\'
import { useEffect, useState, useCallback } from 'react'
import Shell from '@/components/Shell'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { Plus, Wrench, Zap, Home, Briefcase, AlertCircle } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
}

const KategoriIcon: Record<string, any> = {
  'Maintenance': Wrench,
  'Listrik': Zap,
  'Sewa Ruang': Home,
  'Operasional': Briefcase,
  'Lainnya': AlertCircle
}

const emptyForm = { kategori: 'Maintenance', jumlah: '', tgl_pengeluaran: '', keterangan: '' }

export default function PengeluaranPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'}|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/pengeluaran')
    setData(await r.json()); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openModal = () => {
    const now = new Date()
    const pad = (n:number) => String(n).padStart(2,'0')
    setForm({ ...emptyForm, tgl_pengeluaran:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}` })
    setModal(true)
  }

  const save = async () => {
    if (!form.kategori || !form.jumlah || !form.tgl_pengeluaran) { 
      setToast({ msg:'Lengkapi form!', type:'error' }); return 
    }
    const r = await fetch('/api/pengeluaran', { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body:JSON.stringify(form) 
    })
    if (!r.ok) { const d=await r.json(); setToast({ msg:d.error, type:'error' }); return }
    setToast({ msg:'Pengeluaran berhasil dicatat!', type:'success' })
    setModal(false); load()
  }

  const now = new Date()
  const bulanIni = data.filter((p:any) => {
    const tgl = new Date(p.tgl_pengeluaran)
    return tgl.getMonth()===now.getMonth() && tgl.getFullYear()===now.getFullYear()
  })
  const namabulan = new Intl.DateTimeFormat('id-ID', {month:'long', year:'numeric'}).format(now)
  const totalBulanIni = bulanIni.reduce((s,p) => s+Number(p.jumlah), 0)

  const kategoriList = ['Maintenance', 'Listrik', 'Sewa Ruang', 'Operasional', 'Lainnya']

  return (
    <Shell>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Pengeluaran Operasional</h1>
          <p className="text-muted text-sm mt-1">Pengeluaran bulan {namabulan}</p>
        </div>
        <button onClick={openModal} className="btn-primary w-fit"><Plus size={16}/> Catat Pengeluaran</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-pastel-mint rounded-2xl p-4 text-center border border-green-100">
          <div className="text-xl font-bold text-accent-mint">{bulanIni.length}</div>
          <div className="text-xs text-muted mt-1">Total Transaksi</div>
        </div>
        <div className="bg-pastel-purple rounded-2xl p-4 text-center border border-purple-100">
          <div className="text-xl font-bold text-accent-purple truncate">{fmt(totalBulanIni)}</div>
          <div className="text-xs text-muted mt-1">Total Pengeluaran</div>
        </div>
        <div className="bg-pastel-blue rounded-2xl p-4 text-center border border-blue-100">
          <div className="text-xl font-bold text-accent-blue">{bulanIni.filter(p => p.kategori === 'Maintenance').length}</div>
          <div className="text-xs text-muted mt-1">Maintenance</div>
        </div>
        <div className="bg-pastel-yellow rounded-2xl p-4 text-center border border-yellow-100">
          <div className="text-xl font-bold text-accent-yellow">{bulanIni.filter(p => p.kategori !== 'Maintenance').length}</div>
          <div className="text-xs text-muted mt-1">Lainnya</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th">Kategori</th><th className="th">Deskripsi</th>
                <th className="th">Tanggal</th><th className="th">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(4)].map((_,j)=><td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
              )) : bulanIni.map(p => {
                const Icon = KategoriIcon[p.kategori] || AlertCircle
                return (
                  <tr key={p.id} className="table-row-hover border-t border-purple-50">
                    <td className="td">
                      <span className="flex items-center gap-1.5 text-xs text-muted font-semibold">
                        <Icon size={13} className="text-accent-purple"/>{p.kategori}
                      </span>
                    </td>
                    <td className="td text-xs text-muted">{p.keterangan || '-'}</td>
                    <td className="td text-xs text-muted">{String(p.tgl_pengeluaran).slice(0,10)}</td>
                    <td className="td font-mono font-bold text-accent-mint">{fmt(p.jumlah)}</td>
                  </tr>
                )
              })}
              {!loading && !bulanIni.length && (
                <tr><td colSpan={4} className="td text-center text-muted py-10">Belum ada pengeluaran bulan ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Catat Pengeluaran" headerColor="bg-pastel-yellow">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Kategori *</label>
            <select className="input-field" value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})}>
              {kategoriList.map(kat=>(
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
              <input className="input-field font-mono" type="number" value={form.jumlah} onChange={e=>setForm({...form,jumlah:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tanggal</label>
              <input className="input-field" type="date" value={form.tgl_pengeluaran} onChange={e=>setForm({...form,tgl_pengeluaran:e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Deskripsi</label>
            <input className="input-field" placeholder="Opsional..." value={form.keterangan} onChange={e=>setForm({...form,keterangan:e.target.value})}/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-primary justify-center">Konfirmasi</button>
        </div>
      </Modal>
    </Shell>
  )
}
''',
    'src/app/api/pengeluaran/route.ts': '''import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM pengeluaran
      ORDER BY tgl_pengeluaran DESC, created_at DESC
    `)
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { kategori, jumlah, tgl_pengeluaran, keterangan } = await req.json()
    if (!kategori || !jumlah || !tgl_pengeluaran)
      return NextResponse.json({ error: 'kategori, jumlah, dan tgl_pengeluaran wajib diisi' }, { status: 400 })

    const [r]: any = await pool.query(
      'INSERT INTO pengeluaran (kategori, jumlah, tgl_pengeluaran, keterangan) VALUES (?,?,?,?)',
      [kategori, jumlah, tgl_pengeluaran, keterangan || '']
    )

    return NextResponse.json({ id: r.insertId }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
'''
}

for path, content in files_content.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Created file: {path}')

print('Setup complete!')
