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
import LoginPage from "./pages/LoginPage";
import PremiumPage from "./pages/PremiumPage";
import PaymentPage from "./pages/PaymentPage";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        // Get initial user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.warn('App initialization warning:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user || null);
          setIsLoading(false);
        } catch (error) {
          console.warn("Auth state change warning:", error);
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
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
                <Route path="/login" element={<LoginPage />} />
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