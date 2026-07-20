'use client'
import Shell from '@/components/Shell'
import { useState, useEffect, useCallback } from 'react'
import Toast from '@/components/Toast'
import { Upload, MessageCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'}|null>(null)
  const [form, setForm] = useState({
    nama_isp: '', telepon: '', email: '', website: '', alamat: '', logo_url: null as string | null,
    mikrotik_host: '', mikrotik_user: '', mikrotik_password: '', mikrotik_port: '8728'
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // WA Gateway state
  const [waStatus, setWaStatus]   = useState<{ready:boolean, error?:string} | null>(null)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

  useEffect(() => {
    fetch('/api/pengaturan').then(r => r.json()).then(data => {
      setForm(data)
      if (data.logo_url) setLogoPreview(data.logo_url)
      setLoading(false)
    })
  }, [])

  const fetchWaStatus = useCallback(async () => {
    const r = await fetch('/api/whatsapp/status')
    const d = await r.json()
    setWaStatus(d)
    return d
  }, [])

  useEffect(() => { fetchWaStatus() }, [fetchWaStatus])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setLogoPreview(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('nama_isp', form.nama_isp)
    formData.append('telepon', form.telepon)
    formData.append('email', form.email)
    formData.append('website', form.website)
    formData.append('alamat', form.alamat)
    formData.append('mikrotik_host', form.mikrotik_host)
    formData.append('mikrotik_user', form.mikrotik_user)
    formData.append('mikrotik_password', form.mikrotik_password)
    formData.append('mikrotik_port', form.mikrotik_port)
    if (logoFile) formData.append('logo_file', logoFile)
    const r = await fetch('/api/pengaturan', { method: 'POST', body: formData })
    const d = await r.json()
    if (!r.ok) { setToast({ msg: d.error, type: 'error' }) }
    else { setToast({ msg: 'Pengaturan berhasil disimpan!', type: 'success' }); setLogoFile(null); window.dispatchEvent(new Event('settingsUpdated')) }
  }

  const dbConfig = { host: process.env.NEXT_PUBLIC_DB_HOST || 'localhost', port: '3306', name: 'billing_internet' }

  if (loading) return (
    <Shell><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3"></div><div className="grid grid-cols-2 gap-4"><div className="h-64 bg-gray-200 rounded"></div><div className="h-64 bg-gray-200 rounded"></div></div></div></Shell>
  )

  return (
    <Shell>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <h1 className="text-2xl font-bold text-dark mb-6">Pengaturan Sistem</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Info Perusahaan */}
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Informasi Perusahaan</h3>
          <form onSubmit={handleSave} className="space-y-3">
            {[
              { label:'Nama ISP',   key: 'nama_isp', placeholder:'NetBill Internet Provider' },
              { label:'Telepon',    key: 'telepon', placeholder:'(0355) 123-4567' },
              { label:'Email',      key: 'email', placeholder:'info@netbill.id' },
              { label:'Website',    key: 'website', placeholder:'https://netbill.id' },
            ].map(f=>(
              <div key={f.key}>
                <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">{f.label}</label>
                <input type="text" className="input-field" placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form] || ''}
                  onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Alamat</label>
              <textarea className="input-field h-20 resize-none" value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-2">Logo</label>
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center cursor-pointer hover:border-accent-purple transition-colors">
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-input" />
                <label htmlFor="logo-input" className="cursor-pointer">
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={logoPreview} alt="Logo preview" className="h-16 object-contain" />
                      <span className="text-xs text-accent-purple font-semibold">Ubah Logo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted">
                      <Upload size={20} />
                      <span className="text-xs">Upload Logo</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center mt-4">Simpan Pengaturan</button>
          </form>
        </div>

        <div className="space-y-4">
          {/* WA Gateway */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={18} className="text-green-500"/>
              <h3 className="font-bold text-dark">WhatsApp Gateway</h3>
            </div>

            {/* Status */}
            <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${waStatus?.ready ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              {waStatus?.ready
                ? <CheckCircle size={20} className="text-green-500 flex-shrink-0"/>
                : <XCircle size={20} className="text-red-400 flex-shrink-0"/>
              }
              <div>
                <div className={`font-semibold text-sm ${waStatus?.ready ? 'text-green-700' : 'text-red-600'}`}>
                  {waStatus?.ready ? 'Fonnte API Aktif' : waStatus?.error ? 'Backend tidak aktif' : 'Token belum dikonfigurasi'}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {waStatus?.ready ? 'WhatsApp siap mengirim notifikasi via Fonnte' : 'Pastikan FONNTE_TOKEN sudah diset di .env backend'}
                </div>
              </div>
              <button onClick={fetchWaStatus} className="ml-auto w-7 h-7 rounded-lg bg-white flex items-center justify-center text-muted hover:bg-gray-100 transition-colors">
                <RefreshCw size={13}/>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-50 text-xs text-muted space-y-1">
              <div>Provider: <span className="font-mono text-accent-purple">Fonnte API</span></div>
              <div>Backend URL: <span className="font-mono text-accent-purple">{backendUrl}</span></div>
              <div>Tidak perlu scan QR — cukup pastikan token Fonnte sudah diset di file <code>.env</code> backend.</div>
            </div>
          </div>

          {/* DB Config */}
          <div className="card p-5">
            <h3 className="font-bold text-dark mb-4">Konfigurasi Database MySQL</h3>
            <div className="bg-pastel-lavender rounded-xl p-4 font-mono text-xs space-y-2 text-dark">
              <div><span className="text-accent-purple">HOST</span>: <span className="text-accent-blue">{dbConfig.host}</span></div>
              <div><span className="text-accent-purple">PORT</span>: <span className="text-accent-blue">{dbConfig.port}</span></div>
              <div><span className="text-accent-purple">DATABASE</span>: <span className="text-accent-mint">billing_internet</span></div>
              <div><span className="text-accent-purple">STATUS</span>: <span className="text-accent-mint">● Connected</span></div>
            </div>
          </div>

          {/* MikroTik Config */}
          <div className="card p-5">
            <h3 className="font-bold text-dark mb-4">Konfigurasi MikroTik</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Host / IP</label>
                  <input type="text" className="input-field" placeholder="192.168.1.1"
                    value={form.mikrotik_host || ''} onChange={(e) => setForm({...form, mikrotik_host: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Port API</label>
                  <input type="text" className="input-field" placeholder="8728"
                    value={form.mikrotik_port || ''} onChange={(e) => setForm({...form, mikrotik_port: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Username</label>
                  <input type="text" className="input-field" placeholder="admin"
                    value={form.mikrotik_user || ''} onChange={(e) => setForm({...form, mikrotik_user: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Password</label>
                  <input type="password" className="input-field" placeholder="***"
                    value={form.mikrotik_password || ''} onChange={(e) => setForm({...form, mikrotik_password: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center mt-4">Simpan MikroTik</button>
            </form>
          </div>
        </div>

      </div>
    </Shell>
  )
}
