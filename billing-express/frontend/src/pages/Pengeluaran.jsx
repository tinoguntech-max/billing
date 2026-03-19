import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { Plus, Edit2, Trash2, TrendingDown, ShoppingCart, Zap, Wrench, Users, MoreHorizontal, Wallet } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const KATEGORI = ['Operasional', 'Peralatan', 'Listrik', 'Gaji', 'Pemasaran', 'Lainnya']

const kategoriStyle = {
  Operasional: { bg: 'bg-pastel-blue',     text: 'text-accent-blue',   icon: ShoppingCart },
  Peralatan:   { bg: 'bg-pastel-purple',   text: 'text-accent-purple', icon: Wrench },
  Listrik:     { bg: 'bg-pastel-yellow',   text: 'text-accent-yellow', icon: Zap },
  Gaji:        { bg: 'bg-pastel-mint',     text: 'text-accent-mint',   icon: Users },
  Pemasaran:   { bg: 'bg-pastel-pink',     text: 'text-accent-pink',   icon: TrendingDown },
  Lainnya:     { bg: 'bg-pastel-lavender', text: 'text-muted',         icon: MoreHorizontal },
}

const emptyForm = { kategori: 'Operasional', jumlah: '', tgl_pengeluaran: '', keterangan: '', id_karyawan: '' }

