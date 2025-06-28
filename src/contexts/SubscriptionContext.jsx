import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeRevenueCat, getSubscriptionStatus } from '../utils/revenueCatClient';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState({
    tier: 'free',
    isActive: false,
    features: [],
    expiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSubscription = async () => {
      try {
        await initializeRevenueCat();
        const status = await getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        console.error('Subscription initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSubscription();
  }, []);

  const updateSubscription = (newSubscription) => {
    setSubscription(newSubscription);
  };

  return (
    <SubscriptionContext.Provider value={{ 
      subscription, 
      updateSubscription, 
      isLoading 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};