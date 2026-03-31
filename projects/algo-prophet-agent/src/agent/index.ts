import express from 'express'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.AGENT_PORT ?? 3001

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', agent: 'AlgoProphet Trader (Prophet)', version: '0.1.0' })
})

// Chat endpoint — will be wired to Vibekit agent in Phase 4
app.post('/chat', async (req, res) => {
  const { message } = req.body
  console.log('[Prophet] Received:', message)
  // TODO Phase 4: pipe through Vibekit traderAgent
  res.json({ reply: `[Stub] Prophet received: "${message}" — integration coming in Phase 4.` })
})

app.listen(PORT, () => {
  console.log(`🤖 AlgoProphet Agent "Prophet" running on http://localhost:${PORT}`)
})
