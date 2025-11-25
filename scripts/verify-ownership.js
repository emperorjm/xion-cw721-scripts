/**
 * Verify ownership of an NFT token
 * Queries the contract to check who owns a specific token
 */

import {
  connectQueryClient,
  queryContract,
  handleError,
} from "../utils/helpers.js";
import XION_CONFIG from "../utils/config.js";

async function verifyOwnership() {
  try {
    // Configuration - Can be passed as environment variables or command line args
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const TOKEN_ID = process.env.TOKEN_ID || process.argv[2];
    const EXPECTED_OWNER = process.env.EXPECTED_OWNER || process.argv[3]; // Optional

    console.log("Verifying NFT Ownership...\n");

    // Validate inputs
    if (!CONTRACT_ADDRESS) {
      console.error("Error: CONTRACT_ADDRESS not set!");
      console.log("   Please set CONTRACT_ADDRESS in your .env file");
      return;
    }

    if (!TOKEN_ID) {
      console.error("Error: TOKEN_ID not provided!");
      console.log("   Usage: npm run verify-ownership <token_id> [expected_owner_address]");
      console.log("   Or set TOKEN_ID in .env file");
      return;
    }

    // Connect query client (read-only, no wallet needed)
    console.log("Connecting to XION network...");
    const client = await connectQueryClient();
    console.log(`Connected to ${XION_CONFIG.chainId}\n`);

    console.log("Query Details:");
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Token ID: ${TOKEN_ID}`);

    console.log("\nQuerying NFT ownership...");

    // Query owner of NFT
    const ownerQuery = {
      owner_of: {
        token_id: TOKEN_ID,
      },
    };

    const ownerResult = await queryContract(client, CONTRACT_ADDRESS, ownerQuery);

    console.log("\n" + "=".repeat(80));
    console.log("OWNERSHIP VERIFICATION RESULT");
    console.log("=".repeat(80));
    console.log(`Token ID: ${TOKEN_ID}`);
    console.log(`Owner: ${ownerResult.owner}`);

    if (ownerResult.approvals && ownerResult.approvals.length > 0) {
      console.log(`Approvals: ${ownerResult.approvals.length}`);
      ownerResult.approvals.forEach((approval, i) => {
        console.log(`   ${i + 1}. ${approval.spender} (expires: ${approval.expires})`);
      });
    } else {
      console.log("Approvals: None");
    }

    console.log("=".repeat(80));

    // If expected owner provided, verify match
    if (EXPECTED_OWNER) {
      console.log("\nVerification Check:");
      console.log(`   Expected: ${EXPECTED_OWNER}`);
      console.log(`   Actual: ${ownerResult.owner}`);

      if (ownerResult.owner === EXPECTED_OWNER) {
        console.log("   MATCH - Ownership verified!");
      } else {
        console.log("   MISMATCH - Owner does not match expected address");
      }
    }

    // Query NFT info (metadata)
    console.log("\nFetching NFT metadata...");

    const nftInfoQuery = {
      nft_info: {
        token_id: TOKEN_ID,
      },
    };

    try {
      const nftInfo = await queryContract(client, CONTRACT_ADDRESS, nftInfoQuery);

      console.log("\nNFT Metadata:");
      console.log(`   Token URI: ${nftInfo.token_uri || "Not set"}`);

      if (nftInfo.extension) {
        if (nftInfo.extension.name) {
          console.log(`   Name: ${nftInfo.extension.name}`);
        }
        if (nftInfo.extension.description) {
          console.log(`   Description: ${nftInfo.extension.description}`);
        }
        if (nftInfo.extension.image) {
          console.log(`   Image: ${nftInfo.extension.image}`);
        }

        // Display any other extension fields
        const knownFields = ['name', 'description', 'image'];
        const otherFields = Object.keys(nftInfo.extension).filter(k => !knownFields.includes(k));
        if (otherFields.length > 0) {
          console.log("   Additional metadata:");
          otherFields.forEach(field => {
            console.log(`     ${field}: ${JSON.stringify(nftInfo.extension[field])}`);
          });
        }
      }
    } catch (metadataError) {
      console.log("\nCould not fetch metadata (may not be available)");
    }

    // Query all tokens owned by this owner
    console.log("\nChecking owner's total NFTs...");

    const tokensQuery = {
      tokens: {
        owner: ownerResult.owner,
        limit: 100,
      },
    };

    try {
      const tokensResult = await queryContract(client, CONTRACT_ADDRESS, tokensQuery);
      console.log(`\nTotal NFTs owned by ${ownerResult.owner}: ${tokensResult.tokens.length}`);
      if (tokensResult.tokens.length > 0) {
        console.log(`   Token IDs: ${tokensResult.tokens.join(", ")}`);
      }
    } catch (tokensError) {
      console.log("\nCould not fetch owner's token list");
    }

    console.log("");

    // Disconnect client
    client.disconnect();

  } catch (error) {
    if (error.message && error.message.includes("not found")) {
      console.error("\nError: Token not found!");
      console.log("   The specified token ID does not exist in this contract.");
      console.log("   Please check the token ID and contract address.");
    } else {
      handleError(error);
    }
  }
}

// Run the script
verifyOwnership();
