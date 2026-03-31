/**
 * AlgoProphet — Shared TypeScript Types
 * Used across algo-prophet-logic, algo-prophet-frontend, algo-prophet-agent
 */

export type NetworkType = 'localnet' | 'testnet' | 'mainnet'

export type MarketStatus = 'OPEN' | 'TRADING' | 'CLOSED' | 'RESOLVED'

export type OutcomeType = 'UNRESOLVED' | 'YES' | 'NO' | 'VOID'

export interface Market {
  appId: number
  question: string
  resolutionTimestamp: number
  status: MarketStatus
  outcome: OutcomeType
  yesAsaId: number
  noAsaId: number
  yesPrice: number   // 0.00 – 1.00 (implied probability)
  noPrice: number
  volume: number     // Total ALGO traded
  createdAt: number
}

export interface Order {
  orderId: string
  marketAppId: number
  side: 'BUY' | 'SELL'
  outcome: 'YES' | 'NO'
  price: number        // 0.00 – 1.00
  quantity: number     // Number of shares
  filledQuantity: number
  status: 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED'
  placedAt: number
  walletAddress: string
}

export interface Position {
  marketAppId: number
  outcome: 'YES' | 'NO'
  quantity: number
  avgEntryPrice: number
  currentPrice: number
  pnl: number
}

export interface AgentMessage {
  role: 'user' | 'agent'
  content: string
  timestamp: number
  tradeAction?: {
    type: 'BUY' | 'SELL'
    outcome: 'YES' | 'NO'
    quantity: number
    price: number
    txId?: string
  }
}
