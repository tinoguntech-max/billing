import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { Plus, CheckCircle, Zap, Search, ChevronUp, ChevronDown } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

function JatuhTempo({ tgl, status }) {
  if (!tgl) return <span className="text-xs text-muted">-</span>
  const today = new Date(); today.setHours(0,0,0,0)
  const due   = new Date(tgl); due.setHours(0,0,0,0)
  const diff  = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  const isPaid = status === 'Lunas'
  const dateStr = String(tgl).slice(0, 10)

  if (isPaid) return <span className="text-xs text-muted font-mono">{dateStr}</span>
  if (diff < 0)  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
      ⚠ {dateStr} <span className="text-red-400">({Math.abs(diff)}h)</span>
    </span>
  )
  if (diff <= 3) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
      ⏰ {dateStr} <span className="text-amber-400">(H-{diff})</span>
    </span>
  )
  return <span className="text-xs text-muted font-mono">{dateStr}</span>
}
function Badge({ status }) {
  const map = { Lunas: 'badge badge-paid', 'Belum Bayar': 'badge badge-unpaid', Terlambat: 'badge badge-unpaid' }
  return <span className={map[status] ?? 'badge badge-active'}>{status}</span>
}
const emptyForm = { id_pelanggan: '', periode: '', jumlah: '', tgl_jatuh_tempo: '' }

