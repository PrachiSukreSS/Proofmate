import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Zap, Shield, Cloud, Headphones, Star, Video, Mic, Brain, Blocks as Blockchain, CreditCard, Users, Globe, Award } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { getSubscriptionStatus, getAvailableProducts, purchaseSubscription } from "../utils/revenueCatClient";

const PremiumPage = ({ user }) => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [subscription, products] = await Promise.all([
        getSubscriptionStatus(user.id),
        getAvailableProducts()
      ]);
      
      setCurrentSubscription(subscription);
      setAvailableProducts(products);
    } catch (error) {
      console.error("Error loading subscription data:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (productId) => {
    // Redirect to payment page
    navigate('/payment', { state: { productId, plan: selectedPlan } });
  };

  const features = {
    free: [
      "10 recordings per month",
      "Basic audio quality",
      "5 minutes max per recording",
      "Standard storage (100MB)",
      "Basic timeline view",
    ],
    premium: [
      "Unlimited recordings",
      "Crystal clear HD audio",
      "Unlimited recording length",
      "Unlimited cloud storage",
      "Advanced timeline with search",
      "AI-powered transcription",
      "Tavus video analysis",
      "ElevenLabs voice processing",
      "Algorand blockchain verification",
      "RevenueCat subscription management",
      "Export to multiple formats",
      "Priority customer support",
      "Advanced analytics",
      "API access",
    ],
  };

  const premiumFeatures = [
    {
      icon: Video,
      title: "Tavus Video Analysis",
      description: "Advanced deepfake detection and video authenticity verification",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Mic,
      title: "ElevenLabs Voice AI",
      description: "Professional voice synthesis and audio processing",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Blockchain,
      title: "Algorand Blockchain",
      description: "Immutable proof of authenticity with blockchain verification",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Brain,
      title: "Advanced AI Processing",
      description: "State-of-the-art AI for content analysis and insights",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and secure cloud storage",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Cloud,
      title: "Unlimited Storage",
      description: "Never worry about running out of space for recordings",
      color: "from-indigo-500 to-indigo-600"
    },
  ];

  const pricing = {
    monthly: { price: 29.99, label: "/month" },
    yearly: { price: 299.99, label: "/year", save: "Save 17%" },
  };

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Recordings Processed", value: "2M+", icon: Mic },
    { label: "Countries", value: "120+", icon: Globe },
    { label: "Accuracy Rate", value: "99.7%", icon: Award }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-3">
            <Crown className="h-12 w-12 text-amber-500" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              ProofMate Premium
            </h1>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock the full power of AI-driven content verification with advanced features from industry leaders
          </p>
          
          {currentSubscription?.isActive && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Current Plan: {currentSubscription.tier}</span>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full">
                    <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Premium Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Powered by Industry Leaders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          
          {/* Pricing Toggle */}
          <div className="inline-flex bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPlan === "monthly"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
                selectedPlan === "yearly"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Yearly
              {selectedPlan === "yearly" && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              )}
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free Plan</h3>
                <div className="text-4xl font-bold text-gray-600 dark:text-gray-400">$0</div>
                <p className="text-gray-600 dark:text-gray-400">Perfect for getting started</p>
              </div>
              <div className="space-y-3 mt-8">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                disabled={currentSubscription?.tier === 'free'}
                className="w-full mt-8 py-3 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {currentSubscription?.tier === 'free' ? 'Current Plan' : 'Downgrade'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Premium Plan</h3>
                </div>
                <div className="text-5xl font-bold">
                  ${pricing[selectedPlan].price}
                </div>
                <div className="text-lg opacity-90">
                  {pricing[selectedPlan].label}
                  {selectedPlan === "yearly" && (
                    <span className="block text-sm bg-white/20 rounded-full px-3 py-1 mt-2">
                      {pricing.yearly.save}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-8">
                {features.premium.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
                <div className="text-white/70 text-sm">
                  +{features.premium.length - 8} more premium features
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(`premium_${selectedPlan}`)}
                disabled={currentSubscription?.tier === 'premium'}
                className="w-full mt-8 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {currentSubscription?.tier === 'premium' ? (
                  <>
                    <Crown className="h-5 w-5" />
                    Current Plan
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Upgrade Now
                  </>
                )}
              </button>

              <p className="text-center text-white/70 text-sm mt-4">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 p-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Complete Feature Comparison
            </h2>
            <p className="text-center text-gray-700 dark:text-gray-300 mt-2">
              See everything included in each plan
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Features */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Free Plan</h3>
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">$0</div>
                </div>
                <div className="space-y-3">
                  {features.free.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Features */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Premium Plan</h3>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    ${pricing[selectedPlan].price}
                  </div>
                </div>
                <div className="space-y-3">
                  {features.premium.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. No questions asked."
              },
              {
                q: "Is there a free trial?",
                a: "We offer a 30-day money-back guarantee on all premium plans."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers."
              },
              {
                q: "Is my data secure?",
                a: "Yes, all recordings are encrypted and stored securely with blockchain verification."
              },
              {
                q: "Do you offer enterprise plans?",
                a: "Yes, we offer custom enterprise solutions. Contact our sales team for details."
              },
              {
                q: "How does the AI analysis work?",
                a: "We use advanced AI from Tavus, ElevenLabs, and other industry leaders for comprehensive analysis."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumPage;