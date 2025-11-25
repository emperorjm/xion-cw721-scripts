# XION NFT Scripts

Complete JavaScript toolkit for interacting with XION blockchain NFT smart contracts. Built with CosmJS for the XION testnet.

## Overview

This project provides ready-to-use scripts for:
- Creating wallets (public/private key pairs)
- Deploying CW721 NFT contracts
- Minting NFT tokens
- Transferring NFTs
- Checking gas fees
- Transferring XION tokens
- Verifying token ownership
- Monitoring transactions
- Signing messages
- Signing transactions for later broadcast

## Quick Start

### Prerequisites

- Node.js v18+ installed
- npm or yarn package manager
- Access to XION testnet

### Installation

1. Clone or navigate to this directory:
```bash
cd backend-scripts
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Create a new wallet:
```bash
npm run create-wallet
```

5. Save the mnemonic to your `.env` file:
```bash
echo 'MNEMONIC="your twenty four word mnemonic here"' >> .env
```

6. Get testnet tokens:
   - Join Discord: https://discord.gg/burnt
   - Get @Builder role
   - Use command: `/faucet your-xion-address`

## Scripts Documentation

### 1. Create Wallet

Generate a new XION wallet with a 24-word mnemonic phrase.

```bash
npm run create-wallet
```

**Output:**
- 24-word mnemonic phrase
- XION address (xion1...)
- Public key
- Instructions for funding

**Important:** Save your mnemonic securely and add it to `.env`

---

### 2. Deploy Contract

Instantiate a CW721-metadata-onchain NFT contract using pre-deployed code (Code ID: 525 on testnet). This contract variant supports storing full metadata on-chain.

```bash
npm run deploy-contract
```

**Environment Variables:**
- `MNEMONIC` - Your wallet mnemonic (required)
- `NFT_NAME` - Collection name (optional, default: "My NFT Collection")
- `NFT_SYMBOL` - Collection symbol (optional, default: "MNFT")
- `CONTRACT_LABEL` - Contract label (optional, default: "my-nft-contract")

**Output:**
- Deployed contract address
- Transaction hash
- Explorer link

**Next Step:** Add `CONTRACT_ADDRESS=xion1...` to your `.env` file

---

### 3. Mint Token

Mint a new NFT with metadata. Supports both **on-chain** and **off-chain** (IPFS) metadata storage.

```bash
# Mint with on-chain metadata (default)
METADATA_STORAGE=onchain npm run mint-token

# Mint with off-chain metadata (IPFS)
METADATA_STORAGE=offchain TOKEN_URI=ipfs://QmYourHash npm run mint-token

# Using command line arguments
npm run mint-token <token_id> <owner_address> <token_uri>

# Example with full on-chain metadata
TOKEN_ID=1 \
TOKEN_NAME="Epic Dragon" \
TOKEN_DESCRIPTION="A legendary fire dragon" \
TOKEN_IMAGE="ipfs://QmImageHash" \
TOKEN_ATTRIBUTES='[{"trait_type":"Element","value":"Fire"},{"trait_type":"Power","value":95}]' \
METADATA_STORAGE=onchain \
npm run mint-token
```

**Environment Variables:**
- `CONTRACT_ADDRESS` - NFT contract address (required)
- `TOKEN_ID` - Unique token ID (optional, default: "1")
- `OWNER_ADDRESS` - NFT owner (optional, defaults to minter)
- `METADATA_STORAGE` - "onchain" or "offchain" (optional, default: "onchain")
- `TOKEN_URI` - Metadata URI for off-chain, or reference for on-chain (optional)
- `TOKEN_NAME` - NFT name (optional)
- `TOKEN_DESCRIPTION` - NFT description (optional)
- `TOKEN_IMAGE` - Image URI (optional)
- `TOKEN_ATTRIBUTES` - JSON array of attributes (optional, for on-chain)
- `TOKEN_ANIMATION_URL` - Animation/video URL (optional, for on-chain)
- `TOKEN_EXTERNAL_URL` - External link (optional, for on-chain)
- `TOKEN_BACKGROUND_COLOR` - Background color hex (optional, for on-chain)

**Metadata Storage Modes:**

**On-Chain (METADATA_STORAGE=onchain):**
- All metadata stored directly in the smart contract
- No dependency on external services (IPFS not required)
- Guaranteed permanence and availability
- Higher gas costs for minting
- Best for: Small collections, critical metadata, text-based NFTs

**Off-Chain (METADATA_STORAGE=offchain):**
- Metadata stored on IPFS, contract stores only the reference
- Lower gas costs for minting
- Supports large files (images, videos, etc.)
- Requires IPFS to be accessible
- Best for: Large collections, media-heavy NFTs, standard use case

**Output:**
- Token ID
- Owner address
- Storage mode (on-chain or off-chain)
- Transaction hash
- Explorer link

---

### 4. Transfer NFT

Transfer an NFT to another address.

```bash
# Using environment variables
npm run transfer-nft

