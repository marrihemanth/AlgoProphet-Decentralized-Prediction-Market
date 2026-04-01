import algosdk from 'algosdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup file paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const gitignorePath = path.resolve(__dirname, '../.gitignore');

async function main() {
    console.log('Generating new Algorand Account for Aegis Agent...');

    // 1. Generate new account
    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
    const address = account.addr;

    console.log('\n--- AGENT IDENTITY ---');
    console.log(`Public Address : ${address}`);
    console.log(`Mnemonic       : ${mnemonic}`);
    console.log('----------------------\n');

    // 2. Save securely to .env
    const envContent = `AGENT_MNEMONIC="${mnemonic}"\nAGENT_ADDRESS="${address}"\n`;
    
    // Check if .env exists, if so append, else create
    if (fs.existsSync(envPath)) {
        fs.appendFileSync(envPath, `\n${envContent}`);
        console.log('Appended credentials to existing .env file.');
    } else {
        fs.writeFileSync(envPath, envContent);
        console.log('Created new .env file securely backing up agent credentials.');
    }

    // 3. Ensure .env is in .gitignore locally for the agent folder
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes('.env')) {
            fs.appendFileSync(gitignorePath, '\n.env\n');
        }
    } else {
        fs.writeFileSync(gitignorePath, '.env\n');
    }

    console.log('Agent init script completed successfully.');
    console.log(`To fund this agent for Localnet testing, run the following:`);
    console.log(`algokit localnet fund --account ${address} --amount 100`);
}

main().catch(console.error);
