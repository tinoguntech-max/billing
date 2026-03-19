import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { Plus, University, Banknote, QrCode, Wallet } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const MetodeIcon = { 'Transfer Bank': University, 'Tunai': Banknote, 'QRIS': QrCode, 'E-Wallet': Wallet }
const emptyForm = { id_tagihan: '', jumlah: '', metode: 'Transfer Bank', tgl_bayar: '', keterangan: '' }

export default function Pembayaran() {
  const [data, setData]       = useState([])
  const [tagihan, setTagihan] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ ...emptyForm })
  const [toast, setToast]     = useState(null)
  const [saldo, setSaldo]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r    = await apiFetch('/api/pembayaran')
    const json = await r.json()
    setData(json.data ?? []); setLoading(false)
  }, [])

  useEffect(() => {
    load()
    apiFetch('/api/pengeluaran/saldo')
      .then(r => r.json())
      .then(d => { if (d.saldo !== undefined) setSaldo(Number(d.saldo)) })
      .catch(err => console.error('Saldo error:', err))
  }, [load])

  const openModal = async () => {
    const r    = await apiFetch('/api/tagihan?status=Belum+Bayar&limit=100')
    const json = await r.json()
    setTagihan(json.data ?? [])
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    setForm({ ...emptyForm, tgl_bayar: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}` })
    setModal(true)
  }

  const onChangeTagihan = id => {
    const t = tagihan.find(x => String(x.id) === id)
    setForm(f => ({ ...f, id_tagihan: id, jumlah: t?.jumlah ? String(t.jumlah) : '' }))
  }

  const save = async () => {
    if (!form.id_tagihan || !form.jumlah) { setToast({ msg: 'Lengkapi form!', type: 'error' }); return }
    const r = await apiFetch('/api/pembayaran', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!r.ok) { const d = await r.json(); setToast({ msg: d.error, type: 'error' }); return }
    setToast({ msg: 'Pembayaran berhasil dicatat!', type: 'success' })
    setModal(false)
    load()
    // Reload saldo after payment
    apiFetch('/api/pengeluaran/saldo')
      .then(r => r.json())
      .then(d => { if (d.saldo !== undefined) setSaldo(Number(d.saldo)) })
      .catch(() => {})
  }

  const now        = new Date()
  const bulanIni   = data.filter(b => { const t = new Date(b.tgl_bayar); return t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear() })
  const namaBulan  = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now)
  const totalBulan = bulanIni.reduce((s, b) => s + Number(b.jumlah), 0)
  const saldoNegatif = saldo !== null && saldo < 0

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Riwayat Pembayaran</h1>
          <p className="text-muted text-sm mt-1">Pembayaran bulan {namaBulan}</p>
        </div>
        <button onClick={openModal} className="btn-primary w-fit"><Plus size={16} /> Catat Pembayaran</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {/* Saldo Kas */}
        <div className={`rounded-2xl p-4 text-center border ${saldoNegatif ? 'bg-pastel-pink border-pink-200' : 'bg-pastel-mint border-green-100'}`}>
          <div className={`text-xl font-bold truncate ${saldoNegatif ? 'text-accent-pink' : 'text-accent-mint'}`}>
            {saldo !== null ? fmt(saldo) : <span className="text-sm text-muted">...</span>}
          </div>
          <div className="text-xs text-muted mt-1">Saldo Kas</div>
        </div>
        {[
          { bg: 'bg-pastel-purple border-purple-100', val: fmt(totalBulan), label: 'Total Pembayaran', color: 'text-accent-purple' },
          { bg: 'bg-pastel-blue border-blue-100', val: bulanIni.filter(b => b.metode === 'Transfer Bank').length, label: 'Transfer Bank', color: 'text-accent-blue' },
          { bg: 'bg-pastel-yellow border-yellow-100', val: bulanIni.filter(b => b.metode === 'QRIS' || b.metode === 'E-Wallet').length, label: 'Digital', color: 'text-accent-yellow' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 text-center border`}>
            <div className={`text-xl font-bold ${s.color} truncate`}>{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th">ID Transaksi</th><th className="th">Pelanggan</th><th className="th">No. Tagihan</th>
                <th className="th">Jumlah</th><th className="th">Metode</th><th className="th">Tanggal</th><th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(7)].map((_, j) => <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                </tr>
              )) : bulanIni.map(b => {
                const Icon = MetodeIcon[b.metode] || Banknote
                return (
                  <tr key={b.id} className="table-row-hover border-t border-purple-50">
                    <td className="td font-mono text-xs text-accent-blue font-semibold">TRX-{String(b.id).padStart(4, '0')}</td>
                    <td className="td font-medium">{b.nama_pelanggan}</td>
                    <td className="td font-mono text-xs text-accent-purple">{b.no_tagihan}</td>
                    <td className="td font-mono font-bold text-accent-mint">{fmt(b.jumlah)}</td>
                    <td className="td"><span className="flex items-center gap-1.5 text-xs text-muted"><Icon size={13} className="text-accent-blue" />{b.metode}</span></td>
                    <td className="td text-xs text-muted">{String(b.tgl_bayar).slice(0, 16).replace('T', ' ')}</td>
                    <td className="td"><span className="badge badge-paid">Berhasil</span></td>
                  </tr>
                )
              })}
              {!loading && !bulanIni.length && <tr><td colSpan={7} className="td text-center text-muted py-10">Belum ada pembayaran bulan ini</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Catat Pembayaran" headerColor="bg-pastel-blue">
        <div className="p-6 space-y-4">
          {/* Saldo info */}
          {saldo !== null && (
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold border ${saldo >= 0 ? 'bg-pastel-mint border-green-200 text-accent-mint' : 'bg-pastel-pink border-pink-200 text-accent-pink'}`}>
              <span>Saldo Kas</span>
              <span className="font-mono">{fmt(saldo)}</span>
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