# Using command line arguments
npm run transfer-nft <token_id> <recipient_address>

# Example
npm run transfer-nft 1 xion1xyz...
```

**Environment Variables:**
- `CONTRACT_ADDRESS` - NFT contract address (required)
- `TOKEN_ID` - Token ID to transfer (required)
- `RECIPIENT` - Recipient address (required)

**Output:**
- Transfer confirmation
- From/To addresses
- Transaction hash

---

### 5. Check Gas Fee

Estimate gas fees for various transaction types without executing them.

```bash
# Check different transaction types
npm run check-gas mint
npm run check-gas transfer-nft
npm run check-gas send-tokens
npm run check-gas instantiate
```

**Supported Transaction Types:**
- `mint` - Estimate gas for minting an NFT
- `transfer-nft` - Estimate gas for transferring an NFT
- `send-tokens` - Estimate gas for sending XION tokens
- `instantiate` - Estimate gas for deploying a contract

**Environment Variables:**
- `TX_TYPE` - Transaction type (optional)
- `CONTRACT_ADDRESS` - Required for mint/transfer-nft
- `RECIPIENT` - Required for send-tokens
- `AMOUNT` - Required for send-tokens

**Output:**
- Estimated gas units
- Estimated fee in uxion and XION
- Current wallet balance
- Balance after transaction

---

### 6. Transfer Gas (XION Tokens)

Send XION tokens from one wallet to another.

```bash
# Using command line arguments
npm run transfer-gas <recipient_address> <amount_in_xion>

# Example: Send 1.5 XION
npm run transfer-gas xion1xyz... 1.5
```

**Environment Variables:**
- `RECIPIENT` - Recipient address (required)
- `AMOUNT` - Amount in XION (required, not uxion)

**Output:**
- Transfer confirmation
- Amount sent
- Previous and current balance
- Gas fee paid

**Note:** Amount should be in XION (e.g., 1.5), not uxion. The script automatically converts to base units.

---

### 7. Verify Ownership

Query the blockchain to verify who owns a specific NFT.

```bash
# Using command line arguments
npm run verify-ownership <token_id> [expected_owner_address]

# Example
npm run verify-ownership 1
npm run verify-ownership 1 xion1abc...
```

**Environment Variables:**
- `CONTRACT_ADDRESS` - NFT contract address (required)
- `TOKEN_ID` - Token ID to verify (required)
- `EXPECTED_OWNER` - Expected owner address (optional)

**Output:**
- Current owner address
- Approvals (if any)
- NFT metadata (name, description, image, token URI)
- Verification result (if expected owner provided)
- Total NFTs owned by the owner

**No wallet required** - This is a read-only query operation.

---

### 8. Monitor Transaction

Retrieve and display detailed information about a transaction.

```bash
# Using command line arguments
npm run monitor-tx <transaction_hash> [--wait]

