import React, { useEffect, useState } from "react";
import {
  Mic,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  LogIn,
  Brain,
  Target,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecordMemory from "../components/RecordMemory";
import { supabase } from "../utils/supabaseClient";

const HomePage = ({ user }) => {
  const [showRecording, setShowRecording] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log("👤 Authenticated User:", data?.user);
    });
  }, []);

  const handleStartRecording = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowRecording(true);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Advanced OpenAI integration extracts actionable tasks and insights from your voice",
    },
    {
      icon: Target,
      title: "Smart Task Extraction",
      description:
        "Automatically identifies action items, priorities, and deadlines from your recordings",
    },
    {
      icon: Shield,
      title: "Blockchain Verified",
      description:
        "Your recordings are cryptographically secured and verified on blockchain",
    },
    {
      icon: BarChart3,
      title: "Productivity Insights",
      description:
        "Track your productivity trends and get insights into your task completion patterns",
    },
    {
      icon: Zap,
      title: "Instant Integration",
      description:
        "Export tasks directly to Google Calendar, Todoist, and other productivity tools",
    },
    {
      icon: Clock,
      title: "Smart Organization",
      description:
        "Intelligent categorization and tagging helps you find and manage your memories",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            style={{
              fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
              fontWeight: "800",
              letterSpacing: "-0.02em",
            }}
          >
            ProofMate
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Transform your voice into actionable insights with AI-powered task
            extraction, smart organization, and blockchain verification
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600 mt-4">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>OpenAI Powered</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Task Extraction</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Blockchain Verified</span>
            </div>
          </div>
        </div>

        {/* Main Action Button */}
        <div className="flex flex-col items-center gap-6">
          {!showRecording ? (
            <div className="space-y-4">
              <button
                onClick={handleStartRecording}
                className="group relative overflow-hidden rounded-full p-8 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-purple-500/25 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                style={{
                  boxShadow:
                    "0 25px 50px -12px rgba(147, 51, 234, 0.25), 0 0 30px rgba(147, 51, 234, 0.3)",
                }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className="absolute inset-0 rounded-full animate-pulse opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)",
                  }}
                />
                <div className="relative flex items-center gap-3 text-white">
                  <Mic className="h-8 w-8" />
                  <span className="text-xl font-semibold">
                    {user ? "🎙 Start Smart Recording" : "🎙 Login to Record"}
                  </span>
                </div>
              </button>

              {!user && (
                <p className="text-slate-600 text-sm">
                  Please log in to start recording and extracting actionable
                  insights
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-6xl">
              <RecordMemory onBack={() => setShowRecording(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Features Section - Only show when not recording */}
      {!showRecording && (
        <>
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2
                className="text-3xl md:text-4xl font-bold text-slate-800"
                style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                }}
              >
                AI-Powered Productivity at Your Fingertips
              </h2>
              <p className="text-lg text-slate-700 max-w-3xl mx-auto">
                ProofMate uses advanced OpenAI technology to transform your
                voice recordings into organized, actionable tasks with
                intelligent insights and seamless integrations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-200/50"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 transition-colors duration-300">
                        <Icon className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demo Section */}
          <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="text-center space-y-6">
              <h2
                className="text-3xl md:text-4xl font-bold text-slate-800"
                style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                }}
              >
                See ProofMate in Action
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        🎤 Voice Input Example:
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-purple-500">
                        <p className="text-slate-700 italic">
                          "I need to buy cat food for Lucy tomorrow, and don't
                          forget to call the vet about her checkup. Also,
                          schedule a meeting with the marketing team for next
                          week."
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        🧠 AI-Extracted Tasks:
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-slate-700">
                            Buy cat food for Lucy (High Priority)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-slate-700">
                            Call vet about Lucy's checkup
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-700">
                            Schedule marketing team meeting
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <div className="space-y-6">
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                }}
              >
                Ready to supercharge your productivity?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join the future of voice-powered task management with AI
                insights, blockchain security, and seamless integrations
              </p>
              {user ? (
                <button
                  onClick={handleStartRecording}
                  className="group bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                >
                  Start Recording Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="group bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                >
                  <LogIn className="h-5 w-5" />
                  Login to Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
