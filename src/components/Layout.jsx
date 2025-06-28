import React from "react";
import { motion } from "framer-motion";
import Navigation from "./Navigation";
import ChatbotAssistant from "./ui/ChatbotAssistant";
import PerformanceOptimizer from "./ui/PerformanceOptimizer";
import AccessibilityEnhancer from "./ui/AccessibilityEnhancer";

const Layout = ({ children, user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%238b5cf6" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      {/* Navigation */}
      <Navigation user={user} />

      {/* Main Content */}
      <motion.main 
        className="relative z-10 container mx-auto px-4 py-8 max-w-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.main>

      {/* Interactive Components */}
      <ChatbotAssistant user={user} />
      <PerformanceOptimizer />
      <AccessibilityEnhancer />
    </div>
  )
  );
};

export default Layout;