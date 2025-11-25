/**
 * Sign an arbitrary message with a private key
 * Uses the wallet to sign a message for verification/authentication purposes
 */

import { sha256 } from "@cosmjs/crypto";
import { toUtf8, toBase64, fromBase64 } from "@cosmjs/encoding";
import { serializeSignDoc, makeSignDoc } from "@cosmjs/amino";
import {
  loadWallet,
  getFirstAccount,
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

    // Method 1: Sign arbitrary data (recommended for authentication)
    const messageBytes = toUtf8(MESSAGE);
    const messageHash = sha256(messageBytes);

    // Create a sign doc for the message (Amino format)
    const signDoc = makeSignDoc(
      [
        {
          type: "sign/MsgSignData",
          value: {
            signer: account.address,
            data: toBase64(messageBytes),
          },
        },
      ],
      {
        amount: [],
        gas: "0",
      },
      XION_CONFIG.chainId,
      "",
      0,
      0
    );

    // Sign the message
    const signDocBytes = toUtf8(JSON.stringify(signDoc));
    const signature = await wallet.signAmino(account.address, signDoc);

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

    // Method 2: Direct message signing (for raw data)
    console.log("\nAlternative: Direct Message Signing");
    console.log("   (Useful for raw data authentication)\n");

    const directSignData = {
      message: MESSAGE,
      signer: account.address,
      timestamp: new Date().toISOString(),
    };

    const directSignDoc = makeSignDoc(
      [
        {
          type: "sign/MsgSignData",
          value: directSignData,
        },
      ],
      {
        amount: [],
        gas: "0",
      },
      XION_CONFIG.chainId,
      "",
      0,
      0
    );

    const directSignature = await wallet.signAmino(account.address, directSignDoc);

    console.log("Sign Data:");
    console.log(JSON.stringify(directSignData, null, 2));
    console.log(`\nSignature: ${directSignature.signature.signature}`);

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

  } catch (error) {
    handleError(error);
  }
}

// Run the script
signMessage();
