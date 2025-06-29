import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  ArrowLeft, 
  Check, 
  Crown,
  AlertCircle,
  Loader
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { purchaseSubscription } from "../utils/revenueCatClient";

const PaymentPage = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    email: user?.email || "",
    country: "US"
  });

  const { productId, plan } = location.state || {};

  useEffect(() => {
    if (!productId || !plan) {
      navigate('/premium');
    }
  }, [productId, plan, navigate]);

  const planDetails = {
    monthly: { price: 29.99, period: "month" },
    yearly: { price: 299.99, period: "year", savings: "Save $59.88" }
  };

  const currentPlan = planDetails[plan] || planDetails.monthly;

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = await purchaseSubscription(productId);
      
      if (result.success) {
        toast({
          title: "Payment Successful! 🎉",
          description: "Welcome to ProofMate Premium! Your subscription is now active.",
          variant: "success"
        });
        
        // Redirect to dashboard after successful payment
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "Please check your payment details and try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return (
      paymentData.cardNumber.replace(/\s/g, '').length >= 16 &&
      paymentData.expiryDate.length === 5 &&
      paymentData.cvv.length >= 3 &&
      paymentData.name.trim().length > 0 &&
      paymentData.email.trim().length > 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/premium')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Purchase
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Payment Information
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={paymentData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IN">India</option>
                  <option value="JP">Japan</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid() || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Complete Purchase - ${currentPlan.price}
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Crown className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>
            </div>

            {/* Plan Details */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
              <h3 className="text-lg font-semibold mb-2">ProofMate Premium</h3>
              <p className="text-purple-100 mb-4">
                {plan === 'yearly' ? 'Annual' : 'Monthly'} Subscription
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${currentPlan.price}</span>
                <span className="text-purple-200">/{currentPlan.period}</span>
              </div>
              {plan === 'yearly' && (
                <div className="mt-2 text-sm bg-white/20 rounded-full px-3 py-1 inline-block">
                  {currentPlan.savings}
                </div>
              )}
            </div>

            {/* Features Included */}
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white">What's Included:</h4>
              <div className="space-y-3">
                {[
                  "Unlimited recordings",
                  "Tavus video analysis",
                  "ElevenLabs voice AI",
                  "Algorand blockchain verification",
                  "Advanced analytics",
                  "Priority support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium">${currentPlan.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                <span>Total</span>
                <span>${currentPlan.price}</span>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Shield className="h-4 w-4" />
                <span className="font-medium">30-Day Money-Back Guarantee</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;