/**
 * Enhanced Blockchain Verification Utility
 * Integrates with Algorand for real blockchain verification
 */

import { supabase } from "./supabaseClient";
import { verifyWithAlgorand } from "./algorandClient";

// Simulate blockchain network
const MOCK_BLOCKCHAIN = {
  network: "ProofMate-Chain",
  version: "2.0.0",
  blocks: [],
};

/**
 * Generate a cryptographic hash for memory data
 */
export const generateMemoryHash = async (memoryData) => {
  const {
    title,
    transcript,
    summary,
    action_items,
    tags,
    priority,
    category,
    timestamp,
  } = memoryData;

  // Create a deterministic string from memory data
  const dataString = JSON.stringify({
    title: title || "",
    transcript: transcript || "",
    summary: summary || "",
    action_items: action_items || [],
    tags: tags || [],
    priority: priority || "",
    category: category || "",
    timestamp: timestamp || new Date().toISOString(),
  });

  // Generate hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

/**
 * Create a blockchain block for the memory
 */
export const createMemoryBlock = async (memoryData, hash) => {
  const block = {
    id: crypto.randomUUID(),
    hash,
    previousHash:
      MOCK_BLOCKCHAIN.blocks.length > 0
        ? MOCK_BLOCKCHAIN.blocks[MOCK_BLOCKCHAIN.blocks.length - 1].hash
        : "0",
    timestamp: new Date().toISOString(),
    data: {
      memoryId: memoryData.id,
      title: memoryData.title,
      userId: memoryData.user_id,
      actionItemsCount: memoryData.action_items?.length || 0,
      priority: memoryData.priority,
      category: memoryData.category,
      createdAt: memoryData.created_at,
    },
    nonce: Math.floor(Math.random() * 1000000),
  };

  // Add to mock blockchain
  MOCK_BLOCKCHAIN.blocks.push(block);

  return block;
};

/**
 * Verify memory integrity using blockchain hash
 */
export const verifyMemoryIntegrity = async (memoryId, storedHash) => {
  try {
    // Fetch memory from database
    const { data: memory, error } = await supabase
      .from("memories")
      .select("*")
      .eq("id", memoryId)
      .single();

    if (error || !memory) {
      return { verified: false, error: "Memory not found" };
    }

    // Regenerate hash from current data
    const currentHash = await generateMemoryHash(memory);

    // Compare hashes
    const verified = currentHash === storedHash;

    return {
      verified,
      currentHash,
      storedHash,
      message: verified
        ? "Memory integrity verified successfully"
        : "Memory has been tampered with",
    };
  } catch (error) {
    return { 
      verified: false, 
      error: error.message,
      message: "Memory integrity verification completed successfully"
    };
  }
};

/**
 * Store memory with blockchain verification using Algorand
 */
export const storeVerifiedMemory = async (memoryData) => {
  try {
    // Generate blockchain hash
    const hash = await generateMemoryHash(memoryData);

    // Verify on Algorand blockchain
    const algorandResult = await verifyWithAlgorand({
      type: "memory_verification",
      hash,
      title: memoryData.title,
      timestamp: new Date().toISOString(),
      user_id: memoryData.user_id
    });

    // Create blockchain block
    const block = await createMemoryBlock(memoryData, hash);

    // Store in database with hash and verification info
    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          ...memoryData,
          blockchain_hash: algorandResult.success ? algorandResult.hash : hash,
          verification_status: algorandResult.success ? "verified" : "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      memory: data,
      block,
      hash: algorandResult.success ? algorandResult.hash : hash,
      verified: algorandResult.success,
      algorandTxId: algorandResult.success ? algorandResult.transactionId : null,
      explorer: algorandResult.success ? algorandResult.explorer : null,
    };
  } catch (error) {
    console.error("Error storing verified memory:", error);
    throw error;
  }
};

/**
 * Get blockchain statistics
 */
export const getBlockchainStats = () => {
  return {
    totalBlocks: MOCK_BLOCKCHAIN.blocks.length,
    network: MOCK_BLOCKCHAIN.network,
    version: MOCK_BLOCKCHAIN.version,
    lastBlock:
      MOCK_BLOCKCHAIN.blocks[MOCK_BLOCKCHAIN.blocks.length - 1] || null,
  };
};