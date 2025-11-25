/**
 * Sign a transaction offline and save for later broadcast
 * Creates a signed transaction that can be broadcast at a later time
 */

import fs from "fs";
import path from "path";
import { toUtf8 } from "@cosmjs/encoding";
import {
  loadWallet,
  getFirstAccount,
  connectSigningClient,
  parseXionAmount,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function signTransaction() {
  try {
    // Configuration - Can be passed as environment variables or command line args
    const TX_TYPE = process.env.TX_TYPE || process.argv[2] || "send-tokens";
    const OUTPUT_FILE = process.env.OUTPUT_FILE || process.argv[3] || "signed-tx.json";

    console.log("Signing Transaction for Later Broadcast...\n");

    // Load wallet
    console.log("Loading wallet from environment...");
    const wallet = await loadWallet();
    const account = await getFirstAccount(wallet);
    console.log(`Wallet loaded: ${account.address}\n`);

    // Connect signing client
    console.log("Connecting to XION network...");
    const client = await connectSigningClient(wallet);
    console.log(`Connected to ${XION_CONFIG.chainId}\n`);

    // Get account info for sequence and account number
    const accountInfo = await client.getAccount(account.address);
    if (!accountInfo) {
      throw new Error("Account not found on chain. Please fund your account first.");
    }

    let messages = [];
    let memo = "";
    let txDescription = "";

    // Build transaction based on type
    switch (TX_TYPE.toLowerCase()) {
      case "send-tokens":
        const sendRecipient = process.env.RECIPIENT || "xion1qka2er800suxsy7y9yz9wqgt8p3ktw5ptpf28s";
        const sendAmount = process.env.AMOUNT || "1.0";
        const amountInUxion = parseXionAmount(sendAmount);

        messages = [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
              fromAddress: account.address,
              toAddress: sendRecipient,
              amount: [{ denom: XION_CONFIG.denom, amount: amountInUxion }],
            },
          },
        ];
        memo = `Send ${sendAmount} XION`;
        txDescription = `Send ${sendAmount} XION to ${sendRecipient}`;
        break;

      case "mint-nft":
        const mintContract = process.env.CONTRACT_ADDRESS;
        const tokenId = process.env.TOKEN_ID || "1";
        const tokenUri = process.env.TOKEN_URI || "ipfs://example";

        if (!mintContract) {
          console.error("Error: CONTRACT_ADDRESS required for mint-nft");
          return;
        }

        const mintMsg = {
          mint: {
            token_id: tokenId,
            owner: account.address,
            token_uri: tokenUri,
            extension: {
              name: `NFT #${tokenId}`,
              description: "NFT",
              image: tokenUri,
            },
          },
        };

        messages = [
          {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: {
              sender: account.address,
              contract: mintContract,
              msg: toUtf8(JSON.stringify(mintMsg)),
              funds: [],
            },
          },
        ];
        memo = `Mint NFT #${tokenId}`;
        txDescription = `Mint NFT #${tokenId}`;
        break;

      case "transfer-nft":
        const transferContract = process.env.CONTRACT_ADDRESS;
        const transferTokenId = process.env.TOKEN_ID || "1";
        const transferRecipient = process.env.RECIPIENT;

        if (!transferContract) {
          console.error("Error: CONTRACT_ADDRESS required for transfer-nft");
          return;
        }
        if (!transferRecipient) {
          console.error("Error: RECIPIENT required for transfer-nft");
          return;
        }

        const transferMsg = {
          transfer_nft: {
            recipient: transferRecipient,
            token_id: transferTokenId,
          },
        };

        messages = [
          {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: {
              sender: account.address,
              contract: transferContract,
              msg: toUtf8(JSON.stringify(transferMsg)),
              funds: [],
            },
          },
        ];
        memo = `Transfer NFT #${transferTokenId}`;
        txDescription = `Transfer NFT #${transferTokenId} to ${transferRecipient}`;
        break;

      default:
        console.error(`Unknown transaction type: ${TX_TYPE}`);
        console.log("\nAvailable transaction types:");
        console.log("   - send-tokens: Send XION tokens (requires RECIPIENT, AMOUNT)");
        console.log("   - mint-nft: Mint an NFT (requires CONTRACT_ADDRESS, TOKEN_ID, TOKEN_URI)");
        console.log("   - transfer-nft: Transfer an NFT (requires CONTRACT_ADDRESS, TOKEN_ID, RECIPIENT)");
        console.log("\nUsage: npm run sign-tx <transaction-type> [output-file]");
        return;
    }

    console.log("Transaction Details:");
    console.log(`   Type: ${TX_TYPE}`);
    console.log(`   Description: ${txDescription}`);
    console.log(`   From: ${account.address}`);
    console.log(`   Account Number: ${accountInfo.accountNumber}`);
    console.log(`   Sequence: ${accountInfo.sequence}`);
    console.log(`   Memo: ${memo}`);

    console.log("\nSigning transaction...");

    // Sign the transaction (but don't broadcast)
    const fee = await client.calculateFee(account.address, messages, memo);
    const txRaw = await client.sign(account.address, messages, fee, memo);

    // Serialize the signed transaction
    const txBytes = Array.from(txRaw);

    // Prepare export data
    const signedTxData = {
      chainId: XION_CONFIG.chainId,
      accountAddress: account.address,
      accountNumber: accountInfo.accountNumber,
      sequence: accountInfo.sequence,
      txType: TX_TYPE,
      description: txDescription,
      memo: memo,
      fee: {
        amount: fee.amount,
        gas: fee.gas,
      },
      messages: messages.map((msg) => ({
        typeUrl: msg.typeUrl,
        value: msg.value,
      })),
      signedTxBytes: txBytes,
      timestamp: new Date().toISOString(),
    };

    console.log("\n" + "=".repeat(80));
    console.log("TRANSACTION SIGNED SUCCESSFULLY");
    console.log("=".repeat(80));
    console.log(`Transaction Type: ${TX_TYPE}`);
    console.log(`Description: ${txDescription}`);
    console.log(`Fee: ${fee.amount[0].amount} ${fee.amount[0].denom} (Gas: ${fee.gas})`);
    console.log(`Signed Tx Size: ${txBytes.length} bytes`);
    console.log("=".repeat(80));

    // Save to file
    const outputPath = path.resolve(OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(signedTxData, null, 2));

    console.log(`\nSigned transaction saved to: ${outputPath}`);

    console.log("\nTO BROADCAST THIS TRANSACTION LATER:");
    console.log("   1. Use the broadcast script (create one or use cosmjs):");
    console.log(`      const txBytes = Uint8Array.from(data.signedTxBytes);`);
    console.log(`      const result = await client.broadcastTx(txBytes);`);
    console.log("\n   2. Or use CLI:");
    console.log(`      xiond tx broadcast ${outputPath} --node ${XION_CONFIG.rpcEndpoint}`);

    console.log("\nIMPORTANT NOTES:");
    console.log("   - This transaction is signed with sequence number:", accountInfo.sequence);
    console.log("   - If you broadcast other transactions first, this will fail due to sequence mismatch");
    console.log("   - The transaction must be broadcast before it expires (typically 24 hours)");
    console.log("   - Store this file securely as it represents a signed, ready-to-execute transaction");
    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    handleError(error);
  }
}