# Example
npm run monitor-tx ABC123...
npm run monitor-tx ABC123... --wait
```

**Environment Variables:**
- `TX_HASH` - Transaction hash (required)
- `WAIT` - Wait for indexing (optional, use `--wait` flag)

**Output:**
- Transaction hash and height
- Gas used and wanted
- Transaction status (success/failed)
- Messages and events
- Transaction fee
- Gas efficiency

**Flags:**
- `--wait` - Wait for transaction to be indexed (up to 20 attempts)

**No wallet required** - This is a read-only query operation.

---

### 9. Sign Message

Sign an arbitrary message for authentication or verification purposes.

```bash
# Using command line arguments
npm run sign-message "Your message here"

# Example
npm run sign-message "Hello, XION blockchain!"
```

**Environment Variables:**
- `MESSAGE` - Message to sign (required)

**Output:**
- Original message
- Signer address and public key
- Signature (base64)
- Full signature data (JSON)
- Exportable verification data

**Use Cases:**
- Authentication
- Message verification
- Off-chain signatures
- Proof of ownership

---

### 10. Sign Transaction

Sign a transaction offline and save it for later broadcast.

```bash
# Using command line arguments
npm run sign-tx <transaction_type> [output_file]

# Examples
npm run sign-tx send-tokens
npm run sign-tx mint-nft my-tx.json
npm run sign-tx transfer-nft
```

**Supported Transaction Types:**

**send-tokens:**
- Requires: `RECIPIENT`, `AMOUNT`
- Example: `RECIPIENT=xion1xyz... AMOUNT=1.5 npm run sign-tx send-tokens`

**mint-nft:**
- Requires: `CONTRACT_ADDRESS`, `TOKEN_ID`, `TOKEN_URI`
- Example: `CONTRACT_ADDRESS=xion1... TOKEN_ID=1 npm run sign-tx mint-nft`

**transfer-nft:**
- Requires: `CONTRACT_ADDRESS`, `TOKEN_ID`, `RECIPIENT`
- Example: `CONTRACT_ADDRESS=xion1... TOKEN_ID=1 RECIPIENT=xion1xyz... npm run sign-tx transfer-nft`

**Output:**
- Signed transaction file (JSON)
- Transaction details (fee, gas, sequence)
- Broadcast instructions

**Important Notes:**
- Transaction is signed with current account sequence number
- Must be broadcast in sequence order
- Typically expires after 24 hours
- Store securely - represents a ready-to-execute transaction

**To broadcast later:**
```javascript
const { broadcastSignedTransaction } = require('./scripts/sign-transaction.js');
await broadcastSignedTransaction('signed-tx.json');
```

---

## Preparing IPFS Metadata

For off-chain metadata storage, you need to upload your metadata JSON and assets to IPFS.

### Metadata JSON Format

See `metadata-example.json` for a complete example. The standard format includes:

```json
{
  "name": "Your NFT Name",
  "description": "NFT description",
  "image": "ipfs://QmImageHash/image.png",
  "animation_url": "ipfs://QmVideoHash/animation.mp4",
  "external_url": "https://yourproject.com",
  "background_color": "FFFFFF",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Power",
      "value": 95,
      "max_value": 100
    }
  ]
}
```

### Upload to IPFS

**Option 1: Using Pinata (Recommended)**
1. Create account at https://pinata.cloud
2. Upload your image/video files
3. Get the IPFS CID (Content Identifier)
4. Update metadata JSON with IPFS URIs
5. Upload metadata JSON
6. Use the metadata CID as `TOKEN_URI`

**Option 2: Using NFT.Storage**
1. Create account at https://nft.storage
2. Upload files via web interface or API
3. Get IPFS CIDs for all assets
4. Construct metadata JSON
5. Upload metadata JSON

**Option 3: Using IPFS CLI**
```bash
# Install IPFS
# https://docs.ipfs.io/install/

# Add your files
ipfs add image.png
ipfs add metadata.json

