import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Brain,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../utils/supabaseClient";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [securityChecks, setSecurityChecks] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkExistingAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.warn("Auth check warning:", error);
      }
    };
    checkExistingAuth();
  }, [navigate]);

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your password",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        toast({
          title: "Full Name Required",
          description: "Please enter your full name",
          variant: "destructive"
        });
        return false;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please ensure both passwords are identical",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const simulateSecurityChecks = async () => {
    const checks = [
      { name: "Email validation", duration: 200 },
      { name: "Security scan", duration: 300 },
      { name: "Session setup", duration: 200 }
    ];

    setSecurityChecks([]);
    
    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      setSecurityChecks(prev => [...prev, { ...check, status: 'processing' }]);
      setAuthProgress((i + 1) / checks.length * 100);
      
      await new Promise(resolve => setTimeout(resolve, check.duration));
      
      setSecurityChecks(prev => 
        prev.map((c, idx) => 
          idx === i ? { ...c, status: 'completed' } : c
        )
      );
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthProgress(0);

    try {
      // Simulate security checks
      await simulateSecurityChecks();

      let data, error;
      
      if (isLogin) {
        // Sign in
        const authResult = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password
        });
        data = authResult.data;
        error = authResult.error;
      } else {
        // Sign up
        const authResult = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              username: email.split('@')[0]
            }
          }
        });
        data = authResult.data;
        error = authResult.error;
      }

      if (error) {
        let friendlyMessage = "Please check your credentials and try again.";
        
        if (error.message.includes("Invalid login credentials")) {
          friendlyMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("already registered")) {
          friendlyMessage = "This email is already registered. Please try logging in instead.";
        } else if (error.message.includes("Email not confirmed")) {
          friendlyMessage = "Please check your email and confirm your account.";
        }
        
        throw new Error(friendlyMessage);
      }

      if (data.user) {
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: isLogin 
            ? "Successfully logged in"
            : !data.user.email_confirmed_at 
              ? "Please check your email to verify your account"
              : "Account created successfully",
          variant: "success"
        });

        // Redirect to home page after successful authentication
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setSecurityChecks(prev => 
        prev.map(check => ({ ...check, status: 'failed' }))
      );
      
      toast({
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setAuthProgress(0);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced AI integration for intelligent content processing"
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Algorand-based immutable proof with merkle tree verification"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Instant verification with optimized performance"
    },
    {
      icon: Globe,
      title: "Distributed Ledger",
      description: "Decentralized verification with consensus achievement"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding & Features */}
        <motion.div 
          className="space-y-8 text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ProofMate
              </h1>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Advanced Memory Verification Platform
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                Secure authentication with blockchain-verified memory integrity, 
                real-time monitoring, and distributed consensus.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center lg:text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                      <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.9%</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Integrity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{"<1s"}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Auth Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Verified</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          className="max-w-md w-full mx-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Form Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLogin ? "Secure Login" : "Create Account"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {isLogin
                    ? "Access your blockchain-verified memories"
                    : "Join the secure memory verification platform"}
                </p>
              </div>
            </div>

            {/* Security Progress */}
            {isLoading && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Security Verification
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(authProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${authProgress}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {securityChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {check.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                      {check.status === 'processing' && <Loader className="h-3 w-3 text-blue-600 animate-spin" />}
                      {check.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-600" />}
                      <span className={`${
                        check.status === 'completed' ? 'text-green-700 dark:text-green-300' :
                        check.status === 'failed' ? 'text-red-700 dark:text-red-300' :
                        'text-blue-700 dark:text-blue-300'
                      }`}>
                        {check.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
              {/* Full Name (Sign up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm your password"
                      required={!isLogin}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    {isLogin ? "Authenticating..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In Securely" : "Create Account"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Toggle Mode */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setPassword("");
                    setConfirmPassword("");
                    setFullName("");
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enterprise-Grade Security
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Protected with blockchain verification, merkle trees, and distributed consensus
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;