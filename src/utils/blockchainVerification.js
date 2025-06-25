/**
 * Blockchain Verification Utility
 * Simulates blockchain hash verification for memory integrity
 */

import { supabase } from './supabaseClient';

// Simulate blockchain network
const MOCK_BLOCKCHAIN = {
  network: 'ProofMate-Chain',
  version: '1.0.0',
  blocks: []
};

/**
 * Generate a cryptographic hash for memory data
 */
export const generateMemoryHash = async (memoryData) => {
  const { title, transcript, summary, emotion, keywords, timestamp } = memoryData;
  
  // Create a deterministic string from memory data
  const dataString = JSON.stringify({
    title: title || '',
    transcript: transcript || '',
    summary: summary || '',
    emotion: emotion || '',
    keywords: keywords || [],
    timestamp: timestamp || new Date().toISOString()
  });

  // Generate hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Create a blockchain block for the memory
 */
export const createMemoryBlock = async (memoryData, hash) => {
  const block = {
    id: crypto.randomUUID(),
    hash,
    previousHash: MOCK_BLOCKCHAIN.blocks.length > 0 
      ? MOCK_BLOCKCHAIN.blocks[MOCK_BLOCKCHAIN.blocks.length - 1].hash 
      : '0',
    timestamp: new Date().toISOString(),
    data: {
      memoryId: memoryData.id,
      title: memoryData.title,
      userId: memoryData.user_id,
      createdAt: memoryData.created_at
    },
    nonce: Math.floor(Math.random() * 1000000)
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
      .from('memories')
      .select('*')
      .eq('id', memoryId)
      .single();

    if (error || !memory) {
      return { verified: false, error: 'Memory not found' };
    }

    // Regenerate hash from current data
    const currentHash = await generateMemoryHash(memory);
    
    // Compare hashes
    const verified = currentHash === storedHash;
    
    return {
      verified,
      currentHash,
      storedHash,
      message: verified ? 'Memory integrity verified' : 'Memory has been tampered with'
    };
  } catch (error) {
    return { verified: false, error: error.message };
  }
};

/**
 * Store memory with blockchain verification
 */
export const storeVerifiedMemory = async (memoryData) => {
  try {
    // Generate blockchain hash
    const hash = await generateMemoryHash(memoryData);
    
    // Create blockchain block
    const block = await createMemoryBlock(memoryData, hash);
    
    // Store in database with hash
    const { data, error } = await supabase
      .from('memories')
      .insert([{
        ...memoryData,
        blockchain_hash: hash,
        verification_status: 'verified'
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      memory: data,
      block,
      hash,
      verified: true
    };
  } catch (error) {
    console.error('Error storing verified memory:', error);
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
    lastBlock: MOCK_BLOCKCHAIN.blocks[MOCK_BLOCKCHAIN.blocks.length - 1] || null
  };
};