# Use the returned CID
TOKEN_URI=ipfs://QmYourMetadataCID npm run mint-token
```

### Best Practices

- Upload images/videos first, get their CIDs
- Update metadata JSON with correct IPFS URIs
- Upload metadata JSON last
- Pin important files on multiple pinning services
- Use IPFS gateways for viewing: `https://ipfs.io/ipfs/QmHash`

---

## Project Structure

```
backend-scripts/
├── scripts/               # All executable scripts
│   ├── create-wallet.js
│   ├── deploy-contract.js
│   ├── mint-token.js
│   ├── transfer-nft.js
│   ├── check-gas-fee.js
│   ├── transfer-gas.js
│   ├── verify-ownership.js
│   ├── monitor-transaction.js
│   ├── sign-message.js
│   └── sign-transaction.js
├── utils/                 # Utility functions
│   ├── config.js         # Network configuration
│   └── helpers.js        # Shared helper functions
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

---

## Configuration

### Network Configuration

Default: XION Testnet (`xion-testnet-2`)

Configuration file: `utils/config.js`

```javascript
{
  chainId: "xion-testnet-2",
  rpcEndpoint: "https://rpc.xion-testnet-2.burnt.com:443",
  gasPrice: "0.025uxion",
  cw721MetadataOnchainCodeId: 525
}
```

To switch to mainnet, update the configuration in `utils/config.js`.

### Environment Variables

See `.env.example` for all available environment variables.

**Critical Variables:**
- `MNEMONIC` - Your wallet's 24-word phrase (NEVER commit this!)
- `CONTRACT_ADDRESS` - Your deployed NFT contract address

**Security Best Practices:**
1. Never commit `.env` to version control
2. Add `.env` to `.gitignore`
3. Use different wallets for testnet and mainnet
4. Store mnemonics securely (password manager, hardware wallet)

---

## Security Considerations

1. **Mnemonic Storage:**
   - Never share your mnemonic
   - Never commit `.env` to git
   - Use hardware wallets for mainnet
   - Consider using environment variable management services

2. **Private Keys:**
   - Generated from mnemonic using BIP39/BIP44
   - Stored encrypted in wallet instance
   - Never exposed in logs or output

3. **Transaction Signing:**
   - All signing happens locally
   - Private keys never leave your machine
   - Transactions can be signed offline

4. **Gas Fees:**
   - Always check gas estimates before executing
   - Monitor wallet balance
   - Use `check-gas-fee.js` to preview costs

---

## Testing Workflow

### Complete End-to-End Test

1. **Create and fund wallet:**
```bash
npm run create-wallet
# Copy mnemonic to .env
# Get testnet tokens from Discord faucet
```

2. **Deploy contract:**
```bash
npm run deploy-contract
# Copy CONTRACT_ADDRESS to .env
```

3. **Mint NFT:**
```bash
TOKEN_ID=1 TOKEN_URI=ipfs://example npm run mint-token
```

4. **Verify ownership:**
```bash
npm run verify-ownership 1
```

5. **Transfer NFT:**
```bash
# Create second wallet for testing
npm run create-wallet
# Set RECIPIENT to new wallet address
npm run transfer-nft 1 xion1...
```

6. **Verify transfer:**
```bash
npm run verify-ownership 1
```

7. **Monitor transaction:**
```bash
npm run monitor-tx <hash-from-transfer>
```

---

## Network Information

### XION Testnet

- **Chain ID:** `xion-testnet-2`
- **RPC:** https://rpc.xion-testnet-2.burnt.com:443
- **REST:** https://api.xion-testnet-2.burnt.com
- **Explorer:** https://www.mintscan.io/xion-testnet
- **Faucet:** Discord - https://discord.gg/burnt

### XION Mainnet (Reference)

- **Chain ID:** `xion-mainnet-1`
- **RPC:** https://rpc.xion-mainnet-1.burnt.com:443
- **Explorer:** https://explorer.burnt.com/xion-mainnet-1

---

## CW721 Standard

This project uses the CW721 standard - the Cosmos equivalent of ERC721.

**Standard Functions Available:**
- `mint` - Create new NFT
- `transfer_nft` - Transfer ownership
- `approve` - Grant transfer permission
- `revoke` - Revoke permission
- `transfer_ownership` - Transfer contract ownership (via admin)
- `burn` - Destroy NFT

**Queries Available:**
- `owner_of` - Get token owner
- `nft_info` - Get token metadata
- `all_nft_info` - Get owner + metadata
- `tokens` - List tokens by owner
- `all_tokens` - List all tokens
- `num_tokens` - Total supply

---

## CW721 Contract Variants: Base vs Metadata-Onchain

### Overview

The CW721 standard has multiple implementations. This project uses **CW721-metadata-onchain**, but it's important to understand the differences from the more common **CW721-base** contract.

#### CW721-Base (Code ID: 522 testnet / 25 mainnet)
The standard, minimal implementation of the CW721 NFT standard.

**How it works:**
- Stores only essential data on-chain: token_id, owner, token_uri
- The `token_uri` points to external metadata (usually IPFS)
- Metadata JSON (name, description, image, attributes) lives off-chain
- Wallets/marketplaces fetch metadata from the URI

**Storage structure:**
```rust
pub struct TokenInfo {
    pub owner: Addr,
    pub approvals: Vec<Approval>,
    pub token_uri: Option<String>,  // Points to external metadata
    pub extension: Option<Empty>,   // Empty - no on-chain metadata
}
```

#### CW721-Metadata-Onchain (Code ID: 525 testnet / 28 mainnet)
Extended implementation that supports storing full metadata directly in the smart contract.

**How it works:**
- Can store full metadata on-chain in the `extension` field
- OR can use token_uri for IPFS like base (flexible)
- Metadata is guaranteed available without external dependencies
- Query returns all metadata directly from contract

**Storage structure:**
```rust
pub struct TokenInfo {
    pub owner: Addr,
    pub approvals: Vec<Approval>,
    pub token_uri: Option<String>,        // Optional IPFS reference
    pub extension: Option<Metadata>,      // Full metadata stored here
}

