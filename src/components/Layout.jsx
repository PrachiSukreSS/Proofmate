import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "./Navigation";
import ChatbotAssistant from "./ui/ChatbotAssistant";
import GuidedTour from "./ui/GuidedTour";
import PerformanceOptimizer from "./ui/PerformanceOptimizer";
import AccessibilityEnhancer from "./ui/AccessibilityEnhancer";

const Layout = ({ children, user }) => {
  const [showTour, setShowTour] = useState(false);
  const [tourType, setTourType] = useState('welcome');

  useEffect(() => {
    // Show welcome tour for new users
    const hasSeenTour = localStorage.getItem('truthguard-tour-completed');
    if (!hasSeenTour && user) {
      setTimeout(() => {
        setShowTour(true);
      }, 2000);
    }
  }, [user]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('truthguard-tour-completed', 'true');
  };

  const handleTourSkip = () => {
    setShowTour(false);
    localStorage.setItem('truthguard-tour-skipped', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stardust-50 via-white to-electric-teal-50 dark:from-deep-space-900 dark:via-deep-space-800 dark:to-deep-space-900 transition-colors duration-300">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239747FF" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      {/* Navigation */}
      <Navigation user={user} />

      {/* Main Content */}
      <motion.main 
        className="relative z-10 container-fluid section-padding"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>

      {/* Interactive Components */}
      <ChatbotAssistant user={user} />
      <PerformanceOptimizer />
      <AccessibilityEnhancer />

      {/* Guided Tour */}
      <GuidedTour
        isActive={showTour}
        tourType={tourType}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Floating Action Button for Tour */}
      {user && !showTour && (
        <motion.button
          onClick={() => setShowTour(true)}
          className="fixed top-20 right-6 z-40 p-3 bg-gradient-to-r from-stellar-gold-500 to-stellar-gold-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Start guided tour"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🎯
          </motion.div>
        </motion.button>
      )}
    </div>
  );
};

export default Layout;