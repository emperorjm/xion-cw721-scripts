/**
 * Monitor and verify a transaction
 * Retrieves transaction details and status by transaction hash
 */

import {
  connectQueryClient,
  getTransaction,
  waitForTransaction,
  formatXionAmount,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function monitorTransaction() {
  try {
    // Configuration - Can be passed as environment variable or command line arg
    const TX_HASH = process.env.TX_HASH || process.argv[2];
    const WAIT_FOR_TX = process.env.WAIT === "true" || process.argv[3] === "--wait";

    console.log("Monitoring Transaction...\n");

    // Validate input
    if (!TX_HASH) {
      console.error("Error: Transaction hash not provided!");
      console.log("   Usage: npm run monitor-tx <transaction_hash> [--wait]");
      console.log("   Or set TX_HASH in .env file");
      console.log("\n   Options:");
      console.log("     --wait: Wait for transaction to be indexed if not found immediately");
      return;
    }

    // Connect query client (read-only)
    console.log("Connecting to XION network...");
    const client = await connectQueryClient();
    console.log(`Connected to ${XION_CONFIG.chainId}\n`);

    console.log("Query Details:");
    console.log(`   Transaction Hash: ${TX_HASH}`);
    console.log(`   Wait for indexing: ${WAIT_FOR_TX ? "Yes" : "No"}`);

    console.log("\nFetching transaction...");

    // Get transaction
    let tx;
    if (WAIT_FOR_TX) {
      console.log("   Waiting for transaction to be indexed (max 20 attempts)...");
      tx = await waitForTransaction(client, TX_HASH);
    } else {
      tx = await getTransaction(client, TX_HASH);
    }

    if (!tx) {
      console.log("\nTransaction not found!");
      console.log("   The transaction may not be indexed yet.");
      console.log("   Try running with --wait flag to wait for indexing:");
      console.log(`   npm run monitor-tx ${TX_HASH} --wait`);
      return;
    }

    console.log("\n" + "=".repeat(80));
    console.log("TRANSACTION FOUND");
    console.log("=".repeat(80));
    console.log(`Hash: ${tx.hash}`);
    console.log(`Height: ${tx.height}`);
    console.log(`Gas Used: ${tx.gasUsed}`);
    console.log(`Gas Wanted: ${tx.gasWanted}`);
    console.log(`Explorer: https://www.mintscan.io/xion-testnet/tx/${tx.hash}`);

    // Check transaction result
    if (tx.code === 0) {
      console.log(`Status: SUCCESS`);
    } else {
      console.log(`Status: FAILED (Code: ${tx.code})`);
      if (tx.rawLog) {
        console.log(`Error Log: ${tx.rawLog}`);
      }
    }

    console.log("=".repeat(80));

    // Parse transaction details
    if (tx.tx && tx.tx.body && tx.tx.body.messages) {
      console.log("\nTransaction Messages:");
      tx.tx.body.messages.forEach((msg, i) => {
        console.log(`\n   Message ${i + 1}:`);
        console.log(`     Type: ${msg["@type"] || msg.typeUrl}`);

        // Display message-specific details
        if (msg["@type"]?.includes("MsgSend") || msg.typeUrl?.includes("MsgSend")) {
          console.log(`     From: ${msg.fromAddress || msg.from_address}`);
          console.log(`     To: ${msg.toAddress || msg.to_address}`);
          if (msg.amount && msg.amount.length > 0) {
            msg.amount.forEach((coin) => {
              const formattedAmount = formatXionAmount(coin.amount);
              console.log(`     Amount: ${coin.amount} ${coin.denom} (${formattedAmount} XION)`);
            });
          }
        } else if (msg["@type"]?.includes("MsgExecuteContract") || msg.typeUrl?.includes("MsgExecuteContract")) {
          console.log(`     Sender: ${msg.sender}`);
          console.log(`     Contract: ${msg.contract}`);
          if (msg.msg) {
            try {
              const msgContent = typeof msg.msg === "string" ? JSON.parse(msg.msg) : msg.msg;
              console.log(`     Message: ${JSON.stringify(msgContent, null, 2)}`);
            } catch (e) {
              console.log(`     Message: ${JSON.stringify(msg.msg)}`);
            }
          }
          if (msg.funds && msg.funds.length > 0) {
            console.log(`     Funds: ${JSON.stringify(msg.funds)}`);
          }
        } else if (msg["@type"]?.includes("MsgInstantiateContract") || msg.typeUrl?.includes("MsgInstantiateContract")) {
          console.log(`     Sender: ${msg.sender}`);
          console.log(`     Code ID: ${msg.codeId || msg.code_id}`);
          console.log(`     Label: ${msg.label}`);
          if (msg.admin) {
            console.log(`     Admin: ${msg.admin}`);
          }
        }
      });

      if (tx.tx.body.memo) {
        console.log(`\nMemo: ${tx.tx.body.memo}`);
      }
    }

    // Parse events/logs
    if (tx.events && tx.events.length > 0) {
      console.log("\nTransaction Events:");
      tx.events.forEach((event, i) => {
        console.log(`\n   Event ${i + 1}: ${event.type}`);
        event.attributes.forEach((attr) => {
          console.log(`     ${attr.key}: ${attr.value}`);
        });
      });
    }

    // Calculate fee
    if (tx.tx && tx.tx.authInfo && tx.tx.authInfo.fee) {
      const fee = tx.tx.authInfo.fee;
      if (fee.amount && fee.amount.length > 0) {
        console.log("\nTransaction Fee:");
        fee.amount.forEach((coin) => {
          const formattedFee = formatXionAmount(coin.amount);
          console.log(`   ${coin.amount} ${coin.denom} (${formattedFee} XION)`);
        });
      }
      if (fee.gasLimit) {
        console.log(`   Gas Limit: ${fee.gasLimit}`);
      }
    }

    // Gas efficiency
    if (tx.gasUsed && tx.gasWanted) {
      const efficiency = ((parseInt(tx.gasUsed) / parseInt(tx.gasWanted)) * 100).toFixed(2);
      console.log(`\nGas Efficiency: ${efficiency}% (${tx.gasUsed}/${tx.gasWanted})`);
    }

    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    if (error.message && error.message.includes("not found")) {
      console.error("\nTransaction not found!");
      console.log("   Please verify the transaction hash and try again.");
      console.log("   Or use --wait flag to wait for the transaction to be indexed.");
    } else {
      handleError(error);
    }
  }
}

// Run the script
monitorTransaction();
