'use client'
import { useEffect, useState, useCallback } from 'react'
import Shell from '@/components/Shell'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { Plus, Zap, Rocket, Flame, Crown, X } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
}

const paketStyle = [
  { grad:'from-pastel-purple to-pastel-blue', icon: Zap,    accent:'text-accent-purple', bar:'bg-accent-purple' },
  { grad:'from-pastel-mint to-pastel-sky',    icon: Rocket, accent:'text-accent-blue',   bar:'bg-accent-blue'   },
  { grad:'from-pastel-peach to-pastel-yellow',icon: Flame,  accent:'text-accent-peach',  bar:'bg-accent-peach'  },
  { grad:'from-pastel-pink to-pastel-purple', icon: Crown,  accent:'text-accent-pink',   bar:'bg-accent-pink'   },
]
const emptyForm = { nama_paket:'', kecepatan:'', harga:'', deskripsi:'' }

export default function PaketPage() {
  const [data,    setData]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editId,  setEditId]  = useState<number|null>(null)
  const [form,    setForm]    = useState({ ...emptyForm })
  const [toast,   setToast]   = useState<{msg:string,type:'success'|'error'}|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/paket')
    setData(await r.json()); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm({ ...emptyForm }); setEditId(null); setModal(true) }
  const openEdit = (p: any) => {
    setForm({ nama_paket:p.nama_paket, kecepatan:String(p.kecepatan), harga:String(p.harga), deskripsi:p.deskripsi||'' })
    setEditId(p.id); setModal(true)
  }
  const save = async () => {
    if (!form.nama_paket || !form.kecepatan || !form.harga) { setToast({ msg:'Semua field wajib!', type:'error' }); return }
    const url    = editId ? `/api/paket/${editId}` : '/api/paket'
    const method = editId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (!r.ok) { const d=await r.json(); setToast({ msg:d.error, type:'error' }); return }
    setToast({ msg: editId ? 'Paket diperbarui' : 'Paket ditambahkan', type:'success' })
    setModal(false); load()
  }
  const hapus = async (id: number) => {
    if (!confirm('Hapus paket ini? Pelanggan dengan paket ini akan kehilangan referensi paket.')) return
    const r = await fetch(`/api/paket/${id}`, { method:'DELETE' })
    if (r.ok) { setToast({ msg:'Paket dihapus', type:'success' }); load() }
  }

  return (
    <Shell>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Paket Internet</h1>
          <p className="text-muted text-sm mt-1">Kelola paket layanan internet Anda</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-fit"><Plus size={16}/> Tambah Paket</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_,i)=>(
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3"/>
              <div className="h-5 bg-gray-100 rounded mb-2 w-3/4"/>
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"/>
              <div className="h-8 bg-gray-100 rounded"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((p, i) => {
            const s = paketStyle[i % paketStyle.length]
            const Icon = s.icon
            return (
              <div key={p.id} className="card hover:-translate-y-1 transition-all duration-200">
                <div className={`h-2 bg-gradient-to-r ${s.grad}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center`}>
                      <Icon size={16} className="text-dark opacity-70" />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={()=>openEdit(p)} className="w-7 h-7 rounded-lg bg-pastel-blue flex items-center justify-center text-accent-blue hover:bg-blue-100 transition-colors text-xs">✎</button>
                      <button onClick={()=>hapus(p.id)} className="w-7 h-7 rounded-lg bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-pink-100 transition-colors">
                        <X size={12}/>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-dark text-base mb-1">{p.nama_paket}</h3>
                  <p className="text-xs text-muted mb-3">{p.deskripsi || '—'}</p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-3xl font-bold text-dark">{p.kecepatan}</span>
                    <span className="text-sm text-muted font-medium mb-1">Mbps</span>
                  </div>
                  <div className="border-t border-purple-50 pt-3 flex items-center justify-between">
                    <span className="text-accent-purple font-bold text-sm">
                      {fmt(p.harga)}<span className="text-muted font-normal text-xs">/bln</span>
                    </span>
                    <span className="text-xs text-muted">{p.jumlah_pelanggan} pelanggan</span>
                  </div>
                </div>
              </div>
            )
          })}
          {/* Add card */}
          <div onClick={openAdd}
            className="border-2 border-dashed border-purple-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-purple-50 transition-colors min-h-[180px] bg-pastel-lavender">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-soft">
              <Plus size={20} className="text-accent-purple"/>
            </div>
            <span className="text-sm font-semibold text-accent-purple">Tambah Paket</span>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Paket':'Tambah Paket Internet'} headerColor="bg-pastel-peach">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Nama Paket *</label>
            <input className="input-field" placeholder="Paket Hemat 10M" value={form.nama_paket} onChange={e=>setForm({...form,nama_paket:e.target.value})}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Kecepatan (Mbps) *</label>
              <input className="input-field font-mono" type="number" placeholder="10" value={form.kecepatan} onChange={e=>setForm({...form,kecepatan:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Harga/Bulan (Rp) *</label>
              <input className="input-field font-mono" type="number" placeholder="100000" value={form.harga} onChange={e=>setForm({...form,harga:e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Deskripsi</label>
            <textarea className="input-field h-20 resize-none" placeholder="Cocok untuk penggunaan rumahan..." value={form.deskripsi} onChange={e=>setForm({...form,deskripsi:e.target.value})}/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-primary justify-center">Simpan Paket</button>
        </div>
      </Modal>
    </Shell>
  )
}
