import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Clock,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && !data.user.email_confirmed_at) {
          setMessage("Account created! You can now sign in.");
          setIsLogin(true);
        } else {
          setMessage("Account created successfully! Redirecting...");
          setTimeout(() => navigate("/"), 1000);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setMessage(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Voice-to-Text Recording",
      description: "Advanced speech recognition with AI analysis",
    },
    {
      icon: Shield,
      title: "Blockchain Verification",
      description: "Cryptographic security for memory integrity",
    },
    {
      icon: Clock,
      title: "Timeline Organization",
      description: "Organize and search your memories effortlessly",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-200 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ProofMate
              </h1>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800">
              Your Professional Recording Companion
            </h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto lg:mx-0">
              Capture, verify, and organize your memories with
              blockchain-secured voice recording technology.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-800 text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-200">
            {/* Form Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {isLogin ? "Welcome Back!" : "Create Account"}
                </h3>
                <p className="text-slate-600 mt-2">
                  {isLogin
                    ? "Sign in to access your secure memories"
                    : "Join ProofMate to start recording"}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/80 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Message */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm text-center ${
                    message.includes("error") || message.includes("Error")
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Toggle Mode */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage("");
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">
                  Secure & Private
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Your data is encrypted and secured with blockchain verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