pub struct Metadata {
    pub name: Option<String>,
    pub description: Option<String>,
    pub image: Option<String>,
    pub attributes: Option<Vec<Trait>>,
    pub animation_url: Option<String>,
    pub external_url: Option<String>,
    pub background_color: Option<String>,
    // ... extensible
}
```

### Key Differences

| Feature | CW721-Base | CW721-Metadata-Onchain |
|---------|-----------|------------------------|
| **Metadata Storage** | Off-chain only (IPFS/HTTP) | On-chain OR off-chain (flexible) |
| **token_uri Required** | Yes | No (optional) |
| **Extension Field** | Empty | Full metadata struct |
| **Minting Gas Cost** | Low (~150k-200k gas) | Higher if storing metadata (~300k-500k gas) |
| **Query Speed** | Fast (minimal data) | Fast (all data available) |
| **External Dependencies** | Yes (IPFS must be accessible) | No (if using on-chain) |
| **Metadata Permanence** | Depends on IPFS pinning | Guaranteed (on blockchain) |
| **Ideal For** | Standard NFTs, large collections, media-heavy | Critical metadata, small collections, text NFTs |
| **IPFS Support** | Required | Optional |
| **Metadata Mutability** | Can update IPFS (new URI) | Immutable once minted (on-chain) |
| **Marketplace Compatibility** | Universal | Universal (reads extension OR token_uri) |

### Which Should You Use?

#### Use **CW721-Base** when:
- Building a large NFT collection (10k+ items)
- NFTs have rich media (images, videos, 3D assets)
- Minimizing gas costs is critical
- Following industry standard patterns
- Using established IPFS infrastructure
- Metadata may need updates (point to new IPFS hash)

#### Use **CW721-Metadata-Onchain** when:
- Metadata must be permanently on-chain (no external dependencies)
- Building text-based or low-data NFTs (poetry, credentials, certificates)
- Metadata is critical and can't risk IPFS unavailability
- Want flexibility to use either on-chain OR IPFS per token
- Small to medium collections where gas cost is acceptable
- Building for enterprise/institutional use cases requiring guarantees

### Flexibility of Metadata-Onchain

The beauty of CW721-metadata-onchain is **flexibility**:

```javascript
// Mint with FULL on-chain metadata (no IPFS needed)
METADATA_STORAGE=onchain npm run mint-token

