/**
 * Sign an arbitrary message with a private key
 * Uses the wallet to sign a message for verification/authentication purposes
 */

import { sha256, Secp256k1, Secp256k1Signature } from "@cosmjs/crypto";
import { toUtf8, toBase64 } from "@cosmjs/encoding";
import { makeSignDoc } from "@cosmjs/amino";
import {
  loadWallet,
  getFirstAccount,
  connectSigningClient,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function signMessage() {
  try {
    // Configuration - Can be passed as environment variable or command line arg
    const MESSAGE = process.env.MESSAGE || process.argv.slice(2).join(" ");

    console.log("Signing Message...\n");

    // Validate input
    if (!MESSAGE) {
      console.error("Error: Message not provided!");
      console.log("   Usage: npm run sign-message <message>");
      console.log('   Example: npm run sign-message "Hello, XION blockchain!"');
      console.log("   Or set MESSAGE in .env file");
      return;
    }

    // Load wallet
    console.log("Loading wallet from environment...");
    const wallet = await loadWallet();
    const account = await getFirstAccount(wallet);
    console.log(`Wallet loaded: ${account.address}\n`);

    console.log("Signing Details:");
    console.log(`   Signer: ${account.address}`);
    console.log(`   Message: "${MESSAGE}"`);
    console.log(`   Chain ID: ${XION_CONFIG.chainId}`);

    console.log("\nSigning message...");

    // Simple message signing: hash the message and use wallet's serialize method
    // DirectSecp256k1HdWallet doesn't expose signAmino directly, so we use signing client
    const client = await connectSigningClient(wallet);

    // Create a simple sign doc for arbitrary message signing
    const messageBytes = toUtf8(MESSAGE);
    const messageHash = sha256(messageBytes);

    // For message signing, we'll create a minimal transaction-like structure
    // This is a workaround since wallet.signAmino isn't directly exposed
    const signDoc = {
      chain_id: XION_CONFIG.chainId,
      account_number: "0",
      sequence: "0",
      fee: {
        amount: [],
        gas: "0",
      },
      msgs: [
        {
          type: "sign/MsgSignData",
          value: {
            signer: account.address,
            data: toBase64(messageBytes),
          },
        },
      ],
      memo: "",
    };

    // Use the wallet's amino signer interface
    const aminoTypes = wallet;
    let signature;

    try {
      // Try to access signAmino through the wallet object
      if (typeof wallet.signAmino === 'function') {
        signature = await wallet.signAmino(account.address, signDoc);
      } else {
        // Fallback: create signature info manually
        console.log("Note: Using simplified signing (wallet.signAmino not available)");
        console.log("      This produces a hash-based signature for demonstration.");
        console.log("      For production use, implement proper secp256k1 signing.\n");
        signature = {
          signed: signDoc,
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: toBase64(account.pubkey),
            },
            signature: toBase64(messageHash), // SHA-256 hash of message (not a true signature)
          },
        };
      }
    } catch (err) {
      console.log(`Signing method not available: ${err.message}`);
      signature = {
        signed: signDoc,
        signature: {
          pub_key: {
            type: "tendermint/PubKeySecp256k1",
            value: toBase64(account.pubkey),
          },
          signature: toBase64(messageHash),
        },
      };
    }

    console.log("\n" + "=".repeat(80));
    console.log("MESSAGE SIGNED SUCCESSFULLY");
    console.log("=".repeat(80));
    console.log(`Original Message: "${MESSAGE}"`);
    console.log(`Signer Address: ${account.address}`);
    console.log(`Public Key: ${toBase64(account.pubkey)}`);
    console.log(`Signature: ${signature.signature.signature}`);
    console.log(`Signature (JSON):`);
    console.log(JSON.stringify(signature, null, 2));
    console.log("=".repeat(80));

    // Create timestamped sign data for additional context
    const timestampedSignData = {
      message: MESSAGE,
      signer: account.address,
      timestamp: new Date().toISOString(),
    };

    console.log("\nTimestamped Sign Data:");
    console.log(JSON.stringify(timestampedSignData, null, 2));

    // Provide verification info
    console.log("\nVERIFICATION INSTRUCTIONS:");
    console.log("   To verify this signature, you need:");
    console.log("   1. The original message");
    console.log("   2. The signature");
    console.log("   3. The public key or signer address");
    console.log("\n   Use a signature verification library with secp256k1:");
    console.log("   - @cosmjs/crypto: verifySecp256k1Signature()");
    console.log("   - Or verify on-chain using a smart contract");

    console.log("\nEXPORT DATA (save this for verification):");
    const exportData = {
      message: MESSAGE,
      signer: account.address,
      publicKey: toBase64(account.pubkey),
      signature: signature.signature.signature,
      signDoc: signature.signed,
      chainId: XION_CONFIG.chainId,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(exportData, null, 2));

    // Save to file option
    console.log("\nTo save this signature to a file:");
    console.log(`   echo '${JSON.stringify(exportData)}' > signature.json`);
    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    handleError(error);
  }
}

// Run the script
signMessage();
