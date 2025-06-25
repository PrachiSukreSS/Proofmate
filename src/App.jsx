import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import { supabase } from "./utils/supabaseClient";
import HomePage from "./pages/HomePage";
import TimelinePage from "./pages/TimelinePage";
import ProfilePage from "./pages/ProfilePage";
import PremiumPage from "./pages/PremiumPage";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user on initial load
    const getInitialUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialUser();

    // Listen to auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-200 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading ProofMate...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/timeline" element={<TimelinePage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/premium" element={<PremiumPage user={user} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
      <Toast />
    </Router>
  );
}

export default App;