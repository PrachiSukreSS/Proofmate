import React from "react";
import { motion } from "framer-motion";
import Navigation from "./Navigation";
import ChatbotAssistant from "./ui/ChatbotAssistant";

const Layout = ({ children, user }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <Navigation user={user} />

      {/* Main Content */}
      <motion.main 
        className="container mx-auto px-4 py-8 max-w-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>

      {/* Chatbot */}
      <ChatbotAssistant user={user} />
    </div>
  );
};

export default Layout;