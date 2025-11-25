# Quick Start Guide - XION NFT Scripts

## Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Wallet
```bash
npm run create-wallet
```
**Output:** You'll receive a 24-word mnemonic phrase. Save it securely!

### Step 3: Configure Environment
```bash
cp .env.example .env
nano .env  # or use your preferred editor
```
Add your mnemonic:
```
MNEMONIC="your twenty four word mnemonic phrase here"
```

### Step 4: Fund Your Wallet
1. Join Discord: https://discord.gg/burnt
2. Get @Builder role
3. Use command: `/faucet your-xion-address`

### Step 5: Deploy NFT Contract
```bash
npm run deploy-contract
```
**Output:** You'll receive a contract address. Add it to `.env`:
```
CONTRACT_ADDRESS=xion1abc...xyz
```

### Step 6: Mint Your First NFT
```bash
# Mint with on-chain metadata (default)
npm run mint-token

# Or mint with off-chain metadata (IPFS)
METADATA_STORAGE=offchain TOKEN_URI=ipfs://QmYourHash npm run mint-token
```

**Note:** This project uses CW721-metadata-onchain (Code ID: 525) which supports storing full metadata on-chain or using IPFS for off-chain storage.

### Step 7: Verify Ownership
```bash
npm run verify-ownership 1
```

## Common Commands Cheat Sheet

```bash
# Wallet Operations
npm run create-wallet                           # Create new wallet

# Contract Operations
npm run deploy-contract                         # Deploy NFT contract

# NFT Operations
npm run mint-token                              # Mint NFT (uses .env)
npm run mint-token 1 xion1... ipfs://...       # Mint with args
npm run transfer-nft 1 xion1...                # Transfer NFT
npm run verify-ownership 1                      # Check owner

# Token Operations
npm run transfer-gas xion1... 1.5              # Send 1.5 XION

# Gas & Fees
npm run check-gas mint                          # Check mint gas
npm run check-gas transfer-nft                  # Check transfer gas
npm run check-gas send-tokens                   # Check send gas

# Monitoring
npm run monitor-tx <hash>                       # Check transaction
npm run monitor-tx <hash> --wait                # Wait for tx

# Signing
npm run sign-message "Hello XION"               # Sign message
npm run sign-tx send-tokens                     # Sign tx offline
```

## Environment Variables Quick Reference

**Required:**
- `MNEMONIC` - Your 24-word phrase
- `CONTRACT_ADDRESS` - Your NFT contract (after deployment)

**Optional:**
- `TOKEN_ID` - Token ID for operations (default: "1")
- `RECIPIENT` - Recipient address for transfers
- `AMOUNT` - Amount in XION for transfers
- `TOKEN_URI` - IPFS or HTTP URI for NFT metadata

## Troubleshooting

**Problem:** "MNEMONIC not found"
**Solution:** Add `MNEMONIC="..."` to `.env` file

**Problem:** "Insufficient balance"
**Solution:** Get testnet tokens from Discord faucet

**Problem:** "CONTRACT_ADDRESS not set"
**Solution:** Run `deploy-contract` first, then add address to `.env`

**Problem:** "Transaction not found"
**Solution:** Wait a few seconds or use `--wait` flag

## Full Documentation

See [README.md](README.md) for complete documentation of all scripts and features.

## Useful Links

- **XION Testnet Explorer:** https://www.mintscan.io/xion-testnet
- **XION Documentation:** https://docs.burnt.com
- **Discord (for faucet):** https://discord.gg/burnt
- **CosmJS Docs:** https://cosmos.github.io/cosmjs/

---

**Ready to build on XION!**
