/**
 * Create a new XION wallet
 * Generates a new mnemonic phrase and derives the public/private key pair
 */

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import XION_CONFIG from "../utils/config.js";
import { handleError } from "../utils/helpers.js";

async function createWallet() {
  try {
    console.log("Creating new XION wallet...\n");

    // Generate a new wallet with 24-word mnemonic
    const wallet = await DirectSecp256k1HdWallet.generate(24, {
      prefix: XION_CONFIG.addressPrefix,
    });

    // Get the mnemonic
    const mnemonic = wallet.mnemonic;

    // Get account info
    const accounts = await wallet.getAccounts();
    const account = accounts[0];

    // Display results
    console.log("Wallet created successfully!\n");
    console.log("=" .repeat(80));
    console.log("MNEMONIC PHRASE (Keep this secure and private!):");
    console.log("=" .repeat(80));
    console.log(mnemonic);
    console.log("=" .repeat(80));
    console.log("\nWALLET INFORMATION:");
    console.log(`   Address: ${account.address}`);
    console.log(`   Algorithm: ${account.algo}`);
    console.log(`   Public Key: ${Buffer.from(account.pubkey).toString("hex")}`);
    console.log("\nIMPORTANT SECURITY NOTES:");
    console.log("   1. Store your mnemonic phrase in a secure location");
    console.log("   2. Never share your mnemonic with anyone");
    console.log("   3. Add it to your .env file as MNEMONIC=\"your mnemonic phrase\"");
    console.log("   4. Add .env to .gitignore to prevent accidental commits");
    console.log("\nFUNDING YOUR WALLET:");
    console.log(`   Network: ${XION_CONFIG.chainName}`);
    console.log(`   Chain ID: ${XION_CONFIG.chainId}`);
    console.log(`   To get testnet tokens:`);
    console.log(`   1. Join Discord: ${XION_CONFIG.faucet.discord}`);
    console.log(`   2. Get @Builder role`);
    console.log(`   3. Use command: ${XION_CONFIG.faucet.command.replace("[your-xion-address]", account.address)}`);
    console.log("");

  } catch (error) {
    handleError(error);
  }
}

// Run the script
createWallet();
