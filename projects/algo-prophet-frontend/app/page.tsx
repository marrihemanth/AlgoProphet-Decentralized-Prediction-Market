'use client'

import { useEffect, useRef, useState } from 'react'
import AgentLog from '@/components/feed/AgentLog'

// ── Types ──────────────────────────────────────────────────────────────────
interface PricePoint { t: number; v: number }

const MARKETS = [
  { id: 'sports', label: 'Sports', active: false },
  { id: 'economics', label: 'Economics', active: false },
  { id: 'crypto', label: 'Crypto', active: true },
]

const PORTFOLIO = [
  { market: 'Algorand TVL',  side: 'YES', pnl: '+12.4%', pos: true },
  { market: 'BTC > 100k',   side: 'NO',  pnl: '-3.1%',  pos: false },
  { market: 'ECB Rate Cut',  side: 'YES', pnl: '+8.7%',  pos: true },
  { market: 'ETH Merge Vol', side: 'NO',  pnl: '+5.2%',  pos: true },
]

// Generate 24h synthetic price path
function generatePricePath(points = 96): PricePoint[] {
  const data: PricePoint[] = []
  let v = 0.52
  for (let i = 0; i < points; i++) {
    v = Math.max(0.05, Math.min(0.95, v + (Math.random() - 0.48) * 0.025))
    data.push({ t: i, v })
  }
  return data
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function PriceChart({ data }: { data: PricePoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const W = 700, H = 80

  if (data.length < 2) return null

  const xs = data.map((_, i) => (i / (data.length - 1)) * W)
  const min = Math.min(...data.map(d => d.v))
  const max = Math.max(...data.map(d => d.v))
  const ys = data.map(d => H - ((d.v - min) / (max - min)) * (H - 8) - 4)

  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const gradientPoly = [
    `0,${H}`,
    ...xs.map((x, i) => `${x},${ys[i]}`),
    `${W},${H}`,
  ].join(' ')

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#FF006E" />
        </linearGradient>
        <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF006E" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon points={gradientPoly} fill="url(#fillGrad)" />
      {/* Price line */}
      <polyline points={polyline} fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
      {/* Current dot */}
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.5" fill="#00E5FF" />
    </svg>
  )
}

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-60" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF88]" />
    </span>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [priceData] = useState<PricePoint[]>(generatePricePath)
  const [probability, setProbability] = useState(64.2)
  const [connected, setConnected] = useState(false)
  const [aegisActive, setAegisActive] = useState(true)
  const [autoTrade, setAutoTrade] = useState(true)
  const [betSide, setBetSide] = useState<'yes' | 'no' | null>(null)
  const [isAgentGlowing, setIsAgentGlowing] = useState(false)

  // Listen for agent moves
  useEffect(() => {
    const handleTrade = () => {
      setIsAgentGlowing(true)
      setTimeout(() => setIsAgentGlowing(false), 1200) // Glow fades after 1.2s
    }
    window.addEventListener('aegis-trade', handleTrade)
    return () => window.removeEventListener('aegis-trade', handleTrade)
  }, [])

  // Slowly drift probability
  useEffect(() => {
    const t = setInterval(() => {
      setProbability(p => {
        const drift = (Math.random() - 0.48) * 0.3
        return Math.max(5, Math.min(95, parseFloat((p + drift).toFixed(1))))
      })
    }, 1500)
    return () => clearInterval(t)
  }, [])

  const yesPrice = (probability / 100).toFixed(2)
  const noPrice = ((100 - probability) / 100).toFixed(2)

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-[#0A0A0A] text-[#EAEAEA] font-mono transition-all duration-700 ${isAgentGlowing ? 'shadow-[inset_0_0_100px_rgba(0,229,255,0.25)] border-[#00E5FF] border' : 'border-[#0A0A0A] border'}`}>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#222222] shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polygon points="10,2 18,7 18,13 10,18 2,13 2,7" stroke="#00E5FF" strokeWidth="1" fill="none" />
            <polygon points="10,5 15,8 15,12 10,15 5,12 5,8" stroke="#00E5FF" strokeWidth="0.5" fill="none" strokeOpacity="0.4" />
            <circle cx="10" cy="10" r="1.5" fill="#00E5FF" />
          </svg>
          <span className="text-xs tracking-[0.3em] uppercase text-[#EAEAEA]">AlgoProphet</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#444444]">MAINNET</span>
          <span className="text-[10px] text-[#00FF88]">● CONNECTED</span>
          <button
            onClick={() => setConnected(c => !c)}
            className={`text-[10px] tracking-widest uppercase px-3 py-1 border transition-all duration-100 ${
              connected
                ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/5'
                : 'border-[#222222] text-[#EAEAEA] hover:border-[#444444]'
            }`}
          >
            {connected ? 'PERA: ADDR...1234' : 'CONNECT PERA WALLET'}
          </button>
        </div>
      </div>

      {/* ── Three Columns ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── COLUMN 1: Intelligence Feed ─────────────────────────────── */}
        <div className="w-[220px] border-r border-[#222222] flex flex-col shrink-0 overflow-hidden">

          {/* Markets */}
          <div className="p-3 border-b border-[#222222]">
            <p className="label-header mb-2">Markets</p>
            {MARKETS.map(m => (
              <div
                key={m.id}
                className={`flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer transition-colors duration-100 ${
                  m.active ? 'bg-[#1A1A1A] text-[#EAEAEA]' : 'text-[#666666] hover:text-[#999999]'
                }`}
              >
                <LiveDot />
                {m.label}
              </div>
            ))}
          </div>

          {/* Agent Feed */}
          <div className="flex flex-col flex-1 p-3 overflow-hidden">
            <p className="label-header mb-2 shrink-0">Agent Feed</p>
            <AgentLog />
          </div>
        </div>

        {/* ── COLUMN 2: Oracle Canvas ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto border-r border-[#222222]">
          <div className="flex flex-col h-full p-6 gap-5">

            {/* Market Question */}
            <div>
              <p className="label-header mb-2">Active Market</p>
              <h1 className="text-xl font-bold leading-tight tracking-tight">
                Will Algorand TVL exceed $1B by Q3 2025?
              </h1>
            </div>

            {/* Probability */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-7xl font-bold leading-none tabular-nums"
                style={{ color: '#00E5FF', textShadow: '0 0 20px rgba(0,229,255,0.3)' }}
              >
                {probability}%
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#666666] uppercase tracking-widest">Current Probability</span>
                <span className="text-[10px] text-[#444444]">Updated 1.5s ago</span>
              </div>
            </div>

            {/* Chart */}
            <div className="border border-[#222222] bg-[#0D0D0D] p-2">
              <div className="flex justify-between text-[10px] text-[#444444] mb-1 px-1">
                <span>24H</span>
                <span>VOL: 12,401 ALGO</span>
              </div>
              <PriceChart data={priceData} />
              <div className="flex justify-between text-[10px] text-[#444444] mt-1 px-1">
                <span className="text-[#00E5FF]">NOW</span>
                <span>24H AGO</span>
              </div>
            </div>

            {/* Price row */}
            <div className="flex items-center border border-[#222222]">
              <div className="flex-1 flex flex-col items-center py-3 border-r border-[#222222]">
                <span className="text-[10px] text-[#666666] uppercase tracking-widest mb-1">Yes</span>
                <span className="text-lg font-bold text-[#00E5FF]">{yesPrice} ALGO</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-3">
                <span className="text-[10px] text-[#666666] uppercase tracking-widest mb-1">No</span>
                <span className="text-lg font-bold text-[#FF006E]">{noPrice} ALGO</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setBetSide('yes')}
                className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-100 ${
                  betSide === 'yes'
                    ? 'bg-[#00E5FF] text-[#0A0A0A]'
                    : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0A0A0A]'
                }`}
                style={betSide === 'yes' ? { boxShadow: '0 0 20px rgba(0,229,255,0.4)' } : {}}
              >
                ▲ PLACE YES BET
              </button>
              <button
                onClick={() => setBetSide('no')}
                className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-100 ${
                  betSide === 'no'
                    ? 'bg-[#FF006E] text-white'
                    : 'bg-[#FF006E]/10 text-[#FF006E] border border-[#FF006E] hover:bg-[#FF006E] hover:text-white'
                }`}
                style={betSide === 'no' ? { boxShadow: '0 0 20px rgba(255,0,110,0.4)' } : {}}
              >
                ▼ PLACE NO BET
              </button>
            </div>

            {/* Bet amount (appears on selection) */}
            {betSide && (
              <div className="border border-[#222222] p-3 bg-[#0D0D0D] flex items-center gap-3">
                <span className="text-[10px] text-[#666666] uppercase tracking-widest shrink-0">Amount</span>
                <input
                  type="number"
                  defaultValue={10}
                  min={1}
                  className="flex-1 bg-transparent text-right text-sm text-[#EAEAEA] outline-none border-b border-[#333333] focus:border-[#00E5FF] pb-0.5 transition-colors duration-100"
                />
                <span className="text-[10px] text-[#666666]">ALGO</span>
                <button
                  onClick={() => setBetSide(null)}
                  className="text-[#666666] hover:text-[#EAEAEA] text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Market stats footer */}
            <div className="mt-auto grid grid-cols-3 gap-px border border-[#222222]">
              {[
                { label: 'Total Volume', value: '48,291 ALGO' },
                { label: 'Liquidity', value: '12,401 ALGO' },
                { label: 'Closes In', value: '14d 6h 22m' },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center py-2 bg-[#0D0D0D]">
                  <span className="text-[10px] text-[#666666] uppercase tracking-widest">{stat.label}</span>
                  <span className="text-xs text-[#EAEAEA] mt-0.5">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Command Center ─────────────────────────────────── */}
        <div className="w-[260px] flex flex-col shrink-0 overflow-y-auto">

          {/* Portfolio */}
          <div className="border-b border-[#222222] p-3">
            <p className="label-header mb-3">Portfolio</p>
            <div className="grid grid-cols-3 text-[9px] text-[#444444] uppercase tracking-wider mb-1 px-1">
              <span>Market</span>
              <span className="text-center">Side</span>
              <span className="text-right">P&L</span>
            </div>
            <div className="border-t border-[#1A1A1A]">
              {PORTFOLIO.map((row, i) => (
                <div key={i} className="grid grid-cols-3 px-1 py-2 text-[10px] hover:bg-[#111111] transition-colors">
                  <span className="text-[#999999] truncate pr-1">{row.market}</span>
                  <span className={`text-center ${row.side === 'YES' ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                    {row.side}
                  </span>
                  <span className={`text-right ${row.pos ? 'text-[#00FF88]' : 'text-[#FF006E]'}`}>
                    {row.pnl}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] pt-2 border-t border-[#1A1A1A] mt-1 px-1">
              <span className="text-[#666666]">Total P&L</span>
              <span className="text-[#00FF88]">+23.2%</span>
            </div>
          </div>

          {/* Agent: Aegis */}
          <div className="p-3 border-b border-[#222222]">
            <p className="label-header mb-3">Agent: Aegis</p>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#666666]">STATUS</span>
                <span className={aegisActive ? 'text-[#00FF88]' : 'text-[#FF006E]'}>
                  ● {aegisActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#666666]">STRATEGY</span>
                <span className="text-[#EAEAEA]">MOMENTUM ARB</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#666666]">WALLET</span>
                <span className="text-[#EAEAEA]">ADDR...1234</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#666666]">CONFIDENCE</span>
                <span className="text-[#00E5FF]">87.3%</span>
              </div>

              {/* Auto-trade toggle */}
              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className="text-[#666666]">AUTO-TRADE</span>
                <button
                  onClick={() => setAutoTrade(a => !a)}
                  className={`relative inline-flex h-4 w-8 items-center transition-colors duration-100 ${
                    autoTrade ? 'bg-[#00E5FF]/20 border border-[#00E5FF]' : 'bg-[#222222] border border-[#333333]'
                  }`}
                >
                  <span
                    className={`inline-block h-2.5 w-2.5 transform transition-transform duration-100 ${
                      autoTrade ? 'translate-x-4 bg-[#00E5FF]' : 'translate-x-1 bg-[#666666]'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Pause button */}
            <button
              onClick={() => setAegisActive(a => !a)}
              className="w-full mt-3 py-2 text-[10px] tracking-widest uppercase border border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E]/10 transition-colors duration-100"
            >
              {aegisActive ? '⏸ PAUSE AEGIS' : '▶ RESUME AEGIS'}
            </button>
          </div>

          {/* System status */}
          <div className="p-3">
            <p className="label-header mb-2">System</p>
            <div className="space-y-1.5">
              {[
                { label: 'Localnet', status: 'ONLINE', ok: true },
                { label: 'Oracle Feed', status: 'STREAMING', ok: true },
                { label: 'Escrow Ctr.', status: 'DEPLOYED', ok: true },
                { label: 'Orderbook', status: 'DEPLOYED', ok: true },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-[10px]">
                  <span className="text-[#666666]">{s.label}</span>
                  <span className={s.ok ? 'text-[#00FF88]' : 'text-[#FF006E]'}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-1 border-t border-[#222222] shrink-0">
        <span className="text-[9px] text-[#333333] uppercase tracking-widest">AlgoProphet v0.1.0-alpha</span>
        <span className="text-[9px] text-[#333333]">Algorand Localnet ● Block 12,441</span>
        <span className="text-[9px] text-[#00FF88]">● All Systems Operational</span>
      </div>
    </div>
  )
}
