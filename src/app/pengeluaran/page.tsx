'use client'
import { useEffect, useState, useCallback } from 'react'
import Shell from '@/components/Shell'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { Plus, TrendingDown, ArrowDownRight, Tag } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
}

const emptyForm = { kategori: 'Operasional', jumlah: '', tgl_pengeluaran: '', keterangan: '' }

export default function PengeluaranPage() {
  const [data,    setData]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ ...emptyForm })
  const [toast,   setToast]   = useState<{msg:string,type:'success'|'error'}|null>(null)
  const [saldo,   setSaldo]   = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const [rData, rSaldo] = await Promise.all([
      fetch('/api/pengeluaran'),
      fetch('/api/pengeluaran/saldo')
    ])
    const jData = await rData.json()
    const jSaldo = await rSaldo.json()
    setData(jData.data || [])
    setSaldo(jSaldo.saldo || 0)
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openModal = () => {
    const now = new Date()
    const pad = (n:number) => String(n).padStart(2,'0')
    setForm({ ...emptyForm, tgl_pengeluaran:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}` })
    setModal(true)
  }

  const save = async () => {
    if (!form.jumlah || !form.tgl_pengeluaran) { setToast({ msg:'Lengkapi form!', type:'error' }); return }
    const r = await fetch('/api/pengeluaran', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (!r.ok) { const d=await r.json(); setToast({ msg:d.error, type:'error' }); return }
    setToast({ msg:'Pengeluaran berhasil dicatat!', type:'success' })
    setModal(false); load()
  }

  const hapus = async (id: number) => {
    if (!confirm('Hapus catatan pengeluaran ini?')) return
    const r = await fetch(`/api/pengeluaran/${id}`, { method:'DELETE' })
    if (r.ok) { setToast({ msg:'Pengeluaran dihapus', type:'success' }); load() }
  }

  const now = new Date()
  const bulanIni = data.filter((b:any) => {
    const tgl = new Date(b.tgl_pengeluaran)
    return tgl.getMonth()===now.getMonth() && tgl.getFullYear()===now.getFullYear()
  })
  const namabulan = new Intl.DateTimeFormat('id-ID', {month:'long', year:'numeric'}).format(now)
  const totalBulanIni = bulanIni.reduce((s,b) => s+Number(b.jumlah), 0)

  return (
    <Shell>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Pengeluaran</h1>
          <p className="text-muted text-sm mt-1">Catat pengeluaran bulan {namabulan}</p>
        </div>
        <button onClick={openModal} className="btn-primary w-fit bg-red-500 hover:bg-red-600 shadow-red-500/30">
          <Plus size={16}/> Catat Pengeluaran
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-pastel-pink rounded-2xl p-5 border border-pink-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <TrendingDown size={24} className="text-accent-pink"/>
          </div>
          <div>
            <div className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Pengeluaran {namabulan}</div>
            <div className="text-2xl font-bold text-accent-pink">{fmt(totalBulanIni)}</div>
          </div>
        </div>
        <div className="bg-pastel-lavender rounded-2xl p-5 border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <ArrowDownRight size={24} className="text-accent-purple"/>
          </div>
          <div>
            <div className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Saldo Tersedia Saat Ini</div>
            <div className="text-2xl font-bold text-accent-purple">{fmt(saldo)}</div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-peach">
                <th className="th">ID</th><th className="th">Kategori</th>
                <th className="th">Keterangan</th><th className="th">Jumlah</th>
                <th className="th">Tanggal</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i} className="border-t border-orange-50">
                  {[...Array(6)].map((_,j)=><td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
              )) : bulanIni.map(b => (
                <tr key={b.id} className="table-row-hover border-t border-orange-50">
                  <td className="td font-mono text-xs text-accent-peach font-semibold">OUT-{String(b.id).padStart(4,'0')}</td>
                  <td className="td">
                    <span className="flex items-center gap-1.5 font-medium text-dark">
                      <Tag size={13} className="text-accent-peach"/>{b.kategori}
                    </span>
                  </td>
                  <td className="td text-muted">{b.keterangan || '-'}</td>
                  <td className="td font-mono font-bold text-red-500">{fmt(b.jumlah)}</td>
                  <td className="td text-xs text-muted">{String(b.tgl_pengeluaran).slice(0,16).replace('T',' ')}</td>
                  <td className="td">
                    <button onClick={()=>hapus(b.id)} className="text-xs text-red-500 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
              {!loading && !bulanIni.length && (
                <tr><td colSpan={6} className="td text-center text-muted py-10">Belum ada pengeluaran bulan ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Catat Pengeluaran" headerColor="bg-pastel-pink">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Kategori *</label>
              <select className="input-field" value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})}>
                <option>Operasional</option><option>Gaji Karyawan</option><option>Beli Alat</option><option>Sewa Tempat</option><option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
              <input className="input-field font-mono" type="number" value={form.jumlah} onChange={e=>setForm({...form,jumlah:e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tanggal *</label>
            <input className="input-field" type="datetime-local" value={form.tgl_pengeluaran} onChange={e=>setForm({...form,tgl_pengeluaran:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Keterangan</label>
            <textarea className="input-field h-20 resize-none" placeholder="Beli kabel LAN..." value={form.keterangan} onChange={e=>setForm({...form,keterangan:e.target.value})}/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-pink-100 text-sm font-semibold text-muted hover:bg-pastel-pink hover:text-accent-pink">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold shadow-soft hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #F989A9, #F5B5C8)' }}>Simpan Pengeluaran</button>
        </div>
      </Modal>
    </Shell>
  )
}
