import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, AlertTriangle, CheckCircle, Crown } from 'lucide-react';
import { isAdmin } from '../../utils/adminConfig';

const SessionMonitor = ({ sessionInfo }) => {
  const [showMonitor, setShowMonitor] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    try {
      if (sessionInfo) {
        setTimeRemaining(sessionInfo.timeRemaining);
        
        // Show monitor if session is expiring soon (less than 5 minutes)
        const shouldShow = sessionInfo.timeRemaining < 5 * 60 * 1000 && sessionInfo.timeRemaining > 0;
        setShowMonitor(shouldShow);
      }
    } catch (error) {
      console.warn("Session monitor update warning:", error);
    }
  }, [sessionInfo]);

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      if (timeRemaining > 0) {
        setTimeRemaining(prev => Math.max(0, prev - 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (ms) => {
    try {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.warn("Time formatting warning:", error);
      return "0:00";
    }
  };

  const getSecurityLevelColor = (level) => {
    switch (level) {
      case 'admin':
        return 'from-amber-500 to-orange-500';
      case 'premium':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-blue-500 to-green-500';
    }
  };

  const getSecurityLevelIcon = (level) => {
    switch (level) {
      case 'admin':
        return Crown;
      case 'premium':
        return Shield;
      default:
        return CheckCircle;
    }
  };

  if (!sessionInfo || !showMonitor) return null;

  const SecurityIcon = getSecurityLevelIcon(sessionInfo.securityLevel);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-24 left-6 z-40 max-w-sm"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${getSecurityLevelColor(sessionInfo.securityLevel)} rounded-full flex items-center justify-center`}>
              <SecurityIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Session Monitor
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {sessionInfo.securityLevel === 'admin' ? 'Admin Session' : 'Secure Session'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Session Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <div className="flex items-center gap-1">
                {sessionInfo.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  sessionInfo.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {sessionInfo.isValid ? 'Active' : 'Expired'}
                </span>
              </div>
            </div>

            {/* Time Remaining */}
            {sessionInfo.isValid && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Time Left</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className={`text-sm font-medium ${
                    timeRemaining < 2 * 60 * 1000 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* Security Level */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Security</span>
              <span className={`text-sm font-medium bg-gradient-to-r ${getSecurityLevelColor(sessionInfo.securityLevel)} bg-clip-text text-transparent`}>
                {sessionInfo.securityLevel.charAt(0).toUpperCase() + sessionInfo.securityLevel.slice(1)}
              </span>
            </div>

            {/* Progress Bar */}
            {sessionInfo.isValid && (
              <div className="space-y-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      timeRemaining < 2 * 60 * 1000 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-blue-500 to-green-500'
                    }`}
                    style={{ 
                      width: `${Math.max(0, (timeRemaining / (24 * 60 * 60 * 1000)) * 100)}%` 
                    }}
                  />
                </div>
                {timeRemaining < 5 * 60 * 1000 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Session expiring soon. Activity will extend your session.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionMonitor;