import axios from "axios";

const PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
const SECRET_KEY = import.meta.env.VITE_REVENUECAT_SECRET_KEY;
const BASE_URL = "https://api.revenuecat.com/v1";

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${SECRET_KEY || PUBLIC_KEY}`
};

let isInitialized = false;

export const initializeRevenueCat = async () => {
  try {
    console.log("💰 Initializing RevenueCat...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    isInitialized = true;
    console.log("✅ RevenueCat Initialized");
    return { success: true };
  } catch (error) {
    console.error("❌ RevenueCat initialization error:", error);
    return { success: false, error: error.message };
  }
};

export const getSubscriptionStatus = async (userId = null) => {
  if (!isInitialized) {
    await initializeRevenueCat();
  }

  try {
    if (!PUBLIC_KEY && !SECRET_KEY) {
      console.warn("RevenueCat API keys not configured, using mock data");
      return getMockSubscriptionStatus();
    }

    const appUserId = userId || `user_${Date.now()}`;
    
    const response = await axios.get(`${BASE_URL}/subscribers/${appUserId}`, {
      headers
    });

    const subscriber = response.data.subscriber;
    const entitlements = subscriber.entitlements || {};
    
    // Check for active entitlements
    const activeEntitlement = Object.values(entitlements).find(
      entitlement => entitlement.expires_date === null || new Date(entitlement.expires_date) > new Date()
    );

    if (activeEntitlement) {
      return {
        tier: activeEntitlement.product_identifier || 'premium',
        isActive: true,
        features: getPremiumFeatures(),
        expiresAt: activeEntitlement.expires_date,
        limits: getPremiumLimits()
      };
    } else {
      return getFreeTierStatus();
    }
    
  } catch (error) {
    console.error("❌ Error fetching subscription status:", error);
    return getFreeTierStatus();
  }
};

export const getAvailableProducts = async () => {
  try {
    if (!PUBLIC_KEY && !SECRET_KEY) {
      console.warn("RevenueCat API keys not configured, using mock products");
      return getMockProducts();
    }

    const response = await axios.get(`${BASE_URL}/offerings`, {
      headers
    });

    const offerings = response.data.offerings || {};
    const currentOffering = offerings.current || offerings[Object.keys(offerings)[0]];
    
    if (currentOffering && currentOffering.packages) {
      return currentOffering.packages.map(pkg => ({
        id: pkg.identifier,
        title: pkg.package_type === 'monthly' ? 'Premium Monthly' : 'Premium Yearly',
        description: pkg.package_type === 'monthly' ? 
          'Perfect for individuals and small teams' : 
          'Save 20% with annual billing',
        price: pkg.product.price_string || (pkg.package_type === 'monthly' ? '$29.99' : '$299.99'),
        period: pkg.package_type === 'monthly' ? 'month' : 'year',
        features: getPremiumFeatures()
      }));
    }

    return getMockProducts();
    
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return getMockProducts();
  }
};

export const purchaseSubscription = async (productId) => {
  try {
    console.log(`💳 Purchasing subscription: ${productId}`);
    
    // In a real app, this would trigger the platform-specific purchase flow
    // For web, you'd typically redirect to Stripe or another payment processor
    
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.1; // 90% success rate for demo
    
    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        productId,
        purchaseDate: new Date().toISOString()
      };
    } else {
      throw new Error('Purchase failed - payment declined');
    }
    
  } catch (error) {
    console.error("❌ Purchase error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const restorePurchases = async (userId = null) => {
  try {
    console.log("🔄 Restoring purchases...");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return await getSubscriptionStatus(userId);
    
  } catch (error) {
    console.error("❌ Restore purchases error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const cancelSubscription = async (userId) => {
  try {
    console.log("❌ Cancelling subscription...");
    
    if (!PUBLIC_KEY && !SECRET_KEY) {
      console.warn("RevenueCat API keys not configured, using mock cancellation");
      return { success: true, message: "Subscription cancelled successfully" };
    }

    // In a real implementation, this would call the RevenueCat API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: "Subscription cancelled successfully"
    };
    
  } catch (error) {
    console.error("❌ Cancellation error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper functions
const getMockSubscriptionStatus = () => {
  const tiers = ['free', 'premium'];
  const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
  
  if (randomTier === 'premium') {
    return {
      tier: 'premium',
      isActive: true,
      features: getPremiumFeatures(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      limits: getPremiumLimits()
    };
  } else {
    return getFreeTierStatus();
  }
};

const getFreeTierStatus = () => {
  return {
    tier: 'free',
    isActive: true,
    features: ['Basic verification', '10 verifications/month', 'Standard support'],
    expiresAt: null,
    limits: {
      verificationsPerMonth: 10,
      fileSize: 10 * 1024 * 1024, // 10MB
      features: ['basic_verification']
    }
  };
};

const getPremiumFeatures = () => {
  return [
    'Unlimited verifications',
    'Advanced AI analysis',
    'Tavus video processing',
    'ElevenLabs voice synthesis',
    'Algorand blockchain verification',
    'Priority support',
    'Analytics dashboard',
    'API access',
    'Custom integrations'
  ];
};

const getPremiumLimits = () => {
  return {
    verificationsPerMonth: -1, // Unlimited
    fileSize: 1024 * 1024 * 1024, // 1GB
    features: [
      'basic_verification',
      'advanced_analytics',
      'priority_support',
      'api_access',
      'custom_integrations',
      'tavus_video_analysis',
      'elevenlabs_voice_synthesis',
      'algorand_blockchain'
    ]
  };
};

const getMockProducts = () => {
  return [
    {
      id: 'premium_monthly',
      title: 'Premium Monthly',
      description: 'Perfect for individuals and small teams',
      price: '$29.99',
      period: 'month',
      features: getPremiumFeatures()
    },
    {
      id: 'premium_yearly',
      title: 'Premium Yearly',
      description: 'Save 20% with annual billing',
      price: '$299.99',
      period: 'year',
      features: getPremiumFeatures()
    }
  ];
};