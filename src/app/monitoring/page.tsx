'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Shell from '@/components/Shell'
import {
  RefreshCw, Radio, Wifi, WifiOff, AlertTriangle,
  Signal, Thermometer, Zap, Activity
} from 'lucide-react'

// ─── Ambang batas redaman (ONT RxPower) ──────────────────────────────────────
// Nilai khas untuk GPON/EPON: OLT transmit -3 s/d +2 dBm, ONT receive -8 s/d -27 dBm
const RX_GOOD    = -20   // ≥ -20 dBm  → Bagus
const RX_WARN    = -25   // ≥ -25 dBm  → Lemah
                         // < -25 dBm  → Buruk

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toNum(val: any): number | null {
  if (val === undefined || val === null || val === '' || val === 'N/A') return null
  const n = parseFloat(String(val))
  return isNaN(n) ? null : n
}

function fmtDbm(val: number | null): string {
  if (val === null) return '—'
  return `${val.toFixed(2)} dBm`
}

function fmtFixed(val: number | null, dec = 2, unit = ''): string {
  if (val === null) return '—'
  return `${val.toFixed(dec)}${unit ? ' ' + unit : ''}`
}

type SignalLevel = 'good' | 'warn' | 'bad' | 'na'

function rxLevel(rx: number | null): SignalLevel {
  if (rx === null) return 'na'
  if (rx >= RX_GOOD) return 'good'
  if (rx >= RX_WARN) return 'warn'
  return 'bad'
}

const LEVEL_STYLE: Record<SignalLevel, { bar: string; badge: string; label: string }> = {
  good: { bar: '#22c55e', badge: 'bg-green-100 text-green-700',  label: 'Bagus' },
  warn: { bar: '#f59e0b', badge: 'bg-yellow-100 text-yellow-700', label: 'Lemah' },
  bad:  { bar: '#ef4444', badge: 'bg-red-100 text-red-600',       label: 'Buruk' },
  na:   { bar: '#d1d5db', badge: 'bg-gray-100 text-gray-400',     label: 'N/A'   },
}

// Signal bar — skala -10 dBm (max) s/d -40 dBm (min)
function SignalBar({ rx }: { rx: number | null }) {
  const level = rxLevel(rx)
  const style = LEVEL_STYLE[level]

  if (rx === null) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2.5 bg-gray-100 rounded-full" />
        <span className="text-xs text-gray-400 font-mono">N/A</span>
      </div>
    )
  }

  const pct = Math.min(100, Math.max(0, ((rx + 40) / 30) * 100))
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: style.bar }}
        />
      </div>
      <span className="text-xs font-mono font-bold" style={{ color: style.bar }}>
        {rx.toFixed(2)} dBm
      </span>
    </div>
  )
}

