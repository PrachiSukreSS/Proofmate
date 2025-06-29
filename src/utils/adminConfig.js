// Admin configuration
export const ADMIN_USERS = [
  'prachisukre2005@gmail.com'
];

export const isAdmin = (email) => {
  return ADMIN_USERS.includes(email?.toLowerCase());
};

export const getAdminSubscriptionStatus = () => {
  return {
    tier: 'premium',
    isActive: true,
    features: [
      'Unlimited verifications',
      'Advanced AI analysis',
      'Tavus video processing',
      'ElevenLabs voice synthesis',
      'Algorand blockchain verification',
      'Priority support',
      'Analytics dashboard',
      'API access',
      'Custom integrations',
      'Admin privileges'
    ],
    expiresAt: null,
    limits: {
      verificationsPerMonth: -1,
      fileSize: 1024 * 1024 * 1024 * 10, // 10GB
      features: ['all_features', 'admin_access']
    }
  };
};