/**
 * Check gas fee estimation for various transaction types
 * Simulates transactions to estimate gas costs without executing them
 */

import { toUtf8 } from "@cosmjs/encoding";
import {
  loadWallet,
  getFirstAccount,
  connectSigningClient,
  simulateTransaction,
  calculateFee,
  formatXionAmount,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function checkGasFee() {
  try {
    // Configuration
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const TRANSACTION_TYPE = process.env.TX_TYPE || process.argv[2] || "mint";

    console.log("Estimating Gas Fees...\n");

    // Load wallet
    console.log("Loading wallet from environment...");
    const wallet = await loadWallet();
    const account = await getFirstAccount(wallet);
    console.log(`Wallet loaded: ${account.address}\n`);

    // Connect signing client
    console.log("Connecting to XION network...");
    const client = await connectSigningClient(wallet);
    console.log(`Connected to ${XION_CONFIG.chainId}\n`);

    let messages = [];
    let txDescription = "";

    // Build message based on transaction type
    switch (TRANSACTION_TYPE.toLowerCase()) {
      case "mint":
        if (!CONTRACT_ADDRESS) {
          console.error("Error: CONTRACT_ADDRESS required for mint simulation");
          return;
        }
        const mintMsg = {
          mint: {
            token_id: "99999", // Use high number unlikely to exist
            owner: account.address,
            token_uri: "ipfs://example",
            // Note: Code ID 525 doesn't support extension in mint message
          },
        };
        messages = [
          {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: {
              sender: account.address,
              contract: CONTRACT_ADDRESS,
              msg: toUtf8(JSON.stringify(mintMsg)),
              funds: [],
            },
          },
        ];
        txDescription = "Mint NFT";
        break;

      case "transfer-nft":
        if (!CONTRACT_ADDRESS) {
          console.error("Error: CONTRACT_ADDRESS required for transfer-nft simulation");
          return;
        }
        const transferNftMsg = {
          transfer_nft: {
            recipient: account.address, // Use own address for simulation
            token_id: "2", // Use token that exists and you own
          },
        };
        messages = [
          {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: {
              sender: account.address,
              contract: CONTRACT_ADDRESS,
              msg: toUtf8(JSON.stringify(transferNftMsg)),
              funds: [],
            },
          },
        ];
        txDescription = "Transfer NFT";
        break;

      case "send-tokens":
        const amount = process.env.AMOUNT || "1000000"; // 1 XION in uxion
        const recipient = process.env.RECIPIENT || account.address; // Use own address for simulation
        messages = [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
              fromAddress: account.address,
              toAddress: recipient,
              amount: [{ denom: XION_CONFIG.denom, amount: amount }],
            },
          },
        ];
        txDescription = "Send Tokens";
        break;

      case "instantiate":
        const codeId = XION_CONFIG.cw721MetadataOnchainCodeId;
        const instantiateMsg = {
          name: "Test NFT Collection",
          symbol: "TEST",
          minter: account.address,
        };
        messages = [
          {
            typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
            value: {
              sender: account.address,
              admin: account.address,
              codeId: BigInt(codeId),
              label: "test-contract",
              msg: toUtf8(JSON.stringify(instantiateMsg)),
              funds: [],
            },
          },
        ];
        txDescription = "Instantiate Contract";
        break;

      default:
        console.error(`Unknown transaction type: ${TRANSACTION_TYPE}`);
        console.log("\nAvailable transaction types:");
        console.log("   - mint: Estimate gas for minting an NFT");
        console.log("   - transfer-nft: Estimate gas for transferring an NFT");
        console.log("   - send-tokens: Estimate gas for sending XION tokens");
        console.log("   - instantiate: Estimate gas for deploying a contract");
        console.log("\nUsage: npm run check-gas <transaction-type>");
        return;
    }

    console.log(`Simulating: ${txDescription}`);
    console.log("Estimating gas...\n");

    // Simulate transaction
    const gasEstimate = await simulateTransaction(client, account.address, messages);

    // Calculate fee
    const fee = calculateFee(gasEstimate);
    const feeAmount = parseInt(fee.amount[0].amount);
    const feeInXion = formatXionAmount(feeAmount);

    console.log("=".repeat(80));
    console.log("GAS ESTIMATION RESULTS");
    console.log("=".repeat(80));
    console.log(`Transaction Type: ${txDescription}`);
    console.log(`Estimated Gas: ${gasEstimate} units`);
    console.log(`Gas Price: ${XION_CONFIG.gasPrice}`);
    console.log(`Gas Adjustment: ${XION_CONFIG.gasAdjustment}x`);
    console.log(`Estimated Fee: ${feeAmount} ${XION_CONFIG.denom} (${feeInXion} XION)`);
    console.log("=".repeat(80));

    // Get current balance
    const balance = await client.getBalance(account.address, XION_CONFIG.denom);
    const balanceInXion = formatXionAmount(balance.amount);

    console.log("\nWallet Balance:");
    console.log(`   Current: ${balance.amount} ${XION_CONFIG.denom} (${balanceInXion} XION)`);
    console.log(`   After TX: ${parseInt(balance.amount) - feeAmount} ${XION_CONFIG.denom} (${formatXionAmount(parseInt(balance.amount) - feeAmount)} XION)`);

    if (parseInt(balance.amount) < feeAmount) {
      console.log("\nWarning: Insufficient balance for this transaction!");
      console.log("   Please fund your wallet with testnet tokens.");
    } else {
      console.log("\nSufficient balance for this transaction");
    }

    console.log("\nNOTE:");
    console.log("   - Gas estimates are approximate and may vary");
    console.log("   - Actual gas used may be different from the estimate");
    console.log("   - Fees are automatically calculated as: gas_used × gas_price");
    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    handleError(error);
  }
}

// Run the script
checkGasFee();
