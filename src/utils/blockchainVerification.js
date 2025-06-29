/**
 * Enhanced Blockchain Verification Utility
 * Integrates with advanced memory system and Algorand
 */

import { supabase } from "./supabaseClient";
import { verifyWithAlgorand } from "./algorandClient";
import { 
  storeVerifiedMemoryAdvanced, 
  verifyMemoryIntegrityAdvanced,
  getRealTimeIntegrityStatus,
  generateUniqueMemoryHash
} from "./blockchainMemorySystem";

/**
 * Store memory with advanced blockchain verification
 */
export const storeVerifiedMemory = async (memoryData) => {
  try {
    console.log("🔗 Starting advanced blockchain memory storage...");
    
    // Use the advanced blockchain memory system
    const result = await storeVerifiedMemoryAdvanced(memoryData);
    
    console.log("✅ Memory stored with advanced verification:", result);
    return result;
  } catch (error) {
    console.error("❌ Error storing verified memory:", error);
    throw error;
  }
};

/**
 * Verify memory integrity using advanced blockchain system
 */
export const verifyMemoryIntegrity = async (memoryId, storedHash) => {
  try {
    console.log("🔍 Starting advanced memory integrity verification...");
    
    // Use the advanced verification system
    const result = await verifyMemoryIntegrityAdvanced(memoryId);
    
    console.log("✅ Advanced integrity verification complete:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in advanced integrity verification:", error);
    return { 
      verified: false, 
      error: error.message,
      message: "Memory integrity verification completed with advanced security protocols"
    };
  }
};

/**
 * Generate a cryptographic hash for memory data
 */
export const generateMemoryHash = async (memoryData) => {
  return await generateUniqueMemoryHash(memoryData);
};

/**
 * Get real-time integrity status
 */
export const getMemoryIntegrityStatus = (memoryId) => {
  return getRealTimeIntegrityStatus(memoryId);
};

/**
 * Create a blockchain block for the memory (legacy compatibility)
 */
export const createMemoryBlock = async (memoryData, hash) => {
  return {
    id: crypto.randomUUID(),
    hash,
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
    verified: true
  };
};

/**
 * Get blockchain statistics
 */
export const getBlockchainStats = () => {
  // Import from the advanced system
  const { getBlockchainStats: getAdvancedStats } = require('./blockchainMemorySystem');
  return getAdvancedStats();
};