// ─── Komponen halaman ─────────────────────────────────────────────────────────
export default function MonitoringPage() {
  const [data,      setData]      = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // Filter & search
  const [search,      setSearch]      = useState('')
  const [filterLevel, setFilterLevel] = useState<'all' | SignalLevel>('all')
  const [filterPon,   setFilterPon]   = useState('all')   // PON port filter

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r    = await fetch('/api/olt/optical-list')
      const json = await r.json()
      if (!r.ok) throw new Error(json.error || 'Gagal mengambil data OLT')
      setData(json.data ?? [])
      setLastFetch(new Date())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Daftar PON port unik dari data
  const ponPorts = useMemo(
    () => Array.from(new Set(data.map((o: any) => o.PonId).filter(Boolean))).sort() as string[],
    [data]
  )

  // Hitung summary per level
  const summary = useMemo(() => {
    const s = { good: 0, warn: 0, bad: 0, na: 0 }
    data.forEach(o => s[rxLevel(toNum(o.RxPower))]++)
    return s
  }, [data])

  // Data setelah filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter(o => {
      const matchSearch = !q ||
        (o.OnuDesc  ?? '').toLowerCase().includes(q) ||
        (o.OnuName  ?? '').toLowerCase().includes(q) ||
        (o.PonSn    ?? '').toLowerCase().includes(q) ||
        String(o.OnuId ?? '').includes(q)

      const matchPon   = filterPon   === 'all' || o.PonId === filterPon
      const matchLevel = filterLevel === 'all' || rxLevel(toNum(o.RxPower)) === filterLevel

      return matchSearch && matchPon && matchLevel
    })
  }, [data, search, filterPon, filterLevel])

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Shell>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Radio size={22} className="text-accent-purple" />
            Monitoring Redaman ONT
          </h1>
          <p className="text-muted text-sm mt-1">
            Data optik real-time dari OLT C-Data
            {lastFetch && (
              <span className="ml-2 text-xs opacity-70">
                · diperbarui {lastFetch.toLocaleTimeString('id-ID')}
              </span>
            )}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-primary w-fit">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-600 text-sm">Gagal terhubung ke OLT</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
            <p className="text-xs text-muted mt-1">
              Pastikan Host, Port, Username & Password OLT sudah benar di menu Pengaturan.
            </p>
          </div>
        </div>
      )}

      {/* ── Summary cards — klik untuk filter ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Total */}
        <button
          onClick={() => setFilterLevel('all')}
          className={`rounded-2xl p-4 text-center border transition-all
            bg-pastel-lavender border-purple-100
            ${filterLevel === 'all' ? 'ring-2 ring-accent-purple shadow-sm' : 'hover:shadow-sm'}`}
        >
          <div className="text-2xl font-bold text-accent-purple">{data.length}</div>
          <div className="text-xs text-muted mt-1">Total ONT</div>
        </button>

        {/* Bagus */}
        <button
          onClick={() => setFilterLevel(filterLevel === 'good' ? 'all' : 'good')}
          className={`rounded-2xl p-4 text-center border transition-all
            bg-green-50 border-green-100
            ${filterLevel === 'good' ? 'ring-2 ring-green-400 shadow-sm' : 'hover:shadow-sm'}`}
        >
          <div className="text-2xl font-bold text-green-600">{summary.good}</div>
          <div className="text-xs text-muted mt-1 flex items-center justify-center gap-1">
            <Wifi size={11} className="text-green-500" /> Bagus ≥ {RX_GOOD} dBm
          </div>
        </button>

        {/* Lemah */}
        <button
          onClick={() => setFilterLevel(filterLevel === 'warn' ? 'all' : 'warn')}
          className={`rounded-2xl p-4 text-center border transition-all
            bg-yellow-50 border-yellow-100
            ${filterLevel === 'warn' ? 'ring-2 ring-yellow-400 shadow-sm' : 'hover:shadow-sm'}`}
        >
          <div className="text-2xl font-bold text-yellow-600">{summary.warn}</div>
          <div className="text-xs text-muted mt-1 flex items-center justify-center gap-1">
            <Signal size={11} className="text-yellow-500" /> Lemah {RX_WARN}–{RX_GOOD} dBm
          </div>
        </button>

        {/* Buruk + N/A */}
        <button
          onClick={() => setFilterLevel(filterLevel === 'bad' ? 'all' : 'bad')}
          className={`rounded-2xl p-4 text-center border transition-all
            bg-red-50 border-red-100
            ${filterLevel === 'bad' ? 'ring-2 ring-red-400 shadow-sm' : 'hover:shadow-sm'}`}
        >
          <div className="text-2xl font-bold text-red-500">{summary.bad + summary.na}</div>
          <div className="text-xs text-muted mt-1 flex items-center justify-center gap-1">
            <WifiOff size={11} className="text-red-400" /> Buruk / N/A
          </div>
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="card p-3 mb-4 flex flex-wrap gap-3">
        <input
          className="input-field flex-1 min-w-48"
          placeholder="Cari nama, SN, ONT ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {ponPorts.length > 1 && (
          <select
            className="input-field w-auto"
            value={filterPon}
            onChange={e => setFilterPon(e.target.value)}
          >
            <option value="all">Semua PON Port</option>
            {ponPorts.map(p => (
              <option key={p} value={p}>PON {p}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Tabel ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pastel-lavender text-xs">
                <th className="th whitespace-nowrap">PON / ID</th>
                <th className="th">Deskripsi</th>
                <th className="th whitespace-nowrap">Serial Number</th>
                <th className="th whitespace-nowrap">
                  RX Power
                  <span className="block font-normal text-muted">(ONT terima)</span>
                </th>
                <th className="th whitespace-nowrap">
                  OLT RX
                  <span className="block font-normal text-muted">(OLT terima)</span>
                </th>
                <th className="th whitespace-nowrap">
                  TX Power
                  <span className="block font-normal text-muted">(ONT kirim)</span>
                </th>
                <th className="th whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Thermometer size={12} /> Suhu
                  </div>
                </th>
                <th className="th whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Zap size={12} /> Tegangan
                  </div>
                </th>
                <th className="th whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Activity size={12} /> Bias
                  </div>
                </th>
                <th className="th whitespace-nowrap">Jarak (m)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-t border-purple-50">
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="td">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="td text-center py-14 text-muted">
                    {error
                      ? 'Tidak ada data — periksa koneksi OLT'
                      : 'Tidak ada ONT yang cocok dengan filter'}
                  </td>
                </tr>
              ) : (
                filtered.map((ont, idx) => {
                  const rx       = toNum(ont.RxPower)
                  const oltRx    = toNum(ont.OltRxPower)
                  const tx       = toNum(ont.TxPower)
                  const temp     = toNum(ont.Temperature)
                  const volt     = toNum(ont.Voltage)
                  const bias     = toNum(ont.BiasCurrent)
                  const range    = toNum(ont.Range)
                  const level    = rxLevel(rx)
                  const style    = LEVEL_STYLE[level]

                  return (
                    <tr
                      key={`${ont.PonId}-${ont.OnuId}-${idx}`}
                      className="border-t border-purple-50 hover:bg-pastel-lavender/30 transition-colors"
                    >
                      {/* PON / ID */}
                      <td className="td">
                        <div className="font-mono text-xs font-semibold text-accent-purple">
                          {ont.PonId ?? '—'}
                        </div>
                        <div className="text-xs text-muted">ID: {ont.OnuId ?? '—'}</div>
                      </td>

                      {/* Deskripsi */}
                      <td className="td">
                        <div className="font-semibold text-dark">
                          {ont.OnuDesc || ont.OnuName || '—'}
                        </div>
                        {ont.OnuDesc && ont.OnuName && (
                          <div className="text-xs text-muted truncate max-w-[160px]">{ont.OnuName}</div>
                        )}
                      </td>

                      {/* Serial Number */}
                      <td className="td font-mono text-xs text-muted whitespace-nowrap">
                        {ont.PonSn ?? '—'}
                      </td>

                      {/* RX Power — kolom utama */}
                      <td className="td">
                        <SignalBar rx={rx} />
                        <span className={`mt-1 inline-block text-xs font-semibold px-1.5 py-0.5 rounded-md ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>

                      {/* OLT RX Power */}
                      <td className="td whitespace-nowrap">
                        {oltRx !== null ? (
                          <span className={`text-xs font-mono font-semibold ${
                            oltRx >= -25 ? 'text-green-600' :
                            oltRx >= -30 ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            {fmtDbm(oltRx)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>

                      {/* TX Power */}
                      <td className="td whitespace-nowrap">
                        <span className="text-xs font-mono text-muted">{fmtDbm(tx)}</span>
                      </td>

                      {/* Suhu */}
                      <td className="td whitespace-nowrap">
                        {temp !== null ? (
                          <span className={`text-xs font-semibold ${
                            temp > 70 ? 'text-red-500' :
                            temp > 55 ? 'text-yellow-600' : 'text-muted'
                          }`}>
                            {fmtFixed(temp, 1, '°C')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>

                      {/* Tegangan */}
                      <td className="td whitespace-nowrap">
                        {volt !== null ? (
                          <span className={`text-xs font-semibold ${
                            volt < 3.0 || volt > 3.6 ? 'text-red-500' :
                            volt < 3.1 || volt > 3.5 ? 'text-yellow-600' : 'text-muted'
                          }`}>
                            {fmtFixed(volt, 2, 'V')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>

                      {/* Bias Current */}
                      <td className="td whitespace-nowrap">
                        <span className="text-xs font-mono text-muted">
                          {bias !== null ? fmtFixed(bias, 2, 'mA') : '—'}
                        </span>
                      </td>

                      {/* Jarak */}
                      <td className="td whitespace-nowrap">
                        <span className="text-xs text-muted">
                          {range !== null ? `${range} m` : '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tabel */}
        {!loading && data.length > 0 && (
          <div className="px-4 py-2.5 border-t border-purple-50 flex items-center justify-between text-xs text-muted">
            <span>
              Menampilkan <strong className="text-dark">{filtered.length}</strong> dari{' '}
              <strong className="text-dark">{data.length}</strong> ONT
            </span>
            {(filterLevel !== 'all' || filterPon !== 'all' || search) && (
              <button
                onClick={() => { setFilterLevel('all'); setFilterPon('all'); setSearch('') }}
                className="text-accent-purple hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Legenda ── */}
      <div className="card p-4 mt-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Keterangan Ambang Batas Redaman (ONT RxPower)
        </p>
        <div className="flex flex-wrap gap-5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0" />
            <span className="font-semibold text-dark">Bagus</span>
            <span className="text-muted">≥ {RX_GOOD} dBm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
            <span className="font-semibold text-dark">Lemah</span>
            <span className="text-muted">{RX_WARN} s/d {RX_GOOD} dBm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
            <span className="font-semibold text-dark">Buruk</span>
            <span className="text-muted">&lt; {RX_WARN} dBm</span>
          </div>
          <div className="text-muted border-l border-gray-100 pl-5">
            <span className="font-semibold text-dark">OLT RX</span> — daya yang diterima OLT dari ONT.{' '}
            <span className="font-semibold text-dark">TX</span> — daya yang dipancarkan ONT.{' '}
            <span className="font-semibold text-dark">Bias</span> — arus laser dioda ONT.
          </div>
        </div>
      </div>
    </Shell>
  )
}
