import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Brain, 
  ArrowRight, 
  CheckCircle,
  Video,
  Mic,
  FileText,
  BarChart3
} from "lucide-react";

const HomePage = ({ user }) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Content Verification",
      description: "Advanced AI analysis for authenticity detection",
      color: "text-blue-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Machine learning algorithms for accurate results",
      color: "text-purple-600"
    },
    {
      icon: Video,
      title: "Multi-Format Support",
      description: "Verify videos, audio, text, and images",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Comprehensive reports and insights",
      color: "text-orange-600"
    }
  ];

  const stats = [
    { label: "Verifications", value: "1M+", icon: CheckCircle },
    { label: "Accuracy", value: "99.7%", icon: Shield },
    { label: "Users", value: "50K+", icon: Brain },
    { label: "Countries", value: "120+", icon: BarChart3 }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Truth
            </span>
            <span className="text-gray-900 dark:text-white">Guard</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Advanced truth verification platform powered by AI. 
            Ensure data integrity and combat misinformation with cutting-edge technology.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {user ? 'Go to Dashboard' : 'Start Verification'}
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/verify')}
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-semibold text-lg transition-all duration-300"
          >
            Try Demo
          </button>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="flex justify-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Advanced Verification Technology
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive suite of AI-powered tools for truth verification and data integrity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 ${feature.color} bg-opacity-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 rounded-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Verify Truth?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of organizations using TruthGuard to ensure data integrity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/verify')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Try Demo
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;