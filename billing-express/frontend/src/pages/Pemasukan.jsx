import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { Plus, Edit2, Trash2, TrendingUp, Wifi, Package, Repeat, MoreHorizontal, Banknote, Wallet, CreditCard } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

// Kategori manual (tidak termasuk Pembayaran Tagihan — itu otomatis)
const KATEGORI_MANUAL = ['Langganan', 'Instalasi', 'Upgrade Paket', 'Denda', 'Uang dari Pak Tino', 'Lainnya']
const KATEGORI_FILTER = ['Pembayaran Tagihan', ...KATEGORI_MANUAL]

const kategoriStyle = {
  'Pembayaran Tagihan': { bg: 'bg-pastel-mint',     text: 'text-accent-mint',   icon: CreditCard },
  Langganan:            { bg: 'bg-pastel-blue',      text: 'text-accent-blue',   icon: Wifi },
  Instalasi:            { bg: 'bg-pastel-purple',    text: 'text-accent-purple', icon: Package },
  'Upgrade Paket':      { bg: 'bg-pastel-lavender',  text: 'text-accent-purple', icon: TrendingUp },
  Denda:                { bg: 'bg-pastel-yellow',    text: 'text-accent-yellow', icon: Repeat },
  'Uang dari Pak Tino': { bg: 'bg-pastel-pink',      text: 'text-accent-pink',   icon: Banknote },
  Lainnya:              { bg: 'bg-pastel-lavender',  text: 'text-muted',         icon: MoreHorizontal },
}

const emptyForm = { kategori: 'Langganan', jumlah: '', tgl_pemasukan: '', keterangan: '' }

