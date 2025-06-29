import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import LoadingScreen from "./components/LoadingScreen";
import { supabase } from "./utils/supabaseClient";
import { ThemeProvider } from "./contexts/ThemeContext";
import { updateUserActivity, getSessionInfo } from "./utils/secureAuthSystem";
import { initializeBlockchainSystem } from "./utils/blockchainMemorySystem";

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
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        // Get initial user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Initialize blockchain system if user is authenticated
        if (user) {
          await initializeBlockchainSystem();
          
          // Get session information
          const session = getSessionInfo();
          setSessionInfo(session);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setIsLoading(false);

        // Initialize blockchain system for new sessions
        if (session?.user && event === 'SIGNED_IN') {
          await initializeBlockchainSystem();
        }

        // Update session info
        if (session?.user) {
          const sessionInfo = getSessionInfo();
          setSessionInfo(sessionInfo);
        } else {
          setSessionInfo(null);
        }
      }
    );

    // Set up activity monitoring
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (user) {
        updateUserActivity();
        const session = getSessionInfo();
        setSessionInfo(session);
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Session monitoring interval
    const sessionMonitor = setInterval(() => {
      if (user) {
        const session = getSessionInfo();
        setSessionInfo(session);
        
        // Auto-logout if session is invalid
        if (!session.isValid) {
          supabase.auth.signOut();
        }
      }
    }, 60000); // Check every minute

    return () => {
      authListener.subscription.unsubscribe();
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(sessionMonitor);
    };
  }, [user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <Layout user={user} sessionInfo={sessionInfo}>
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