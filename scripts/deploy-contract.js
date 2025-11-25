/**
 * Deploy (instantiate) a CW721 NFT contract
 * Uses pre-deployed CW721-metadata-onchain contract code (Code ID: 525 on testnet)
 * This contract variant supports storing full metadata on-chain
 */

import {
  loadWallet,
  getFirstAccount,
  connectSigningClient,
  instantiateContract,
  printTxResult,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function deployContract() {
  try {
    // Configuration - Update these values as needed
    const NFT_NAME = process.env.NFT_NAME || "My NFT Collection";
    const NFT_SYMBOL = process.env.NFT_SYMBOL || "MNFT";
    const CONTRACT_LABEL = process.env.CONTRACT_LABEL || "my-nft-contract";

    console.log("Deploying CW721 NFT Contract...\n");

    // Load wallet
    console.log("Loading wallet from environment...");
    const wallet = await loadWallet();
    const account = await getFirstAccount(wallet);
    console.log(`Wallet loaded: ${account.address}\n`);

    // Connect signing client
    console.log("Connecting to XION network...");
    const client = await connectSigningClient(wallet);
    console.log(`Connected to ${XION_CONFIG.chainId}\n`);

    // Check balance
    const balance = await client.getBalance(account.address, XION_CONFIG.denom);
    console.log(`Wallet balance: ${balance.amount} ${balance.denom}`);

    if (parseInt(balance.amount) === 0) {
      console.log("\nWarning: Wallet has zero balance!");
      console.log("   Please fund your wallet with testnet tokens before deploying.");
      console.log(`   Discord: ${XION_CONFIG.faucet.discord}`);
      console.log(`   Command: ${XION_CONFIG.faucet.command}`);
      return;
    }

    // Prepare instantiation message
    const instantiateMsg = {
      name: NFT_NAME,
      symbol: NFT_SYMBOL,
      minter: account.address, // Wallet address will be the minter
    };

    console.log("\nContract Configuration:");
    console.log(`   Name: ${NFT_NAME}`);
    console.log(`   Symbol: ${NFT_SYMBOL}`);
    console.log(`   Minter: ${account.address}`);
    console.log(`   Code ID: ${XION_CONFIG.cw721MetadataOnchainCodeId}`);
    console.log(`   Label: ${CONTRACT_LABEL}`);

    console.log("\nInstantiating contract...");

    // Instantiate the contract
    const result = await instantiateContract(
      client,
      account.address,
      XION_CONFIG.cw721MetadataOnchainCodeId,
      instantiateMsg,
      CONTRACT_LABEL,
      account.address // Set deployer as admin for ownership transfer capability
    );

    // Get contract address from result
    const contractAddress = result.contractAddress;

    console.log("\n" + "=".repeat(80));
    console.log("CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("=".repeat(80));
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Explorer: https://www.mintscan.io/xion-testnet/address/${contractAddress}`);
    console.log("=".repeat(80));

    // Print transaction details
    printTxResult(result);

    console.log("\nNEXT STEPS:");
    console.log(`   1. Add CONTRACT_ADDRESS="${contractAddress}" to your .env file`);
    console.log("   2. Use mint-token.js to mint your first NFT");
    console.log("   3. Use transfer-nft.js to transfer NFTs between addresses");
    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    handleError(error);
  }
}

// Run the script
deployContract();
