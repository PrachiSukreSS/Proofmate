import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import LoadingScreen from "./components/LoadingScreen";
import { supabase } from "./utils/supabaseClient";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import HomePage from "./pages/HomePage";
import TimelinePage from "./pages/TimelinePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import PremiumPage from "./pages/PremiumPage";
import PaymentPage from "./pages/PaymentPage";

function App() {
  const [user, setUser] = useState({ id: 'demo-user', email: 'demo@proofmate.ai' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set demo user and finish loading
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <Layout user={user}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage user={user} />} />
                <Route path="/timeline" element={<TimelinePage user={user} />} />
                <Route path="/analytics" element={<AnalyticsPage user={user} />} />
                <Route path="/profile" element={<ProfilePage user={user} />} />
                <Route path="/premium" element={<PremiumPage user={user} />} />
                <Route path="/payment" element={<PaymentPage user={user} />} />
              </Routes>
            </AnimatePresence>
          </Layout>
          <Toast />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;