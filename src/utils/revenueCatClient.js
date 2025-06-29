const PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
const BASE_URL = "https://api.revenuecat.com/v1";
const OFFERING_ID = import.meta.env.VITE_REVENUECAT_OFFERING_ID;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${PUBLIC_KEY}`
};

let isInitialized = false;

export const initializeRevenueCat = async () => {
  try {
    console.log("🔄 Initializing RevenueCat...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    isInitialized = true;
    console.log("✅ RevenueCat Initialized");
    return { success: true };
  } catch (error) {
    console.error("❌ Initialization Error:", error);
    return { success: false, error: error.message };
  }
};

export const getAvailableProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/offerings`, { headers });
    const data = await res.json();
    const current = data?.offerings?.find(o => o.identifier === OFFERING_ID);
    return current?.packages || [];
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return [];
  }
};

export const getSubscriptionStatus = async (appUserID) => {
  try {
    const res = await fetch(`${BASE_URL}/subscribers/${appUserID}`, { headers });
    const data = await res.json();
    const entitlements = data?.subscriber?.entitlements || {};

    const active = Object.values(entitlements).find(e => e?.expires_date === null || new Date(e.expires_date) > new Date());

    return {
      tier: active?.product_identifier || 'free',
      isActive: !!active,
      expiresAt: active?.expires_date || null
    };
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    return { tier: 'free', isActive: false };
  }
};

export const purchaseSubscription = async (productId) => {
  console.warn("⚠️ RevenueCat purchases must be handled via client-side SDK (iOS/Android/Web)!");
  return { success: false, error: "Use the RevenueCat client SDK to complete purchases." };
};

export const restorePurchases = async (appUserID) => {
  return await getSubscriptionStatus(appUserID);
};