export default function Pengeluaran() {
  const [data, setData]                 = useState([])
  const [summary, setSummary]           = useState([])
  const [total, setTotal]               = useState(0)
  const [saldo, setSaldo]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(false)
  const [editId, setEditId]             = useState(null)
  const [form, setForm]                 = useState({ ...emptyForm })
  const [toast, setToast]               = useState(null)
  const [karyawanList, setKaryawanList] = useState([])

  const now = new Date()
  const [filterBulan, setFilterBulan]       = useState(String(now.getMonth() + 1))
  const [filterTahun, setFilterTahun]       = useState(String(now.getFullYear()))
  const [filterKategori, setFilterKategori] = useState('')

  const loadSaldo = useCallback(() => {
    apiFetch('/api/pengeluaran/saldo')
      .then(r => r.json())
      .then(d => { if (d.saldo !== undefined) setSaldo(Number(d.saldo)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiFetch('/api/karyawan/aktif')
      .then(r => r.json())
      .then(d => setKaryawanList(Array.isArray(d) ? d : []))
      .catch(() => {})
    loadSaldo()
  }, [loadSaldo])

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filterBulan)    q.set('bulan', filterBulan)
    if (filterTahun)    q.set('tahun', filterTahun)
    if (filterKategori) q.set('kategori', filterKategori)
    const r    = await apiFetch('/api/pengeluaran?' + q)
    const json = await r.json()
    setData(json.data ?? [])
    setSummary(json.summary ?? [])
    setTotal(json.data?.reduce((s, x) => s + Number(x.jumlah), 0) ?? 0)
    setLoading(false)
  }, [filterBulan, filterTahun, filterKategori])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm({ ...emptyForm, tgl_pengeluaran: new Date().toISOString().slice(0, 10) })
    setEditId(null); setModal(true)
  }
  const openEdit = row => {
    setForm({
      kategori: row.kategori,
      jumlah: String(row.jumlah),
      tgl_pengeluaran: String(row.tgl_pengeluaran).slice(0, 10),
      keterangan: row.keterangan || '',
      id_karyawan: row.id_karyawan ? String(row.id_karyawan) : '',
    })
    setEditId(row.id); setModal(true)
  }

  const onKaryawanChange = id => {
    const k = karyawanList.find(x => String(x.id) === id)
    setForm(f => ({
      ...f,
      id_karyawan: id,
      jumlah: k?.gaji ? String(k.gaji) : f.jumlah,
      keterangan: k ? `Gaji ${k.nama}` : f.keterangan,
    }))
  }

  const save = async () => {
    if (!form.kategori || !form.jumlah || !form.tgl_pengeluaran) {
      setToast({ msg: 'Kategori, jumlah, dan tanggal wajib diisi', type: 'error' }); return
    }
    const payload = { ...form }
    if (form.kategori !== 'Gaji') delete payload.id_karyawan
    const r = await apiFetch(editId ? `/api/pengeluaran/${editId}` : '/api/pengeluaran', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type: 'error' }); return }
    setToast({ msg: editId ? 'Pengeluaran diperbarui' : 'Pengeluaran ditambahkan', type: 'success' })
    setModal(false); load(); loadSaldo()
  }

  const hapus = async id => {
    if (!confirm('Hapus pengeluaran ini?')) return
    await apiFetch(`/api/pengeluaran/${id}`, { method: 'DELETE' })
    setToast({ msg: 'Pengeluaran dihapus', type: 'success' }); load(); loadSaldo()
  }

  const namaBulan = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(Number(filterTahun), Number(filterBulan) - 1))
  const totalSummary = summary.reduce((s, x) => s + Number(x.total), 0) || 1
  const saldoNegatif = saldo !== null && saldo < 0

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Pengeluaran</h1>
          <p className="text-muted text-sm mt-1">Catat dan pantau pengeluaran operasional</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-fit"><Plus size={16} /> Tambah Pengeluaran</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Saldo Kas */}
        <div className={`card p-5 ${saldoNegatif ? 'border-pink-200' : ''}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${saldoNegatif ? 'bg-pastel-pink' : 'bg-pastel-mint'}`}>
            <Wallet size={18} className={saldoNegatif ? 'text-accent-pink' : 'text-accent-mint'} />
          </div>
          <div className={`text-xl font-bold truncate ${saldoNegatif ? 'text-accent-pink' : 'text-accent-mint'}`}>
            {saldo !== null ? fmt(saldo) : <span className="text-muted text-sm">Memuat...</span>}
          </div>
          <div className="text-sm text-muted mt-1">Saldo Kas</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%', background: saldoNegatif ? 'linear-gradient(90deg,#E8609A,#F5956A)' : 'linear-gradient(90deg,#2EC98A,#4BA3E3)' }} />
          </div>
        </div>

        {/* Total pengeluaran bulan ini */}
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-pink flex items-center justify-center mb-3">
            <TrendingDown size={18} className="text-accent-pink" />
          </div>
          <div className="text-xl font-bold text-dark truncate">{fmt(total)}</div>
          <div className="text-sm text-muted mt-1">Total {namaBulan}</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#E8609A,#9B6FD4)' }} /></div>
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
          {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
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
                )) : data.map(row => {
                  const st   = kategoriStyle[row.kategori] ?? kategoriStyle.Lainnya
                  const Icon = st.icon
                  return (
                    <tr key={row.id} className="table-row-hover border-t border-purple-50">
                      <td className="td text-xs text-muted font-mono">{String(row.tgl_pengeluaran).slice(0, 10)}</td>
                      <td className="td">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.text}`}>
                          <Icon size={11} />{row.kategori}
                        </span>
                      </td>
                      <td className="td text-muted text-xs">{row.keterangan || '-'}</td>
                      <td className="td font-mono font-semibold text-accent-pink">{fmt(row.jumlah)}</td>
                      <td className="td">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(row)} className="w-7 h-7 rounded-lg bg-pastel-blue flex items-center justify-center text-accent-blue hover:bg-blue-100 transition-colors"><Edit2 size={12} /></button>
                          <button onClick={() => hapus(row.id)} className="w-7 h-7 rounded-lg bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-pink-100 transition-colors"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!loading && !data.length && (
                  <tr><td colSpan={5} className="td text-center text-muted py-10">Belum ada pengeluaran bulan ini</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data.length > 0 && (
            <div className="px-5 py-3 border-t border-purple-50 flex justify-between items-center">
              <span className="text-sm text-muted">{data.length} transaksi</span>
              <span className="font-bold text-accent-pink font-mono">{fmt(total)}</span>
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
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,#9B6FD4,#4BA3E3)' }} />
                      </div>
                      <div className="text-xs text-muted mt-1 font-mono">{fmt(s.total)}</div>
                    </div>
                  )
                })}
              </div>
          }
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'} headerColor="bg-pastel-pink">
        <div className="p-6 space-y-4">
          {/* Saldo info di modal */}
          {saldo !== null && !editId && (
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold border ${saldo >= 0 ? 'bg-pastel-mint border-green-200 text-accent-mint' : 'bg-pastel-pink border-pink-200 text-accent-pink'}`}>
              <span>Saldo Kas Tersedia</span>
              <span className="font-mono">{fmt(saldo)}</span>
            </div>
          )}
          {!editId && saldo !== null && Number(form.jumlah) > saldo && (
            <div className="bg-pastel-pink border border-pink-200 text-accent-pink text-xs rounded-xl px-4 py-2.5">
              Jumlah melebihi saldo kas ({fmt(saldo)}). Pengeluaran tidak dapat diproses.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Kategori *</label>
              <select className="input-field" value={form.kategori}
                onChange={e => setForm({ ...form, kategori: e.target.value, id_karyawan: '' })}>
                {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tanggal *</label>
              <input className="input-field" type="date" value={form.tgl_pengeluaran} onChange={e => setForm({ ...form, tgl_pengeluaran: e.target.value })} />
            </div>
          </div>

          {form.kategori === 'Gaji' && (
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Karyawan</label>
              <select className="input-field" value={form.id_karyawan} onChange={e => onKaryawanChange(e.target.value)}>
                <option value="">-- Pilih Karyawan --</option>
                {karyawanList.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.nama}{k.gaji > 0 ? ` - ${fmt(k.gaji)}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
            <input className="input-field font-mono" type="number" placeholder="50000" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Keterangan</label>
            <textarea className="input-field h-20 resize-none" placeholder="Deskripsi pengeluaran..." value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save}
            disabled={!editId && saldo !== null && Number(form.jumlah) > saldo}
            className="flex-1 py-2.5 rounded-xl btn-submit justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  )
}
