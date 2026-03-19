import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const [pengaturan, setPengaturan] = useState(null)

  useEffect(() => {
    fetch('/api/pengaturan').then(r => r.json()).then(setPengaturan).catch(() => {})
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error); setLoading(false); return }
      login(d.token, d.user)
      navigate('/')
    } catch {
      setError('Gagal terhubung ke server')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#F0EFF8 0%,#E8D5FF 50%,#C8E6FF 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex flex-col items-center">
            {pengaturan?.logo_url
              ? <img src={pengaturan.logo_url} alt="Logo" className="w-full max-h-16 object-contain mb-2" />
              : <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-soft mb-2"
                  style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>
                  <span className="text-white font-black text-xl tracking-tight">TN</span>
                </div>
            }
            <p className="text-muted text-sm mt-1">Billing Internet</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft border border-purple-100 p-8">
          <h2 className="text-lg font-bold text-dark mb-1">Selamat Datang</h2>
          <p className="text-muted text-sm mb-6">Masuk ke akun Anda untuk melanjutkan</p>

          {error && (
            <div className="bg-pastel-pink border border-pink-200 text-accent-pink text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Email</label>
              <input className="input-field" type="email"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Password</label>
              <div className="relative">
                <input className="input-field pr-10" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-orange w-full justify-center py-3 mt-2 disabled:opacity-60">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-purple-50">
            <p className="text-xs text-muted text-center mb-3">Akun demo</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin',     email: 'admin@TamNet.id',     pw: 'admin123',     cls: 'bg-pastel-purple text-accent-purple border border-purple-200 hover:bg-purple-100' },
                { label: 'Bendahara', email: 'bendahara@TamNet.id', pw: 'bendahara123', cls: 'bg-pastel-mint   text-accent-mint   border border-green-200  hover:bg-green-100' },
                { label: 'Karyawan',  email: 'karyawan@TamNet.id',  pw: 'karyawan123',  cls: 'bg-pastel-blue  text-accent-blue   border border-blue-200   hover:bg-blue-100' },
              ].map(a => (
                <button key={a.label} type="button"
                  onClick={() => setForm({ email: a.email, password: a.pw })}
                  className={`${a.cls} rounded-xl py-2 text-xs font-semibold transition-colors`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



