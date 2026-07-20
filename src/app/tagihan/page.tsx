'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Shell from '@/components/Shell'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { Plus, CheckCircle, Zap, ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle, Clock, Search, Edit2, MessageCircle } from 'lucide-react'

function Badge({ status }: { status: string }) {
  const map: Record<string,string> = { Lunas:'badge badge-paid','Belum Bayar':'badge badge-unpaid',Terlambat:'badge badge-late' }
  return <span className={map[status]||'badge badge-active'}>{status}</span>
}
function fmt(n: number) {
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
}

type SortKey = 'no_tagihan'|'nama_pelanggan'|'nama_paket'|'periode'|'jumlah'|'tgl_jatuh_tempo'|'status'
type SortDir = 'asc'|'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey, sortKey: SortKey, sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="inline ml-1 opacity-30"/>
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="inline ml-1 text-accent-purple"/>
    : <ChevronDown size={13} className="inline ml-1 text-accent-purple"/>
}

const emptyForm = { id_pelanggan:'', periode:'', jumlah:'', tgl_jatuh_tempo:'' }
const PAGE_SIZES = [10, 25, 50, 100]

export default function TagihanPage() {
  const [data,      setData]      = useState<any[]>([])
  const [pelanggan, setPelanggan] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [form,      setForm]      = useState({ ...emptyForm })
  const [toast,     setToast]     = useState<{msg:string,type:'success'|'error'}|null>(null)
  const [generating,setGenerating]= useState(false)
  const [sending,   setSending]   = useState<number|null>(null)
  const [editModal,  setEditModal]  = useState(false)
  const [editForm,   setEditForm]   = useState<{id:number, tgl_jatuh_tempo:string, status:string, periode:string}>({id:0, tgl_jatuh_tempo:'', status:'', periode:''})

  // Sort & Pagination
  const [sortKey,   setSortKey]   = useState<SortKey>('no_tagihan')
  const [sortDir,   setSortDir]   = useState<SortDir>('desc')
  const [page,      setPage]      = useState(1)
  const [pageSize,  setPageSize]  = useState(10)
  const [filterTab, setFilterTab] = useState<'semua'|'jatuh_tempo'|'terlambat'>('semua')
  const [search,    setSearch]    = useState('')
  const [filterPeriode, setFilterPeriode] = useState('')
  const [filterPaket,   setFilterPaket]   = useState('')

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const sorted = useMemo(() => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    const q = search.toLowerCase()
    return [...data].filter(t => {
      if (t.status === 'Lunas') return false
      const jatuhTempo = String(t.tgl_jatuh_tempo || '').slice(0, 10)
      const isLewat = jatuhTempo && jatuhTempo <= today
      if (filterTab === 'terlambat' && !isLewat) return false
      if (filterTab === 'jatuh_tempo' && jatuhTempo !== today) return false
      if (q && !t.nama_pelanggan?.toLowerCase().includes(q) && !t.no_tagihan?.toLowerCase().includes(q)) return false
      if (filterPeriode && t.periode !== filterPeriode) return false
      if (filterPaket && t.nama_paket !== filterPaket) return false
      return true
    }).sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (sortKey === 'jumlah') { av = Number(av); bv = Number(bv) }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, filterTab, search, filterPeriode, filterPaket, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const generateOtomatis = async () => {
    setGenerating(true)
    const r = await fetch('/api/tagihan/generate-otomatis', { method:'POST' })
    const d = await r.json()
    if (r.ok) { setToast({ msg: d.message, type:'success' }); load() }
    else       { setToast({ msg: d.error,   type:'error'   }) }
    setGenerating(false)
  }

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

  const kirimWA = async (id: number, nama: string) => {
    setSending(id)
    const r = await fetch('/api/whatsapp/send-tagihan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tagihan: id })
    })
    const d = await r.json()
    setToast({ msg: r.ok ? d.message : (d.error || 'Gagal kirim WA'), type: r.ok ? 'success' : 'error' })
    setSending(null)
  }

  const openEdit = (t: any) => {
    setEditForm({ id: t.id, tgl_jatuh_tempo: String(t.tgl_jatuh_tempo||'').slice(0,10), status: t.status, periode: t.periode || '' })
    setEditModal(true)
  }

  const saveEdit = async () => {
    const r = await fetch(`/api/tagihan/${editForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: editForm.status, tgl_jatuh_tempo: editForm.tgl_jatuh_tempo, periode: editForm.periode })
    })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type:'error' }); return }
    setToast({ msg: 'Tagihan diperbarui', type:'success' })
    setEditModal(false); load()
  }

  const bayar = async (id: number, no: string) => {
    if (!confirm(`Catat pembayaran untuk ${no}?`)) return
    const tagihan = data.find((t: any) => t.id === id)
    if (!tagihan) { setToast({ msg:'Tagihan tidak ditemukan', type:'error' }); return }
    const r = await fetch('/api/pembayaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tagihan: id, jumlah: tagihan.jumlah, metode: 'Tunai', tgl_bayar: new Date().toISOString(), keterangan: `Pembayaran ${no}` })
    })
    const result = await r.json()
    if (!r.ok) { setToast({ msg: result.error, type:'error' }); return }
    setToast({ msg: `✅ ${no} berhasil dibayar!`, type:'success' })
    load()
  }

  const bulanIni   = new Date().toISOString().slice(0, 7)
  const lunas      = data.filter(t => t.status === 'Lunas' && String(t.tgl_bayar || t.created_at || '').slice(0, 7) === bulanIni).length
  const belum      = data.filter(t => t.status !== 'Lunas').length
  const _now       = new Date()
  const today      = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`
  const terlambat  = data.filter(t => t.status !== 'Lunas' && String(t.tgl_jatuh_tempo||'').slice(0,10) !== '' && String(t.tgl_jatuh_tempo||'').slice(0,10) <= today).length
  const jatuhHari  = data.filter(t => t.status !== 'Lunas' && String(t.tgl_jatuh_tempo||'').slice(0,10) === today).length

  const periodeList = Array.from(new Set(data.map(t => t.periode).filter(Boolean))) as string[]
  const paketList   = Array.from(new Set(data.map(t => t.nama_paket).filter(Boolean))) as string[]

  const thProps = (key: SortKey) => ({
    className: 'th cursor-pointer select-none hover:bg-purple-100 transition-colors',
    onClick: () => handleSort(key)
  })

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-pastel-mint rounded-2xl p-4 text-center border border-green-100">
          <div className="text-2xl font-bold text-accent-mint">{lunas}</div>
          <div className="text-xs text-muted mt-1">Lunas Bulan Ini</div>
        </div>
        <div className="bg-pastel-pink rounded-2xl p-4 text-center border border-pink-100">
          <div className="text-2xl font-bold text-accent-pink">{belum}</div>
          <div className="text-xs text-muted mt-1">Belum Bayar</div>
        </div>
        <div className="bg-pastel-yellow rounded-2xl p-4 text-center border border-yellow-100 cursor-pointer hover:border-yellow-300 transition-colors" onClick={()=>{ setFilterTab('jatuh_tempo'); setPage(1) }}>
          <div className="flex items-center justify-center gap-1">
            <Clock size={16} className="text-accent-yellow"/>
            <div className="text-2xl font-bold text-accent-yellow">{jatuhHari}</div>
          </div>
          <div className="text-xs text-muted mt-1">Jatuh Tempo Hari Ini</div>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100 cursor-pointer hover:border-red-300 transition-colors" onClick={()=>{ setFilterTab('terlambat'); setPage(1) }}>
          <div className="flex items-center justify-center gap-1">
            <AlertTriangle size={16} className="text-red-500"/>
            <div className="text-2xl font-bold text-red-500">{terlambat}</div>
          </div>
          <div className="text-xs text-muted mt-1">Terlambat</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-3">
        {(['semua','jatuh_tempo','terlambat'] as const).map(tab => (
          <button key={tab} onClick={()=>{ setFilterTab(tab); setPage(1) }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filterTab === tab ? 'bg-accent-purple text-white border-accent-purple' : 'border-purple-100 text-muted hover:bg-pastel-lavender'}`}>
            {tab === 'semua' ? 'Semua' : tab === 'jatuh_tempo' ? 'Jatuh Tempo Hari Ini' : 'Terlambat'}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
          <input className="input-field pl-9" placeholder="Cari nama pelanggan / no tagihan..."
            value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}/>
        </div>
        <select className="input-field w-auto" value={filterPeriode} onChange={e=>{ setFilterPeriode(e.target.value); setPage(1) }}>
          <option value="">Semua Periode</option>
          {periodeList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input-field w-auto" value={filterPaket} onChange={e=>{ setFilterPaket(e.target.value); setPage(1) }}>
          <option value="">Semua Paket</option>
          {paketList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(search || filterPeriode || filterPaket) && (
          <button onClick={()=>{ setSearch(''); setFilterPeriode(''); setFilterPaket(''); setPage(1) }}
            className="px-3 py-1.5 rounded-xl text-xs border border-purple-100 text-muted hover:bg-pastel-lavender transition-colors">
            Reset
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th {...thProps('no_tagihan')}>No. Tagihan <SortIcon col="no_tagihan" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('nama_pelanggan')}>Pelanggan <SortIcon col="nama_pelanggan" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('nama_paket')}>Paket <SortIcon col="nama_paket" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('periode')}>Periode <SortIcon col="periode" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('jumlah')}>Jumlah <SortIcon col="jumlah" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('tgl_jatuh_tempo')}>Jatuh Tempo <SortIcon col="tgl_jatuh_tempo" sortKey={sortKey} sortDir={sortDir}/></th>
                <th {...thProps('status')}>Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir}/></th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(8)].map((_,j)=>(
                    <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>
                  ))}
                </tr>
              )) : paginated.map(t=>{
                const jatuh = String(t.tgl_jatuh_tempo||'').slice(0,10)
                const isLewat = jatuh && jatuh <= today
                return (
                <tr key={t.id} className={`table-row-hover border-t border-purple-50 ${isLewat ? 'bg-red-50/40' : ''}`}>
                  <td className="td font-mono text-xs text-accent-purple font-semibold">{t.no_tagihan}</td>
                  <td className="td font-medium">{t.nama_pelanggan}</td>
                  <td className="td text-xs text-muted">{t.nama_paket||'—'}</td>
                  <td className="td text-xs text-muted">{t.periode}</td>
                  <td className="td font-mono font-semibold">{fmt(t.jumlah)}</td>
                  <td className={`td text-xs font-medium ${isLewat ? 'text-red-500' : 'text-muted'}`}>
                    {jatuh} {isLewat && <AlertTriangle size={11} className="inline ml-1"/>}
                  </td>
                  <td className="td"><Badge status={t.status}/></td>
                  <td className="td">
                    <div className="flex gap-1">
                    {t.status !== 'Lunas'
                      ? <button onClick={()=>bayar(t.id, t.no_tagihan)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pastel-mint text-accent-mint text-xs font-semibold hover:bg-green-100 transition-colors">
                          <CheckCircle size={12}/> Bayar
                        </button>
                      : <span className="text-xs text-muted">—</span>
                    }
                    <button onClick={()=>kirimWA(t.id, t.nama_pelanggan)} disabled={sending === t.id}
                      title="Kirim notifikasi WhatsApp"
                      className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors disabled:opacity-40">
                      <MessageCircle size={12}/>
                    </button>
                    <button onClick={()=>openEdit(t)}
                      className="w-7 h-7 rounded-lg bg-pastel-blue flex items-center justify-center text-accent-blue hover:bg-blue-100 transition-colors">
                      <Edit2 size={12}/>
                    </button>
                    </div>
                  </td>
                </tr>
                )
              })}
              {!loading && !data.length && (
                <tr><td colSpan={8} className="td text-center text-muted py-10">Belum ada tagihan</td></tr>
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
              <button
                onClick={() => setPage(1)} disabled={page === 1}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors"
              >«</button>
              <button
                onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors"
              >‹</button>
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
              <button
                onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors"
              >›</button>
              <button
                onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="px-2 py-1 rounded-lg text-xs border border-purple-100 disabled:opacity-40 hover:bg-pastel-lavender transition-colors"
              >»</button>
            </div>
          </div>
        )}
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
      <Modal open={editModal} onClose={()=>setEditModal(false)} title="Edit Tagihan" headerColor="bg-pastel-blue">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Periode</label>
            <input className="input-field" placeholder="April 2026" value={editForm.periode}
              onChange={e=>setEditForm({...editForm, periode: e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jatuh Tempo</label>
            <input className="input-field" type="date" value={editForm.tgl_jatuh_tempo}
              onChange={e=>setEditForm({...editForm, tgl_jatuh_tempo: e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Status</label>
            <select className="input-field" value={editForm.status} onChange={e=>setEditForm({...editForm, status: e.target.value})}>
              <option>Belum Bayar</option>
              <option>Terlambat</option>
              <option>Lunas</option>
            </select>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={()=>setEditModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl btn-primary justify-center">Simpan</button>
        </div>
      </Modal>
    </Shell>
  )
}
