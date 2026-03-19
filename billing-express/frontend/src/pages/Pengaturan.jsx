import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import Toast from '../components/Toast'
import { Upload, RefreshCw, Smartphone, CheckCircle, XCircle } from 'lucide-react'

export default function Pengaturan() {
  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile]     = useState(null)
  const [waStatus, setWaStatus]     = useState(null)
  const [waLoading, setWaLoading]   = useState(false)
  const [form, setForm] = useState({ 
    nama_isp: '', telepon: '', email: '', website: '', alamat: '', 
    mikrotik_host: '', mikrotik_user: '', mikrotik_password: '', mikrotik_port: '8728',
    wa_api_url: '', wa_api_token: '', wa_notif_enabled: false
  })

  useEffect(() => {
    apiFetch('/api/pengaturan').then(r => r.json()).then(d => {
      setForm({ 
        nama_isp: d.nama_isp || '', telepon: d.telepon || '', email: d.email || '', 
        website: d.website || '', alamat: d.alamat || '', 
        mikrotik_host: d.mikrotik_host || '', mikrotik_user: d.mikrotik_user || '', 
        mikrotik_password: d.mikrotik_password || '', mikrotik_port: d.mikrotik_port || '8728',
        wa_api_url: d.wa_api_url || '', wa_api_token: d.wa_api_token || '', 
        wa_notif_enabled: d.wa_notif_enabled || false
      })
      if (d.logo_url) setLogoPreview(d.logo_url)
      setLoading(false)
    })
    // Load WA status
    loadWaStatus()
  }, [])

  const loadWaStatus = () => {
    apiFetch('/api/whatsapp/status').then(r => r.json()).then(d => setWaStatus(d)).catch(() => {})
  }

  const handleWaLogout = async () => {
    if (!confirm('Yakin ingin logout WhatsApp? Anda perlu scan QR code lagi dengan nomor baru.')) return
    setWaLoading(true)
    try {
      const r = await apiFetch('/api/whatsapp/logout', { method: 'POST' })
      const d = await r.json()
      if (d.success) {
        setToast({ msg: 'WhatsApp berhasil logout. Silakan scan QR code baru.', type: 'success' })
        setWaStatus({ ready: false, hasQR: false })
        // Buka halaman QR di tab baru
        setTimeout(() => window.open('/api/whatsapp/qr', '_blank'), 1000)
      } else {
        setToast({ msg: 'Gagal logout WhatsApp', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Gagal logout WhatsApp', type: 'error' })
    }
    setWaLoading(false)
  }

  const handleLogoChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async e => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (logoFile) fd.append('logo_file', logoFile)
    const r = await apiFetch('/api/pengaturan', { method: 'POST', body: fd })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type: 'error' }); return }
    setToast({ msg: ' Pengaturan berhasil disimpan!', type: 'success' })
    setLogoFile(null)
    window.dispatchEvent(new Event('settingsUpdated'))
  }

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="grid grid-cols-2 gap-4"><div className="h-64 bg-gray-200 rounded" /><div className="h-64 bg-gray-200 rounded" /></div>
    </div>
  )

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-dark mb-6">Pengaturan Sistem</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Informasi Perusahaan</h3>
          <form onSubmit={handleSave} className="space-y-3">
            {[
              { label: 'Nama ISP',  key: 'nama_isp',  placeholder: 'TamNet Internet Provider' },
              { label: 'Telepon',   key: 'telepon',   placeholder: '(0355) 123-4567' },
              { label: 'Email',     key: 'email',     placeholder: 'info@TamNet.id' },
              { label: 'Website',   key: 'website',   placeholder: 'https://TamNet.id' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">{f.label}</label>
                <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Alamat</label>
              <textarea className="input-field h-20 resize-none" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-2">Logo</label>
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center cursor-pointer hover:border-accent-purple transition-colors">
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-input" />
                <label htmlFor="logo-input" className="cursor-pointer">
                  {logoPreview
                    ? <div className="flex flex-col items-center gap-2"><img src={logoPreview} alt="Logo" className="h-16 object-contain" /><span className="text-xs text-accent-purple font-semibold">Ubah Logo</span></div>
                    : <div className="flex flex-col items-center gap-2 text-muted"><Upload size={20} /><span className="text-xs">Upload Logo</span></div>
                  }
                </label>
              </div>
            </div>
            <button type="submit" className="btn-submit w-full justify-center mt-4">Simpan Pengaturan</button>
          </form>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Konfigurasi Database MySQL</h3>
          <div className="bg-pastel-lavender rounded-xl p-4 font-mono text-xs space-y-2 text-dark mb-4">
            <div><span className="text-accent-purple">HOST</span>: <span className="text-accent-blue">localhost</span></div>
            <div><span className="text-accent-purple">PORT</span>: <span className="text-accent-blue">3306</span></div>
            <div><span className="text-accent-purple">DATABASE</span>: <span className="text-accent-mint">billing_internet</span></div>
            <div><span className="text-accent-purple">STATUS</span>: <span className="text-accent-mint">o Connected</span></div>
          </div>
          <h4 className="font-semibold text-dark text-sm mb-2">Skema Database</h4>
          <div className="bg-pastel-mint rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs text-dark font-mono whitespace-pre-wrap">{`pelanggan  -> paket (id_paket)
tagihan    -> pelanggan (id_pelanggan)
pembayaran -> tagihan (id_tagihan)
pengaturan (single row config)
pengeluaran (standalone)`}</pre>
          </div>
        </div>
      </div>

      {/* MikroTik Configuration */}
      <div className="card p-5 mt-4">
        <h3 className="font-bold text-dark mb-4">Konfigurasi MikroTik</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Host / IP MikroTik</label>
            <input className="input-field" placeholder="192.168.1.1" value={form.mikrotik_host} onChange={e => setForm({ ...form, mikrotik_host: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Port API</label>
            <input className="input-field" type="number" placeholder="8728" value={form.mikrotik_port} onChange={e => setForm({ ...form, mikrotik_port: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Username</label>
            <input className="input-field" placeholder="admin" value={form.mikrotik_user} onChange={e => setForm({ ...form, mikrotik_user: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Password</label>
            <input className="input-field" type="password" placeholder="••••••" value={form.mikrotik_password} onChange={e => setForm({ ...form, mikrotik_password: e.target.value })} />
          </div>
        </div>
        <button type="button" onClick={handleSave} className="btn-primary w-full mt-4">Simpan Konfigurasi</button>
      </div>

      {/* WhatsApp Notification Configuration */}
      <div className="card p-5 mt-4">
        <h3 className="font-bold text-dark mb-4">🔔 Notifikasi WhatsApp</h3>
        <div className="bg-pastel-blue border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-accent-blue mb-2 font-semibold">Fitur Notifikasi Otomatis</p>
          <ul className="text-xs text-muted space-y-1">
            <li>• Notifikasi otomatis saat modem pelanggan offline</li>
            <li>• Notifikasi saat koneksi kembali online</li>
            <li>• Monitoring setiap 5 menit</li>
            <li>• Menggunakan API WhatsApp (Fonnte, Wablas, dll)</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-pastel-lavender rounded-xl">
            <input 
              type="checkbox" 
              id="wa-enabled" 
              checked={form.wa_notif_enabled}
              onChange={e => setForm({ ...form, wa_notif_enabled: e.target.checked })}
              className="w-5 h-5 text-accent-purple rounded focus:ring-2 focus:ring-accent-purple"
            />
            <label htmlFor="wa-enabled" className="font-semibold text-dark cursor-pointer">
              Aktifkan Notifikasi WhatsApp
            </label>
          </div>
          
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">
              WhatsApp API URL
            </label>
            <input 
              className="input-field font-mono text-sm" 
              placeholder="https://api.fonnte.com/send" 
              value={form.wa_api_url} 
              onChange={e => setForm({ ...form, wa_api_url: e.target.value })} 
            />
            <p className="text-xs text-muted mt-1">Contoh: Fonnte, Wablas, atau WhatsApp Business API</p>
          </div>
          
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">
              API Token / Key
            </label>
            <input 
              className="input-field font-mono text-sm" 
              type="password"
              placeholder="••••••••••••••••" 
              value={form.wa_api_token} 
              onChange={e => setForm({ ...form, wa_api_token: e.target.value })} 
            />
            <p className="text-xs text-muted mt-1">Token autentikasi dari provider WhatsApp API Anda</p>
          </div>
        </div>
        
        <button type="button" onClick={handleSave} className="btn-primary w-full mt-4">
          Simpan Konfigurasi WhatsApp
        </button>
      </div>

      {/* WhatsApp Gateway Status */}
      <div className="card p-5 mt-4">
        <h3 className="font-bold text-dark mb-4">📱 WhatsApp Gateway</h3>
        <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${waStatus?.ready ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {waStatus?.ready
            ? <CheckCircle size={20} className="text-green-600 shrink-0" />
            : <XCircle size={20} className="text-red-500 shrink-0" />
          }
          <div>
            <p className={`font-semibold text-sm ${waStatus?.ready ? 'text-green-700' : 'text-red-600'}`}>
              {waStatus?.ready ? 'WhatsApp Terhubung' : 'WhatsApp Tidak Terhubung'}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {waStatus?.ready ? 'Gateway siap mengirim notifikasi' : 'Scan QR code untuk menghubungkan'}
            </p>
          </div>
          <button onClick={loadWaStatus} className="ml-auto w-7 h-7 rounded-lg bg-white flex items-center justify-center text-muted hover:bg-gray-100" title="Refresh status">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="flex gap-3">
          <a href="/api/whatsapp/qr" target="_blank"
            className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold text-center hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <Smartphone size={16} />
            {waStatus?.ready ? 'Lihat Status QR' : 'Scan QR Code'}
          </a>
          <button onClick={handleWaLogout} disabled={waLoading || !waStatus?.ready}
            className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {waLoading ? <RefreshCw size={16} className="animate-spin" /> : <XCircle size={16} />}
            Ganti Nomor WA
          </button>
        </div>
        <p className="text-xs text-muted mt-3 text-center">
          Klik "Ganti Nomor WA" untuk logout dan scan QR dengan nomor baru
        </p>
      </div>
    </div>
  )
}



