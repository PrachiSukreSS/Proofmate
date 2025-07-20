import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";

// Pages
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <Layout>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </AnimatePresence>
        </Layout>
      </div>
    </Router>
  );
}

export default App;