// Bonus: Broadcast function (can be used separately)
export async function broadcastSignedTransaction(signedTxFile) {
  try {
    console.log("Broadcasting Signed Transaction...\n");

    // Read signed transaction file
    const signedTxData = JSON.parse(fs.readFileSync(signedTxFile, "utf-8"));

    console.log("Loading signed transaction...");
    console.log(`   File: ${signedTxFile}`);
    console.log(`   Type: ${signedTxData.txType}`);
    console.log(`   Signer: ${signedTxData.accountAddress}`);
    console.log(`   Sequence: ${signedTxData.sequence}`);

    // Load wallet (just for connection, not for signing)
    const wallet = await loadWallet();
    const client = await connectSigningClient(wallet);

    console.log("\nBroadcasting transaction...");

    // Convert back to Uint8Array and broadcast
    const txBytes = Uint8Array.from(signedTxData.signedTxBytes);
    const result = await client.broadcastTx(txBytes);

    console.log("\n" + "=".repeat(80));
    console.log("TRANSACTION BROADCAST SUCCESSFULLY");
    console.log("=".repeat(80));
    console.log(`Transaction Hash: ${result.transactionHash}`);
    console.log(`Height: ${result.height}`);
    console.log(`Gas Used: ${result.gasUsed}`);
    console.log(`Explorer: https://www.mintscan.io/xion-testnet/tx/${result.transactionHash}`);
    console.log("=".repeat(80));
    console.log("");

    client.disconnect();

    return result;
  } catch (error) {
    handleError(error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  signTransaction();
}
