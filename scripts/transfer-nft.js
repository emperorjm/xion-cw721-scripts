/**
 * Transfer an NFT to another address
 * Executes the transfer_nft function on the CW721 contract
 */

import {
  loadWallet,
  getFirstAccount,
  connectSigningClient,
  executeContract,
  printTxResult,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function transferNFT() {
  try {
    // Configuration - Can be passed as environment variables or command line args
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const TOKEN_ID = process.env.TOKEN_ID || process.argv[2];
    const RECIPIENT = process.env.RECIPIENT || process.argv[3];

    console.log("Transferring NFT...\n");

    // Validate inputs
    if (!CONTRACT_ADDRESS) {
      console.error("Error: CONTRACT_ADDRESS not set!");
      console.log("   Please set CONTRACT_ADDRESS in your .env file");
      return;
    }

    if (!TOKEN_ID) {
      console.error("Error: TOKEN_ID not provided!");
      console.log("   Usage: npm run transfer-nft <token_id> <recipient_address>");
      console.log("   Or set TOKEN_ID and RECIPIENT in .env file");
      return;
    }

    if (!RECIPIENT) {
      console.error("Error: RECIPIENT address not provided!");
      console.log("   Usage: npm run transfer-nft <token_id> <recipient_address>");
      console.log("   Or set RECIPIENT in .env file");
      return;
    }

    // Load wallet
    console.log("Loading wallet from environment...");
    const wallet = await loadWallet();
    const account = await getFirstAccount(wallet);
    console.log(`Wallet loaded: ${account.address}\n`);

    // Connect signing client
    console.log("Connecting to XION network...");
    const client = await connectSigningClient(wallet);
    console.log(`Connected to ${XION_CONFIG.chainId}\n`);

    // Prepare transfer message
    const transferMsg = {
      transfer_nft: {
        recipient: RECIPIENT,
        token_id: TOKEN_ID,
      },
    };

    console.log("Transfer Details:");
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Token ID: ${TOKEN_ID}`);
    console.log(`   From: ${account.address}`);
    console.log(`   To: ${RECIPIENT}`);

    console.log("\nExecuting transfer...");

    // Execute transfer transaction
    const result = await executeContract(
      client,
      account.address,
      CONTRACT_ADDRESS,
      transferMsg,
      `Transferred NFT #${TOKEN_ID} to ${RECIPIENT}`
    );

    console.log("\n" + "=".repeat(80));
    console.log("NFT TRANSFERRED SUCCESSFULLY!");
    console.log("=".repeat(80));
    console.log(`Token ID: ${TOKEN_ID}`);
    console.log(`From: ${account.address}`);
    console.log(`To: ${RECIPIENT}`);
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`Explorer: https://www.mintscan.io/xion-testnet/tx/${result.transactionHash}`);
    console.log("=".repeat(80));

    // Print transaction details
    printTxResult(result);

    console.log("\nNEXT STEPS:");
    console.log("   1. Use verify-ownership.js to confirm the new owner");
    console.log("   2. Use monitor-transaction.js to track transaction status");
    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    handleError(error);
  }
}

// Run the script
transferNFT();
