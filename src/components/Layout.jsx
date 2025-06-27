import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import { supabase } from "../utils/supabaseClient";

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-lavender-50 to-purple-200"
      style={{
        background:
          "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 25%, #ddd6fe 50%, #c4b5fd 75%, #a78bfa 100%)",
      }}
    >
      <Navigation user={user} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
    </div>
  );
};

export default Layout;
