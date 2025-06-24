import React, { useState } from "react";
import { Mic, Zap, Shield, Clock, ArrowRight } from "lucide-react";
import RecordMemory from "../components/RecordMemory";

const HomePage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartRecording = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRecording(!isRecording);
    setIsLoading(false);
  };

  const features = [
    {
      icon: Zap,
      title: "Instant Recording",
      description:
        "Start recording with a single click and capture your thoughts instantly",
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description:
        "Your recordings are encrypted and stored safely in the cloud",
    },
    {
      icon: Clock,
      title: "Timeline View",
      description:
        "Organize and browse your recordings with our intuitive timeline",
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
          <p className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Your professional recording companion for capturing ideas, meetings,
            and memories with crystal-clear quality
          </p>
        </div>

        {/* Recording Button */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleStartRecording}
            disabled={isLoading}
            className={`group relative overflow-hidden rounded-full p-8 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-purple-500/25 ${
              isRecording
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/25"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            } ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
            style={{
              boxShadow: isRecording
                ? "0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 30px rgba(239, 68, 68, 0.3)"
                : "0 25px 50px -12px rgba(147, 51, 234, 0.25), 0 0 30px rgba(147, 51, 234, 0.3)",
            }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 rounded-full animate-pulse opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              style={{
                background: isRecording
                  ? "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex items-center gap-3 text-white">
              {isLoading ? (
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Mic
                  className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
                />
              )}
              <span className="text-xl font-semibold">
                {isLoading
                  ? "Starting..."
                  : isRecording
                  ? "🎙 Recording..."
                  : "🎙 Start Recording"}
              </span>
            </div>
          </button>

          {isRecording && (
            <div className="flex items-center gap-2 text-red-600 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <span className="text-sm font-medium">Recording in progress</span>
            </div>
          )}

          {isRecording && (
            <div className="mt-8">
              <RecordMemory />
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
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
            Everything you need to record professionally
          </h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            ProofMate combines powerful recording technology with intuitive
            design to make capturing audio effortless
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
            Ready to get started?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who trust ProofMate for their
            recording needs
          </p>
          <button className="group bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
            Get Started Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
