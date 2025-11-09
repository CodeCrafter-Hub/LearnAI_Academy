'use client';

import { useState, useEffect } from 'react';
import { Focus, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FocusMode Component
 * Provides distraction-free learning environment
 */
export default function FocusMode({ children, enabled, onToggle }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (enabled) {
      // Hide distractions
      document.body.style.overflow = 'hidden';
      
      // Add focus mode class
      document.documentElement.classList.add('focus-mode');
      
      return () => {
        document.body.style.overflow = '';
        document.documentElement.classList.remove('focus-mode');
      };
    }
  }, [enabled]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (!enabled) {
    return children;
  }

  return (
    <div className="focus-mode-container relative">
      {/* Focus Mode Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Focus className="w-5 h-5" />
          <span className="font-semibold">Focus Mode</span>
          <span className="text-xs opacity-90">Distraction-free learning</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Exit Focus Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Content with padding for header */}
      <div style={{ paddingTop: '60px' }}>
        {children}
      </div>

      {/* Focus Mode Styles */}
      <style jsx global>{`
        .focus-mode {
          --distraction-opacity: 0.1;
        }
        
        .focus-mode header,
        .focus-mode nav,
        .focus-mode footer,
        .focus-mode .sidebar,
        .focus-mode .notification-center,
        .focus-mode .leaderboard {
          opacity: var(--distraction-opacity);
          pointer-events: none;
        }
        
        .focus-mode .focus-mode-container {
          max-width: 100%;
        }
        
        .focus-mode-container {
          background: var(--color-bg-base);
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}

/**
 * FocusModeToggle Component
 * Button to toggle focus mode
 */
export function FocusModeToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`btn ${enabled ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
      title={enabled ? 'Exit Focus Mode' : 'Enter Focus Mode'}
    >
      <Focus className="w-4 h-4" />
      {enabled ? 'Exit Focus' : 'Focus Mode'}
    </button>
  );
}

