import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { Plus, University, Banknote, QrCode, Wallet, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const MetodeIcon = { 'Transfer Bank': University, Tunai: Banknote, QRIS: QrCode, 'E-Wallet': Wallet }
const emptyForm = { id_tagihan: '', jumlah: '', metode: 'Transfer Bank', tgl_bayar: '', keterangan: '' }

export default function Pembayaran() {
  const [data, setData]             = useState([])
  const [tagihan, setTagihan]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState({ ...emptyForm })
  const [toast, setToast]           = useState(null)
  const [saldo, setSaldo]           = useState(null)
  const [total, setTotal]           = useState(0)
  const [search, setSearch]         = useState('')
  const [filterMetode, setFilterMetode] = useState('')
  const [sortBy, setSortBy]         = useState('created_at')
  const [sortOrder, setSortOrder]   = useState('desc')
  const [page, setPage]             = useState(1)
  const [limit, setLimit]           = useState(10)

  const loadSaldo = useCallback(() => {
    apiFetch('/api/pengeluaran/saldo').then(r => r.json())
      .then(d => { if (d.saldo !== undefined) setSaldo(Number(d.saldo)) }).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search)       q.set('search', search)
    if (filterMetode) q.set('metode', filterMetode)
    q.set('sortBy', sortBy)
    q.set('sortOrder', sortOrder)
    q.set('page', page)
    q.set('limit', limit)
    const r    = await apiFetch('/api/pembayaran?' + q)
    const json = await r.json()
    setData(json.data ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [search, filterMetode, sortBy, sortOrder, page, limit])

  useEffect(() => { load(); loadSaldo() }, [load, loadSaldo])

  const handleSort = col => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortOrder('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={13} className="opacity-30" />
    return sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  const openModal = async () => {
    const r    = await apiFetch('/api/tagihan?status=Belum+Bayar&limit=100')
    const json = await r.json()
    setTagihan(json.data ?? [])
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const tgl = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) +
                'T' + pad(now.getHours()) + ':' + pad(now.getMinutes())
    setForm({ ...emptyForm, tgl_bayar: tgl })
    setModal(true)
  }

  const onChangeTagihan = id => {
    const t = tagihan.find(x => String(x.id) === id)
    setForm(f => ({ ...f, id_tagihan: id, jumlah: t?.jumlah ? String(t.jumlah) : '' }))
  }

  const hapus = async id => {
    if (!confirm('Hapus pembayaran ini? Status tagihan akan dikembalikan ke Belum Bayar.')) return
    const r = await apiFetch('/api/pembayaran/' + id, { method: 'DELETE' })
    const d = await r.json()
    setToast({ msg: r.ok ? 'Pembayaran dihapus' : d.error, type: r.ok ? 'success' : 'error' })
    if (r.ok) { load(); loadSaldo() }
  }

  const save = async () => {
    if (!form.id_tagihan || !form.jumlah) { setToast({ msg: 'Lengkapi form!', type: 'error' }); return }
    const r = await apiFetch('/api/pembayaran', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    if (!r.ok) { const d = await r.json(); setToast({ msg: d.error, type: 'error' }); return }
    setToast({ msg: 'Pembayaran berhasil dicatat!', type: 'success' })
    setModal(false); load(); loadSaldo()
  }

  const totalPages   = Math.max(1, Math.ceil(total / limit))
  const totalNominal = data.reduce((s, b) => s + Number(b.jumlah), 0)
  const saldoNegatif = saldo !== null && saldo < 0

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Riwayat Pembayaran</h1>
          <p className="text-muted text-sm mt-1">Kelola semua transaksi pembayaran</p>
        </div>
        <button onClick={openModal} className="btn-primary w-fit"><Plus size={16} /> Catat Pembayaran</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className={`rounded-2xl p-4 text-center border ${saldoNegatif ? 'bg-pastel-pink border-pink-200' : 'bg-pastel-mint border-green-100'}`}>
          <div className={`text-xl font-bold truncate ${saldoNegatif ? 'text-accent-pink' : 'text-accent-mint'}`}>
            {saldo !== null ? fmt(saldo) : <span className="text-sm text-muted">...</span>}
          </div>
          <div className="text-xs text-muted mt-1">Saldo Kas</div>
        </div>
        <div className="bg-pastel-purple border-purple-100 rounded-2xl p-4 text-center border">
          <div className="text-xl font-bold text-accent-purple truncate">{fmt(totalNominal)}</div>
          <div className="text-xs text-muted mt-1">Total ({total} transaksi)</div>
        </div>
        <div className="bg-pastel-blue border-blue-100 rounded-2xl p-4 text-center border">
          <div className="text-xl font-bold text-accent-blue">{data.filter(b => b.metode === 'Transfer Bank').length}</div>
          <div className="text-xs text-muted mt-1">Transfer Bank</div>
        </div>
        <div className="bg-pastel-yellow border-yellow-100 rounded-2xl p-4 text-center border">
          <div className="text-xl font-bold text-accent-yellow">{data.filter(b => b.metode === 'QRIS' || b.metode === 'E-Wallet').length}</div>
          <div className="text-xs text-muted mt-1">Digital</div>
        </div>
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-field pl-9" placeholder="Cari nama pelanggan / no. tagihan..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input-field w-auto" value={filterMetode} onChange={e => { setFilterMetode(e.target.value); setPage(1) }}>
          <option value="">Semua Metode</option>
          <option>Transfer Bank</option>
          <option>Tunai</option>
          <option>QRIS</option>
          <option>E-Wallet</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">ID <SortIcon col="created_at" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('nama_pelanggan')}>
                  <div className="flex items-center gap-1">Pelanggan <SortIcon col="nama_pelanggan" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('no_tagihan')}>
                  <div className="flex items-center gap-1">No. Tagihan <SortIcon col="no_tagihan" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('jumlah')}>
                  <div className="flex items-center gap-1">Jumlah <SortIcon col="jumlah" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('metode')}>
                  <div className="flex items-center gap-1">Metode <SortIcon col="metode" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('tgl_bayar')}>
                  <div className="flex items-center gap-1">Tanggal <SortIcon col="tgl_bayar" /></div>
                </th>
                <th className="th">Status</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(8)].map((_, j) => <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                </tr>
              )) : data.map(b => {
                const Icon = MetodeIcon[b.metode] || Banknote
                return (
                  <tr key={b.id} className="table-row-hover border-t border-purple-50">
                    <td className="td font-mono text-xs text-accent-blue font-semibold">TRX-{String(b.id).padStart(4, '0')}</td>
                    <td className="td font-medium">{b.nama_pelanggan}</td>
                    <td className="td font-mono text-xs text-accent-purple">{b.no_tagihan}</td>
                    <td className="td font-mono font-bold text-accent-mint">{fmt(b.jumlah)}</td>
                    <td className="td">
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <Icon size={13} className="text-accent-blue" />{b.metode}
                      </span>
                    </td>
                    <td className="td text-xs text-muted">{String(b.tgl_bayar).slice(0, 16).replace('T', ' ')}</td>
                    <td className="td"><span className="badge badge-paid">Berhasil</span></td>
                    <td className="td">
                      <button onClick={() => hapus(b.id)} className="w-7 h-7 rounded-lg bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-pink-100 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!loading && !data.length && (
                <tr><td colSpan={8} className="td text-center text-muted py-10">Belum ada data pembayaran</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-purple-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {total === 0 ? '0 data' : `${((page-1)*limit)+1}–${Math.min(page*limit, total)} dari ${total} data`}
            </span>
            <select className="input-field w-auto text-sm py-1.5" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}>
              <option value={10}>10 / hal</option>
              <option value={25}>25 / hal</option>
              <option value={50}>50 / hal</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold text-dark hover:bg-pastel-lavender disabled:opacity-50 disabled:cursor-not-allowed">
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button key={i+1} onClick={() => setPage(i+1)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold ${page === i+1 ? 'bg-accent-purple text-white' : 'border border-purple-200 text-dark hover:bg-pastel-lavender'}`}>
                  {i+1}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <span className="text-muted px-1">...</span>
                  <button onClick={() => setPage(totalPages)} className="w-8 h-8 rounded-lg text-sm font-semibold border border-purple-200 text-dark hover:bg-pastel-lavender">
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold text-dark hover:bg-pastel-lavender disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Catat Pembayaran" headerColor="bg-pastel-blue">
        <div className="p-6 space-y-4">
          {saldo !== null && (
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold border ${saldo >= 0 ? 'bg-pastel-mint border-green-200 text-accent-mint' : 'bg-pastel-pink border-pink-200 text-accent-pink'}`}>
              <span>Saldo Kas</span><span className="font-mono">{fmt(saldo)}</span>
            </div>
          )}
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">No. Tagihan *</label>
            <select className="input-field" value={form.id_tagihan} onChange={e => onChangeTagihan(e.target.value)}>
              <option value="">-- Pilih Tagihan Belum Bayar --</option>
              {tagihan.map(t => <option key={t.id} value={t.id}>{t.no_tagihan} - {t.nama_pelanggan} - {fmt(t.jumlah)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Jumlah (Rp) *</label>
              <input className="input-field font-mono" type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Metode</label>
              <select className="input-field" value={form.metode} onChange={e => setForm({ ...form, metode: e.target.value })}>
                <option>Transfer Bank</option><option>Tunai</option><option>QRIS</option><option>E-Wallet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tanggal Bayar</label>
            <input className="input-field" type="datetime-local" value={form.tgl_bayar} onChange={e => setForm({ ...form, tgl_bayar: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Keterangan</label>
            <input className="input-field" placeholder="Opsional..." value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-submit justify-center">Konfirmasi Bayar</button>
        </div>
      </Modal>
    </div>
  )
}
