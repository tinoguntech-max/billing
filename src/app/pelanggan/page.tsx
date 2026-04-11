'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Shell from '@/components/Shell'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { Plus, Edit2, Trash2, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

function Badge({ status }: { status: string }) {
  const map: Record<string,string> = {
    Aktif:'badge badge-paid', Nonaktif:'badge badge-inactive', Trial:'badge badge-trial'
  }
  return <span className={map[status]||'badge badge-active'}>{status}</span>
}

type SortKey = 'id'|'nama'|'telepon'|'nama_paket'|'ip_address'|'tgl_bergabung'|'status'
type SortDir = 'asc'|'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey, sortKey: SortKey, sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="inline ml-1 opacity-30"/>
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="inline ml-1 text-accent-purple"/>
    : <ChevronDown size={13} className="inline ml-1 text-accent-purple"/>
}

const emptyForm = { nama:'', email:'', telepon:'', alamat:'', ip_address:'', id_paket:'', status:'Aktif', tgl_bergabung:'' }
const PAGE_SIZES = [10, 25, 50, 100]

export default function PelangganPage() {
  const [data,         setData]         = useState<any[]>([])
  const [paket,        setPaket]        = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal,        setModal]        = useState(false)
  const [editId,       setEditId]       = useState<number|null>(null)
  const [form,         setForm]         = useState({ ...emptyForm })
  const [toast,        setToast]        = useState<{msg:string,type:'success'|'error'}|null>(null)

  // Sort & Pagination
  const [sortKey,  setSortKey]  = useState<SortKey>('id')
  const [sortDir,  setSortDir]  = useState<SortDir>('desc')
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/pelanggan?limit=1000')
    const json = await r.json()
    setData(Array.isArray(json) ? json : (json.data ?? []))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { fetch('/api/paket').then(r=>r.json()).then(setPaket) }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const sorted = useMemo(() => {
    const q = search.toLowerCase()
    return [...data]
      .filter(p => {
        const matchSearch = !q || p.nama?.toLowerCase().includes(q) || p.telepon?.includes(q) || p.email?.toLowerCase().includes(q)
        const matchStatus = !filterStatus || p.status === filterStatus
        return matchSearch && matchStatus
      })
      .sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (sortKey === 'id') { av = Number(av); bv = Number(bv) }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, search, filterStatus, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const openAdd  = () => { setForm({ ...emptyForm, tgl_bergabung: new Date().toISOString().slice(0,10) }); setEditId(null); setModal(true) }
  const openEdit = (p: any) => {
    let tgl = ''
    if (p.tgl_bergabung) tgl = String(p.tgl_bergabung).slice(0, 10)
    setForm({ nama:p.nama, email:p.email||'', telepon:p.telepon, alamat:p.alamat||'',
      ip_address:p.ip_address||'', id_paket:String(p.id_paket||''), status:p.status,
      tgl_bergabung: tgl })
    setEditId(p.id); setModal(true)
  }

  const save = async () => {
    if (!form.nama || !form.telepon) { setToast({ msg:'Nama dan telepon wajib diisi', type:'error' }); return }
    const url    = editId ? `/api/pelanggan/${editId}` : '/api/pelanggan'
    const method = editId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type:'error' }); return }
    setToast({ msg: editId ? 'Pelanggan diperbarui' : 'Pelanggan ditambahkan', type:'success' })
    setModal(false); load()
  }

  const hapus = async (id: number) => {
    if (!confirm('Hapus pelanggan ini?')) return
    const r = await fetch(`/api/pelanggan/${id}`, { method:'DELETE' })
    if (r.ok) { setToast({ msg:'Pelanggan dihapus', type:'success' }); load() }
  }

  const aktif    = data.filter(p => p.status === 'Aktif').length
  const trial    = data.filter(p => p.status === 'Trial').length
  const nonaktif = data.filter(p => p.status === 'Nonaktif').length

  // Hitung distribusi paket
  const paketCount = data.reduce<Record<string, number>>((acc, p) => {
    const nama = p.nama_paket || 'Tanpa Paket'
    acc[nama] = (acc[nama] || 0) + 1
    return acc
  }, {})
  const topPaket = Object.entries(paketCount).sort((a, b) => b[1] - a[1])

  const thProps = (key: SortKey) => ({
    className: 'th cursor-pointer select-none hover:bg-purple-100 transition-colors',
    onClick: () => handleSort(key)
  })

  return (
    <Shell>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Data Pelanggan</h1>
          <p className="text-muted text-sm mt-1">Kelola semua pelanggan internet Anda</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-fit">
          <Plus size={16} /> Tambah Pelanggan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-pastel-mint rounded-2xl p-4 text-center border border-green-100">
          <div className="text-2xl font-bold text-accent-mint">{aktif}</div>
          <div className="text-xs text-muted mt-1">Pelanggan Aktif</div>
        </div>
        <div className="bg-pastel-yellow rounded-2xl p-4 text-center border border-yellow-100">
          <div className="text-2xl font-bold text-accent-yellow">{trial}</div>
          <div className="text-xs text-muted mt-1">Trial</div>
        </div>
        <div className="bg-pastel-pink rounded-2xl p-4 text-center border border-pink-100">
          <div className="text-2xl font-bold text-accent-pink">{nonaktif}</div>
          <div className="text-xs text-muted mt-1">Nonaktif</div>
        </div>
        <div className="bg-pastel-lavender rounded-2xl p-4 text-center border border-purple-100">
          <div className="text-2xl font-bold text-accent-purple">{data.length}</div>
          <div className="text-xs text-muted mt-1">Total Pelanggan</div>
        </div>
      </div>

      {/* Distribusi Paket */}
      {topPaket.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Distribusi Paket</div>
          <div className="flex flex-wrap gap-2">
            {topPaket.map(([nama, count]) => (
              <div key={nama} className="flex items-center gap-2 bg-pastel-purple rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-accent-purple">{nama}</span>
                <span className="text-xs bg-accent-purple text-white rounded-full px-2 py-0.5 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-field pl-9" placeholder="Cari nama / nomor / email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input-field w-auto" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">Semua Status</option>
          <option>Aktif</option><option>Nonaktif</option><option>Trial</option>
        </select>
        <select className="input-field w-auto">
          <option>Semua Paket</option>
          {paket.map(p => <option key={p.id}>{p.nama_paket}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th {...thProps('id')}>ID <SortIcon col="id" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('nama')}>Pelanggan <SortIcon col="nama" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('telepon')}>Kontak <SortIcon col="telepon" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('nama_paket')}>Paket <SortIcon col="nama_paket" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('ip_address')}>IP <SortIcon col="ip_address" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('tgl_bergabung')}>Bergabung <SortIcon col="tgl_bergabung" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('status')}>Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir}/></th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i} className="border-t border-purple-50">
                    {[...Array(8)].map((_,j) => (
                      <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.map(p => (
                <tr key={p.id} className="table-row-hover border-t border-purple-50">
                  <td className="td font-mono text-xs text-muted">#{String(p.id).padStart(3,'0')}</td>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{background:'linear-gradient(135deg,#9B6FD4,#4BA3E3)'}}>
                        {p.nama.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-dark">{p.nama}</div>
                        <div className="text-xs text-muted">{p.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td text-muted">{p.telepon}</td>
                  <td className="td">
                    <span className="bg-pastel-purple text-accent-purple px-2 py-1 rounded-lg text-xs font-medium">
                      {p.nama_paket || '—'}
                    </span>
                  </td>
                  <td className="td font-mono text-xs text-muted">{p.ip_address || '—'}</td>
                  <td className="td text-xs text-muted">{String(p.tgl_bergabung||'').slice(0,10)}</td>
                  <td className="td"><Badge status={p.status} /></td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-pastel-blue flex items-center justify-center text-accent-blue hover:bg-blue-100 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => hapus(p.id)} className="w-7 h-7 rounded-lg bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-pink-100 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !data.length && (
                <tr><td colSpan={8} className="td text-center text-muted py-10">Tidak ada data pelanggan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-purple-50">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>Tampilkan</span>
              <select
                className="border border-purple-100 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-accent-purple"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              >
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>dari {sorted.length} data{sorted.length !== data.length ? ` (total ${data.length})` : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors">«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number|'...')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i-1] as number) > 1) acc.push('...')
                  acc.push(p); return acc
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e${i}`} className="px-2 py-1 text-xs text-muted">…</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${page === p ? 'bg-accent-purple text-white border-accent-purple' : 'border-purple-100 hover:bg-pastel-lavender'}`}
                    >{p}</button>
                )
              }
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors">›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors">»</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={()=>setModal(false)}
        title={editId ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
        headerColor="bg-pastel-lavender">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Nama Lengkap *</label>
              <input className="input-field" placeholder="Budi Santoso" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Nomor HP *</label>
              <input className="input-field" placeholder="08xx-xxxx" value={form.telepon} onChange={e=>setForm({...form,telepon:e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Email</label>
            <input className="input-field" type="email" placeholder="email@domain.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Alamat</label>
            <textarea className="input-field h-20 resize-none" placeholder="Jl. Contoh No. 1..." value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Paket Internet</label>
              <select className="input-field" value={form.id_paket} onChange={e=>setForm({...form,id_paket:e.target.value})}>
                <option value="">Pilih Paket...</option>
                {paket.map(p=><option key={p.id} value={p.id}>{p.nama_paket}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">IP Address</label>
              <input className="input-field font-mono" placeholder="192.168.1.x" value={form.ip_address} onChange={e=>setForm({...form,ip_address:e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option>Aktif</option><option>Trial</option><option>Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tgl Bergabung</label>
              <input className="input-field" type="date" value={form.tgl_bergabung} onChange={e=>setForm({...form,tgl_bergabung:e.target.value})} />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender transition-colors">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-primary justify-center">Simpan</button>
        </div>
      </Modal>
    </Shell>
  )
}
