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
  Award
} from "lucide-react";
import RecordMemory from "../components/RecordMemory";

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [showRecordMemory, setShowRecordMemory] = React.useState(false);

  const features = [
    {
      icon: Mic,
      title: "Smart Voice Recording",
      description: "High-quality audio capture with real-time transcription and AI analysis",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Brain,
      title: "AI Memory Processing",
      description: "Extract action items, summaries, and insights from your voice recordings",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Blockchain Verification",
      description: "Cryptographic proof of authenticity for all your important memories",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Target,
      title: "Productivity Insights",
      description: "Track goals, analyze patterns, and optimize your workflow",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Auto-export action items to calendars and task management tools",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights into your productivity and memory patterns",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { label: "Voice Memories", value: "50K+", icon: Mic },
    { label: "AI Accuracy", value: "99.2%", icon: Brain },
    { label: "Active Users", value: "25K+", icon: Users },
    { label: "Countries", value: "80+", icon: Globe }
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
            <motion.div 
              className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Mic className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Proof
              </span>
              <span className="text-gray-900 dark:text-white">Mate</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Your AI-powered voice memory assistant. Record, analyze, and transform your thoughts into actionable insights with blockchain-verified authenticity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            onClick={() => user ? setShowRecordMemory(true) : navigate('/login')}
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="h-5 w-5" />
            {user ? 'Start Recording' : 'Get Started'}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            onClick={() => navigate('/timeline')}
            className="px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-semibold text-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Demo
          </motion.button>
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
                className="text-center space-y-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full">
                    <Icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
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
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
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
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200 dark:border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="space-y-4">
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 10 }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>
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
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </motion.div>
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
              whileHover={{ y: -5 }}
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
            <motion.button
              onClick={() => user ? setShowRecordMemory(true) : navigate('/login')}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="h-5 w-5" />
              Start Recording Now
            </motion.button>
            <motion.button
              onClick={() => navigate('/timeline')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Features
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;