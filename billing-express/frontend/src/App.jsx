import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Shell      from './components/Shell'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Pelanggan  from './pages/Pelanggan'
import Tagihan    from './pages/Tagihan'
import Paket      from './pages/Paket'
import Pembayaran from './pages/Pembayaran'
import Pengeluaran from './pages/Pengeluaran'
import Laporan    from './pages/Laporan'
import Pengaturan from './pages/Pengaturan'
import MikroTik   from './pages/MikroTik'
import Karyawan   from './pages/Karyawan'
import Pemasukan from './pages/Pemasukan'
import Profil     from './pages/Profil'

import Peta       from './pages/Peta'
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-accent-purple border-t-transparent animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return null

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/*" element={
        <PrivateRoute>
          <Shell>
            <Routes>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/profil"       element={<Profil />} />
              <Route path="/pelanggan"    element={<PrivateRoute roles={['admin','karyawan']}><Pelanggan /></PrivateRoute>} />
              <Route path="/tagihan"      element={<Tagihan />} />
              <Route path="/paket"        element={<PrivateRoute roles={['admin']}><Paket /></PrivateRoute>} />
              <Route path="/pembayaran"   element={<PrivateRoute roles={['admin','bendahara']}><Pembayaran /></PrivateRoute>} />
              <Route path="/pengeluaran"  element={<PrivateRoute roles={['admin','bendahara']}><Pengeluaran /></PrivateRoute>} />
              <Route path="/pemasukan"   element={<PrivateRoute roles={['admin','bendahara']}><Pemasukan /></PrivateRoute>} />
              <Route path="/laporan"      element={<PrivateRoute roles={['admin','bendahara']}><Laporan /></PrivateRoute>} />
              <Route path="/karyawan"     element={<PrivateRoute roles={['admin']}><Karyawan /></PrivateRoute>} />
              <Route path="/pengaturan"   element={<PrivateRoute roles={['admin']}><Pengaturan /></PrivateRoute>} />
              <Route path="/mikrotik"     element={<PrivateRoute roles={['admin']}><MikroTik /></PrivateRoute>} />
              <Route path="/peta"         element={<PrivateRoute roles={['admin']}><Peta /></PrivateRoute>} />
            </Routes>
          </Shell>
        </PrivateRoute>
      } />
    </Routes>
  )
}

