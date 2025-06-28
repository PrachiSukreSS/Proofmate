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
  RefreshCw,
  Shield,
  Brain,
  HelpCircle,
  Sparkles,
  Heart
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const ChatbotAssistant = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi there! 👋 I'm your friendly ProofMate assistant! I'm here to help you with voice recording, AI analysis, and any questions about our platform. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { toast } = useToast();

  const quickActions = [
    {
      icon: Shield,
      label: 'How to Verify',
      message: 'How do I verify content?',
      color: 'text-blue-600'
    },
    {
      icon: Brain,
      label: 'AI Features',
      message: 'What AI features are available?',
      color: 'text-purple-600'
    },
    {
      icon: HelpCircle,
      label: 'Get Help',
      message: 'I need help with the platform',
      color: 'text-green-600'
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      
      const responses = {
        verification: [
          "To verify content: 1) Go to the Verify page, 2) Upload your file, 3) Wait for AI analysis, 4) Review the detailed results with confidence scores. ✨",
          "Our verification process uses advanced AI to analyze content authenticity, detect manipulation, and provide confidence scores. It's powered by cutting-edge technology! 🚀"
        ],
        features: [
          "ProofMate offers amazing features: AI-powered content analysis, blockchain verification, detailed reporting, and real-time processing! 🎯",
          "Key features include: Multi-format support (video, audio, text, images), confidence scoring, comprehensive analytics, and seamless integrations! 💫"
        ],
        help: [
          "I'm here to help! 😊 I can assist with: Platform navigation, understanding results, troubleshooting issues, and explaining features.",
          "For technical support: Check file formats, ensure stable internet, and contact our amazing support team if issues persist! 🛠️"
        ],
        default: [
          "I'm here to help with ProofMate! 🌟 Ask me about verification, features, or any questions about the platform.",
          "You can ask me about content verification, platform features, or how to use specific tools. I love helping! 💝"
        ]
      };

      // Simple keyword matching
      const lowerMessage = userMessage.toLowerCase();
      let responseCategory = 'default';
      
      if (lowerMessage.includes('verify') || lowerMessage.includes('check') || lowerMessage.includes('analyze')) {
        responseCategory = 'verification';
      } else if (lowerMessage.includes('feature') || lowerMessage.includes('ai') || lowerMessage.includes('capability')) {
        responseCategory = 'features';
      } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
        responseCategory = 'help';
      }

      const categoryResponses = responses[responseCategory];
      const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "Oops! I'm having a little hiccup. 😅 Please try again or contact our support team!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');

    await generateBotResponse(messageToProcess);
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.message);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Chat cleared! 🧹✨ How can I help you with ProofMate today?",
        timestamp: new Date()
      }
    ]);
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <MessageCircle className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
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
      } bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Bot className="h-5 w-5 text-white" />
          </motion.div>
          {!isMinimized && (
            <div className="text-white">
              <h3 className="font-bold text-lg">ProofMate Assistant</h3>
              <p className="text-xs opacity-90 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-powered help
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-white" />
            ) : (
              <Minimize2 className="h-4 w-4 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 bg-gradient-to-b from-purple-50/30 to-blue-50/30 dark:from-gray-900/30 dark:to-gray-800/30">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'bot' 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {message.type === 'bot' ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </motion.div>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <motion.div 
                      className={`p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white shadow-lg'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </motion.div>
                    <p className="text-xs text-gray-500 mt-2 px-2">
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white/80 dark:bg-gray-700/80 p-4 rounded-2xl shadow-lg">
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 bg-purple-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-indigo-500 rounded-full"
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
          <div className="p-3 border-t border-purple-200/50 dark:border-purple-700/50 bg-white/50 dark:bg-gray-800/50">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="flex flex-col items-center gap-1 p-3 bg-white/80 dark:bg-gray-700/80 hover:bg-purple-50 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`h-4 w-4 ${action.color}`} />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-purple-200/50 dark:border-purple-700/50 bg-white/50 dark:bg-gray-800/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything... 💬"
                className="flex-1 px-4 py-3 bg-white/80 dark:bg-gray-700/80 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-200"
              />
              <motion.button
                onClick={clearChat}
                className="p-3 bg-gray-200/80 dark:bg-gray-600/80 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-xl transition-colors"
                title="Clear chat"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ChatbotAssistant;