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
  Volume2,
  VolumeX,
  RefreshCw,
  Brain,
  Shield,
  Zap,
  HelpCircle,
  BookOpen,
  Target,
  Mic,
  MicOff,
  Star,
  Coffee,
  Settings
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const ChatbotAssistant = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your TruthGuard AI assistant. I can help you with verification processes, explain features, troubleshoot issues, and guide you through our platform. How can I assist you today?",
      timestamp: new Date(),
      avatar: '🤖'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { toast } = useToast();

  const quickActions = [
    {
      icon: Shield,
      label: 'How to Verify',
      message: 'How do I verify content on TruthGuard?',
      category: 'verification'
    },
    {
      icon: Brain,
      label: 'AI Features',
      message: 'What AI features are available?',
      category: 'features'
    },
    {
      icon: Zap,
      label: 'Quick Start',
      message: 'I\'m new here, show me how to get started',
      category: 'onboarding'
    },
    {
      icon: HelpCircle,
      label: 'Troubleshooting',
      message: 'I\'m having technical issues',
      category: 'support'
    },
    {
      icon: BookOpen,
      label: 'Documentation',
      message: 'Where can I find detailed documentation?',
      category: 'docs'
    },
    {
      icon: Target,
      label: 'Best Practices',
      message: 'What are the best practices for verification?',
      category: 'tips'
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
      // Add to conversation context
      setConversationContext(prev => [...prev.slice(-4), userMessage]);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      
      const responses = {
        verification: [
          "To verify content on TruthGuard: 1) Go to the Verify page, 2) Upload your file (video, audio, image, or document), 3) Select analysis type, 4) Wait for AI processing, 5) Review detailed results with confidence scores and recommendations.",
          "Our verification process uses multiple AI models: GPT-4 for content analysis, specialized deepfake detection for videos, voice authentication for audio, and blockchain verification for tamper-proof results.",
          "You can verify various content types: videos (deepfake detection), audio files (voice authentication), documents (fact-checking), and images (manipulation detection). Each gets tailored analysis."
        ],
        features: [
          "TruthGuard offers: Advanced AI analysis with confidence scores, blockchain verification for immutable proof, real-time processing, detailed reporting, API access, and integration with popular tools.",
          "Our AI features include: Content authenticity scoring, bias detection, fact-checking against reliable sources, emotional manipulation analysis, and technical authenticity markers.",
          "Key capabilities: Multi-modal analysis (video/audio/text/image), real-time processing, exportable reports, API integration, webhook support, and comprehensive analytics dashboard."
        ],
        onboarding: [
          "Welcome to TruthGuard! Here's how to start: 1) Create your account, 2) Try the demo verification, 3) Explore the dashboard, 4) Upload your first content for analysis, 5) Review the detailed results and reports.",
          "Getting started is easy: Begin with our guided tour, try a sample verification to understand the process, check your dashboard for analytics, and explore subscription options for advanced features.",
          "New user guide: Start with the verification demo, familiarize yourself with the interface, understand confidence scores, learn about different analysis types, and explore export options."
        ],
        support: [
          "For technical issues: 1) Check your internet connection, 2) Ensure file formats are supported (MP4, MP3, PDF, JPG, etc.), 3) Verify file size limits, 4) Clear browser cache, 5) Try a different browser if needed.",
          "Common solutions: Refresh the page, check file format compatibility, ensure stable internet, verify account permissions, and contact support if issues persist.",
          "Troubleshooting steps: Confirm file requirements, check browser compatibility, verify account status, test with smaller files, and use our status page for system updates."
        ],
        docs: [
          "Documentation is available in the Help section: User guides, API documentation, integration tutorials, troubleshooting guides, and video walkthroughs for all features.",
          "Find comprehensive docs at: Getting Started guide, API reference with examples, integration tutorials, best practices guide, and FAQ section with common questions.",
          "Access documentation through: Main menu Help section, in-app tooltips and guides, video tutorials, API documentation portal, and community forums for user discussions."
        ],
        tips: [
          "Best practices: 1) Use high-quality, uncompressed files, 2) Provide context about content source, 3) Cross-reference with multiple sources, 4) Review flagged items manually, 5) Keep verification history organized.",
          "For optimal results: Upload original files when possible, use clear audio/video quality, provide relevant metadata, understand confidence score meanings, and maintain verification records.",
          "Pro tips: Higher resolution yields better analysis, original files are more accurate than compressed ones, context helps interpretation, and regular verification builds trust patterns."
        ],
        default: [
          "I'm here to help with TruthGuard! I can assist with verification processes, explain features, troubleshoot issues, guide you through the platform, or answer questions about our AI capabilities.",
          "I can help you with: Content verification guidance, feature explanations, technical support, best practices, API documentation, and general platform navigation. What specific area interests you?",
          "Feel free to ask about: How verification works, understanding results, troubleshooting issues, feature capabilities, integration options, or any other TruthGuard-related questions."
        ]
      };

      // Enhanced keyword matching with context awareness
      const lowerMessage = userMessage.toLowerCase();
      let responseCategory = 'default';
      
      if (lowerMessage.includes('verify') || lowerMessage.includes('upload') || lowerMessage.includes('check') || lowerMessage.includes('analyze')) {
        responseCategory = 'verification';
      } else if (lowerMessage.includes('feature') || lowerMessage.includes('ai') || lowerMessage.includes('capability') || lowerMessage.includes('what can')) {
        responseCategory = 'features';
      } else if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('new') || lowerMessage.includes('guide') || lowerMessage.includes('tutorial')) {
        responseCategory = 'onboarding';
      } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('error') || lowerMessage.includes('trouble') || lowerMessage.includes('help') || lowerMessage.includes('fix')) {
        responseCategory = 'support';
      } else if (lowerMessage.includes('documentation') || lowerMessage.includes('docs') || lowerMessage.includes('manual') || lowerMessage.includes('api') || lowerMessage.includes('reference')) {
        responseCategory = 'docs';
      } else if (lowerMessage.includes('best') || lowerMessage.includes('practice') || lowerMessage.includes('tip') || lowerMessage.includes('recommend') || lowerMessage.includes('optimize')) {
        responseCategory = 'tips';
      }

      const categoryResponses = responses[responseCategory];
      const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        avatar: '🤖'
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
        content: "I apologize, but I'm experiencing a technical issue. Please try asking your question again, or contact our support team if the problem persists.",
        timestamp: new Date(),
        avatar: '🤖'
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
        console.error('Speech recognition error:', event.error);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.start();
    } else {
      toast({
        title: "Voice input not supported",
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
        content: "Chat cleared! I'm ready to help you with any TruthGuard questions or guidance you need.",
        timestamp: new Date(),
        avatar: '🤖'
      }
    ]);
    setConversationContext([]);
  };

  const exportChat = () => {
    const chatData = {
      messages,
      timestamp: new Date().toISOString(),
      user: user?.email || 'Anonymous'
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `truthguard-chat-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat Exported",
      description: "Your conversation has been saved",
      variant: "success"
    });
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bot className="h-2.5 w-2.5 text-white" />
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
      } glassmorphic rounded-2xl shadow-2xl overflow-hidden border border-white/20`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            animate={{ rotate: isProcessing ? 360 : 0 }}
            transition={{ duration: 2, repeat: isProcessing ? Infinity : 0 }}
          >
            <Bot className="h-5 w-5 text-white" />
          </motion.div>
          {!isMinimized && (
            <div className="text-white">
              <h3 className="font-semibold">TruthGuard Assistant</h3>
              <p className="text-xs opacity-90">AI-powered help & guidance</p>
            </div>
          )}
          {isMinimized && (
            <div className="text-white">
              <h3 className="font-semibold text-sm">AI Assistant</h3>
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
          <div className="p-3 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">
                  {messages.length - 1} messages
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1 rounded transition-colors ${voiceEnabled ? 'text-green-400' : 'text-gray-400'}`}
                  whileHover={{ scale: 1.1 }}
                  title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  onClick={exportChat}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  title="Export chat"
                >
                  <Settings className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={clearChat}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded transition-colors"
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
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    {message.type === 'bot' ? (
                      <Bot className="h-4 w-4 text-blue-400" />
                    ) : (
                      <User className="h-4 w-4 text-purple-400" />
                    )}
                  </motion.div>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <motion.div 
                      className={`p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-white/10 text-gray-100 border border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </motion.div>
                    <p className="text-xs text-gray-400 mt-1">
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
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-400" />
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
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
              {quickActions.slice(0, 4).map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-3 w-3 text-blue-400" />
                    <span className="truncate font-medium text-gray-200">{action.label}</span>
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
                placeholder="Ask me anything about TruthGuard..."
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm disabled:opacity-50 placeholder-gray-400 text-white"
              />
              <motion.button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                } disabled:opacity-50 border border-white/20`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </motion.button>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/20"
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