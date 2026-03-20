import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { apiFetch } from '../lib/api'
import Toast from '../components/Toast'
import { RefreshCw, Users, Wifi, WifiOff, MapPin } from 'lucide-react'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom colored markers
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

const icons = {
  online: createIcon('green'),
  offline: createIcon('red'),
  trial: createIcon('orange'),
  nonaktif: createIcon('grey'),
}

function FitBounds({ pelanggan }) {
  const map = useMap()
  useEffect(() => {
    const valid = pelanggan.filter(p => p.latitude && p.longitude)
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map(p => [p.latitude, p.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [pelanggan, map])
  return null
}

export default function Peta() {
  const [pelanggan, setPelanggan] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('semua')
  const [toast, setToast] = useState(null)
  const [center] = useState([-7.5, 110.0]) // Default center Indonesia

  const load = async () => {
    setLoading(true)
    const r = await apiFetch('/api/pelanggan?limit=1000')
    const d = await r.json()
    setPelanggan(d.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = pelanggan.filter(p => {
    if (!p.latitude || !p.longitude) return false
    if (filter === 'semua') return true
    if (filter === 'online') return p.status_online === 'Online'
    if (filter === 'offline') return p.status_online === 'Offline'
    if (filter === 'aktif') return p.status === 'Aktif'
    if (filter === 'nonaktif') return p.status === 'Nonaktif'
    return true
  })

  const getIcon = (p) => {
    if (p.status === 'Nonaktif') return icons.nonaktif
    if (p.status === 'Trial') return icons.trial
    if (p.status_online === 'Online') return icons.online
    return icons.offline
  }

  const stats = {
    total: pelanggan.filter(p => p.latitude && p.longitude).length,
    online: pelanggan.filter(p => p.latitude && p.longitude && p.status_online === 'Online').length,
    offline: pelanggan.filter(p => p.latitude && p.longitude && p.status_online === 'Offline').length,
    tanpaLokasi: pelanggan.filter(p => !p.latitude || !p.longitude).length,
  }

  return (
    <div className="p-6 space-y-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Peta Pelanggan</h1>
          <p className="text-sm text-muted">Lokasi pelanggan di peta</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Di Peta', value: stats.total, icon: MapPin, color: 'bg-pastel-lavender text-accent-purple' },
          { label: 'Online', value: stats.online, icon: Wifi, color: 'bg-pastel-mint text-accent-mint' },
          { label: 'Offline', value: stats.offline, icon: WifiOff, color: 'bg-pastel-pink text-accent-pink' },
          { label: 'Tanpa Lokasi', value: stats.tanpaLokasi, icon: Users, color: 'bg-pastel-yellow text-accent-yellow' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-dark">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card p-4 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted font-semibold">Filter:</span>
        {[
          { key: 'semua', label: 'Semua' },
          { key: 'online', label: '🟢 Online' },
          { key: 'offline', label: '🔴 Offline' },
          { key: 'aktif', label: 'Aktif' },
          { key: 'nonaktif', label: 'Nonaktif' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              filter === f.key ? 'bg-accent-purple text-white' : 'bg-pastel-lavender text-dark hover:bg-purple-100'
            }`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted">{filtered.length} titik ditampilkan</span>
      </div>

      {/* Legend */}
      <div className="card p-3 flex items-center gap-4 flex-wrap">
        <span className="text-xs text-muted font-semibold">Keterangan:</span>
        {[
          { color: 'bg-green-500', label: 'Online' },
          { color: 'bg-red-500', label: 'Offline' },
          { color: 'bg-orange-400', label: 'Trial' },
          { color: 'bg-gray-400', label: 'Nonaktif' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-xs text-muted">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="card overflow-hidden" style={{ height: '550px' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-accent-purple" />
          </div>
        ) : (
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds pelanggan={filtered} />
            {filtered.map(p => (
              <Marker key={p.id} position={[p.latitude, p.longitude]} icon={getIcon(p)}>
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-bold text-sm mb-1">{p.nama}</p>
                    <div className="space-y-0.5 text-xs text-gray-600">
                      <p>📦 Paket: {p.nama_paket || '-'}</p>
                      <p>📡 Status: <span className={p.status_online === 'Online' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{p.status_online || '-'}</span></p>
                      <p>🌐 IP: {p.ip_address || '-'}</p>
                      <p>📞 Telp: {p.telepon || '-'}</p>
                      <p>📍 {p.alamat || '-'}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {stats.tanpaLokasi > 0 && (
        <div className="card p-4 bg-pastel-yellow border border-yellow-200">
          <p className="text-sm text-accent-yellow font-semibold">⚠️ {stats.tanpaLokasi} pelanggan belum memiliki koordinat lokasi</p>
          <p className="text-xs text-muted mt-1">Tambahkan koordinat di menu Edit Pelanggan (isi kolom Latitude & Longitude)</p>
        </div>
      )}
    </div>
  )
}
