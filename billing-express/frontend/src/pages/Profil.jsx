import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import Toast from '../components/Toast'
import { Camera, Shield, Banknote, User } from 'lucide-react'

const roleStyle = {
  admin:     { bg: 'bg-pastel-purple', text: 'text-accent-purple', icon: Shield,   label: 'Admin' },
  bendahara: { bg: 'bg-pastel-mint',   text: 'text-accent-mint',   icon: Banknote, label: 'Bendahara' },
  karyawan:  { bg: 'bg-pastel-blue',   text: 'text-accent-blue',   icon: User,     label: 'Karyawan' },
}

export default function Profil() {
  const { user, updateUser } = useAuth()
  const [toast, setToast]   = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const [form, setForm] = useState({
    nama:         user?.nama || '',
    telepon:      user?.telepon || '',
    alamat:       user?.alamat || '',
    password_lama:  '',
    password_baru:  '',
    konfirmasi_pw:  '',
  })
  const [fotoPreview, setFotoPreview] = useState(user?.foto || null)
  const [fotoFile, setFotoFile]       = useState(null)

  const rs   = roleStyle[user?.role] ?? roleStyle.karyawan
  const Icon = rs.icon

  const handleFoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setFotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const uploadFoto = async () => {
    if (!fotoFile) return
    const fd = new FormData()
    fd.append('foto', fotoFile)
    const r = await apiFetch('/api/karyawan/foto', { method: 'POST', body: fd })
    const d = await r.json()
    if (r.ok) { updateUser({ foto: d.foto }); setFotoFile(null) }
    return r.ok
  }

  const saveProfile = async e => {
    e.preventDefault()
    if (form.password_baru && form.password_baru !== form.konfirmasi_pw)
      return setToast({ msg: 'Konfirmasi password tidak cocok', type: 'error' })
    if (form.password_baru && form.password_baru.length < 6)
      return setToast({ msg: 'Password baru minimal 6 karakter', type: 'error' })

    setSaving(true)
    try {
      // Upload foto dulu kalau ada
      if (fotoFile) await uploadFoto()

      const body = { nama: form.nama, telepon: form.telepon, alamat: form.alamat }
      if (form.password_baru) {
        body.password_lama = form.password_lama
        body.password_baru = form.password_baru
      }

      const r = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) { setToast({ msg: d.error, type: 'error' }); return }

      updateUser({ nama: form.nama, telepon: form.telepon, alamat: form.alamat })
      setForm(f => ({ ...f, password_lama: '', password_baru: '', konfirmasi_pw: '' }))
      setToast({ msg: 'Profil berhasil diperbarui', type: 'success' })
    } finally { setSaving(false) }
  }

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-dark mb-6">Edit Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Foto & info */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            {fotoPreview
              ? <img src={fotoPreview} alt="Foto" className="w-24 h-24 rounded-full object-cover border-4 border-purple-100" />
              : <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-purple-100"
                  style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>{user?.nama?.charAt(0)}</div>
            }
            <button onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-white shadow-soft hover:opacity-90 transition-opacity">
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </div>
          <h3 className="font-bold text-dark text-lg">{user?.nama}</h3>
          <p className="text-muted text-sm mb-3">{user?.email}</p>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${rs.bg} ${rs.text}`}>
            <Icon size={12} />{rs.label}
          </span>
          {fotoFile && (
            <p className="text-xs text-accent-purple mt-3 font-medium">Foto baru dipilih - simpan untuk mengupload</p>
          )}
        </div>

        {/* Form */}
        <div className="md:col-span-2 card p-6">
          <form onSubmit={saveProfile} className="space-y-4">
            <h3 className="font-bold text-dark mb-2">Informasi Pribadi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input className="input-field" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Telepon</label>
                <input className="input-field" placeholder="08xx-xxxx" value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Email</label>
              <input className="input-field bg-gray-50 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Alamat</label>
              <textarea className="input-field h-16 resize-none" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
            </div>

            <div className="border-t border-purple-50 pt-4">
              <h3 className="font-bold text-dark mb-3">Ubah Password <span className="text-muted font-normal text-sm">(opsional)</span></h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Password Lama</label>
                  <input className="input-field" type="password" placeholder=""
                    value={form.password_lama} onChange={e => setForm({ ...form, password_lama: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Password Baru</label>
                    <input className="input-field" type="password" placeholder="Min. 6 karakter"
                      value={form.password_baru} onChange={e => setForm({ ...form, password_baru: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Konfirmasi</label>
                    <input className="input-field" type="password" placeholder="Ulangi password"
                      value={form.konfirmasi_pw} onChange={e => setForm({ ...form, konfirmasi_pw: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-submit w-full justify-center py-3 disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


