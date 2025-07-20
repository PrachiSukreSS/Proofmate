import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Mic, 
  Brain, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Target,
  Zap,
  Calendar,
  BarChart3,
  Users,
  Globe,
  Star,
  Award,
  Video,
  Headphones,
  Blocks as Blockchain,
  Cloud,
  Crown,
  Link,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import RecordMemory from "../components/RecordMemory";

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [showRecordMemory, setShowRecordMemory] = React.useState(false);

  const features = [
    {
      icon: Video,
      title: "Tavus Video Analysis",
      description: "Advanced deepfake detection and video authenticity verification with AI-powered analysis",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Headphones,
      title: "ElevenLabs Voice AI",
      description: "Professional voice synthesis, cloning, and audio processing with emotion detection",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Blockchain,
      title: "Algorand Blockchain",
      description: "Immutable proof of authenticity with smart contract verification and transparency",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Brain,
      title: "Advanced AI Processing",
      description: "State-of-the-art AI integration for intelligent content analysis and insights",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, secure cloud storage, and comprehensive audit trails",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Cloud,
      title: "Unlimited Storage",
      description: "Never worry about running out of space with scalable cloud infrastructure",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "AI Accuracy", value: "99.2%", icon: Brain },
    { label: "Recordings Processed", value: "2M+", icon: Mic },
    { label: "Countries", value: "120+", icon: Globe }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content: "ProofMate has revolutionized how I capture and act on meeting insights. The AI analysis is incredibly accurate.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Entrepreneur",
      content: "The blockchain verification gives me confidence that my important voice notes are authentic and secure.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Researcher",
      content: "Perfect for capturing research ideas on the go. The action item extraction saves me hours of work.",
      rating: 5
    }
  ];

  if (showRecordMemory) {
    return <RecordMemory onBack={() => setShowRecordMemory(false)} user={user} />;
  }

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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Proof
              </span>
              <span className="text-gray-900 dark:text-white">Mate</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
            Your AI-powered voice memory assistant. Record, analyze, and transform your thoughts into actionable insights with blockchain-verified authenticity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => setShowRecordMemory(true)}
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-300 shadow-lg flex items-center gap-2"
          >
            <Mic className="h-5 w-5" />
            Start Recording
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/timeline')}
            className="px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-xl font-semibold text-lg transition-colors duration-300"
          >
            View Demo
          </button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Everything you need to capture, analyze, and act on your voice memories
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Simple, powerful, and intelligent
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Record Your Voice",
              description: "Capture high-quality audio with real-time transcription and smart categorization",
              icon: Mic
            },
            {
              step: "02", 
              title: "AI Analysis",
              description: "Advanced AI extracts action items, summaries, and insights from your recordings",
              icon: Brain
            },
            {
              step: "03",
              title: "Take Action",
              description: "Export to calendars, task managers, or review in your personalized timeline",
              icon: Target
            }
          ].map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Loved by Professionals
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            See what our users are saying
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Transform Your Voice?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of users who are already boosting their productivity with ProofMate
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRecordMemory(true)}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <Mic className="h-5 w-5" />
              Start Recording Now
            </button>
            <button
              onClick={() => navigate('/timeline')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-300"
            >
              Explore Features
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 rounded-3xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ProofMate</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI-powered voice memory assistant with blockchain verification and advanced analytics.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors">Features</a></li>
                <li><a href="#" className="transition-colors">Pricing</a></li>
                <li><a href="#" className="transition-colors">API</a></li>
                <li><a href="#" className="transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors">About</a></li>
                <li><a href="#" className="transition-colors">Blog</a></li>
                <li><a href="#" className="transition-colors">Careers</a></li>
                <li><a href="#" className="transition-colors">Press</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors">Help Center</a></li>
                <li><a href="#" className="transition-colors">Contact</a></li>
                <li><a href="#" className="transition-colors">Privacy</a></li>
                <li><a href="#" className="transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 ProofMate. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@proofmate.ai</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;