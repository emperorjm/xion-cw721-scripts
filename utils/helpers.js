/**
 * Utility functions for XION blockchain operations
 */

import { SigningStargateClient, StargateClient, GasPrice } from "@cosmjs/stargate";
import { SigningCosmWasmClient, CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { toUtf8 } from "@cosmjs/encoding";
import dotenv from "dotenv";
import XION_CONFIG from "./config.js";

// Load environment variables
dotenv.config();

/**
 * Create a wallet from a mnemonic phrase
 * @param {string} mnemonic - BIP39 mnemonic phrase
 * @returns {Promise<DirectSecp256k1HdWallet>} Wallet instance
 */
export async function createWalletFromMnemonic(mnemonic) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: XION_CONFIG.addressPrefix,
  });
  return wallet;
}

/**
 * Load wallet from environment variable
 * @returns {Promise<DirectSecp256k1HdWallet>} Wallet instance
 */
export async function loadWallet() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error("MNEMONIC not found in environment variables. Please set it in .env file");
  }
  return createWalletFromMnemonic(mnemonic);
}

/**
 * Get the first account from a wallet
 * @param {DirectSecp256k1HdWallet} wallet - Wallet instance
 * @returns {Promise<object>} Account with address, algo, and pubkey
 */
export async function getFirstAccount(wallet) {
  const accounts = await wallet.getAccounts();
  return accounts[0];
}

/**
 * Connect to XION network (read-only client for CosmWasm operations)
 * @returns {Promise<CosmWasmClient>} Query client
 */
export async function connectQueryClient() {
  const client = await CosmWasmClient.connect(XION_CONFIG.rpcEndpoint);
  return client;
}

/**
 * Connect to XION network with signing capabilities for CosmWasm operations
 * @param {DirectSecp256k1HdWallet} wallet - Wallet instance
 * @returns {Promise<SigningCosmWasmClient>} Signing client
 */
export async function connectSigningClient(wallet) {
  const client = await SigningCosmWasmClient.connectWithSigner(
    XION_CONFIG.rpcEndpoint,
    wallet,
    {
      gasPrice: GasPrice.fromString(XION_CONFIG.gasPrice),
    }
  );
  return client;
}

/**
 * Query a smart contract
 * @param {CosmWasmClient} client - Query client
 * @param {string} contractAddress - Contract address
 * @param {object} queryMsg - Query message object
 * @returns {Promise<any>} Query result
 */
export async function queryContract(client, contractAddress, queryMsg) {
  const result = await client.queryContractSmart(contractAddress, queryMsg);
  return result;
}

/**
 * Execute a smart contract transaction
 * @param {SigningCosmWasmClient} client - Signing client
 * @param {string} senderAddress - Sender's address
 * @param {string} contractAddress - Contract address
 * @param {object} executeMsg - Execute message object
 * @param {string} memo - Transaction memo (optional)
 * @param {Array} funds - Funds to send with transaction (optional)
 * @returns {Promise<object>} Transaction result
 */
export async function executeContract(
  client,
  senderAddress,
  contractAddress,
  executeMsg,
  memo = "",
  funds = []
) {
  const result = await client.execute(
    senderAddress,
    contractAddress,
    executeMsg,
    "auto",
    memo,
    funds
  );
  return result;
}

/**
 * Instantiate a smart contract from existing code
 * @param {SigningCosmWasmClient} client - Signing client
 * @param {string} senderAddress - Sender's address
 * @param {number} codeId - Code ID of deployed contract
 * @param {object} instantiateMsg - Instantiation message
 * @param {string} label - Human-readable label for the contract
 * @param {string} admin - Admin address (optional, pass empty string for no admin)
 * @returns {Promise<object>} Instantiation result with contract address
 */
export async function instantiateContract(
  client,
  senderAddress,
  codeId,
  instantiateMsg,
  label,
  admin = ""
) {
  const result = await client.instantiate(
    senderAddress,
    codeId,
    instantiateMsg,
    label,
    "auto",
    {
      admin: admin || undefined,
    }
  );
  return result;
}

