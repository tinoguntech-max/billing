import { useState } from 'react'
import { apiFetch } from '../lib/api'
import Toast from '../components/Toast'
import { RefreshCw, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react'

export default function MikroTik() {
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [statusResult, setStatusResult] = useState(null)

  const testConnection = async () => {
    setLoading(true)
    try {
      const r = await apiFetch('/api/mikrotik/test')
      const d = await r.json()
      if (d.success) {
        setToast({ msg: `Koneksi berhasil! Identity: ${d.identity}`, type: 'success' })
      } else {
        setToast({ msg: `Koneksi gagal: ${d.error}`, type: 'error' })
      }
    } catch (err) {
      setToast({ msg: 'Error: ' + err.message, type: 'error' })
    }
    setLoading(false)
  }

  const syncUsers = async () => {
    if (!confirm('Sync semua PPPoE users dari MikroTik?')) return
    setLoading(true)
    try {
      const r = await apiFetch('/api/mikrotik/sync', { method: 'POST' })
      const d = await r.json()
      if (d.success) {
        setSyncResult(d)
        setToast({ msg: `Sync berhasil: ${d.synced} users (${d.created} baru, ${d.updated} update)`, type: 'success' })
      } else {
        setToast({ msg: `Sync gagal: ${d.error}`, type: 'error' })
      }
    } catch (err) {
      setToast({ msg: 'Error: ' + err.message, type: 'error' })
    }
    setLoading(false)
  }

  const checkStatus = async () => {
    setLoading(true)
    try {
      const r = await apiFetch('/api/mikrotik/status')
      const d = await r.json()
      if (d.success) {
        setStatusResult(d)
        setToast({ msg: `Status updated: ${d.online} users online`, type: 'success' })
      } else {
        setToast({ msg: `Gagal: ${d.error}`, type: 'error' })
      }
    } catch (err) {
      setToast({ msg: 'Error: ' + err.message, type: 'error' })
    }
    setLoading(false)
  }

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Integrasi MikroTik</h1>
        <p className="text-muted text-sm mt-1">Kelola PPPoE users dan monitoring status online</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-blue flex items-center justify-center mb-3">
            <Wifi size={18} className="text-accent-blue" />
          </div>
          <h3 className="font-bold text-dark mb-2">Test Koneksi</h3>
          <p className="text-xs text-muted mb-4">Cek koneksi ke MikroTik API</p>
          <button onClick={testConnection} disabled={loading} className="btn-primary w-full text-sm">
            {loading ? 'Testing...' : 'Test Koneksi'}
          </button>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center mb-3">
            <RefreshCw size={18} className="text-accent-mint" />
          </div>
          <h3 className="font-bold text-dark mb-2">Sync PPPoE Users</h3>
          <p className="text-xs text-muted mb-4">Import semua PPPoE secret dari MikroTik</p>
          <button onClick={syncUsers} disabled={loading} className="btn-primary w-full text-sm">
            {loading ? 'Syncing...' : 'Sync Users'}
          </button>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-purple flex items-center justify-center mb-3">
            <CheckCircle size={18} className="text-accent-purple" />
          </div>
          <h3 className="font-bold text-dark mb-2">Cek Status Online</h3>
          <p className="text-xs text-muted mb-4">Update status online/offline pelanggan</p>
          <button onClick={checkStatus} disabled={loading} className="btn-primary w-full text-sm">
            {loading ? 'Checking...' : 'Cek Status'}
          </button>
        </div>
      </div>

      {syncResult && (
        <div className="card p-5 mb-4">
          <h3 className="font-bold text-dark mb-3">Hasil Sync</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-pastel-blue rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent-blue">{syncResult.synced}</div>
              <div className="text-xs text-muted mt-1">Total Synced</div>
            </div>
            <div className="bg-pastel-mint rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent-mint">{syncResult.created}</div>
              <div className="text-xs text-muted mt-1">Baru Dibuat</div>
            </div>
            <div className="bg-pastel-purple rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent-purple">{syncResult.updated}</div>
              <div className="text-xs text-muted mt-1">Diupdate</div>
            </div>
          </div>
        </div>
      )}

      {statusResult && (
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-3">Status Online</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Wifi size={16} className="text-accent-mint" />
              <span className="text-sm font-semibold text-dark">{statusResult.online} Online</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-muted" />
              <span className="text-sm text-muted">Offline lainnya</span>
            </div>
          </div>
          {statusResult.users.length > 0 && (
            <div className="bg-pastel-mint rounded-xl p-4">
              <div className="text-xs font-semibold text-accent-mint mb-2">Users Online:</div>
              <div className="flex flex-wrap gap-2">
                {statusResult.users.map((u, i) => (
                  <span key={i} className="bg-white px-2 py-1 rounded-lg text-xs font-mono text-dark">{u}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card p-5 mt-4">
        <h3 className="font-bold text-dark mb-3">Panduan Penggunaan</h3>
        <div className="space-y-2 text-sm text-muted">
          <p>1. Pastikan konfigurasi MikroTik sudah diatur di halaman Pengaturan</p>
          <p>2. Test koneksi terlebih dahulu untuk memastikan API bisa diakses</p>
          <p>3. Sync PPPoE users untuk import data pelanggan dari MikroTik</p>
          <p>4. Gunakan Cek Status untuk monitoring users yang sedang online</p>
          <p>5. Isolir/Enable pelanggan bisa dilakukan dari halaman Pelanggan</p>
        </div>
      </div>
    </div>
  )
}
