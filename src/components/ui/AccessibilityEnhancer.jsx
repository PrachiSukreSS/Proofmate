import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Type,
  Contrast,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  Settings,
  X
} from 'lucide-react';

const AccessibilityEnhancer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    focusIndicators: true,
    colorBlindFriendly: false,
    textToSpeech: false
  });

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Apply settings on load
    applySettings(settings);
  }, []);

  useEffect(() => {
    // Save settings when they change
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (newSettings) => {
    const root = document.documentElement;
    
    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Color blind friendly
    if (newSettings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }

    // Enhanced focus indicators
    if (newSettings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Keyboard navigation
    if (newSettings.keyboardNavigation) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false,
      focusIndicators: true,
      colorBlindFriendly: false,
      textToSpeech: false
    };
    setSettings(defaultSettings);
  };

  const accessibilityOptions = [
    {
      key: 'highContrast',
      label: 'High Contrast',
      description: 'Increase contrast for better visibility',
      icon: Contrast
    },
    {
      key: 'largeText',
      label: 'Large Text',
      description: 'Increase text size for easier reading',
      icon: Type
    },
    {
      key: 'reducedMotion',
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions',
      icon: EyeOff
    },
    {
      key: 'focusIndicators',
      label: 'Enhanced Focus',
      description: 'Stronger focus indicators for navigation',
      icon: Eye
    },
    {
      key: 'keyboardNavigation',
      label: 'Keyboard Navigation',
      description: 'Enhanced keyboard navigation support',
      icon: Keyboard
    },
    {
      key: 'colorBlindFriendly',
      label: 'Color Blind Friendly',
      description: 'Adjust colors for color vision deficiency',
      icon: MousePointer
    },
    {
      key: 'textToSpeech',
      label: 'Text to Speech',
      description: 'Enable text-to-speech functionality',
      icon: Volume2
    }
  ];

  return (
    <>
      {/* Accessibility Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        aria-label="Open accessibility settings"
      >
        <Eye className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed left-6 bottom-24 z-50 w-80 max-h-[70vh] bg-white dark:bg-deep-space-800 rounded-2xl shadow-2xl border border-stardust-200 dark:border-deep-space-700 overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-white" />
                  <div>
                    <h3 className="font-semibold text-white">Accessibility</h3>
                    <p className="text-xs text-white/80">Customize your experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {accessibilityOptions.map((option) => {
                    const Icon = option.icon;
                    const isEnabled = settings[option.key];
                    
                    return (
                      <div
                        key={option.key}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-stardust-50 dark:hover:bg-deep-space-700 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isEnabled 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : 'bg-stardust-200 dark:bg-deep-space-600 text-stardust-600 dark:text-stardust-400'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-deep-space-900 dark:text-stardust-50">
                              {option.label}
                            </h4>
                            <button
                              onClick={() => toggleSetting(option.key)}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                isEnabled 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                                  : 'bg-stardust-300 dark:bg-deep-space-600'
                              }`}
                              aria-label={`Toggle ${option.label}`}
                            >
                              <motion.div
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                animate={{ x: isEnabled ? 26 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                          <p className="text-sm text-stardust-600 dark:text-stardust-400 mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reset Button */}
                <div className="mt-6 pt-4 border-t border-stardust-200 dark:border-deep-space-700">
                  <button
                    onClick={resetSettings}
                    className="w-full p-3 bg-stardust-100 dark:bg-deep-space-700 hover:bg-stardust-200 dark:hover:bg-deep-space-600 rounded-lg transition-colors text-center"
                  >
                    <span className="text-sm font-medium text-deep-space-900 dark:text-stardust-50">
                      Reset to Defaults
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Accessibility Styles */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(150%);
        }
        
        .large-text {
          font-size: 120% !important;
        }
        
        .large-text * {
          font-size: inherit !important;
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .enhanced-focus *:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        .keyboard-nav {
          --focus-ring-width: 3px;
          --focus-ring-color: #3b82f6;
        }
        
        .color-blind-friendly {
          --primary-color: #0066cc;
          --secondary-color: #ff6600;
          --success-color: #009900;
          --warning-color: #ffcc00;
          --error-color: #cc0000;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .reduce-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        @media (prefers-contrast: high) {
          .high-contrast {
            filter: contrast(200%);
          }
        }
      `}</style>
    </>
  );
};

export default AccessibilityEnhancer;