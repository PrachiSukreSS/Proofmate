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
  MicOff
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const ChatbotAssistant = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hello! I'm your TruthGuard AI Assistant. I'm here to help you with verification processes, answer questions about our platform, and guide you through any challenges. How can I assist you today?",
      timestamp: new Date(),
      avatar: '🤖'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [personality, setPersonality] = useState('professional');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { toast } = useToast();

  const personalities = {
    professional: {
      name: 'Professional',
      avatar: '🤖',
      description: 'Formal and precise assistance',
      color: 'from-blue-500 to-blue-600'
    },
    friendly: {
      name: 'Friendly',
      avatar: '😊',
      description: 'Warm and approachable guidance',
      color: 'from-green-500 to-green-600'
    },
    expert: {
      name: 'Expert',
      avatar: '🧠',
      description: 'Technical and detailed explanations',
      color: 'from-purple-500 to-purple-600'
    },
    casual: {
      name: 'Casual',
      avatar: '😎',
      description: 'Relaxed and conversational',
      color: 'from-orange-500 to-orange-600'
    }
  };

  const quickActions = [
    {
      icon: Shield,
      label: 'How to verify content?',
      message: 'Can you guide me through the content verification process?'
    },
    {
      icon: Brain,
      label: 'AI Analysis explained',
      message: 'How does the AI analysis work and what should I expect?'
    },
    {
      icon: Zap,
      label: 'Quick start guide',
      message: 'I\'m new here. Can you give me a quick overview of TruthGuard?'
    },
    {
      icon: Target,
      label: 'Best practices',
      message: 'What are the best practices for accurate verification results?'
    },
    {
      icon: HelpCircle,
      label: 'Troubleshooting',
      message: 'I\'m having issues with my verification. Can you help?'
    },
    {
      icon: BookOpen,
      label: 'Documentation',
      message: 'Where can I find detailed documentation and tutorials?'
    }
  ];

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
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = {
        verification: [
          "To verify content, simply upload your file or record audio using our verification page. Our AI will analyze it for authenticity, bias, and factual accuracy. The process typically takes 30-60 seconds.",
          "Our verification process uses multiple AI models including GPT-4 for content analysis, blockchain for immutable proof, and specialized algorithms for deepfake detection.",
          "You can verify videos, audio files, documents, and images. Each type goes through tailored analysis pipelines for maximum accuracy."
        ],
        ai: [
          "Our AI analysis combines natural language processing, computer vision, and audio analysis. It checks for consistency, factual accuracy, emotional manipulation, and technical authenticity markers.",
          "The confidence score represents how certain our AI is about the content's authenticity. Scores above 90% indicate high confidence, while lower scores may require manual review.",
          "Our AI is trained on millions of verified and manipulated content samples, allowing it to detect subtle patterns that indicate potential manipulation or misinformation."
        ],
        guide: [
          "Welcome to TruthGuard! 🛡️ Start by uploading content for verification, view results in your dashboard, and export findings to your preferred tools. Our AI handles the complex analysis while you focus on making informed decisions.",
          "TruthGuard offers three main features: Content Verification (upload and analyze), Analytics Dashboard (track your verification history), and Integration Tools (export to calendar, task managers, etc.).",
          "New users should start with our demo verification to understand the process, then explore the dashboard to see analytics, and finally check out the subscription options for advanced features."
        ],
        practices: [
          "For best results: 1) Upload high-quality files, 2) Provide context about the content source, 3) Cross-reference with multiple sources, 4) Review flagged items manually, 5) Keep your verification history organized.",
          "Quality matters! Higher resolution videos, clear audio, and complete documents yield more accurate results. Our AI performs better with uncompressed, original files.",
          "Always verify the source of your content when possible. Our AI can detect manipulation, but understanding the content's origin adds valuable context to the analysis."
        ],
        troubleshooting: [
          "Common issues include: file format not supported (try converting to MP4/MP3/PDF), file too large (compress or upgrade plan), or slow processing (check internet connection). What specific issue are you experiencing?",
          "If verification is taking too long, it might be due to high server load or complex content. Try refreshing the page or contact support if the issue persists.",
          "For upload errors, ensure your file is under the size limit and in a supported format. Clear your browser cache if you continue experiencing issues."
        ],
        documentation: [
          "You can find comprehensive documentation in our Help Center, including video tutorials, API documentation, and integration guides. Would you like me to direct you to a specific section?",
          "Our documentation covers: Getting Started Guide, API Reference, Integration Tutorials, Troubleshooting, and Best Practices. All are accessible from the main menu.",
          "For developers, we offer detailed API documentation with code examples, SDKs for popular languages, and webhook integration guides."
        ],
        default: [
          "I'm here to help with any questions about TruthGuard! You can ask me about verification processes, AI analysis, troubleshooting, or general platform guidance.",
          "That's an interesting question! While I specialize in TruthGuard assistance, I can help you understand how our platform addresses your specific needs.",
          "I'd be happy to help! Could you provide more details about what you're trying to accomplish? I can offer more targeted guidance that way."
        ]
      };

      // Simple keyword matching for demo purposes
      const lowerMessage = userMessage.toLowerCase();
      let responseCategory = 'default';
      
      if (lowerMessage.includes('verify') || lowerMessage.includes('verification') || lowerMessage.includes('upload')) {
        responseCategory = 'verification';
      } else if (lowerMessage.includes('ai') || lowerMessage.includes('analysis') || lowerMessage.includes('confidence')) {
        responseCategory = 'ai';
      } else if (lowerMessage.includes('guide') || lowerMessage.includes('start') || lowerMessage.includes('overview') || lowerMessage.includes('new')) {
        responseCategory = 'guide';
      } else if (lowerMessage.includes('practice') || lowerMessage.includes('tip') || lowerMessage.includes('best')) {
        responseCategory = 'practices';
      } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('error') || lowerMessage.includes('help')) {
        responseCategory = 'troubleshooting';
      } else if (lowerMessage.includes('documentation') || lowerMessage.includes('tutorial') || lowerMessage.includes('api')) {
        responseCategory = 'documentation';
      }

      const categoryResponses = responses[responseCategory];
      const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      
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
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
        avatar: personalities[personality].avatar
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
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
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not access microphone or recognize speech",
          variant: "destructive"
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.start();
    } else {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive"
      });
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date(),
        avatar: personalities[personality].avatar
      }
    ]);
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-cosmic-purple-500 to-electric-teal-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-nebula-pink-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-3 w-3 text-white" />
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
      } bg-white dark:bg-deep-space-800 rounded-2xl shadow-2xl border border-stardust-200 dark:border-deep-space-700 overflow-hidden`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header - Always visible */}
      <div className={`bg-gradient-to-r ${personalities[personality].color} p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">{personalities[personality].avatar}</span>
          </div>
          {!isMinimized && (
            <div className="text-white">
              <h3 className="font-semibold">TruthGuard Assistant</h3>
              <p className="text-xs opacity-90">{personalities[personality].description}</p>
            </div>
          )}
          {isMinimized && (
            <div className="text-white">
              <h3 className="font-semibold text-sm">TruthGuard Assistant</h3>
            </div>
          )}
        </div>
        {/* Control buttons - Always visible */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-white" />
            ) : (
              <Minimize2 className="h-4 w-4 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content - Only visible when not minimized */}
      {!isMinimized && (
        <>
          {/* Settings Bar */}
          <div className="p-3 bg-stardust-50 dark:bg-deep-space-900 border-b border-stardust-200 dark:border-deep-space-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="text-xs bg-transparent border border-stardust-300 dark:border-deep-space-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-electric-teal-500"
                >
                  {Object.entries(personalities).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1 rounded transition-colors ${voiceEnabled ? 'text-green-600' : 'text-gray-400'}`}
                  title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={clearChat}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="Clear chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cosmic-purple-500 to-electric-teal-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-white">{message.avatar}</span>
                  </div>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-cosmic-purple-500 to-electric-teal-500 text-white'
                        : 'bg-stardust-100 dark:bg-deep-space-700 text-deep-space-900 dark:text-stardust-50'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs text-stardust-500 dark:text-deep-space-400 mt-1">
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cosmic-purple-500 to-electric-teal-500 flex items-center justify-center">
                  <span className="text-sm text-white">{personalities[personality].avatar}</span>
                </div>
                <div className="bg-stardust-100 dark:bg-deep-space-700 p-3 rounded-2xl">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-stardust-200 dark:border-deep-space-700">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickActions.slice(0, 4).map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 p-2 text-xs bg-stardust-100 dark:bg-deep-space-700 hover:bg-stardust-200 dark:hover:bg-deep-space-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-stardust-200 dark:border-deep-space-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
                placeholder="Ask me anything about TruthGuard..."
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-stardust-100 dark:bg-deep-space-700 border border-stardust-300 dark:border-deep-space-600 rounded-lg focus:ring-2 focus:ring-electric-teal-500 focus:border-transparent text-sm disabled:opacity-50"
              />
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-stardust-200 dark:bg-deep-space-600 hover:bg-stardust-300 dark:hover:bg-deep-space-500'
                } disabled:opacity-50`}
                title={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                className="p-2 bg-gradient-to-r from-cosmic-purple-500 to-electric-teal-500 text-white rounded-lg hover:from-cosmic-purple-600 hover:to-electric-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Send message"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ChatbotAssistant;