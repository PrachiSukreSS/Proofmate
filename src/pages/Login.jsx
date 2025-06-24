import { useState } from "react";
import { supabase } from "../utils/supabaseClient"; // your supabase client

const Login = () => {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert("Login failed 😢");
      console.error(error);
    } else {
      alert("Check your email for the login link ✨");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-4 text-center">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        type="email"
        className="w-full border p-2 rounded"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Send Magic Link ✉️
      </button>
    </div>
  );
};

export default Login;
