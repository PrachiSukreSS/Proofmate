import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Clock, Wifi, X } from 'lucide-react';

const PerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    tti: 0,
    cls: 0,
    fid: 0,
    lcp: 0,
    score: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Performance monitoring
    const measurePerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        const tti = navigation.loadEventEnd - navigation.fetchStart;
        
        // Simulate other metrics for demo
        const cls = Math.random() * 0.1;
        const fid = Math.random() * 100;
        const lcp = fcp + Math.random() * 1000;
        
        // Calculate performance score (0-100)
        const score = Math.max(0, 100 - (fcp / 50) - (tti / 100) - (cls * 1000) - (fid / 10) - (lcp / 100));
        
        setMetrics({
          fcp: Math.round(fcp),
          tti: Math.round(tti),
          cls: Math.round(cls * 1000) / 1000,
          fid: Math.round(fid),
          lcp: Math.round(lcp),
          score: Math.round(score)
        });
      }
    };

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Show performance indicator only if score is very low (below 60)
    const timer = setTimeout(() => {
      if (metrics.score < 60 && metrics.score > 0) {
        setIsVisible(true);
        // Auto-hide after 4 seconds
        setTimeout(() => setIsVisible(false), 4000);
      }
    }, 3000);

    return () => {
      window.removeEventListener('load', measurePerformance);
      clearTimeout(timer);
    };
  }, [metrics.score]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        className="fixed bottom-24 right-6 z-40 max-w-sm"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="card-glass p-4 shadow-2xl rounded-2xl border border-purple-200/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div 
                className={`w-8 h-8 bg-gradient-to-r ${getScoreColor(metrics.score)} rounded-full flex items-center justify-center`}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Performance</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{getScoreLabel(metrics.score)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <motion.div 
                  className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(metrics.score)} bg-clip-text text-transparent`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {metrics.score}
                </motion.div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
              </div>
              <motion.button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                aria-label="Dismiss"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                FCP
              </span>
              <span className={metrics.fcp < 1500 ? 'text-green-600' : 'text-red-600'}>
                {metrics.fcp}ms
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                TTI
              </span>
              <span className={metrics.tti < 3500 ? 'text-green-600' : 'text-red-600'}>
                {metrics.tti}ms
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                CLS
              </span>
              <span className={metrics.cls < 0.1 ? 'text-green-600' : 'text-red-600'}>
                {metrics.cls}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PerformanceOptimizer;