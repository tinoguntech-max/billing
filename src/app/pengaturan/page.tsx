'use client'
import Shell from '@/components/Shell'
import { useState, useEffect } from 'react'
import Toast from '@/components/Toast'
import { Upload } from 'lucide-react'

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'}|null>(null)
  const [form, setForm] = useState({
    nama_isp: '',
    telepon: '',
    email: '',
    website: '',
    alamat: '',
    logo_url: null as string | null,
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    // Load pengaturan
    fetch('/api/pengaturan')
      .then(r => r.json())
      .then(data => {
        setForm(data)
        if (data.logo_url) setLogoPreview(data.logo_url)
        setLoading(false)
      })
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string)
      }
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
    if (logoFile) {
      formData.append('logo_file', logoFile)
    }

    const r = await fetch('/api/pengaturan', { method: 'POST', body: formData })
    const d = await r.json()

    if (!r.ok) {
      setToast({ msg: d.error, type: 'error' })
    } else {
      setToast({ msg: '✅ Pengaturan berhasil disimpan!', type: 'success' })
      setLogoFile(null)
      // Reload pengaturan in all components
      window.dispatchEvent(new Event('settingsUpdated'))
    }
  }

  const dbConfig = {
    host: process.env.NEXT_PUBLIC_DB_HOST || 'localhost',
    port: '3306',
    name: 'billing_internet',
  }

  if (loading) {
    return (
      <Shell>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Shell>
    )
  }

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
                <input
                  type="text"
                  className="input-field"
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form] || ''}
                  onChange={(e) => setForm({...form, [f.key]: e.target.value})}
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Alamat</label>
              <textarea
                className="input-field h-20 resize-none"
                value={form.alamat}
                onChange={(e) => setForm({...form, alamat: e.target.value})}
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-2">Logo</label>
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center cursor-pointer hover:border-accent-purple transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-input"
                />
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

        {/* DB Config */}
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Konfigurasi Database MySQL</h3>
          <div className="bg-pastel-lavender rounded-xl p-4 font-mono text-xs space-y-2 text-dark mb-4">
            <div><span className="text-accent-purple">HOST</span>: <span className="text-accent-blue">{dbConfig.host}</span></div>
            <div><span className="text-accent-purple">PORT</span>: <span className="text-accent-blue">{dbConfig.port}</span></div>
            <div><span className="text-accent-purple">DATABASE</span>: <span className="text-accent-mint">billing_internet</span></div>
            <div><span className="text-accent-purple">STATUS</span>: <span className="text-accent-mint">● Connected</span></div>
          </div>

          <h4 className="font-semibold text-dark text-sm mb-2">Skema Database</h4>
          <div className="bg-pastel-mint rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs text-dark font-mono whitespace-pre-wrap">{`CREATE TABLE paket (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nama_paket VARCHAR(100) NOT NULL,
  kecepatan  INT NOT NULL,
  harga      DECIMAL(12,0) NOT NULL,
  deskripsi  TEXT
);

CREATE TABLE pelanggan (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nama         VARCHAR(100) NOT NULL,
  email        VARCHAR(100),
  telepon      VARCHAR(20),
  alamat       TEXT,
  ip_address   VARCHAR(20),
  id_paket     INT,
  status       ENUM('Aktif','Nonaktif','Trial'),
  tgl_bergabung DATE,
  FOREIGN KEY (id_paket) REFERENCES paket(id)
);

CREATE TABLE tagihan (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  no_tagihan     VARCHAR(30) UNIQUE,
  id_pelanggan   INT NOT NULL,
  periode        VARCHAR(30),
  jumlah         DECIMAL(12,0),
  tgl_jatuh_tempo DATE,
  status         ENUM('Lunas','Belum Bayar','Terlambat'),
  FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id)
);

CREATE TABLE pembayaran (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  id_tagihan  INT NOT NULL,
  jumlah      DECIMAL(12,0),
  metode      ENUM('Transfer Bank','Tunai','QRIS','E-Wallet'),
  tgl_bayar   DATETIME,
  FOREIGN KEY (id_tagihan) REFERENCES tagihan(id)
);`}</pre>
          </div>
        </div>
      </div>
    </Shell>
  )
}
