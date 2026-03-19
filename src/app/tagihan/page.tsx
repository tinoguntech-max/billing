'use client'
import { useEffect, useState, useCallback } from 'react'
import Shell from '@/components/Shell'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { Plus, CheckCircle, Zap } from 'lucide-react'

function Badge({ status }: { status: string }) {
  const map: Record<string,string> = { Lunas:'badge badge-paid','Belum Bayar':'badge badge-unpaid',Terlambat:'badge badge-unpaid' }
  return <span className={map[status]||'badge badge-active'}>{status}</span>
}
function fmt(n: number) {
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
}

const emptyForm = { id_pelanggan:'', periode:'', jumlah:'', tgl_jatuh_tempo:'' }

export default function TagihanPage() {
  const [data,    setData]    = useState<any[]>([])
  const [pelanggan, setPelanggan] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ ...emptyForm })
  const [toast,   setToast]   = useState<{msg:string,type:'success'|'error'}|null>(null)
  const [generating, setGenerating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/tagihan')
    const json = await r.json()
    setData(Array.isArray(json) ? json : (json.data ?? []))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch('/api/pelanggan?limit=100').then(r=>r.json()).then(json => setPelanggan(Array.isArray(json) ? json : (json.data ?? [])))
    const now = new Date()
    const bulan = now.toLocaleString('id-ID',{month:'long',year:'numeric'})
    const jatuh = new Date(now.getFullYear(), now.getMonth(), 20).toISOString().slice(0,10)
    setForm(f => ({ ...f, periode: bulan, tgl_jatuh_tempo: jatuh }))
  }, [])

  const generateOtomatis = async () => {
    setGenerating(true)
    const r = await fetch('/api/tagihan/generate-otomatis', { method:'POST' })
    const d = await r.json()
    if (r.ok) {
      setToast({ msg: d.message, type:'success' })
      load()
    } else {
      setToast({ msg: d.error, type:'error' })
    }
    setGenerating(false)
  }

  // Auto-fill jumlah dari paket pelanggan
  const onChangePelanggan = (id: string) => {
    const p = pelanggan.find((x:any) => String(x.id) === id)
    setForm(f => ({ ...f, id_pelanggan: id, jumlah: p?.harga ? String(p.harga) : '' }))
  }

  const save = async () => {
    if (!form.id_pelanggan || !form.jumlah) { setToast({ msg:'Lengkapi form!', type:'error' }); return }
    const r = await fetch('/api/tagihan', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type:'error' }); return }
    setToast({ msg:`Tagihan ${d.no_tagihan} dibuat`, type:'success' })
    setModal(false); load()
  }

  const bayar = async (id: number, no: string) => {
    if (!confirm(`Catat pembayaran untuk ${no}?`)) return

    // Ambil data tagihan
    const tagihan = data.find((t: any) => t.id === id)
    if (!tagihan) { setToast({ msg:'Tagihan tidak ditemukan', type:'error' }); return }

    // Create pembayaran
    const r = await fetch('/api/pembayaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_tagihan: id,
        jumlah: tagihan.jumlah,
        metode: 'Tunai',
        tgl_bayar: new Date().toISOString(),
        keterangan: `Pembayaran ${no}`
      })
    })

    const result = await r.json()
    if (!r.ok) { setToast({ msg: result.error, type:'error' }); return }

    setToast({ msg: `✅ ${no} berhasil dibayar!`, type:'success' })
    load()
  }

  const lunas  = data.filter(t => t.status === 'Lunas').length
  const belum  = data.filter(t => t.status !== 'Lunas').length

  return (
    <Shell>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Manajemen Tagihan</h1>
          <p className="text-muted text-sm mt-1">Buat dan kelola tagihan pelanggan</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={generateOtomatis} disabled={generating} className="btn-primary w-fit bg-accent-blue hover:bg-blue-600 disabled:opacity-50">
            <Zap size={16} className="mr-1"/> {generating ? 'Memproses...' : 'Generate Otomatis'}
          </button>
          <button onClick={()=>setModal(true)} className="btn-primary w-fit">
            <Plus size={16}/> Buat Tagihan
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-pastel-mint rounded-2xl p-4 text-center border border-green-100">
          <div className="text-2xl font-bold text-accent-mint">{lunas}</div>
          <div className="text-xs text-muted mt-1">Sudah Lunas</div>
        </div>
        <div className="bg-pastel-pink rounded-2xl p-4 text-center border border-pink-100">
          <div className="text-2xl font-bold text-accent-pink">{belum}</div>
          <div className="text-xs text-muted mt-1">Belum Bayar</div>
        </div>
        <div className="bg-pastel-yellow rounded-2xl p-4 text-center border border-yellow-100">
          <div className="text-2xl font-bold text-accent-yellow">{data.length}</div>
          <div className="text-xs text-muted mt-1">Total Tagihan</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th">No. Tagihan</th><th className="th">Pelanggan</th>
                <th className="th">Paket</th><th className="th">Periode</th>
                <th className="th">Jumlah</th><th className="th">Jatuh Tempo</th>
                <th className="th">Status</th><th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(8)].map((_,j)=>(
                    <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>
                  ))}
                </tr>
              )) : data.map(t=>(
                <tr key={t.id} className="table-row-hover border-t border-purple-50">
                  <td className="td font-mono text-xs text-accent-purple font-semibold">{t.no_tagihan}</td>
                  <td className="td font-medium">{t.nama_pelanggan}</td>
                  <td className="td text-xs text-muted">{t.nama_paket||'—'}</td>
                  <td className="td text-xs text-muted">{t.periode}</td>
                  <td className="td font-mono font-semibold">{fmt(t.jumlah)}</td>
                  <td className="td text-xs text-muted">{String(t.tgl_jatuh_tempo||'').slice(0,10)}</td>
                  <td className="td"><Badge status={t.status}/></td>
                  <td className="td">
                    {t.status !== 'Lunas'
                      ? <button onClick={()=>bayar(t.id, t.no_tagihan)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pastel-mint text-accent-mint text-xs font-semibold hover:bg-green-100 transition-colors">
                          <CheckCircle size={12}/> Bayar
                        </button>
                      : <span className="text-xs text-muted">—</span>
                    }
                  </td>
                </tr>
              ))}
              {!loading && !data.length && (
                <tr><td colSpan={8} className="td text-center text-muted py-10">Belum ada tagihan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Buat Tagihan Baru" headerColor="bg-pastel-mint">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Pilih Pelanggan *</label>
            <select className="input-field" value={form.id_pelanggan} onChange={e=>onChangePelanggan(e.target.value)}>
              <option value="">-- Pilih Pelanggan --</option>
              {pelanggan.filter((p:any)=>p.status!=='Nonaktif').map((p:any)=>(
                <option key={p.id} value={p.id}>{p.nama} ({p.telepon})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Periode</label>
              <input className="input-field" placeholder="Maret 2026" value={form.periode} onChange={e=>setForm({...form,periode:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
              <input className="input-field font-mono" type="number" value={form.jumlah} onChange={e=>setForm({...form,jumlah:e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jatuh Tempo</label>
            <input className="input-field" type="date" value={form.tgl_jatuh_tempo} onChange={e=>setForm({...form,tgl_jatuh_tempo:e.target.value})}/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-primary justify-center">Buat Tagihan</button>
        </div>
      </Modal>
    </Shell>
  )
}
