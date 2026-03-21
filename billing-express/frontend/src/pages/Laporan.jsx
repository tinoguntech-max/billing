import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { TrendingUp, TrendingDown, Wallet, FileText } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function Laporan() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = () => apiFetch('/api/dashboard').then(r => r.json()).then(setData)
    fetchData()
    const interval = setInterval(fetchData, 5000)
    const onVisible = () => { if (document.visibilityState === 'visible') fetchData() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  const colors = ['from-accent-purple to-accent-blue', 'from-accent-mint to-accent-blue', 'from-accent-yellow to-accent-peach', 'from-accent-pink to-accent-purple']

  const pendapatanTagihan = Number(data?.pendapatan ?? 0)
  const pendapatanLain    = Number(data?.pemasukanLain ?? 0)
  const totalPemasukan    = pendapatanTagihan + pendapatanLain

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-6">Laporan Keuangan</h1>

      {/* Ringkasan pemasukan bulan ini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-accent-mint" />
          </div>
          <div className="text-xl font-bold text-accent-mint truncate">{fmt(totalPemasukan)}</div>
          <div className="text-sm text-muted mt-1">Total Pemasukan Bulan Ini</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#2EC98A,#4BA3E3)' }} /></div>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-blue flex items-center justify-center mb-3">
            <FileText size={18} className="text-accent-blue" />
          </div>
          <div className="text-xl font-bold text-dark truncate">{fmt(pendapatanTagihan)}</div>
          <div className="text-sm text-muted mt-1">Dari Tagihan Pelanggan</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: totalPemasukan > 0 ? `${(pendapatanTagihan / totalPemasukan) * 100}%` : '0%', background: 'linear-gradient(90deg,#4BA3E3,#9B6FD4)' }} />
          </div>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-purple flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-accent-purple" />
          </div>
          <div className="text-xl font-bold text-dark truncate">{fmt(pendapatanLain)}</div>
          <div className="text-sm text-muted mt-1">Pemasukan Lainnya</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: totalPemasukan > 0 ? `${(pendapatanLain / totalPemasukan) * 100}%` : '0%', background: 'linear-gradient(90deg,#9B6FD4,#E8609A)' }} />
          </div>
        </div>

        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-lavender flex items-center justify-center mb-3">
            <Wallet size={18} className="text-accent-purple" />
          </div>
          <div className={`text-xl font-bold truncate ${Number(data?.saldo ?? 0) >= 0 ? 'text-accent-mint' : 'text-accent-pink'}`}>
            {data ? fmt(data.saldo) : '-'}
          </div>
          <div className="text-sm text-muted mt-1">Saldo Kas (All Time)</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: '100%' }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Ringkasan Bulan Ini</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Tagihan Diterbitkan', value: `${data?.tagihan?.total ?? '-'} tagihan` },
              { label: 'Tagihan Lunas',             value: `${data?.tagihan?.lunas ?? '-'} tagihan`, color: 'text-accent-mint' },
              { label: 'Tagihan Belum Bayar',       value: `${data?.tagihan?.belum ?? '-'} tagihan`, color: 'text-accent-pink' },
              { label: 'Pendapatan Tagihan',        value: data ? fmt(pendapatanTagihan) : '-', color: 'text-accent-blue' },
              { label: 'Pemasukan Lainnya',         value: data ? fmt(pendapatanLain) : '-', color: 'text-accent-purple' },
              { label: 'Total Pemasukan',           value: data ? fmt(totalPemasukan) : '-', color: 'text-accent-mint' },
              { label: 'Pelanggan Aktif',           value: `${data?.pelanggan?.aktif ?? '-'} pelanggan` },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-purple-50 last:border-0">
                <span className="text-muted text-sm">{row.label}</span>
                <span className={`font-bold text-dark ${row.color || ''}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">Distribusi Paket</h3>
          <div className="space-y-3">
            {data?.distribusiPaket?.map((p, i) => {
              const total = data.distribusiPaket.reduce((s, x) => s + Number(x.jumlah), 0) || 1
              const pct   = Math.round((Number(p.jumlah) / total) * 100)
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">{p.nama_paket}</span>
                    <span className="font-semibold">{pct}% ({p.jumlah} user)</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill bg-gradient-to-r ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-5 md:col-span-2">
          <h3 className="font-bold text-dark mb-4">Trend Pendapatan Tagihan 6 Bulan</h3>
          {data?.pendapatan6?.length > 0
            ? <div className="flex items-end gap-3 h-40">
                {data.pendapatan6.map((b, i, arr) => {
                  const max  = Math.max(...arr.map(x => Number(x.total)))
                  const pct  = max > 0 ? (Number(b.total) / max) * 100 : 0
                  const last = i === arr.length - 1
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative group">
                      <div className="absolute -top-8 bg-dark text-white text-xs px-2 py-1 rounded-lg font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{fmt(b.total)}</div>
                      <div className="w-full rounded-t-xl transition-all duration-700"
                        style={{ height: `${Math.max(pct, 4)}%`, background: last ? 'linear-gradient(180deg,#9B6FD4,#4BA3E3)' : 'linear-gradient(180deg,#E8D5FF,#C8E6FF)' }} />
                      <span className={`text-xs ${last ? 'text-dark font-bold' : 'text-muted'}`}>{b.bulan}</span>
                    </div>
                  )
                })}
              </div>
            : <div className="h-40 flex items-center justify-center text-muted text-sm">Belum ada data pembayaran</div>
          }
        </div>
      </div>
    </div>
  )
}
