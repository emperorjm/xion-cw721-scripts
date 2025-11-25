/**
 * Transfer XION tokens (gas tokens) between wallets
 * Sends native XION tokens from one address to another
 */

import {
  loadWallet,
  getFirstAccount,
  connectSigningClient,
  formatXionAmount,
  parseXionAmount,
  printTxResult,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function transferGas() {
  try {
    // Configuration - Can be passed as environment variables or command line args
    const RECIPIENT = process.env.RECIPIENT || process.argv[2];
    const AMOUNT = process.env.AMOUNT || process.argv[3]; // In XION (not uxion)

    console.log("Transferring XION Tokens...\n");

    // Validate inputs
    if (!RECIPIENT) {
      console.error("Error: RECIPIENT address not provided!");
      console.log("   Usage: npm run transfer-gas <recipient_address> <amount_in_xion>");
      console.log("   Example: npm run transfer-gas xion1abc... 1.5");
      console.log("   Or set RECIPIENT and AMOUNT in .env file");
      return;
    }

    if (!AMOUNT) {
      console.error("Error: AMOUNT not provided!");
      console.log("   Usage: npm run transfer-gas <recipient_address> <amount_in_xion>");
      console.log("   Example: npm run transfer-gas xion1abc... 1.5");
      console.log("   Or set AMOUNT in .env file");
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

    // Convert amount to base unit (uxion)
    const amountInUxion = parseXionAmount(AMOUNT);

    // Check balance
    const balance = await client.getBalance(account.address, XION_CONFIG.denom);
    const balanceInXion = formatXionAmount(balance.amount);

    console.log("Wallet Balance:");
    console.log(`   Current: ${balance.amount} ${XION_CONFIG.denom} (${balanceInXion} XION)`);

    if (parseInt(balance.amount) < parseInt(amountInUxion)) {
      console.error("\nError: Insufficient balance!");
      console.log(`   Required: ${amountInUxion} ${XION_CONFIG.denom} (${AMOUNT} XION)`);
      console.log(`   Available: ${balance.amount} ${XION_CONFIG.denom} (${balanceInXion} XION)`);
      return;
    }

    console.log("\nTransfer Details:");
    console.log(`   From: ${account.address}`);
    console.log(`   To: ${RECIPIENT}`);
    console.log(`   Amount: ${amountInUxion} ${XION_CONFIG.denom} (${AMOUNT} XION)`);

    console.log("\nSending tokens...");

    // Send tokens
    const result = await client.sendTokens(
      account.address,
      RECIPIENT,
      [{ denom: XION_CONFIG.denom, amount: amountInUxion }],
      "auto",
      `Transfer ${AMOUNT} XION tokens`
    );

    console.log("\n" + "=".repeat(80));
    console.log("TOKENS TRANSFERRED SUCCESSFULLY!");
    console.log("=".repeat(80));
    console.log(`Amount: ${amountInUxion} ${XION_CONFIG.denom} (${AMOUNT} XION)`);
    console.log(`From: ${account.address}`);
    console.log(`To: ${RECIPIENT}`);
    console.log(`Explorer: https://www.mintscan.io/xion-testnet/tx/${result.transactionHash}`);
    console.log("=".repeat(80));

    // Print transaction details
    printTxResult(result);

    // Get new balance
    const newBalance = await client.getBalance(account.address, XION_CONFIG.denom);
    const newBalanceInXion = formatXionAmount(newBalance.amount);

    console.log("\nUpdated Balance:");
    console.log(`   Previous: ${balance.amount} ${XION_CONFIG.denom} (${balanceInXion} XION)`);
    console.log(`   Current: ${newBalance.amount} ${XION_CONFIG.denom} (${newBalanceInXion} XION)`);
    console.log(`   Transferred: ${amountInUxion} ${XION_CONFIG.denom} (${AMOUNT} XION)`);
    console.log(`   Gas Fee: ${parseInt(balance.amount) - parseInt(newBalance.amount) - parseInt(amountInUxion)} ${XION_CONFIG.denom}`);
    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    handleError(error);
  }
}

// Run the script
transferGas();
