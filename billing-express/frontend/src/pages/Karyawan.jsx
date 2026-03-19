import { useEffect, useState, useCallback } from 'react'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { apiFetch } from '../lib/api'
import { Plus, Edit2, Trash2, UserCheck, UserX, Shield, Banknote, User } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const ROLES = ['admin', 'bendahara', 'karyawan']
const roleStyle = {
  admin:     { bg: 'bg-pastel-purple', text: 'text-accent-purple', icon: Shield },
  bendahara: { bg: 'bg-pastel-mint',   text: 'text-accent-mint',   icon: Banknote },
  karyawan:  { bg: 'bg-pastel-blue',   text: 'text-accent-blue',   icon: User },
}
const emptyForm = { nama: '', email: '', password: '', role: 'karyawan', telepon: '', alamat: '', gaji: '', aktif: 1 }

export default function Karyawan() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState({ ...emptyForm })
  const [toast, setToast]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await apiFetch('/api/karyawan')
    setData(await r.json()); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm({ ...emptyForm }); setEditId(null); setModal(true) }
  const openEdit = row => {
    setForm({
      nama: row.nama, email: row.email, password: '', role: row.role,
      telepon: row.telepon || '', alamat: row.alamat || '',
      gaji: row.gaji > 0 ? String(row.gaji) : '', aktif: row.aktif,
    })
    setEditId(row.id); setModal(true)
  }

  const save = async () => {
    if (!form.nama || !form.email || (!editId && !form.password))
      return setToast({ msg: 'Nama, email, dan password wajib diisi', type: 'error' })

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })

    const r = await apiFetch(editId ? `/api/karyawan/${editId}` : '/api/karyawan', {
      method: editId ? 'PUT' : 'POST', body: fd,
    })
    const d = await r.json()
    if (!r.ok) return setToast({ msg: d.error, type: 'error' })
    setToast({ msg: editId ? 'Karyawan diperbarui' : 'Karyawan ditambahkan', type: 'success' })
    setModal(false); load()
  }

  const hapus = async id => {
    if (!confirm('Hapus karyawan ini?')) return
    const r = await apiFetch(`/api/karyawan/${id}`, { method: 'DELETE' })
    const d = await r.json()
    if (!r.ok) return setToast({ msg: d.error, type: 'error' })
    setToast({ msg: 'Karyawan dihapus', type: 'success' }); load()
  }

  const toggleAktif = async row => {
    const fd = new FormData()
    fd.append('aktif', row.aktif ? 0 : 1)
    await apiFetch(`/api/karyawan/${row.id}`, { method: 'PUT', body: fd })
    load()
  }

  const aktif    = data.filter(d => d.aktif).length
  const nonaktif = data.filter(d => !d.aktif).length
  const totalGaji = data.filter(d => d.aktif).reduce((s, d) => s + Number(d.gaji || 0), 0)

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Manajemen Karyawan</h1>
          <p className="text-muted text-sm mt-1">Kelola akun dan hak akses karyawan</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-fit"><Plus size={16} /> Tambah Karyawan</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-dark">{data.length}</div>
          <div className="text-xs text-muted mt-1">Total Karyawan</div>
        </div>
        <div className="bg-pastel-mint rounded-2xl p-4 text-center border border-green-100">
          <div className="text-2xl font-bold text-accent-mint">{aktif}</div>
          <div className="text-xs text-muted mt-1">Aktif</div>
        </div>
        <div className="bg-pastel-pink rounded-2xl p-4 text-center border border-pink-100">
          <div className="text-2xl font-bold text-accent-pink">{nonaktif}</div>
          <div className="text-xs text-muted mt-1">Nonaktif</div>
        </div>
        <div className="bg-pastel-yellow rounded-2xl p-4 text-center border border-yellow-100">
          <div className="text-lg font-bold text-accent-yellow truncate">{fmt(totalGaji)}</div>
          <div className="text-xs text-muted mt-1">Total Gaji/Bulan</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th">Karyawan</th>
                <th className="th">Role</th>
                <th className="th">Telepon</th>
                <th className="th">Gaji/Bulan</th>
                <th className="th">Status</th>
                <th className="th">Bergabung</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => (
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(7)].map((_, j) => <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                </tr>
              )) : data.map(row => {
                const rs   = roleStyle[row.role] ?? roleStyle.karyawan
                const Icon = rs.icon
                return (
                  <tr key={row.id} className="table-row-hover border-t border-purple-50">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        {row.foto
                          ? <img src={row.foto} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          : <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>
                              {row.nama.charAt(0)}
                            </div>
                        }
                        <div>
                          <div className="font-semibold text-dark">{row.nama}</div>
                          <div className="text-xs text-muted">{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${rs.bg} ${rs.text}`}>
                        <Icon size={11} />{row.role}
                      </span>
                    </td>
                    <td className="td text-muted text-xs">{row.telepon || '-'}</td>
                    <td className="td font-mono text-sm font-semibold text-accent-mint">
                      {row.gaji > 0 ? fmt(row.gaji) : <span className="text-muted font-normal text-xs">-</span>}
                    </td>
                    <td className="td">
                      <button onClick={() => toggleAktif(row)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors
                          ${row.aktif ? 'bg-pastel-mint text-accent-mint hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {row.aktif ? <><UserCheck size={11} /> Aktif</> : <><UserX size={11} /> Nonaktif</>}
                      </button>
                    </td>
                    <td className="td text-xs text-muted">{String(row.created_at).slice(0, 10)}</td>
                    <td className="td">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(row)} className="w-7 h-7 rounded-lg bg-pastel-blue flex items-center justify-center text-accent-blue hover:bg-blue-100"><Edit2 size={12} /></button>
                        <button onClick={() => hapus(row.id)} className="w-7 h-7 rounded-lg bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-pink-100"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!loading && !data.length && (
                <tr><td colSpan={7} className="td text-center text-muted py-10">Belum ada karyawan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Karyawan' : 'Tambah Karyawan'} headerColor="bg-pastel-purple">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Nama *</label>
              <input className="input-field" placeholder="Nama lengkap" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Role *</label>
              <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Email *</label>
            <input className="input-field" type="email" placeholder="email@tamnet.id" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">
              Password {editId && <span className="text-muted font-normal normal-case">(kosongkan jika tidak diubah)</span>}
            </label>
            <input className="input-field" type="password" placeholder={editId ? '' : 'Min. 6 karakter'}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Telepon</label>
              <input className="input-field" placeholder="08xx-xxxx" value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Gaji/Bulan (Rp)</label>
              <input className="input-field font-mono" type="number" placeholder="0" value={form.gaji} onChange={e => setForm({ ...form, gaji: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Alamat</label>
            <textarea className="input-field h-16 resize-none" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
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
