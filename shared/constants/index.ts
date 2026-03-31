/**
 * AlgoProphet — Shared Constants
 * Populated with App IDs after deploy, per network.
 */

export const NETWORKS = {
  localnet: {
    algodToken: 'a'.repeat(64),
    algodServer: 'http://localhost',
    algodPort: 4001,
    indexerServer: 'http://localhost',
    indexerPort: 8980,
  },
  testnet: {
    algodToken: '',
    algodServer: 'https://testnet-api.algonode.cloud',
    algodPort: 443,
    indexerServer: 'https://testnet-idx.algonode.cloud',
    indexerPort: 443,
  },
} as const

/**
 * App IDs — fill in after running deploy-localnet.ts / deploy-testnet.ts
 */
export const APP_IDS = {
  localnet: {
    ORDERBOOK: 0,
    MARKET_FACTORY: 0,
    ESCROW: 0,
  },
  testnet: {
    ORDERBOOK: 0,
    MARKET_FACTORY: 0,
    ESCROW: 0,
  },
}