export default function Tagihan() {
  const [data, setData]           = useState([])
  const [pelanggan, setPelanggan] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({ ...emptyForm })
  const [toast, setToast]         = useState(null)
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary]     = useState({})

  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy]         = useState('created_at')
  const [sortOrder, setSortOrder]   = useState('desc')
  const [page, setPage]             = useState(1)
  const [limit, setLimit]           = useState(10)
  const [total, setTotal]           = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search)       q.set('search', search)
    if (filterStatus) q.set('status', filterStatus)
    q.set('sortBy', sortBy)
    q.set('sortOrder', sortOrder)
    q.set('page', page)
    q.set('limit', limit)
    const r    = await apiFetch('/api/tagihan?' + q)
    const json = await r.json()
    setData(json.data ?? [])
    setTotal(json.total ?? 0)
    setSummary(json.summary ?? {})
    setLoading(false)
  }, [search, filterStatus, sortBy, sortOrder, page, limit])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    apiFetch('/api/pelanggan?limit=500').then(r => r.json()).then(j => setPelanggan(j.data ?? []))
    const now   = new Date()
    const bulan = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
    const jatuh = new Date(now.getFullYear(), now.getMonth(), 20).toISOString().slice(0, 10)
    setForm(f => ({ ...f, periode: bulan, tgl_jatuh_tempo: jatuh }))
  }, [])

  const handleSort = col => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortOrder('asc') }
    setPage(1)
  }
  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={13} className="opacity-30" />
    return sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  const generateOtomatis = async () => {
    setGenerating(true)
    const r = await apiFetch('/api/tagihan/generate-otomatis', { method: 'POST' })
    const d = await r.json()
    setToast({ msg: r.ok ? d.message : d.error, type: r.ok ? 'success' : 'error' })
    if (r.ok) load()
    setGenerating(false)
  }

  const onChangePelanggan = id => {
    const p = pelanggan.find(x => String(x.id) === id)
    setForm(f => ({ ...f, id_pelanggan: id, jumlah: p?.harga ? String(p.harga) : '' }))
  }

  const save = async () => {
    if (!form.id_pelanggan || !form.jumlah) { setToast({ msg: 'Lengkapi form!', type: 'error' }); return }
    const r = await apiFetch('/api/tagihan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type: 'error' }); return }
    setToast({ msg: `Tagihan ${d.no_tagihan} dibuat`, type: 'success' })
    setModal(false); load()
  }

  const bayar = async (id, no) => {
    if (!confirm(`Catat pembayaran untuk ${no}?`)) return
    const tagihan = data.find(t => t.id === id)
    if (!tagihan) return
    const r = await apiFetch('/api/pembayaran', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tagihan: id, jumlah: tagihan.jumlah, metode: 'Tunai', tgl_bayar: new Date().toISOString(), keterangan: `Pembayaran ${no}` }),
    })
    const d = await r.json()
    setToast({ msg: r.ok ? `${no} berhasil dibayar!` : d.error, type: r.ok ? 'success' : 'error' })
    if (r.ok) load()
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Manajemen Tagihan</h1>
          <p className="text-muted text-sm mt-1">Buat dan kelola tagihan pelanggan</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={generateOtomatis} disabled={generating} className="btn-blue w-fit disabled:opacity-50">
            <Zap size={16} /> {generating ? 'Memproses...' : 'Generate Otomatis'}
          </button>
          <button onClick={() => setModal(true)} className="btn-primary w-fit"><Plus size={16} /> Buat Tagihan</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-pastel-mint rounded-2xl p-4 text-center border border-green-100">
          <div className="text-2xl font-bold text-accent-mint">{summary['Lunas']?.count ?? 0}</div>
          <div className="text-xs font-mono text-accent-mint mt-0.5">{fmt(summary['Lunas']?.nominal ?? 0)}</div>
          <div className="text-xs text-muted mt-1">Sudah Lunas</div>
        </div>
        <div className="bg-pastel-pink rounded-2xl p-4 text-center border border-pink-100">
          <div className="text-2xl font-bold text-accent-pink">{(summary['Belum Bayar']?.count ?? 0) + (summary['Terlambat']?.count ?? 0)}</div>
          <div className="text-xs font-mono text-accent-pink mt-0.5">{fmt((summary['Belum Bayar']?.nominal ?? 0) + (summary['Terlambat']?.nominal ?? 0))}</div>
          <div className="text-xs text-muted mt-1">Belum Bayar</div>
        </div>
        <div className="bg-pastel-yellow rounded-2xl p-4 text-center border border-yellow-100">
          <div className="text-2xl font-bold text-accent-yellow">{Object.values(summary).reduce((s, x) => s + (x.count ?? 0), 0)}</div>
          <div className="text-xs font-mono text-accent-yellow mt-0.5">{fmt(Object.values(summary).reduce((s, x) => s + (x.nominal ?? 0), 0))}</div>
          <div className="text-xs text-muted mt-1">Total Tagihan</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-field pl-9" placeholder="Cari nama pelanggan / no. tagihan..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input-field w-auto" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">Semua Status</option>
          <option>Belum Bayar</option>
          <option>Lunas</option>
          <option>Terlambat</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('no_tagihan')}>
                  <div className="flex items-center gap-1">No. Tagihan <SortIcon col="no_tagihan" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('nama_pelanggan')}>
                  <div className="flex items-center gap-1">Pelanggan <SortIcon col="nama_pelanggan" /></div>
                </th>
                <th className="th">Paket</th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('periode')}>
                  <div className="flex items-center gap-1">Periode <SortIcon col="periode" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('jumlah')}>
                  <div className="flex items-center gap-1">Jumlah <SortIcon col="jumlah" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('tgl_jatuh_tempo')}>
                  <div className="flex items-center gap-1">Jatuh Tempo <SortIcon col="tgl_jatuh_tempo" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <SortIcon col="status" /></div>
                </th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(8)].map((_, j) => <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                </tr>
              )) : data.map(t => (
                <tr key={t.id} className="table-row-hover border-t border-purple-50">
                  <td className="td font-mono text-xs text-accent-purple font-semibold">{t.no_tagihan}</td>
                  <td className="td font-medium">{t.nama_pelanggan}</td>
                  <td className="td text-xs text-muted">{t.nama_paket || '-'}</td>
                  <td className="td text-xs text-muted">{t.periode}</td>
                  <td className="td font-mono font-semibold">{fmt(t.jumlah)}</td>
                  <td className="td"><JatuhTempo tgl={t.tgl_jatuh_tempo} status={t.status} /></td>
                  <td className="td"><Badge status={t.status} /></td>
                  <td className="td">
                    {t.status !== 'Lunas'
                      ? <button onClick={() => bayar(t.id, t.no_tagihan)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pastel-mint text-accent-mint text-xs font-semibold hover:bg-green-100 transition-colors">
                          <CheckCircle size={12} /> Bayar
                        </button>
                      : <span className="text-xs text-muted">-</span>
                    }
                  </td>
                </tr>
              ))}
              {!loading && !data.length && <tr><td colSpan={8} className="td text-center text-muted py-10">Tidak ada tagihan ditemukan</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-purple-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {total === 0 ? '0 data' : `${((page - 1) * limit) + 1}–${Math.min(page * limit, total)} dari ${total} data`}
            </span>
            <select className="input-field w-auto text-sm py-1.5" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}>
              <option value={10}>10 / hal</option>
              <option value={25}>25 / hal</option>
              <option value={50}>50 / hal</option>
              <option value={100}>100 / hal</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold text-dark hover:bg-pastel-lavender disabled:opacity-50 disabled:cursor-not-allowed">
              ← Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold ${page === p ? 'bg-accent-purple text-white' : 'border border-purple-200 text-dark hover:bg-pastel-lavender'}`}>
                    {p}
                  </button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-muted px-1">...</span>
                  <button onClick={() => setPage(totalPages)}
                    className="w-8 h-8 rounded-lg text-sm font-semibold border border-purple-200 text-dark hover:bg-pastel-lavender">
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold text-dark hover:bg-pastel-lavender disabled:opacity-50 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Buat Tagihan Baru" headerColor="bg-pastel-mint">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Pilih Pelanggan *</label>
            <select className="input-field" value={form.id_pelanggan} onChange={e => onChangePelanggan(e.target.value)}>
              <option value="">-- Pilih Pelanggan --</option>
              {pelanggan.filter(p => p.status !== 'Nonaktif').map(p => (
                <option key={p.id} value={p.id}>{p.nama} ({p.telepon})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Periode</label>
              <input className="input-field" value={form.periode} onChange={e => setForm({ ...form, periode: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
              <input className="input-field font-mono" type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jatuh Tempo</label>
            <input className="input-field" type="date" value={form.tgl_jatuh_tempo} onChange={e => setForm({ ...form, tgl_jatuh_tempo: e.target.value })} />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-submit justify-center">Buat Tagihan</button>
        </div>
      </Modal>
    </div>
  )
}