export default function Pemasukan() {
  const [data, setData]       = useState([])
  const [summary, setSummary] = useState([])
  const [total, setTotal]     = useState(0)
  const [saldo, setSaldo]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState({ ...emptyForm })
  const [toast, setToast]     = useState(null)

  const now = new Date()
  const [filterBulan, setFilterBulan]       = useState(String(now.getMonth() + 1))
  const [filterTahun, setFilterTahun]       = useState(String(now.getFullYear()))
  const [filterKategori, setFilterKategori] = useState('')

  const loadSaldo = useCallback(() => {
    apiFetch('/api/pengeluaran/saldo').then(r => r.json()).then(d => {
      if (d.saldo !== undefined) setSaldo(Number(d.saldo))
    }).catch(() => {})
  }, [])

  useEffect(() => { loadSaldo() }, [loadSaldo])

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filterBulan)    q.set('bulan', filterBulan)
    if (filterTahun)    q.set('tahun', filterTahun)
    if (filterKategori) q.set('kategori', filterKategori)
    const r    = await apiFetch('/api/pemasukan?' + q)
    const json = await r.json()
    setData(json.data ?? [])
    setSummary(json.summary ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [filterBulan, filterTahun, filterKategori])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm({ ...emptyForm, tgl_pemasukan: new Date().toISOString().slice(0, 10) })
    setEditId(null); setModal(true)
  }
  const openEdit = row => {
    setForm({
      kategori: row.kategori,
      jumlah: String(row.jumlah),
      tgl_pemasukan: String(row.tgl_pemasukan).slice(0, 10),
      keterangan: row.keterangan || '',
    })
    setEditId(row.id); setModal(true)
  }

  const save = async () => {
    if (!form.kategori || !form.jumlah || !form.tgl_pemasukan) {
      setToast({ msg: 'Kategori, jumlah, dan tanggal wajib diisi', type: 'error' }); return
    }
    const r = await apiFetch(editId ? `/api/pemasukan/${editId}` : '/api/pemasukan', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type: 'error' }); return }
    setToast({ msg: editId ? 'Pemasukan diperbarui' : 'Pemasukan ditambahkan', type: 'success' })
    setModal(false); load(); loadSaldo()
  }

  const hapus = async id => {
    if (!confirm('Hapus pemasukan ini?')) return
    await apiFetch(`/api/pemasukan/${id}`, { method: 'DELETE' })
    setToast({ msg: 'Pemasukan dihapus', type: 'success' }); load(); loadSaldo()
  }

  const namaBulan = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(Number(filterTahun), Number(filterBulan) - 1))
  const totalSummary = summary.reduce((s, x) => s + Number(x.total), 0) || 1
  const saldoNegatif = saldo !== null && saldo < 0

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Pemasukan</h1>
          <p className="text-muted text-sm mt-1">Semua pemasukan: pembayaran tagihan + pemasukan lainnya</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-fit"><Plus size={16} /> Tambah Pemasukan</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Saldo Kas */}
        <div className={`card p-5 ${saldoNegatif ? 'border-pink-200' : ''}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${saldoNegatif ? 'bg-pastel-pink' : 'bg-pastel-lavender'}`}>
            <Wallet size={18} className={saldoNegatif ? 'text-accent-pink' : 'text-accent-purple'} />
          </div>
          <div className={`text-xl font-bold truncate ${saldoNegatif ? 'text-accent-pink' : 'text-accent-purple'}`}>
            {saldo !== null ? fmt(saldo) : <span className="text-muted text-sm">Memuat...</span>}
          </div>
          <div className="text-sm text-muted mt-1">Saldo Kas</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%', background: saldoNegatif ? 'linear-gradient(90deg,#E8609A,#F5956A)' : 'linear-gradient(90deg,#9B6FD4,#4BA3E3)' }} />
          </div>
        </div>

        {/* Total pemasukan bulan ini (gabungan) */}
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-accent-mint" />
          </div>
          <div className="text-xl font-bold text-accent-mint truncate">{fmt(total)}</div>
          <div className="text-sm text-muted mt-1">Total {namaBulan}</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#2EC98A,#4BA3E3)' }} /></div>
        </div>

        {summary.slice(0, 2).map((s, i) => {
          const st   = kategoriStyle[s.kategori] ?? kategoriStyle.Lainnya
          const Icon = st.icon
          const pct  = Math.round((Number(s.total) / totalSummary) * 100)
          return (
            <div key={i} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={st.text} />
              </div>
              <div className="text-xl font-bold text-dark truncate">{fmt(s.total)}</div>
              <div className="text-sm text-muted mt-1">{s.kategori}</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <select className="input-field w-auto" value={filterBulan} onChange={e => setFilterBulan(e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i+1} value={i+1}>
              {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2024, i))}
            </option>
          ))}
        </select>
        <select className="input-field w-auto" value={filterTahun} onChange={e => setFilterTahun(e.target.value)}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="input-field w-auto" value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
          <option value="">Semua Kategori</option>
          {KATEGORI_FILTER.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* Tabel + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-pastel-lavender">
                  <th className="th">Tanggal</th>
                  <th className="th">Kategori</th>
                  <th className="th">Keterangan</th>
                  <th className="th">Jumlah</th>
                  <th className="th">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-purple-50">
                    {[...Array(5)].map((_, j) => <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                  </tr>
                )) : data.map((row, idx) => {
                  const st      = kategoriStyle[row.kategori] ?? kategoriStyle.Lainnya
                  const Icon    = st.icon
                  const isAuto  = row.sumber === 'pembayaran'
                  return (
                    <tr key={`${row.sumber}-${row.id}-${idx}`} className="table-row-hover border-t border-purple-50">
                      <td className="td text-xs text-muted font-mono">{String(row.tgl_pemasukan).slice(0, 10)}</td>
                      <td className="td">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.text}`}>
                          <Icon size={11} />{row.kategori}
                        </span>
                      </td>
                      <td className="td text-muted text-xs">{row.keterangan || '-'}</td>
                      <td className="td font-mono font-semibold text-accent-mint">{fmt(row.jumlah)}</td>
                      <td className="td">
                        {isAuto
                          ? <span className="text-xs text-muted italic">otomatis</span>
                          : <div className="flex gap-1">
                              <button onClick={() => openEdit(row)} className="w-7 h-7 rounded-lg bg-pastel-blue flex items-center justify-center text-accent-blue hover:bg-blue-100 transition-colors"><Edit2 size={12} /></button>
                              <button onClick={() => hapus(row.id)} className="w-7 h-7 rounded-lg bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-pink-100 transition-colors"><Trash2 size={12} /></button>
                            </div>
                        }
                      </td>
                    </tr>
                  )
                })}
                {!loading && !data.length && (
                  <tr><td colSpan={5} className="td text-center text-muted py-10">Belum ada pemasukan bulan ini</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data.length > 0 && (
            <div className="px-5 py-3 border-t border-purple-50 flex justify-between items-center">
              <span className="text-sm text-muted">{data.length} transaksi</span>
              <span className="font-bold text-accent-mint font-mono">{fmt(total)}</span>
            </div>
          )}
        </div>

        {/* Breakdown per kategori */}
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Breakdown Kategori</h3>
          {summary.length === 0
            ? <div className="text-center text-muted text-sm py-8">Belum ada data</div>
            : <div className="space-y-4">
                {summary.map((s, i) => {
                  const st   = kategoriStyle[s.kategori] ?? kategoriStyle.Lainnya
                  const Icon = st.icon
                  const pct  = Math.round((Number(s.total) / totalSummary) * 100)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${st.text}`}>
                          <Icon size={12} />{s.kategori}
                        </span>
                        <span className="text-xs font-mono font-bold text-dark">{pct}%</span>
                      </div>
                      <div className="progress-bar !mt-0">
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,#2EC98A,#4BA3E3)' }} />
                      </div>
                      <div className="text-xs text-muted mt-1 font-mono">{fmt(s.total)}</div>
                    </div>
                  )
                })}
              </div>
          }
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Pemasukan' : 'Tambah Pemasukan'} headerColor="bg-pastel-mint">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Kategori *</label>
              <select className="input-field" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {KATEGORI_MANUAL.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tanggal *</label>
              <input className="input-field" type="date" value={form.tgl_pemasukan} onChange={e => setForm({ ...form, tgl_pemasukan: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
            <input className="input-field font-mono" type="number" placeholder="100000" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Keterangan</label>
            <textarea className="input-field h-20 resize-none" placeholder="Deskripsi pemasukan..." value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-submit justify-center">Simpan</button>
        </div>
      </Modal>
    </div>
  )
}
