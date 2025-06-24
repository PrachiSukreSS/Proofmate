import React, { useState } from 'react';
import { Crown, Check, X, Zap, Shield, Cloud, Headphones, Star } from 'lucide-react';

const PremiumPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const features = {
    free: [
      'Up to 10 recordings per month',
      'Basic audio quality',
      '5 minutes max per recording',
      'Standard storage (100MB)',
      'Basic timeline view',
    ],
    premium: [
      'Unlimited recordings',
      'Crystal clear HD audio',
      'Unlimited recording length',
      'Unlimited cloud storage',
      'Advanced timeline with search',
      'AI-powered transcription',
      'Noise cancellation',
      'Export to multiple formats',
      'Priority customer support',
      'Advanced analytics',
    ],
  };

  const premiumFeatures = [
    {
      icon: Zap,
      title: 'Lightning Fast Performance',
      description: 'Experience blazing-fast recording start times and seamless playback',
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'End-to-end encryption and secure cloud storage for your recordings',
    },
    {
      icon: Cloud,
      title: 'Unlimited Storage',
      description: 'Never worry about running out of space for your important recordings',
    },
    {
      icon: Headphones,
      title: 'AI Transcription',
      description: 'Automatically convert your voice recordings to searchable text',
    },
  ];

  const pricing = {
    monthly: { price: 9.99, label: '/month' },
    yearly: { price: 99.99, label: '/year', save: 'Save 17%' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Crown className="h-8 w-8 text-amber-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent" style={{
            fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
            fontWeight: '800',
            letterSpacing: '-0.02em'
          }}>
            Unlock Premium
          </h1>
        </div>
        <p className="text-xl text-slate-700 max-w-2xl mx-auto">
          Supercharge your recording experience with advanced features and unlimited possibilities
        </p>
      </div>

      {/* Premium Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {premiumFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-purple-200"
            >
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 w-fit">
                  <Icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-800">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Toggle */}
      <div className="text-center space-y-8">
        <div className="inline-flex bg-white/70 backdrop-blur-sm p-1 rounded-xl border-2 border-purple-200">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedPlan === 'monthly'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
              selectedPlan === 'yearly'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Yearly
            {selectedPlan === 'yearly' && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            )}
          </button>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="h-6 w-6" />
                <h3 className="text-2xl font-bold" style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: '800'
                }}>ProofMate Premium</h3>
              </div>
              
              <div className="space-y-2">
                <div className="text-5xl font-bold">
                  ${pricing[selectedPlan].price}
                </div>
                <div className="text-lg opacity-90">
                  {pricing[selectedPlan].label}
                  {selectedPlan === 'yearly' && (
                    <span className="block text-sm bg-white/20 rounded-full px-3 py-1 mt-2">
                      {pricing.yearly.save}
                    </span>
                  )}
                </div>
              </div>
              
              <button className="w-full bg-white text-amber-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Upgrade Now
              </button>
              
              <p className="text-sm opacity-75">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-8">
          <h2 className="text-3xl font-bold text-center text-slate-800" style={{
            fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
            fontWeight: '800'
          }}>
            Choose Your Plan
          </h2>
          <p className="text-center text-slate-700 mt-2">
            Compare features and find the perfect fit for your needs
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800" style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: '800'
                }}>Free Plan</h3>
                <div className="text-3xl font-bold text-slate-600">$0</div>
                <p className="text-slate-600">Perfect for getting started</p>
              </div>
              
              <div className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Plan */}
            <div className="space-y-6 relative">
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800" style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: '800'
                }}>Premium Plan</h3>
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  ${pricing[selectedPlan].price}
                </div>
                <p className="text-slate-600">For serious creators</p>
              </div>
              
              <div className="space-y-3">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="text-center space-y-8">
        <h2 className="text-3xl font-bold text-slate-800" style={{
          fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
          fontWeight: '800'
        }}>Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="font-semibold text-slate-800 mb-2">Can I cancel anytime?</h3>
            <p className="text-slate-600">Yes, you can cancel your subscription at any time. No questions asked.</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="font-semibold text-slate-800 mb-2">Is there a free trial?</h3>
            <p className="text-slate-600">We offer a 30-day money-back guarantee on all premium plans.</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="font-semibold text-slate-800 mb-2">What payment methods do you accept?</h3>
            <p className="text-slate-600">We accept all major credit cards, PayPal, and bank transfers.</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="font-semibold text-slate-800 mb-2">Is my data secure?</h3>
            <p className="text-slate-600">Yes, all recordings are encrypted and stored securely in the cloud.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;