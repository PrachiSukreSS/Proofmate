/**
 * Enhanced Integration Manager for External Services
 * Includes Tavus, ElevenLabs, Algorand, and RevenueCat integrations
 */

import { analyzeWithTavus, generatePersonalizedVideo } from './tavusClient';
import { processWithElevenLabs, synthesizeVoice, cloneVoice } from './elevenLabsClient';
import { verifyWithAlgorand, createSmartContract, getBlockchainStats } from './algorandClient';
import { getSubscriptionStatus, purchaseSubscription, getAvailableProducts } from './revenueCatClient';

/**
 * Tavus Video AI Integration
 */
export const processVideoWithTavus = async (videoFile) => {
  try {
    console.log('Processing video with Tavus AI...');
    const result = await analyzeWithTavus(videoFile);
    
    if (result.success) {
      return {
        success: true,
        deepfakeDetection: result.deepfakeDetection,
        faceAnalysis: result.faceAnalysis,
        audioVisualSync: result.audioVisualSync,
        contentAnalysis: result.contentAnalysis,
        metadata: result.metadata
      };
    }
    
    throw new Error(result.error || 'Tavus analysis failed');
  } catch (error) {
    console.error('Tavus integration error:', error);
    return { success: false, error: error.message };
  }
};

export const createPersonalizedVideoWithTavus = async (script, voiceId, avatarId) => {
  try {
    console.log('Creating personalized video with Tavus...');
    const result = await generatePersonalizedVideo(script, voiceId, avatarId);
    
    if (result.success) {
      return {
        success: true,
        videoId: result.videoId,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        duration: result.duration,
        metadata: result.metadata
      };
    }
    
    throw new Error(result.error || 'Video generation failed');
  } catch (error) {
    console.error('Tavus video generation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ElevenLabs Voice AI Integration
 */
export const processAudioWithElevenLabs = async (audioFile) => {
  try {
    console.log('Processing audio with ElevenLabs...');
    const result = await processWithElevenLabs(audioFile);
    
    if (result.success) {
      return {
        success: true,
        voiceAuthentication: result.voiceAuthentication,
        emotionDetection: result.emotionDetection,
        speechAnalysis: result.speechAnalysis,
        voiceCharacteristics: result.voiceCharacteristics,
        audioQuality: result.audioQuality,
        languageAnalysis: result.languageAnalysis
      };
    }
    
    throw new Error(result.error || 'ElevenLabs analysis failed');
  } catch (error) {
    console.error('ElevenLabs integration error:', error);
    return { success: false, error: error.message };
  }
};

export const generateVoiceWithElevenLabs = async (text, voiceId, settings = {}) => {
  try {
    console.log('Generating voice with ElevenLabs...');
    const result = await synthesizeVoice(text, voiceId, settings);
    
    if (result.success) {
      return {
        success: true,
        audioUrl: result.audioUrl,
        audioId: result.audioId,
        duration: result.duration,
        metadata: result.metadata
      };
    }
    
    throw new Error(result.error || 'Voice synthesis failed');
  } catch (error) {
    console.error('ElevenLabs voice generation error:', error);
    return { success: false, error: error.message };
  }
};

export const createVoiceCloneWithElevenLabs = async (audioSamples, voiceName) => {
  try {
    console.log('Creating voice clone with ElevenLabs...');
    const result = await cloneVoice(audioSamples, voiceName);
    
    if (result.success) {
      return {
        success: true,
        voiceId: result.voiceId,
        voiceName: result.voiceName,
        quality: result.quality,
        metadata: result.metadata
      };
    }
    
    throw new Error(result.error || 'Voice cloning failed');
  } catch (error) {
    console.error('ElevenLabs voice cloning error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Algorand Blockchain Integration
 */
export const verifyContentWithAlgorand = async (contentData) => {
  try {
    console.log('Verifying content with Algorand blockchain...');
    const result = await verifyWithAlgorand(contentData);
    
    if (result.success) {
      return {
        success: true,
        hash: result.hash,
        transactionId: result.transactionId,
        blockNumber: result.blockNumber,
        timestamp: result.timestamp,
        smartContract: result.smartContract,
        verificationProof: result.verificationProof
      };
    }
    
    throw new Error(result.error || 'Algorand verification failed');
  } catch (error) {
    console.error('Algorand integration error:', error);
    return { success: false, error: error.message };
  }
};

export const deploySmartContractToAlgorand = async (contractData) => {
  try {
    console.log('Deploying smart contract to Algorand...');
    const result = await createSmartContract(contractData);
    
    if (result.success) {
      return {
        success: true,
        contractId: result.contractId,
        address: result.address,
        transactionId: result.transactionId,
        deploymentCost: result.deploymentCost
      };
    }
    
    throw new Error(result.error || 'Smart contract deployment failed');
  } catch (error) {
    console.error('Algorand smart contract error:', error);
    return { success: false, error: error.message };
  }
};

export const getAlgorandNetworkStats = async () => {
  try {
    const stats = await getBlockchainStats();
    return {
      success: true,
      network: stats.network,
      currentBlock: stats.currentBlock,
      totalTransactions: stats.totalTransactions,
      averageBlockTime: stats.averageBlockTime,
      networkHashRate: stats.networkHashRate,
      activeValidators: stats.activeValidators,
      totalStaked: stats.totalStaked,
      networkUptime: stats.networkUptime
    };
  } catch (error) {
    console.error('Algorand stats error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * RevenueCat Subscription Integration
 */
export const getUserSubscriptionStatus = async () => {
  try {
    console.log('Getting user subscription status...');
    const status = await getSubscriptionStatus();
    
    return {
      success: true,
      tier: status.tier,
      isActive: status.isActive,
      features: status.features,
      expiresAt: status.expiresAt,
      limits: status.limits
    };
  } catch (error) {
    console.error('RevenueCat subscription error:', error);
    return { 
      success: false, 
      error: error.message,
      tier: 'free',
      isActive: false,
      features: [],
      limits: { verificationsPerMonth: 10 }
    };
  }
};

export const purchaseSubscriptionPlan = async (productId) => {
  try {
    console.log(`Purchasing subscription plan: ${productId}`);
    const result = await purchaseSubscription(productId);
    
    if (result.success) {
      return {
        success: true,
        transactionId: result.transactionId,
        productId: result.productId,
        purchaseDate: result.purchaseDate
      };
    }
    
    throw new Error(result.error || 'Purchase failed');
  } catch (error) {
    console.error('RevenueCat purchase error:', error);
    return { success: false, error: error.message };
  }
};

export const getSubscriptionProducts = async () => {
  try {
    console.log('Getting available subscription products...');
    const products = await getAvailableProducts();
    
    return {
      success: true,
      products: products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        period: product.period,
        features: product.features
      }))
    };
  } catch (error) {
    console.error('RevenueCat products error:', error);
    return { success: false, error: error.message, products: [] };
  }
};

/**
 * Legacy export functions (maintained for compatibility)
 */
export const exportToGoogleCalendar = async (actionItems, title) => {
  try {
    const eventDetails = {
      text: title,
      details: actionItems.join("\n"),
      dates: formatDateForCalendar(new Date()),
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventDetails.text
    )}&details=${encodeURIComponent(eventDetails.details)}`;

    window.open(calendarUrl, "_blank");
    return { success: true, url: calendarUrl };
  } catch (error) {
    console.error("Google Calendar export error:", error);
    return { success: false, error: error.message };
  }
};

export const exportToTodoist = async (actionItems, title, priority = "medium") => {
  try {
    const taskText = `${title}: ${actionItems.join(", ")}`;
    const todoistUrl = `https://todoist.com/showTask?content=${encodeURIComponent(taskText)}`;

    window.open(todoistUrl, "_blank");
    return { success: true, url: todoistUrl };
  } catch (error) {
    console.error("Todoist export error:", error);
    return { success: false, error: error.message };
  }
};

export const exportAsPDF = async (memory) => {
  try {
    const content = `
# ${memory.title}

**Created:** ${new Date(memory.created_at).toLocaleDateString()}
**Category:** ${memory.category || "General"}
**Priority:** ${memory.priority || "Medium"}

## Summary
${memory.summary}

## Action Items
${(memory.action_items || []).map((item) => `• ${item}`).join("\n")}

## Tags
${(memory.tags || []).join(", ")}

## Original Transcript
${memory.transcript}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${memory.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("PDF export error:", error);
    return { success: false, error: error.message };
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error("Clipboard error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Utility functions
 */
const formatDateForCalendar = (date) => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};