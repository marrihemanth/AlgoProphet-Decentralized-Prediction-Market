'use client'

import { useEffect, useRef, useState } from 'react'
import algosdk from 'algosdk'

interface LogEntry {
  id: number
  time: string
  message: string
  level?: 'info' | 'warn' | 'signal'
}

const INITIAL_LOGS: LogEntry[] = [
  { id: 1, time: '14:02:41', message: 'Analyzing ECB statement...', level: 'info' },
  { id: 2, time: '14:02:43', message: 'Volatility threshold: [LOW]', level: 'signal' },
  { id: 3, time: '14:02:51', message: 'Scanning orderbook depth...', level: 'info' },
  { id: 4, time: '14:03:01', message: 'Signal confidence: 87.3%', level: 'signal' },
  { id: 5, time: '14:03:08', message: 'Algo TVL trend: [BULLISH]', level: 'signal' },
  { id: 6, time: '14:03:15', message: 'Cross-ref sentiment feeds...', level: 'info' },
]

const LIVE_MESSAGES = [
  'Calibrating position size...',
  'Orderbook imbalance detected: YES +12%',
  'Fetching on-chain volume...',
  'Model inference: 91ms latency',
  'Rebalancing portfolio weights...',
  'Price discovery phase: active',
  'Correlation sweep: 3 assets',
  'Opportunity window: 2.4min',
  'Risk score: [ACCEPTABLE]',
  'Slippage estimate: 0.08 ALGO',
]

function formatTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

export default function AgentLog() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [nextId, setNextId] = useState(INITIAL_LOGS.length + 1)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 1. Ambient Logs (Simulated "thinking")
  useEffect(() => {
    const ambientInterval = setInterval(() => {
      const msg = LIVE_MESSAGES[Math.floor(Math.random() * LIVE_MESSAGES.length)]
      const level = (msg.includes('[') ? 'signal' : 'info') as 'signal' | 'info'
      setLogs(prev => {
        const updated = [...prev, { id: nextId, time: formatTime(), message: msg, level }]
        return updated.slice(-24)
      })
      setNextId(n => n + 1)
    }, 2800)
    return () => clearInterval(ambientInterval)
  }, [nextId])

  // 2. Real-time algosdk Watcher
  useEffect(() => {
    let lastRound = BigInt(0);
    const indexerClient = new algosdk.Indexer('', 'http://127.0.0.1', 8980);
    const AGENT_ADDRESS = '4R3AYVXLDCRQXHN4SRMPB5DL3CGI2LT2DWQXQ3FGRAKKXAQWOUTLXPB72Q';

    const watcherInterval = setInterval(async () => {
      try {
        const response = await indexerClient.lookupAccountTransactions(AGENT_ADDRESS).limit(1).do();
        if (response.transactions && response.transactions.length > 0) {
          const tx = response.transactions[0];
          const round = tx.confirmedRound || BigInt(0);

          // If this is the first poll, just sync to the latest round
          if (lastRound === BigInt(0)) {
            lastRound = round;
            return;
          }

          if (round > lastRound) {
            lastRound = round;
            
            // Dispatch event to page.tsx for global cyan glow
            window.dispatchEvent(new CustomEvent('aegis-trade', { detail: tx }));

            // Determine action (Mock decoding since it's an ApplicationCall)
            // If it's an application call, we assume it's BUY_YES/NO based on fee or some logic.
            // For now, we just log "EXECUTED STRATEGY -> BUY_YES (10 ALGO)"
            const isAppCall = tx.txType === 'appl';
            if (isAppCall) {
              setLogs(prev => {
                const id = prev.length ? prev[prev.length - 1].id + 1 : 1;
                return [...prev, {
                  id,
                  time: formatTime(),
                  message: '[AEGIS]: EXECUTED STRATEGY -> BUY_YES (10 ALGO)',
                  level: 'signal'
                }].slice(-24);
              });
              setNextId(n => n + 1);
            }
          }
        }
      } catch (error) {
        // Silently ignore connection errors to avoid spamming the console
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(watcherInterval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const levelColor = (level?: string) => {
    if (level === 'signal') return 'text-[#00E5FF]'
    if (level === 'warn') return 'text-[#FF006E]'
    return 'text-[#888888]'
  }

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 pr-1">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 text-[10px] leading-5 animate-[slideUp_0.2s_ease-out]">
          <span className="text-[#444444] shrink-0">{log.time}</span>
          <span className="text-[#555555] shrink-0">›</span>
          <span className={levelColor(log.level)}>{log.message}</span>
        </div>
      ))}
      {/* Blinking cursor */}
      <div className="flex gap-2 text-[10px] leading-5">
        <span className="text-[#444444]" suppressHydrationWarning>{formatTime()}</span>
        <span className="text-[#555555]">›</span>
        <span className="text-[#00E5FF] animate-[blink_1s_step-end_infinite]">█</span>
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
