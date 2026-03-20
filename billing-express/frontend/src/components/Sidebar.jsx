import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, FileText, Package, CreditCard,
  BarChart2, Settings, X, TrendingDown, UserCog, LogOut, ChevronDown, Wifi, Map
} from 'lucide-react'

// Definisi nav per role
const NAV = {
  admin: {
    main: [
      { to: '/',            label: 'Dashboard',        icon: LayoutDashboard },
      { to: '/pelanggan',   label: 'Pelanggan',        icon: Users },
      { to: '/tagihan',     label: 'Tagihan',          icon: FileText },
      { to: '/paket',       label: 'Paket Internet',   icon: Package },
      { to: '/pembayaran',  label: 'Pembayaran',       icon: CreditCard },
      { to: '/pengeluaran', label: 'Pengeluaran',      icon: TrendingDown },
      { to: '/peta',        label: 'Peta Pelanggan',   icon: Map },
    ],
    report: [
      { to: '/laporan',    label: 'Laporan Keuangan', icon: BarChart2 },
      { to: '/karyawan',   label: 'Karyawan',         icon: UserCog },
      { to: '/mikrotik',   label: 'MikroTik',         icon: Wifi },
      { to: '/pengaturan', label: 'Pengaturan',       icon: Settings },
    ],
  },
  bendahara: {
    main: [
      { to: '/',            label: 'Dashboard',        icon: LayoutDashboard },
      { to: '/tagihan',     label: 'Tagihan',          icon: FileText },
      { to: '/pembayaran',  label: 'Pembayaran',       icon: CreditCard },
      { to: '/pengeluaran', label: 'Pengeluaran',      icon: TrendingDown },
    ],
    report: [
      { to: '/laporan', label: 'Laporan Keuangan', icon: BarChart2 },
    ],
  },
  karyawan: {
    main: [
      { to: '/',          label: 'Dashboard',  icon: LayoutDashboard },
      { to: '/pelanggan', label: 'Pelanggan',  icon: Users },
      { to: '/tagihan',   label: 'Tagihan',    icon: FileText },
    ],
    report: [],
  },
}

const roleLabel = { admin: 'Admin', bendahara: 'Bendahara', karyawan: 'Karyawan' }
const roleColor = { admin: 'text-accent-purple', bendahara: 'text-accent-mint', karyawan: 'text-accent-blue' }

export default function Sidebar({ open, onClose }) {
  const { user, logout }    = useAuth()
  const navigate            = useNavigate()
  const [pengaturan, setPengaturan] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const nav = NAV[user?.role] ?? NAV.karyawan

  useEffect(() => {
    fetch('/api/pengaturan').then(r => r.json()).then(setPengaturan)
    const handler = () => fetch('/api/pengaturan').then(r => r.json()).then(setPengaturan)
    window.addEventListener('settingsUpdated', handler)
    return () => window.removeEventListener('settingsUpdated', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink to={to} end={to === '/'} onClick={onClose}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <Icon size={16} />
      {label}
    </NavLink>
  )

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-purple-100 flex flex-col shadow-soft transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="p-6 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pengaturan?.logo_url
              ? <img src={pengaturan.logo_url} alt="Logo" className="h-9 w-9 object-contain" />
              : <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>
                  <span className="text-white font-black text-sm tracking-tight">TN</span>
                </div>
            }
            <div>
              <div className="font-bold text-dark text-lg leading-none">{pengaturan?.nama_isp?.split(' ')[0] || 'TamNet'}</div>
              <div className="text-muted text-xs mt-0.5">Billing Internet</div>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden w-7 h-7 rounded-lg bg-pastel-lavender flex items-center justify-center text-muted">
            <X size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-3">Menu Utama</p>
          {nav.main.map(n => <NavItem key={n.to} {...n} />)}

          {nav.report.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 mt-5 px-3">Laporan</p>
              {nav.report.map(n => <NavItem key={n.to} {...n} />)}
            </>
          )}
        </nav>

        {/* User menu */}
        <div className="p-4 border-t border-purple-50">
          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 bg-pastel-lavender rounded-xl px-3 py-2.5 hover:bg-purple-100 transition-colors">
              {user?.foto
                ? <img src={user.foto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>
                    {user?.nama?.charAt(0)}
                  </div>
              }
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-semibold text-dark truncate">{user?.nama}</div>
                <div className={`text-xs font-medium ${roleColor[user?.role] ?? 'text-muted'}`}>{roleLabel[user?.role]}</div>
              </div>
              <ChevronDown size={14} className={`text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl border border-purple-100 shadow-soft overflow-hidden">
                <NavLink to="/profil" onClick={() => { setUserMenuOpen(false); onClose() }}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-pastel-lavender transition-colors">
                  <UserCog size={14} className="text-muted" /> Edit Profil
                </NavLink>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-accent-pink bg-pastel-pink hover:bg-pink-100 transition-colors">
                  <LogOut size={14} /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

