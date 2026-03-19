import { useEffect, useState, useCallback, useRef } from 'react'
import { apiFetch } from '../lib/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { Plus, Edit2, Trash2, Search, Upload, Download, Wifi, WifiOff, Power, PowerOff, RefreshCw, ChevronUp, ChevronDown, Activity, ArrowDown, ArrowUp, ExternalLink, MessageCircle } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
function Badge({ status }) {
  const map = { Aktif: 'badge badge-paid', Nonaktif: 'badge badge-inactive', Trial: 'badge badge-trial' }
  return <span className={map[status] ?? 'badge badge-active'}>{status}</span>
}
const emptyForm = { nama: '', email: '', telepon: '', alamat: '', ip_address: '', id_paket: '', status: 'Aktif', tgl_bergabung: '' }

export default function Pelanggan() {
  const [data, setData]       = useState([])
  const [paket, setPaket]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterOnline, setFilterOnline] = useState('')
  const [sortBy, setSortBy]   = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage]       = useState(1)
  const [limit, setLimit]     = useState(10)
  const [total, setTotal]     = useState(0)
  const [modal, setModal]     = useState(false)
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState({ ...emptyForm })
  const [toast, setToast]     = useState(null)
  const [importModal, setImportModal] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedPelangganId, setSelectedPelangganId] = useState(null)
  const [waModal, setWaModal] = useState(false)
  const [waMessage, setWaMessage] = useState('')
  const [sendingWa, setSendingWa] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(null)
  const fileInputRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search)       q.set('search', search)
    if (filterStatus) q.set('status', filterStatus)
    if (filterOnline) q.set('online', filterOnline)
    if (sortBy)       q.set('sortBy', sortBy)
    if (sortOrder)    q.set('sortOrder', sortOrder)
    q.set('page', page)
    q.set('limit', limit)
    const r    = await apiFetch('/api/pelanggan?' + q)
    const json = await r.json()
    console.log('Pelanggan API response:', json)
    setData(json.data ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [search, filterStatus, filterOnline, sortBy, sortOrder, page, limit])

  useEffect(() => { load() }, [load])
  useEffect(() => { apiFetch('/api/paket').then(r => r.json()).then(setPaket) }, [])
  
  // Cleanup interval saat component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  const openAdd  = () => { setForm({ ...emptyForm, tgl_bergabung: new Date().toISOString().slice(0, 10) }); setEditId(null); setModal(true) }
  const openEdit = p => {
    setForm({ nama: p.nama, email: p.email || '', telepon: p.telepon, alamat: p.alamat || '',
      ip_address: p.ip_address || '', id_paket: String(p.id_paket || ''), status: p.status,
      tgl_bergabung: String(p.tgl_bergabung || '').slice(0, 10) })
    setEditId(p.id); setModal(true)
  }
  const save = async () => {
    if (!form.nama || !form.telepon) { setToast({ msg: 'Nama dan telepon wajib diisi', type: 'error' }); return }
    const r = await fetch(editId ? `/api/pelanggan/${editId}` : '/api/pelanggan', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type: 'error' }); return }
    setToast({ msg: editId ? 'Pelanggan diperbarui' : 'Pelanggan ditambahkan', type: 'success' })
    setModal(false); load()
  }
  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const r = await apiFetch('/api/pelanggan/import', { method: 'POST', body: formData })
      const d = await r.json()
      setToast({ msg: d.message, type: r.ok ? 'success' : 'error' })
      if (r.ok) { setImportModal(false); load() }
    } catch (err) {
      setToast({ msg: 'Gagal import: ' + err.message, type: 'error' })
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const downloadTemplate = () => {
    import('xlsx').then(XLSX => {
      const data = [
        ['Nama', 'Email', 'Telepon', 'Alamat', 'IP', 'ID_Paket', 'Status', 'Tanggal'],
        ['Budi Santoso', 'budi@email.com', '08123456789', 'Jl. Mawar No. 5', '192.168.1.10', '1', 'Aktif', '2026-01-15'],
        ['Siti Rahayu', 'siti@email.com', '08234567890', 'Jl. Melati No. 3', '192.168.1.11', '2', 'Aktif', '2026-02-10'],
      ]
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Template')
      XLSX.writeFile(wb, 'template-pelanggan.xlsx')
    })
  }

  const hapus = async id => {
    if (!confirm('Hapus pelanggan ini?')) return
    await fetch(`/api/pelanggan/${id}`, { method: 'DELETE' })
    setToast({ msg: 'Pelanggan dihapus', type: 'success' }); load()
  }

  const checkOnlineStatus = async () => {
    setCheckingStatus(true)
    try {
      const r = await apiFetch('/api/mikrotik/status')
      const d = await r.json()
      if (r.ok) {
        setToast({ msg: `Status diperbarui: ${d.online} pelanggan online`, type: 'success' })
        load()
      } else {
        setToast({ msg: d.error || 'Gagal cek status', type: 'error' })
      }
    } catch (err) {
      setToast({ msg: 'Gagal cek status: ' + err.message, type: 'error' })
    }
    setCheckingStatus(false)
  }

  const isolirPelanggan = async (id, nama) => {
    if (!confirm(`Isolir pelanggan ${nama}? Koneksi internet akan diputus.`)) return
    try {
      const r = await apiFetch(`/api/mikrotik/isolir/${id}`, { method: 'POST' })
      const d = await r.json()
      setToast({ msg: d.message || 'Pelanggan diisolir', type: r.ok ? 'success' : 'error' })
      if (r.ok) load()
    } catch (err) {
      setToast({ msg: 'Gagal isolir: ' + err.message, type: 'error' })
    }
  }

  const aktifkanPelanggan = async (id, nama) => {
    if (!confirm(`Aktifkan kembali pelanggan ${nama}?`)) return
    try {
      const r = await apiFetch(`/api/mikrotik/enable/${id}`, { method: 'POST' })
      const d = await r.json()
      setToast({ msg: d.message || 'Pelanggan diaktifkan', type: r.ok ? 'success' : 'error' })
      if (r.ok) load()
    } catch (err) {
      setToast({ msg: 'Gagal aktifkan: ' + err.message, type: 'error' })
    }
  }

  const showDetail = async (id) => {
    setDetailModal(true)
    setLoadingDetail(true)
    setDetailData(null)
    setSelectedPelangganId(id)
    
    const fetchDetail = async () => {
      try {
        const r = await apiFetch(`/api/mikrotik/pelanggan/${id}`)
        const d = await r.json()
        console.log('Detail koneksi response:', d)
        if (r.ok) {
          setDetailData({ ...d, id })
        } else {
          setToast({ msg: d.error || 'Gagal load detail', type: 'error' })
          setDetailModal(false)
        }
      } catch (err) {
        setToast({ msg: 'Gagal load detail: ' + err.message, type: 'error' })
        setDetailModal(false)
      }
      setLoadingDetail(false)
    }
    
    await fetchDetail()
    
    // Setup auto-refresh setiap 3 detik untuk live data
    const intervalId = setInterval(fetchDetail, 3000)
    setRefreshInterval(intervalId)
  }

  const closeDetailModal = () => {
    setDetailModal(false)
    if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  }

  const disconnectPelanggan = async (id) => {
    if (!confirm('Putuskan koneksi pelanggan ini?')) return
    try {
      const r = await apiFetch(`/api/mikrotik/disconnect/${id}`, { method: 'POST' })
      const d = await r.json()
      setToast({ msg: d.message || 'Koneksi diputus', type: r.ok ? 'success' : 'error' })
      if (r.ok) {
        setDetailModal(false)
        load()
      }
    } catch (err) {
      setToast({ msg: 'Gagal disconnect: ' + err.message, type: 'error' })
    }
  }

  const openWaModal = (pelanggan) => {
    console.log('Opening WA modal for:', pelanggan)
    alert(`Opening WhatsApp modal for ${pelanggan.nama}`)
    setSelectedPelangganId(pelanggan.id)
    setWaMessage(`Halo *${pelanggan.nama}*,\n\n`)
    setWaModal(true)
  }

  const sendWaMessage = async () => {
    console.log('Sending WA message:', { selectedPelangganId, waMessage })
    if (!waMessage.trim()) {
      setToast({ msg: 'Pesan tidak boleh kosong', type: 'error' })
      return
    }

    setSendingWa(true)
    try {
      const r = await apiFetch(`/api/whatsapp/send-to-customer/${selectedPelangganId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: waMessage })
      })
      const d = await r.json()
      
      if (r.ok && d.success) {
        setToast({ msg: 'Pesan WhatsApp berhasil dikirim!', type: 'success' })
        setWaModal(false)
        setWaMessage('')
      } else {
        setToast({ msg: d.message || 'Gagal mengirim pesan', type: 'error' })
      }
    } catch (err) {
      setToast({ msg: 'Gagal mengirim: ' + err.message, type: 'error' })
    }
    setSendingWa(false)
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ChevronUp size={14} className="opacity-30" />
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Data Pelanggan</h1>
          <p className="text-muted text-sm mt-1">Kelola semua pelanggan internet Anda</p>
        </div>
        <div className="flex gap-2">
          <button onClick={checkOnlineStatus} disabled={checkingStatus} className="btn-secondary w-fit">
            <RefreshCw size={16} className={checkingStatus ? 'animate-spin' : ''} /> 
            {checkingStatus ? 'Mengecek...' : 'Cek Status Online'}
          </button>
          <button onClick={() => setImportModal(true)} className="btn-secondary w-fit"><Upload size={16} /> Import Excel</button>
          <button onClick={openAdd} className="btn-primary w-fit"><Plus size={16} /> Tambah Pelanggan</button>
        </div>
      </div>

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
        <select className="input-field w-auto" value={filterOnline} onChange={e => { setFilterOnline(e.target.value); setPage(1) }}>
          <option value="">Semua Koneksi</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1 justify-center">ID <SortIcon column="id" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('nama')}>
                  <div className="flex items-center gap-1">Pelanggan <SortIcon column="nama" /></div>
                </th>
                <th className="th">Kontak</th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('id_paket')}>
                  <div className="flex items-center gap-1">Paket <SortIcon column="id_paket" /></div>
                </th>
                <th className="th">IP</th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('status_online')}>
                  <div className="flex items-center gap-1">Online <SortIcon column="status_online" /></div>
                </th>
                <th className="th cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <SortIcon column="status" /></div>
                </th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-purple-50">
                  {[...Array(8)].map((_, j) => <td key={j} className="td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                </tr>
              )) : data.map(p => {
                const isOnline = p.status_online === 'Online'
                const hasPPPoE = p.pppoe_username
                return (
                <tr key={p.id} className="table-row-hover border-t border-purple-50">
                  <td className="td font-mono text-xs text-muted">#{String(p.id).padStart(3, '0')}</td>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        >{p.nama.charAt(0)}</div>
                      <div>
                        <div className="font-semibold text-dark">{p.nama}</div>
                        <div className="text-xs text-muted">{p.email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td text-muted">{p.telepon}</td>
                  <td className="td"><span className="bg-pastel-purple text-accent-purple px-2 py-1 rounded-lg text-xs font-medium">{p.nama_paket || '-'}</span></td>
                  <td className="td font-mono text-xs text-muted">{p.ip_address || '-'}</td>
                  <td className="td">
                    {hasPPPoE ? (
                      <button 
                        onClick={() => showDetail(p.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                          isOnline 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {isOnline ? 'Online' : 'Offline'}
                      </button>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="td"><Badge status={p.status} /></td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-pastel-blue flex items-center justify-center text-accent-blue hover:bg-blue-100 transition-colors" title="Edit"><Edit2 size={12} /></button>
                      {p.telepon && p.telepon !== '-' && p.telepon.trim() && (
                        <button 
                          onClick={() => openWaModal(p)} 
                          className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors" 
                          title="Kirim WhatsApp"
                        >
                          <MessageCircle size={12} />
                        </button>
                      )}
                      {hasPPPoE && isOnline && p.ip_address && (
                        <button 
                          onClick={() => window.open(`http://${p.ip_address}`, '_blank')} 
                          className="w-7 h-7 rounded-lg bg-pastel-mint flex items-center justify-center text-accent-mint hover:bg-teal-100 transition-colors" 
                          title="Akses Modem"
                        >
                          <ExternalLink size={12} />
                        </button>
                      )}
                      {hasPPPoE && (
                        p.status === 'Aktif' ? (
                          <button onClick={() => isolirPelanggan(p.id, p.nama)} className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-colors" title="Isolir"><PowerOff size={12} /></button>
                        ) : (
                          <button onClick={() => aktifkanPelanggan(p.id, p.nama)} className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors" title="Aktifkan"><Power size={12} /></button>
                        )
                      )}
                      <button onClick={() => hapus(p.id)} className="w-7 h-7 rounded-lg bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-pink-100 transition-colors" title="Hapus"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              )})}
              {!loading && !data.length && <tr><td colSpan={8} className="td text-center text-muted py-10">Tidak ada data pelanggan</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total} data
            </span>
            <select 
              className="input-field w-auto text-sm py-1.5" 
              value={limit} 
              onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
              <option value={100}>100 per halaman</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold text-dark hover:bg-pastel-lavender disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                      page === pageNum 
                        ? 'bg-accent-purple text-white' 
                        : 'border border-purple-200 text-dark hover:bg-pastel-lavender'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {Math.ceil(total / limit) > 5 && (
                <>
                  <span className="text-muted px-2">...</span>
                  <button
                    onClick={() => setPage(Math.ceil(total / limit))}
                    className="w-8 h-8 rounded-lg text-sm font-semibold border border-purple-200 text-dark hover:bg-pastel-lavender"
                  >
                    {Math.ceil(total / limit)}
                  </button>
                </>
              )}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))} 
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold text-dark hover:bg-pastel-lavender disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'} headerColor="bg-pastel-lavender">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Nama Lengkap *</label>
              <input className="input-field" placeholder="Budi Santoso" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Nomor HP *</label>
              <input className="input-field" placeholder="08xx-xxxx" value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Email</label>
            <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Alamat</label>
            <textarea className="input-field h-20 resize-none" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Paket Internet</label>
              <select className="input-field" value={form.id_paket} onChange={e => setForm({ ...form, id_paket: e.target.value })}>
                <option value="">Pilih Paket...</option>
                {paket.map(p => <option key={p.id} value={p.id}>{p.nama_paket}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">IP Address</label>
              <input className="input-field font-mono" placeholder="192.168.1.x" value={form.ip_address} onChange={e => setForm({ ...form, ip_address: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Aktif</option><option>Trial</option><option>Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Tgl Bergabung</label>
              <input className="input-field" type="date" value={form.tgl_bergabung} onChange={e => setForm({ ...form, tgl_bergabung: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Batal</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-submit justify-center">Simpan</button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal open={importModal} onClose={() => setImportModal(false)} title="Import Data Pelanggan" headerColor="bg-pastel-mint">
        <div className="p-6 space-y-4">
          <div className="bg-pastel-blue border border-blue-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-accent-blue mb-2">Format Excel/CSV:</p>
            <ul className="text-muted space-y-1 text-xs">
              <li>• Kolom: Nama, Email, Telepon, Alamat, IP, ID_Paket, Status, Tanggal</li>
              <li>• Nama dan Telepon wajib diisi</li>
              <li>• Status: Aktif / Trial / Nonaktif</li>
            </ul>
          </div>
          <button onClick={downloadTemplate} className="w-full py-2.5 rounded-xl border border-purple-200 text-sm font-semibold text-accent-purple hover:bg-pastel-lavender flex items-center justify-center gap-2">
            <Download size={16} /> Download Template Excel
          </button>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-2">Pilih File Excel/CSV</label>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="input-field" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={() => setImportModal(false)} className="w-full py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Tutup</button>
        </div>
      </Modal>

      {/* Detail Koneksi Modal */}
      <Modal open={detailModal} onClose={closeDetailModal} title="Detail Koneksi Pelanggan" headerColor="bg-pastel-mint">
        <div className="p-6">
          {loadingDetail ? (
            <div className="text-center py-8">
              <RefreshCw size={32} className="animate-spin mx-auto text-accent-purple mb-2" />
              <p className="text-muted">Memuat data...</p>
            </div>
          ) : detailData ? (
            detailData.online ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <Wifi size={24} className="text-green-600" />
                  <div>
                    <p className="font-semibold text-green-700">Pelanggan Online</p>
                    <p className="text-xs text-green-600">Koneksi aktif ke MikroTik</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-purple-50">
                    <span className="text-muted text-sm">Username PPPoE</span>
                    <span className="font-semibold text-dark">{detailData.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-purple-50">
                    <span className="text-muted text-sm">IP Address</span>
                    <span className="font-mono text-sm text-dark">{detailData.ip}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-purple-50">
                    <span className="text-muted text-sm">Uptime</span>
                    <span className="text-sm text-dark">{detailData.uptime}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-purple-50">
                    <span className="text-muted text-sm">Service</span>
                    <span className="text-sm text-dark">{detailData.service}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-purple-50">
                    <span className="text-muted text-sm">Caller ID</span>
                    <span className="text-sm text-dark">{detailData.caller_id}</span>
                  </div>
                </div>

                {/* Traffic Usage */}
                {(detailData.bytes_in || detailData.bytes_out) && (
                  <div className="bg-pastel-blue border border-blue-200 rounded-xl p-4">
                    <p className="font-semibold text-accent-blue mb-3 flex items-center gap-2">
                      <Activity size={16} /> Traffic Usage
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowDown size={14} className="text-green-600" />
                          <span className="text-xs text-muted">Download (Total)</span>
                        </div>
                        <p className="font-bold text-dark">{detailData.bytes_in || '0 B'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowUp size={14} className="text-blue-600" />
                          <span className="text-xs text-muted">Upload (Total)</span>
                        </div>
                        <p className="font-bold text-dark">{detailData.bytes_out || '0 B'}</p>
                      </div>
                    </div>
                    {(detailData.rx_rate || detailData.tx_rate) && (
                      <>
                        <div className="border-t border-blue-200 pt-3 mb-2">
                          <p className="text-xs text-muted font-semibold mb-1 flex items-center gap-1">
                            Real-time Speed 
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-green-600">Live</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <ArrowDown size={14} className="text-green-600" />
                              <span className="text-xs text-green-700 font-medium">Rx (Download)</span>
                            </div>
                            <p className="font-bold text-green-700 text-lg">{detailData.rx_rate || '0 bps'}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <ArrowUp size={14} className="text-blue-600" />
                              <span className="text-xs text-blue-700 font-medium">Tx (Upload)</span>
                            </div>
                            <p className="font-bold text-blue-700 text-lg">{detailData.tx_rate || '0 bps'}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => window.open(`http://${detailData.ip}`, '_blank')}
                    className="py-2.5 rounded-xl bg-pastel-blue text-accent-blue font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} /> Akses Modem
                  </button>
                  <button 
                    onClick={() => disconnectPelanggan(detailData.id)} 
                    className="py-2.5 rounded-xl bg-orange-100 text-orange-600 font-semibold hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <PowerOff size={16} /> Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <WifiOff size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="font-semibold text-dark mb-1">Pelanggan Offline</p>
                <p className="text-sm text-muted">Tidak ada koneksi aktif saat ini</p>
              </div>
            )
          ) : null}
        </div>
        <div className="px-6 pb-6">
          <button onClick={closeDetailModal} className="w-full py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender">Tutup</button>
        </div>
      </Modal>

      {/* WhatsApp Message Modal */}
      <Modal open={waModal} onClose={() => setWaModal(false)} title="📱 Kirim Pesan WhatsApp" headerColor="bg-green-100">
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-700 font-semibold mb-1">Kirim pesan ke pelanggan</p>
            <p className="text-xs text-green-600">Pesan akan dikirim melalui WhatsApp Gateway</p>
          </div>
          
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-2">
              Pesan
            </label>
            <textarea 
              className="input-field h-40 resize-none font-sans"
              placeholder="Ketik pesan Anda di sini..."
              value={waMessage}
              onChange={e => setWaMessage(e.target.value)}
              disabled={sendingWa}
            />
            <p className="text-xs text-muted mt-1">
              Gunakan *teks* untuk bold, _teks_ untuk italic
            </p>
          </div>
        </div>
        
        <div className="px-6 pb-6 flex gap-3">
          <button 
            onClick={() => setWaModal(false)} 
            className="flex-1 py-2.5 rounded-xl border border-purple-100 text-sm font-semibold text-muted hover:bg-pastel-lavender"
            disabled={sendingWa}
          >
            Batal
          </button>
          <button 
            onClick={sendWaMessage} 
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            disabled={sendingWa}
          >
            {sendingWa ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <MessageCircle size={16} />
                Kirim Pesan
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  )
}