// Mint with off-chain metadata (works exactly like base)
METADATA_STORAGE=offchain TOKEN_URI=ipfs://QmHash npm run mint-token
```

You can even **mix both** in the same collection:
- Store critical NFTs on-chain (#1-100)
- Store bulk NFTs on IPFS (#101-10000)

### Migration Between Variants

**Can you switch?**
- **Base → Metadata-Onchain**: Possible but requires new contract deployment. Existing tokens would need migration.
- **Metadata-Onchain → Base**: Not recommended. Would lose on-chain metadata capability.

**Best practice**: Choose the right variant at project start based on your long-term needs.

### Why This Project Uses Metadata-Onchain

This starter kit uses **CW721-metadata-onchain** because:

1. **Maximum Flexibility** - Supports both on-chain and IPFS workflows
2. **Educational Value** - Demonstrates both storage patterns
3. **Future-Proof** - On-chain metadata is gaining traction for critical use cases
4. **No Lock-In** - Can use IPFS mode for cost-sensitive collections
5. **Enterprise Ready** - Suitable for institutional NFT applications

If your project needs the absolute lowest gas costs and will use IPFS exclusively, you can switch to CW721-base by changing the Code ID in `config.js` to 522 (testnet) or 25 (mainnet).

---

## Troubleshooting

### Common Issues

**1. "MNEMONIC not found in environment"**
- Solution: Add `MNEMONIC="your 24 words"` to `.env` file

**2. "Insufficient balance"**
- Solution: Fund your wallet using Discord faucet
- Command: `/faucet your-xion-address`

**3. "CONTRACT_ADDRESS not set"**
- Solution: Run `deploy-contract.js` first and add address to `.env`

**4. "Transaction not found"**
- Solution: Use `--wait` flag or wait a few seconds for indexing

**5. "Sequence mismatch"**
- Solution: Wait for pending transactions to complete
- Or query account to get current sequence

**6. Module not found errors**
- Solution: Run `npm install` to install dependencies

**7. "Account not found"**
- Solution: Fund your account before executing transactions

---

## Dependencies

- `@cosmjs/stargate` - Cosmos SDK client
- `@cosmjs/proto-signing` - Transaction signing
- `@cosmjs/encoding` - Encoding utilities
- `@cosmjs/crypto` - Cryptographic functions
- `dotenv` - Environment variable management

---

## Support

For issues and questions:
- XION Documentation: https://docs.burnt.com
- XION Discord: https://discord.gg/burnt
- CosmJS Documentation: https://cosmos.github.io/cosmjs/

---

## License

MIT License - See LICENSE file for details

---

## Roadmap

Future enhancements planned:
- [ ] Batch minting script
- [ ] NFT marketplace integration
- [ ] Metadata upload to IPFS
- [ ] Whitelist management
- [ ] Royalty configuration
- [ ] Bulk transfer operations
- [ ] Transaction retry logic
- [ ] GUI interface
- [ ] Multi-signature support

---

## Notes

- All amounts in XION are automatically converted to uxion (1 XION = 1,000,000 uxion)
- Gas prices are set to `0.025uxion` by default
- Gas adjustment factor is 1.3x for safety margin
- Pre-deployed contracts are audited and battle-tested
- Mainnet deployment requires governance approval for new contracts

---

**Built for XION blockchain** | **Powered by CosmJS** | **CW721 Standard**
