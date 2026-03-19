'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, FileText, Package, CreditCard, BarChart2, Settings, Wifi, X, TrendingDown } from 'lucide-react'

const navItems = [
  { href: '/',            label: 'Dashboard',        icon: LayoutDashboard, group: 'main' },
  { href: '/pelanggan',   label: 'Pelanggan',        icon: Users,           group: 'main' },
  { href: '/tagihan',     label: 'Tagihan',          icon: FileText,        group: 'main' },
  { href: '/paket',       label: 'Paket Internet',   icon: Package,         group: 'main' },
  { href: '/pembayaran',  label: 'Pembayaran',       icon: CreditCard,      group: 'main' },
  { href: '/pengeluaran', label: 'Pengeluaran',      icon: TrendingDown,    group: 'main' },
  { href: '/laporan',     label: 'Laporan Keuangan', icon: BarChart2,       group: 'report' },
  { href: '/pengaturan',  label: 'Pengaturan',       icon: Settings,        group: 'report' },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [pengaturan, setPengaturan] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetch(`/api/pengaturan?t=${refreshTrigger}`).then(r => r.json()).then(setPengaturan)
  }, [refreshTrigger])

  useEffect(() => {
    const handleSettingsUpdate = () => setRefreshTrigger(prev => prev + 1)
    window.addEventListener('settingsUpdated', handleSettingsUpdate)
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate)
  }, [])

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-purple-100 flex flex-col shadow-soft
        transition-transform duration-300 md:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pengaturan?.logo_url ? (
              <img src={pengaturan.logo_url} alt="Logo" className="h-9 w-9 object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>
                <Wifi size={16} className="text-white" />
              </div>
            )}
            <div>
              <div className="font-bold text-dark text-lg leading-none">{pengaturan?.nama_isp?.split(' ')[0] || 'NetBill'}</div>
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
          {navItems.filter(n => n.group === 'main').map(item => (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
              <item.icon size={16} className={pathname === item.href ? 'text-accent-purple' : 'text-muted'} />
              {item.label}
            </Link>
          ))}
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 mt-5 px-3">Laporan</p>
          {navItems.filter(n => n.group === 'report').map(item => (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
              <item.icon size={16} className={pathname === item.href ? 'text-accent-purple' : 'text-muted'} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-purple-50">
          <div className="flex items-center gap-3 bg-pastel-lavender rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>AD</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-dark truncate">Admin</div>
              <div className="text-xs text-muted truncate">admin@netbill.id</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