/**
 * Get transaction by hash
 * @param {CosmWasmClient} client - Query client
 * @param {string} txHash - Transaction hash
 * @returns {Promise<object|null>} Transaction data or null if not found
 */
export async function getTransaction(client, txHash) {
  const tx = await client.getTx(txHash);
  return tx;
}

/**
 * Wait for transaction to be indexed
 * @param {CosmWasmClient} client - Query client
 * @param {string} txHash - Transaction hash
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} delayMs - Delay between attempts in milliseconds
 * @returns {Promise<object>} Transaction data
 */
export async function waitForTransaction(
  client,
  txHash,
  maxAttempts = 20,
  delayMs = 1000
) {
  for (let i = 0; i < maxAttempts; i++) {
    const tx = await getTransaction(client, txHash);
    if (tx) {
      return tx;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`Transaction ${txHash} not found after ${maxAttempts} attempts`);
}

/**
 * Format XION amount from base unit (uxion) to display unit (XION)
 * @param {string|number} amount - Amount in uxion
 * @returns {string} Amount in XION
 */
export function formatXionAmount(amount) {
  const numAmount = typeof amount === "string" ? parseInt(amount) : amount;
  return (numAmount / Math.pow(10, XION_CONFIG.decimals)).toFixed(6);
}

/**
 * Parse XION amount from display unit (XION) to base unit (uxion)
 * @param {string|number} amount - Amount in XION
 * @returns {string} Amount in uxion
 */
export function parseXionAmount(amount) {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return Math.floor(numAmount * Math.pow(10, XION_CONFIG.decimals)).toString();
}

/**
 * Get account balance
 * @param {CosmWasmClient} client - Query client
 * @param {string} address - Account address
 * @returns {Promise<object>} Balance information
 */
export async function getBalance(client, address) {
  const balance = await client.getBalance(address, XION_CONFIG.denom);
  return balance;
}

/**
 * Simulate a transaction to estimate gas
 * @param {SigningCosmWasmClient} client - Signing client
 * @param {string} senderAddress - Sender's address
 * @param {Array} messages - Array of messages to simulate
 * @returns {Promise<number>} Estimated gas needed
 */
export async function simulateTransaction(client, senderAddress, messages) {
  const gasEstimate = await client.simulate(senderAddress, messages, "");
  return Math.ceil(gasEstimate * XION_CONFIG.gasAdjustment);
}

/**
 * Calculate transaction fee
 * @param {number} gasAmount - Gas amount
 * @returns {object} Fee object with amount and gas
 */
export function calculateFee(gasAmount) {
  const gasPrice = parseFloat(XION_CONFIG.gasPrice);
  const feeAmount = Math.ceil(gasAmount * gasPrice);

  return {
    amount: [{ denom: XION_CONFIG.denom, amount: feeAmount.toString() }],
    gas: gasAmount.toString(),
  };
}

/**
 * Pretty print transaction result
 * @param {object} result - Transaction result
 */
export function printTxResult(result) {
  console.log("\nTransaction successful!");
  console.log(`Transaction Hash: ${result.transactionHash}`);
  console.log(`Gas Used: ${result.gasUsed}`);
  console.log(`Gas Wanted: ${result.gasWanted}`);
  console.log(`Height: ${result.height}`);

  if (result.logs && result.logs.length > 0) {
    console.log("\nEvents:");
    result.logs.forEach((log, i) => {
      log.events.forEach((event) => {
        console.log(`  ${event.type}:`);
        event.attributes.forEach((attr) => {
          console.log(`    ${attr.key}: ${attr.value}`);
        });
      });
    });
  }
}

/**
 * Handle errors gracefully
 * @param {Error} error - Error object
 */
export function handleError(error) {
  console.error("\nError occurred:");
  console.error(error.message);

  if (error.stack) {
    console.error("\nStack trace:");
    console.error(error.stack);
  }

  process.exit(1);
}
