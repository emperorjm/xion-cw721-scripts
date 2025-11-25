/**
 * Mint a new NFT token
 * Creates a new NFT with specified token ID, owner, and metadata
 * Supports both on-chain and off-chain (IPFS) metadata storage
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

async function mintToken() {
  try {
    // Configuration - Can be passed as environment variables or command line args
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const TOKEN_ID = process.env.TOKEN_ID || process.argv[2] || "1";
    const OWNER_ADDRESS = process.env.OWNER_ADDRESS || process.argv[3]; // Optional, defaults to minter
    const TOKEN_URI = process.env.TOKEN_URI || process.argv[4] || "ipfs://QmExample...";
    const TOKEN_NAME = process.env.TOKEN_NAME || "NFT #" + TOKEN_ID;
    const TOKEN_DESCRIPTION = process.env.TOKEN_DESCRIPTION || "An NFT from my collection";
    const TOKEN_IMAGE = process.env.TOKEN_IMAGE || TOKEN_URI;

    // Metadata storage mode: "onchain" or "offchain" (default: onchain)
    const METADATA_STORAGE = (process.env.METADATA_STORAGE || "onchain").toLowerCase();

    // Additional metadata attributes (for on-chain storage)
    const TOKEN_ATTRIBUTES = process.env.TOKEN_ATTRIBUTES; // JSON string of attributes

    console.log("Minting new NFT...\n");

    // Validate contract address
    if (!CONTRACT_ADDRESS) {
      console.error("Error: CONTRACT_ADDRESS not set!");
      console.log("   Please set CONTRACT_ADDRESS in your .env file");
      console.log("   Or run: export CONTRACT_ADDRESS=xion1...");
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

    // Determine owner (defaults to minter if not specified)
    const ownerAddress = OWNER_ADDRESS || account.address;

    // Prepare extension based on storage mode
    let extension;
    let storageInfo;

    if (METADATA_STORAGE === "onchain") {
      // On-chain storage: Store full metadata in extension
      extension = {
        name: TOKEN_NAME,
        description: TOKEN_DESCRIPTION,
        image: TOKEN_IMAGE,
      };

      // Add attributes if provided
      if (TOKEN_ATTRIBUTES) {
        try {
          extension.attributes = JSON.parse(TOKEN_ATTRIBUTES);
        } catch (e) {
          console.log("Warning: Could not parse TOKEN_ATTRIBUTES JSON, skipping attributes");
        }
      }

      // Add any other metadata fields
      if (process.env.TOKEN_ANIMATION_URL) {
        extension.animation_url = process.env.TOKEN_ANIMATION_URL;
      }
      if (process.env.TOKEN_EXTERNAL_URL) {
        extension.external_url = process.env.TOKEN_EXTERNAL_URL;
      }
      if (process.env.TOKEN_BACKGROUND_COLOR) {
        extension.background_color = process.env.TOKEN_BACKGROUND_COLOR;
      }

      storageInfo = "ON-CHAIN (Full metadata stored on blockchain)";
    } else {
      // Off-chain storage: Metadata stored on IPFS, only reference on-chain
      extension = {
        // Store minimal data on-chain for off-chain metadata
        image: TOKEN_IMAGE, // Optional: can be in IPFS metadata instead
      };
      storageInfo = "OFF-CHAIN (Metadata stored on IPFS: " + TOKEN_URI + ")";
    }

    // Prepare mint message
    const mintMsg = {
      mint: {
        token_id: TOKEN_ID,
        owner: ownerAddress,
        token_uri: TOKEN_URI,
        extension: extension,
      },
    };

    console.log("NFT Details:");
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Token ID: ${TOKEN_ID}`);
    console.log(`   Owner: ${ownerAddress}`);
    console.log(`   Storage Mode: ${METADATA_STORAGE.toUpperCase()}`);
    console.log(`   ${storageInfo}`);
    if (METADATA_STORAGE === "onchain") {
      console.log(`   Name: ${TOKEN_NAME}`);
      console.log(`   Description: ${TOKEN_DESCRIPTION}`);
      console.log(`   Image: ${TOKEN_IMAGE}`);
      if (extension.attributes) {
        console.log(`   Attributes: ${JSON.stringify(extension.attributes)}`);
      }
    }
    console.log(`   Token URI: ${TOKEN_URI}`);

    console.log("\nMinting NFT...");

    // Execute mint transaction
    const result = await executeContract(
      client,
      account.address,
      CONTRACT_ADDRESS,
      mintMsg,
      `Minted NFT #${TOKEN_ID}`
    );

    console.log("\n" + "=".repeat(80));
    console.log("NFT MINTED SUCCESSFULLY!");
    console.log("=".repeat(80));
    console.log(`Token ID: ${TOKEN_ID}`);
    console.log(`Owner: ${ownerAddress}`);
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`Storage: ${METADATA_STORAGE.toUpperCase()}`);
    console.log(`Explorer: https://www.mintscan.io/xion-testnet/tx/${result.transactionHash}`);
    console.log("=".repeat(80));

    // Print transaction details
    printTxResult(result);

    console.log("\nMETADATA STORAGE:");
    if (METADATA_STORAGE === "onchain") {
      console.log("   All metadata is stored ON-CHAIN in the contract");
      console.log("   Metadata can be queried directly from the contract");
      console.log("   No external dependencies (IPFS not required)");
    } else {
      console.log("   Metadata is stored OFF-CHAIN on IPFS");
      console.log("   Token URI: " + TOKEN_URI);
      console.log("   Contract stores only the IPFS reference");
      console.log("   Wallets/apps will fetch metadata from IPFS");
    }

    console.log("\nNEXT STEPS:");
    console.log("   1. Use verify-ownership.js to verify the NFT owner");
    console.log("   2. Use transfer-nft.js to transfer the NFT to another address");
    console.log("   3. Query NFT metadata using the contract address and token ID");
    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    handleError(error);
  }
}

// Run the script
mintToken();
