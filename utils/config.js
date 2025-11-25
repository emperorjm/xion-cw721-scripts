/**
 * XION Blockchain Configuration
 * Network: Testnet (xion-testnet-2)
 */

export const XION_CONFIG = {
  // Network identifiers
  chainId: "xion-testnet-2",
  chainName: "XION Testnet",

  // RPC endpoints
  rpcEndpoint: "https://rpc.xion-testnet-2.burnt.com:443",
  restEndpoint: "https://api.xion-testnet-2.burnt.com",

  // Address prefix
  addressPrefix: "xion",

  // Gas configuration
  gasPrice: "0.025uxion",
  gasAdjustment: 1.3,

  // Native token
  denom: "uxion",
  decimals: 6, // 1 XION = 1,000,000 uxion

  // CW721 NFT Contract Code IDs (pre-deployed)
  cw721MetadataOnchainCodeId: 525, // Testnet code ID for cw721-metadata-onchain

  // Faucet info (for testnet)
  faucet: {
    discord: "https://discord.gg/burnt",
    command: "/faucet [your-xion-address]"
  }
};

// Mainnet configuration (for reference, not currently used)
export const XION_MAINNET_CONFIG = {
  chainId: "xion-mainnet-1",
  chainName: "XION Mainnet",
  rpcEndpoint: "https://rpc.xion-mainnet-1.burnt.com:443",
  restEndpoint: "https://api.xion-mainnet-1.burnt.com",
  addressPrefix: "xion",
  gasPrice: "0.025uxion",
  gasAdjustment: 1.3,
  denom: "uxion",
  decimals: 6,
  cw721MetadataOnchainCodeId: 28 // Mainnet code ID
};

export default XION_CONFIG;
