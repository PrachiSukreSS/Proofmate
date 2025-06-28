import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  Brain,
  Shield,
  Zap,
  HelpCircle,
  BookOpen,
  Target,
  Mic,
  MicOff,
  Heart,
  Star,
  Coffee
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const ChatbotAssistant = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi there! 🌟 I'm your friendly TruthGuard assistant! I'm here to help you navigate our platform, answer questions, and make your verification journey smooth and enjoyable. What would you like to explore today?",
      timestamp: new Date(),
      avatar: '🤖'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [personality, setPersonality] = useState('friendly');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mood, setMood] = useState('happy');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { toast } = useToast();

  const personalities = {
    friendly: {
      name: 'Friendly',
      avatar: '😊',
      description: 'Warm and helpful companion',
      color: 'from-pink-400 to-purple-500',
      mood: 'cheerful'
    },
    professional: {
      name: 'Professional',
      avatar: '🤖',
      description: 'Efficient and precise',
      color: 'from-blue-400 to-indigo-500',
      mood: 'focused'
    },
    expert: {
      name: 'Expert',
      avatar: '🧠',
      description: 'Technical specialist',
      color: 'from-purple-400 to-pink-500',
      mood: 'analytical'
    },
    casual: {
      name: 'Casual',
      avatar: '😎',
      description: 'Relaxed and easy-going',
      color: 'from-green-400 to-blue-500',
      mood: 'chill'
    }
  };

  const quickActions = [
    {
      icon: Shield,
      label: 'Verification Guide',
      message: 'How do I verify content step by step?',
      emoji: '🛡️'
    },
    {
      icon: Brain,
      label: 'AI Features',
      message: 'What AI features are available?',
      emoji: '🧠'
    },
    {
      icon: Zap,
      label: 'Quick Start',
      message: 'I\'m new here, show me around!',
      emoji: '⚡'
    },
    {
      icon: HelpCircle,
      label: 'Get Help',
      message: 'I need help with something',
      emoji: '❓'
    }
  ];

  const moods = {
    happy: { emoji: '😊', color: 'text-yellow-500' },
    excited: { emoji: '🤩', color: 'text-orange-500' },
    helpful: { emoji: '🤗', color: 'text-green-500' },
    thinking: { emoji: '🤔', color: 'text-blue-500' }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = async (userMessage) => {
    setIsTyping(true);
    setIsProcessing(true);
    setMood('thinking');
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      const responses = {
        verification: [
          "Great question! 🎯 To verify content, just head to our Verify page and upload your file. Our AI will analyze it for authenticity, check for deepfakes, and provide a detailed confidence score. It's super easy!",
          "I'd love to help you with verification! ✨ Our system supports videos, audio, images, and documents. Just drag and drop your file, and we'll handle the rest with our advanced AI analysis.",
          "Verification is our specialty! 🔍 Upload your content, choose your analysis type, and our AI will check for manipulation, bias, and authenticity. You'll get results in under a minute!"
        ],
        ai: [
          "Our AI is pretty amazing! 🤖 We use GPT-4 for content analysis, specialized models for deepfake detection, and blockchain verification for tamper-proof results. It's like having a team of experts in your pocket!",
          "The AI confidence score shows how certain we are about authenticity! 📊 90%+ means high confidence, 70-90% suggests caution, and below 70% needs human review. We're transparent about our certainty!",
          "Our AI learns from millions of examples! 🧠 It can spot subtle manipulation patterns, analyze emotional tone, detect inconsistencies, and even check factual claims against reliable sources."
        ],
        guide: [
          "Welcome aboard! 🚀 Let me show you around: Start with Dashboard to see your overview, try Verify to upload content, check Analytics for insights, and explore Subscription for advanced features. You've got this!",
          "New to TruthGuard? Perfect! 🌟 Think of us as your truth-detection toolkit. Upload suspicious content, get AI analysis, view detailed reports, and export findings. It's designed to be intuitive and powerful!",
          "I'm excited to help you get started! 🎉 Begin with a test verification to see how it works, explore your dashboard for insights, and don't hesitate to ask me anything. I'm here to make your experience smooth!"
        ],
        help: [
          "I'm here to help! 💪 What specific challenge are you facing? Whether it's uploading files, understanding results, or navigating features, I'll guide you through it step by step.",
          "No worries, we'll figure this out together! 🤝 Tell me what's not working as expected, and I'll provide clear solutions. Sometimes it's just a small setting or browser issue.",
          "Help is on the way! 🆘 I can assist with technical issues, explain features, guide you through processes, or connect you with our support team for complex problems."
        ],
        default: [
          "That's an interesting question! 🤔 I'm here to help with anything TruthGuard-related. Feel free to ask about verification, features, troubleshooting, or just chat about how our platform can help you!",
          "I love helping users explore TruthGuard! ✨ Whether you need technical guidance, want to understand our AI, or just want to chat about digital truth verification, I'm your friendly assistant!",
          "Thanks for reaching out! 😊 I'm designed to make your TruthGuard experience amazing. Ask me anything about our platform, and I'll do my best to provide helpful, clear answers!"
        ]
      };

      // Enhanced keyword matching
      const lowerMessage = userMessage.toLowerCase();
      let responseCategory = 'default';
      
      if (lowerMessage.includes('verify') || lowerMessage.includes('upload') || lowerMessage.includes('check')) {
        responseCategory = 'verification';
      } else if (lowerMessage.includes('ai') || lowerMessage.includes('analysis') || lowerMessage.includes('confidence')) {
        responseCategory = 'ai';
      } else if (lowerMessage.includes('guide') || lowerMessage.includes('start') || lowerMessage.includes('new') || lowerMessage.includes('how')) {
        responseCategory = 'guide';
      } else if (lowerMessage.includes('help') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('trouble')) {
        responseCategory = 'help';
      }

      const categoryResponses = responses[responseCategory];
      const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      
      setMood('helpful');
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        avatar: personalities[personality].avatar
      };
      
      setMessages(prev => [...prev, botMessage]);

      // Text-to-speech if enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.replace(/[🎯✨🔍🤖📊🧠🚀🌟🎉💪🤝🆘🤔😊]/g, ''));
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      setMood('helpful');
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "Oops! 😅 I'm having a tiny technical hiccup. Could you try asking again? I promise I'll do better!",
        timestamp: new Date(),
        avatar: personalities[personality].avatar
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
      setTimeout(() => setMood('happy'), 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      avatar: user?.email?.charAt(0).toUpperCase() || '👤'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');

    await generateBotResponse(messageToProcess);
  };

  const handleQuickAction = (action) => {
    if (isProcessing) return;
    setInputMessage(action.message);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const startVoiceInput = () => {
    if (isListening || isProcessing) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setMood('excited');
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setMood('happy');
      };
      
      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        setMood('happy');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setMood('happy');
      };
      
      recognitionRef.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setMood('happy');
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Fresh start! 🌟 I'm ready to help you with anything TruthGuard-related. What would you like to explore?",
        timestamp: new Date(),
        avatar: personalities[personality].avatar
      }
    ]);
    setMood('happy');
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 glassmorphic hover:scale-110 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="h-2.5 w-2.5 text-white" />
        </motion.div>
      </motion.button>
    );
  }

  return (
    <motion.div
      className={`fixed z-50 ${
        isMinimized 
          ? 'bottom-6 right-6 w-80 h-16' 
          : 'bottom-6 right-6 w-96 h-[600px]'
      } glassmorphic rounded-2xl shadow-2xl overflow-hidden`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header - Always visible */}
      <div className={`bg-gradient-to-r ${personalities[personality].color} p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            animate={{ rotate: isProcessing ? 360 : 0 }}
            transition={{ duration: 2, repeat: isProcessing ? Infinity : 0 }}
          >
            <span className="text-xl">{personalities[personality].avatar}</span>
          </motion.div>
          {!isMinimized && (
            <div className="text-white">
              <h3 className="font-semibold flex items-center gap-2">
                TruthGuard Assistant
                <span className={moods[mood].color}>{moods[mood].emoji}</span>
              </h3>
              <p className="text-xs opacity-90">{personalities[personality].description}</p>
            </div>
          )}
          {isMinimized && (
            <div className="text-white">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Assistant <span className="text-lg">{moods[mood].emoji}</span>
              </h3>
            </div>
          )}
        </div>
        {/* Control buttons - Always visible */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-white" />
            ) : (
              <Minimize2 className="h-4 w-4 text-white" />
            )}
          </motion.button>
          <motion.button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close"
          >
            <X className="h-4 w-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Content - Only visible when not minimized */}
      {!isMinimized && (
        <>
          {/* Settings Bar */}
          <div className="p-3 glassmorphic border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="text-xs glassmorphic border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {Object.entries(personalities).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1 rounded transition-colors ${voiceEnabled ? 'text-green-500' : 'text-gray-400'}`}
                  whileHover={{ scale: 1.1 }}
                  title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  onClick={clearChat}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  title="Clear chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full glassmorphic flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm">{message.avatar}</span>
                  </motion.div>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <motion.div 
                      className={`p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                          : 'glassmorphic text-gray-800 dark:text-gray-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </motion.div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full glassmorphic flex items-center justify-center">
                  <span className="text-sm">{personalities[personality].avatar}</span>
                </div>
                <div className="glassmorphic p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-primary-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-primary-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-primary-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 p-2 text-xs glassmorphic hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm">{action.emoji}</span>
                    <span className="truncate font-medium">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
                placeholder="Type your message... 💬"
                disabled={isProcessing}
                className="flex-1 px-3 py-2 glassmorphic border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm disabled:opacity-50 placeholder-gray-500"
              />
              <motion.button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'glassmorphic hover:bg-white/20'
                } disabled:opacity-50`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </motion.button>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                className="p-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Send message"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ChatbotAssistant;