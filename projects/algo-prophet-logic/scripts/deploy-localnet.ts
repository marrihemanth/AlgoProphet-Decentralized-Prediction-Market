import algosdk from 'algosdk'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.localnet' })

const algodToken = process.env.ALGOD_TOKEN ?? 'a'.repeat(64)
const algodServer = process.env.ALGOD_SERVER ?? 'http://localhost'
const algodPort = Number(process.env.ALGOD_PORT ?? 4001)

async function main() {
  const client = new algosdk.Algodv2(algodToken, algodServer, algodPort)
  const status = await client.status().do()
  console.log('✅ Connected to Localnet | Last round:', status['last-round'])

  // TODO Phase 2: compile + deploy Orderbook, Market, Escrow contracts
  // and print their App IDs to paste into shared/constants/index.ts
  console.log('📋 Deployment stubs ready — implement in Phase 2.')
}

main().catch(console.error)
