import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Users, AlertCircle, Wifi, TrendingUp, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

function Badge({ status }) {
  const map = { Lunas: 'badge badge-paid', 'Belum Bayar': 'badge badge-unpaid', Terlambat: 'badge badge-unpaid', Aktif: 'badge badge-active', Nonaktif: 'badge badge-inactive', Trial: 'badge badge-trial' }
  return <span className={map[status] ?? 'badge badge-active'}>{status}</span>
}

const paketColors = ['#9B6FD4', '#4BA3E3', '#2EC98A', '#F5C842']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const statCards = data ? [
    { label: 'Total Pelanggan',      value: data.pelanggan.total,  icon: Users,       bg: 'bg-pastel-purple', accent: 'text-accent-purple', pct: 72 },
    { label: 'Pendapatan Bulan Ini', value: fmt(data.pendapatan),  icon: TrendingUp,  bg: 'bg-pastel-mint',   accent: 'text-accent-mint',   pct: 60 },
    { label: 'Tagihan Belum Bayar',  value: data.tagihan.belum,    icon: AlertCircle, bg: 'bg-pastel-pink',   accent: 'text-accent-pink',   pct: 35 },
    { label: 'Saldo Kas',            value: fmt(data.saldo ?? 0),  icon: Wallet,      bg: data.saldo >= 0 ? 'bg-pastel-blue' : 'bg-pastel-pink', accent: data.saldo >= 0 ? 'text-accent-blue' : 'text-accent-pink', pct: 80 },
  ] : []

  const totalPaket = data?.distribusiPaket?.reduce((s, p) => s + Number(p.jumlah), 0) || 1

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Selamat datang kembali, Admin </p>
        </div>
        <div className="text-sm text-muted bg-white px-4 py-2 rounded-xl border border-purple-100 shadow-soft w-fit"> {today}</div>
      </div>

      {/* Stat cards */}
      {loading
        ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-7 bg-gray-100 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}</div>
        : <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((s, i) => (
              <div key={i} className="card p-5 hover:-translate-y-1 transition-transform duration-200 cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon size={18} className={s.accent} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-dark">{s.value}</div>
                <div className="text-sm text-muted mt-1">{s.label}</div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.pct}%` }} /></div>
              </div>
            ))}
          </div>
      }

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark">Grafik Pendapatan</h3>
            <span className="text-xs text-muted bg-pastel-lavender px-3 py-1.5 rounded-lg">6 Bulan Terakhir</span>
          </div>
          {(() => {
              const vals = (data?.pendapatan6 ?? []).map(x => Number(x.total))
              const max  = Math.max(...vals, 1)
              const BAR_H = 160
              const fmtY = v => v >= 1000000 ? `${(v/1000000).toFixed(1)}jt` : v >= 1000 ? `${Math.round(v/1000)}rb` : String(v)
              return (
                <div className="flex gap-2">
                  {/* Y-axis */}
                  <div className="flex flex-col justify-between text-right pr-2" style={{ height: BAR_H, minWidth: 48 }}>
                    {[1, 0.75, 0.5, 0.25, 0].map(f => (
                      <span key={f} className="text-xs text-muted leading-none">{fmtY(Math.round(max * f))}</span>
                    ))}
                  </div>
                  {/* Chart area */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-end gap-2 border-b border-l border-purple-100" style={{ height: BAR_H }}>
                      {(data?.pendapatan6 ?? []).map((b, i, arr) => {
                        const pct    = Number(b.total) > 0 ? (Number(b.total) / max) * 100 : 0
                        const isLast = i === arr.length - 1
                        const barH   = Number(b.total) > 0 ? Math.max((pct / 100) * BAR_H, 6) : 4
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center relative group" style={{ height: BAR_H }}>
                            <div className="absolute bottom-0 w-full flex flex-col items-center">
                              {/* Tooltip */}
                              <div className="absolute bg-dark text-white text-xs px-2 py-1 rounded-lg font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                                style={{ bottom: barH + 4 }}>
                                {fmt(b.total)}
                              </div>
                              <div className="w-full rounded-t-lg transition-all duration-500"
                                style={{
                                  height: barH,
                                  background: isLast
                                    ? 'linear-gradient(180deg,#9B6FD4,#4BA3E3)'
                                    : Number(b.total) === 0
                                      ? '#E8D5FF'
                                      : 'linear-gradient(180deg,#C8B5F0,#A8D4F5)'
                                }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {/* X-axis labels */}
                    <div className="flex gap-2 mt-1">
                      {(data?.pendapatan6 ?? []).map((b, i, arr) => (
                        <div key={i} className="flex-1 text-center">
                          <span className={`text-xs ${i === arr.length - 1 ? 'text-dark font-bold' : 'text-muted'}`}>
                            {b.bulan.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()
          }
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Distribusi Paket</h3>
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#E8D5FF" strokeWidth="4" />
              {data?.distribusiPaket?.map((p, i) => {
                const pct    = (Number(p.jumlah) / totalPaket) * 100
                const offset = data.distribusiPaket.slice(0, i).reduce((s, x) => s + (Number(x.jumlah) / totalPaket) * 100, 0)
                return <circle key={i} cx="18" cy="18" r="14" fill="none" stroke={paketColors[i % paketColors.length]}
                  strokeWidth="4" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} strokeLinecap="round" />
              })}
            </svg>
          </div>
          <div className="space-y-2">
            {data?.distribusiPaket?.map((p, i) => {
              const pct = Math.round((Number(p.jumlah) / totalPaket) * 100)
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: paketColors[i % paketColors.length] }} />
                  <span className="flex-1 text-muted truncate">{p.nama_paket}</span>
                  <span className="font-bold text-dark">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tagihan terbaru */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-50">
          <h3 className="font-bold text-dark">Tagihan Terbaru</h3>
          <Link to="/tagihan" className="text-xs text-accent-purple font-semibold hover:underline">Lihat Semua &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender">
                <th className="th">No. Tagihan</th><th className="th">Pelanggan</th>
                <th className="th">Paket</th><th className="th">Jumlah</th>
                <th className="th">Jatuh Tempo</th><th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.tagihanTerbaru?.map(t => (
                <tr key={t.id} className="table-row-hover border-t border-purple-50">
                  <td className="td font-mono text-xs text-accent-purple font-semibold">{t.no_tagihan}</td>
                  <td className="td font-medium">{t.nama_pelanggan}</td>
                  <td className="td text-muted text-xs">{t.nama_paket}</td>
                  <td className="td font-mono font-semibold">{fmt(t.jumlah)}</td>
                  <td className="td text-muted text-xs">{String(t.tgl_jatuh_tempo).slice(0, 10)}</td>
                  <td className="td"><Badge status={t.status} /></td>
                </tr>
              ))}
              {!loading && !data?.tagihanTerbaru?.length && (
                <tr><td colSpan={6} className="td text-center text-muted py-8">Belum ada tagihan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



