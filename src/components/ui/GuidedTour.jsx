import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const GuidedTour = ({ isActive, onComplete, onSkip, tourType = 'welcome' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const { toast } = useToast();

  const tours = {
    welcome: {
      title: "Welcome to TruthGuard",
      description: "Let's take a quick tour of your new truth verification platform",
      steps: [
        {
          id: 'welcome',
          title: "Welcome to TruthGuard! 🛡️",
          content: "Your advanced truth verification platform powered by AI, blockchain, and cutting-edge analytics. Let's explore the key features together.",
          target: null,
          position: 'center',
          icon: Shield,
          color: 'from-cosmic-purple-500 to-electric-teal-500'
        },
        {
          id: 'navigation',
          title: "Navigation Menu",
          content: "Access all platform features from here. Dashboard for analytics, Verify for content analysis, and more.",
          target: '[data-tour="navigation"]',
          position: 'bottom',
          icon: Target,
          color: 'from-electric-teal-500 to-nebula-pink-500'
        },
        {
          id: 'verify-button',
          title: "Start Verification",
          content: "Click here to begin verifying content. Upload files, record audio, or analyze text for authenticity.",
          target: '[data-tour="verify-button"]',
          position: 'bottom',
          icon: Zap,
          color: 'from-nebula-pink-500 to-stellar-gold-500'
        },
        {
          id: 'dashboard',
          title: "Analytics Dashboard",
          content: "View your verification history, success rates, and detailed analytics about your content analysis.",
          target: '[data-tour="dashboard"]',
          position: 'bottom',
          icon: Target,
          color: 'from-stellar-gold-500 to-cosmic-purple-500'
        },
        {
          id: 'profile',
          title: "Your Profile",
          content: "Manage your account settings, subscription, and preferences. Access advanced features and customization options.",
          target: '[data-tour="profile"]',
          position: 'bottom',
          icon: Lightbulb,
          color: 'from-cosmic-purple-500 to-electric-teal-500'
        }
      ]
    },
    verification: {
      title: "Content Verification Guide",
      description: "Learn how to verify content effectively",
      steps: [
        {
          id: 'upload-area',
          title: "Upload Your Content",
          content: "Drag and drop files here or click to browse. We support video, audio, text, and image files up to 100MB.",
          target: '[data-tour="upload-area"]',
          position: 'top',
          icon: Zap,
          color: 'from-blue-500 to-purple-500'
        },
        {
          id: 'analysis-options',
          title: "Analysis Options",
          content: "Choose your analysis type: deepfake detection for videos, voice authentication for audio, or fact-checking for text.",
          target: '[data-tour="analysis-options"]',
          position: 'right',
          icon: Shield,
          color: 'from-purple-500 to-pink-500'
        },
        {
          id: 'results-panel',
          title: "Verification Results",
          content: "View detailed analysis results including confidence scores, flags, and recommendations for next steps.",
          target: '[data-tour="results-panel"]',
          position: 'left',
          icon: Target,
          color: 'from-pink-500 to-orange-500'
        }
      ]
    },
    dashboard: {
      title: "Dashboard Overview",
      description: "Understanding your analytics and insights",
      steps: [
        {
          id: 'stats-cards',
          title: "Key Metrics",
          content: "Monitor your verification statistics, success rates, and overall platform usage at a glance.",
          target: '[data-tour="stats-cards"]',
          position: 'bottom',
          icon: Target,
          color: 'from-green-500 to-blue-500'
        },
        {
          id: 'charts',
          title: "Trend Analysis",
          content: "Visualize your verification trends over time and identify patterns in your content analysis.",
          target: '[data-tour="charts"]',
          position: 'top',
          icon: Lightbulb,
          color: 'from-blue-500 to-purple-500'
        },
        {
          id: 'recent-activity',
          title: "Recent Activity",
          content: "Keep track of your latest verifications and quickly access recent results and reports.",
          target: '[data-tour="recent-activity"]',
          position: 'left',
          icon: Zap,
          color: 'from-purple-500 to-pink-500'
        }
      ]
    }
  };

  const currentTour = tours[tourType];
  const currentStepData = currentTour.steps[currentStep];

  useEffect(() => {
    if (isActive && isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < currentTour.steps.length - 1) {
          nextStep();
        } else {
          completeTour();
        }
      }, 8000); // Auto-advance after 8 seconds

      return () => clearTimeout(timer);
    }
  }, [currentStep, isActive, isPlaying]);

  useEffect(() => {
    if (isActive && currentStepData?.target) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tour-highlight');
        
        return () => {
          element.classList.remove('tour-highlight');
        };
      }
    }
  }, [currentStep, isActive]);

  const nextStep = () => {
    if (currentStep < currentTour.steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const completeTour = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    toast({
      title: "Tour Completed! 🎉",
      description: "You're all set to start using TruthGuard effectively.",
      variant: "success"
    });
    onComplete?.();
  };

  const skipTour = () => {
    toast({
      title: "Tour Skipped",
      description: "You can restart the tour anytime from the help menu.",
    });
    onSkip?.();
  };

  const restartTour = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(true);
  };

  const getTooltipPosition = () => {
    if (!currentStepData?.target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const element = document.querySelector(currentStepData.target);
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const rect = element.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';
    
    switch (position) {
      case 'top':
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  if (!isActive) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Tour Tooltip */}
      <AnimatePresence>
        <motion.div
          className="fixed z-50 max-w-sm"
          style={currentStepData?.position === 'center' ? 
            { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } : 
            getTooltipPosition()
          }
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="card-glass p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {currentStepData?.icon && (
                  <div className={`w-10 h-10 bg-gradient-to-r ${currentStepData.color} rounded-full flex items-center justify-center`}>
                    <currentStepData.icon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-deep-space-900 dark:text-stardust-50">
                    {currentStepData?.title}
                  </h3>
                  <p className="text-xs text-stardust-500 dark:text-deep-space-400">
                    Step {currentStep + 1} of {currentTour.steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="p-2 hover:bg-stardust-200 dark:hover:bg-deep-space-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-stardust-700 dark:text-stardust-300 mb-6 leading-relaxed">
              {currentStepData?.content}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-stardust-500 dark:text-deep-space-400">
                  Progress
                </span>
                <span className="text-xs text-stardust-500 dark:text-deep-space-400">
                  {Math.round(((currentStep + 1) / currentTour.steps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-stardust-200 dark:bg-deep-space-700 rounded-full h-2">
                <motion.div
                  className={`h-2 bg-gradient-to-r ${currentStepData?.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / currentTour.steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {currentTour.steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-cosmic-purple-500 scale-125'
                      : completedSteps.has(index)
                      ? 'bg-green-500'
                      : 'bg-stardust-300 dark:bg-deep-space-600'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-stardust-200 dark:hover:bg-deep-space-700 rounded-lg transition-colors"
                  title={isPlaying ? 'Pause tour' : 'Resume tour'}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={restartTour}
                  className="p-2 hover:bg-stardust-200 dark:hover:bg-deep-space-700 rounded-lg transition-colors"
                  title="Restart tour"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-3 py-2 bg-stardust-200 dark:bg-deep-space-700 hover:bg-stardust-300 dark:hover:bg-deep-space-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back</span>
                </button>
                
                {currentStep === currentTour.steps.length - 1 ? (
                  <button
                    onClick={completeTour}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all transform hover:scale-105"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Complete</span>
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentStepData?.color} hover:opacity-90 text-white rounded-lg transition-all transform hover:scale-105`}
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Highlight Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(151, 71, 255, 0.5), 0 0 20px rgba(151, 71, 255, 0.3);
          border-radius: 8px;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(151, 71, 255, 0.5), 0 0 20px rgba(151, 71, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(151, 71, 255, 0.3), 0 0 30px rgba(151, 71, 255, 0.5);
          }
        }
      `}</style>
    </>
  );
};

export default GuidedTour;