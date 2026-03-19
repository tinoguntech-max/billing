'use client'
import { useEffect, useState, useCallback } from 'react'
import Shell from '@/components/Shell'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { Plus, University, Banknote, QrCode, Wallet } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
}
const MetodeIcon: Record<string, any> = {
  'Transfer Bank': University, 'Tunai': Banknote, 'QRIS': QrCode, 'E-Wallet': Wallet
}
const emptyForm = { id_tagihan:'', jumlah:'', metode:'Transfer Bank', tgl_bayar:'', keterangan:'' }

export default function PembayaranPage() {
  const [data,    setData]    = useState<any[]>([])
  const [tagihan, setTagihan] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ ...emptyForm })
  const [toast,   setToast]   = useState<{msg:string,type:'success'|'error'}|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/pembayaran')
    setData(await r.json()); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openModal = async () => {
    const r = await fetch('/api/tagihan?status=Belum+Bayar&limit=100')
    const json = await r.json()
    setTagihan(Array.isArray(json) ? json : (json.data ?? []))
    const now = new Date()
    const pad = (n:number) => String(n).padStart(2,'0')
    setForm({ ...emptyForm, tgl_bayar:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}` })
    setModal(true)
  }
  const onChangeTagihan = (id: string) => {
    const t = tagihan.find((x:any) => String(x.id) === id)
    setForm(f => ({ ...f, id_tagihan: id, jumlah: t?.jumlah ? String(t.jumlah) : '' }))
  }
  const save = async () => {
    if (!form.id_tagihan || !form.jumlah) { setToast({ msg:'Lengkapi form!', type:'error' }); return }
    const r = await fetch('/api/pembayaran', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (!r.ok) { const d=await r.json(); setToast({ msg:d.error, type:'error' }); return }
    setToast({ msg:'Pembayaran berhasil dicatat!', type:'success' })
    setModal(false); load()
  }

  // Filter data bulan ini saja
  const now = new Date()
  const bulanIni = data.filter((b:any) => {
    const tgl = new Date(b.tgl_bayar)
    return tgl.getMonth()===now.getMonth() && tgl.getFullYear()===now.getFullYear()
  })
  const namabulan = new Intl.DateTimeFormat('id-ID', {month:'long', year:'numeric'}).format(now)
  const totalBulanIni = bulanIni.reduce((s,b) => s+Number(b.jumlah), 0)

  return (
    <Shell>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Riwayat Pembayaran</h1>
          <p className="text-muted text-sm mt-1">Pembayaran bulan {namabulan}</p>
        </div>
        <button onClick={openModal} className="btn-primary w-fit"><Plus size={16}/> Catat Pembayaran</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-pastel-mint rounded-2xl p-4 text-center border border-green-100">
          <div className="text-xl font-bold text-accent-mint">{bulanIni.length}</div>
          <div className="text-xs text-muted mt-1">Total Transaksi</div>
        </div>
        <div className="bg-pastel-purple rounded-2xl p-4 text-center border border-purple-100">
          <div className="text-xl font-bold text-accent-purple truncate">{fmt(totalBulanIni)}</div>
          <div className="text-xs text-muted mt-1">Total Pembayaran</div>
        </div>
        <div className="bg-pastel-blue rounded-2xl p-4 text-center border border-blue-100">
          <div className="text-xl font-bold text-accent-blue">{bulanIni.filter(b=>b.metode==='Transfer Bank').length}</div>
          <div className="text-xs text-muted mt-1">Transfer Bank</div>
        </div>
        <div className="bg-pastel-yellow rounded-2xl p-4 text-center border border-yellow-100">
          <div className="text-xl font-bold text-accent-yellow">{bulanIni.filter(b=>b.metode==='QRIS'||b.metode==='E-Wallet').length}</div>
          <div className="text-xs text-muted mt-1">Digital</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th">ID Transaksi</th><th className="th">Pelanggan</th>
                <th className="th">No. Tagihan</th><th className="th">Jumlah</th>
                <th className="th">Metode</th><th className="th">Tanggal</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(7)].map((_,j)=><td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
              )) : bulanIni.map(b => {
                const Icon = MetodeIcon[b.metode] || Banknote
                return (
                  <tr key={b.id} className="table-row-hover border-t border-purple-50">
                    <td className="td font-mono text-xs text-accent-blue font-semibold">TRX-{String(b.id).padStart(4,'0')}</td>
                    <td className="td font-medium">{b.nama_pelanggan}</td>
                    <td className="td font-mono text-xs text-accent-purple">{b.no_tagihan}</td>
                    <td className="td font-mono font-bold text-accent-mint">{fmt(b.jumlah)}</td>
                    <td className="td">
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <Icon size={13} className="text-accent-blue"/>{b.metode}
                      </span>
                    </td>
                    <td className="td text-xs text-muted">{String(b.tgl_bayar).slice(0,16).replace('T',' ')}</td>
                    <td className="td"><span className="badge badge-paid">Berhasil</span></td>
                  </tr>
                )
              })}
              {!loading && !bulanIni.length && (
                <tr><td colSpan={7} className="td text-center text-muted py-10">Belum ada pembayaran bulan ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Catat Pembayaran" headerColor="bg-pastel-blue">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">No. Tagihan *</label>
            <select className="input-field" value={form.id_tagihan} onChange={e=>onChangeTagihan(e.target.value)}>
              <option value="">-- Pilih Tagihan Belum Bayar --</option>
              {tagihan.map((t:any)=>(
                <option key={t.id} value={t.id}>{t.no_tagihan} — {t.nama_pelanggan} — {fmt(t.jumlah)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
              <input className="input-field font-mono" type="number" value={form.jumlah} onChange={e=>setForm({...form,jumlah:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Metode</label>
              <select className="input-field" value={form.metode} onChange={e=>setForm({...form,metode:e.target.value})}>
                <option>Transfer Bank</option><option>Tunai</option><option>QRIS</option><option>E-Wallet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tanggal Bayar</label>
            <input className="input-field" type="datetime-local" value={form.tgl_bayar} onChange={e=>setForm({...form,tgl_bayar:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Keterangan</label>
            <input className="input-field" placeholder="Opsional..." value={form.keterangan} onChange={e=>setForm({...form,keterangan:e.target.value})}/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-primary justify-center">Konfirmasi Bayar</button>
        </div>
      </Modal>
    </Shell>
  )
}
