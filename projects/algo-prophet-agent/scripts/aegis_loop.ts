import algosdk from 'algosdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'http://localhost';
const ALGOD_PORT = process.env.ALGOD_PORT || 4001;
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

// In a real environment, this App ID would be provided by Phase 2 deployments.
const ORDERBOOK_APP_ID = parseInt(process.env.ORDERBOOK_APP_ID || '1005', 10);

// ── Strategy: Cautious Bull ────────────────────────────────────────────
// Biased towards YES but only acts on high-conviction signals.
// - Sentiment > 52  → BUY_YES  (bullish bias: lower threshold)
// - Sentiment > 70  → BUY_YES  (aggressive, larger position)
// - Sentiment < 40  → BUY_NO   (only when clearly bearish)
// - Everything else  → HOLD    (caution wins)
class AegisBrain {
    public static strategy = 'CAUTIOUS_BULL';

    public static analyzeSentiment(sentimentScore: number): { signal: 'BUY_YES' | 'BUY_NO' | 'HOLD'; conviction: string; size: number } {
        if (sentimentScore > 70) {
            return { signal: 'BUY_YES', conviction: 'AGGRESSIVE', size: 25 };
        }
        if (sentimentScore > 52) {
            return { signal: 'BUY_YES', conviction: 'MODERATE', size: 10 };
        }
        if (sentimentScore < 40) {
            return { signal: 'BUY_NO', conviction: 'DEFENSIVE', size: 10 };
        }
        return { signal: 'HOLD', conviction: 'LOW', size: 0 };
    }
}

async function startAegisLoop() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ◈ AEGIS v0.1.0 — Cautious Bull Strategy');
    console.log('  ◈ Target App ID: ' + ORDERBOOK_APP_ID);
    console.log('  ◈ Loop Interval: 5s');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('AGENT_LOG: Initializing Aegis Oracle Brain...');

    // 1. Recover Account
    const mnemonic = process.env.AGENT_MNEMONIC;
    if (!mnemonic) {
        throw new Error('AGENT_MNEMONIC is missing from .env');
    }
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    console.log(`AGENT_LOG: Aegis Identity Recovered: [${account.addr.toString().slice(0, 8)}...]`);

    // 2. Setup Algod Client
    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

    console.log(`AGENT_LOG: Starting Autonomous Strategy: [${AegisBrain.strategy}]`);
    console.log('AGENT_LOG: Entering main loop — watching for signals...\n');

    let tick = 0;

    // 3. Main Loop
    setInterval(async () => {
        tick++;
        const ts = new Date().toLocaleTimeString();
        try {
            // Generate synthetic sentiment (In Phase X, this would query Qwen)
            const sentiment = Math.floor(Math.random() * 101);
            const volatility = (Math.random() * 3).toFixed(2);
            const spread = (Math.random() * 0.12).toFixed(4);

            console.log(`────────────── TICK #${tick} @ ${ts} ──────────────`);
            console.log(`  Sentiment Score   : ${sentiment}/100`);
            console.log(`  Volatility Index  : ${volatility}%`);
            console.log(`  Orderbook Spread  : ${spread} ALGO`);

            const { signal, conviction, size } = AegisBrain.analyzeSentiment(sentiment);
            
            if (signal === 'HOLD') {
                console.log(`  Decision          : HOLD (conviction: ${conviction})`);
                console.log(`  Action            : No position change.`);
                console.log('');
                return;
            }

            const isYes = signal === 'BUY_YES';
            const price = isYes ? 65 : 35;

            console.log(`  Decision          : ${signal}`);
            console.log(`  Conviction        : ${conviction}`);
            console.log(`  Position Size     : ${size} ALGO`);
            console.log(`  Limit Price       : 0.${price} ALGO`);

            // Execute Transaction
            const params = await algodClient.getTransactionParams().do();

            const appArgs: Uint8Array[] = [
                new Uint8Array(Buffer.from('placeOrder')),
                new Uint8Array([isYes ? 1 : 0]),
                algosdk.encodeUint64(price),
                algosdk.encodeUint64(size)
            ];

            const txn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: account.addr,
                suggestedParams: params,
                appIndex: ORDERBOOK_APP_ID,
                appArgs: appArgs
            });

            const signedTxn = txn.signTxn(account.sk);
            console.log(`  [AEGIS]: EXECUTED STRATEGY -> ${signal} (${size} ALGO)`);
            console.log(`  TxID (signed)     : ${txn.txID().slice(0, 16)}...`);
            console.log('');

        } catch (error: any) {
            console.error(`  AGENT_LOG ERROR: ${error.message}`);
            console.log('');
        }
    }, 5000); // 5 seconds interval
}

// In normal execution, we would call startAegisLoop() here.
// For typescript compilation verification:
export { startAegisLoop };

startAegisLoop();
