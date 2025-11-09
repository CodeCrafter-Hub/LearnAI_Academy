'use client';

import { useState, useEffect } from 'react';
import { Clock, Coffee, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BreakReminder Component
 * Shows timer-based break reminders during study sessions
 */
export default function BreakReminder({ 
  sessionStartTime, 
  gradeLevel, 
  onBreakStart,
  onDismiss 
}) {
  const [breakInfo, setBreakInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakActivities, setBreakActivities] = useState([]);

  useEffect(() => {
    if (!sessionStartTime) return;

    const checkBreakTime = async () => {
      try {
        const sessionDuration = Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 1000 / 60);
        
        const response = await fetch(
          `/api/study/break-reminder?sessionDuration=${sessionDuration}&gradeLevel=${gradeLevel}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          setBreakInfo(data);
          setTimeRemaining(data.nextBreakIn);
          setBreakActivities(data.activities || []);
          
          if (data.shouldTakeBreak) {
            setShowBreakModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking break time:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkBreakTime, 60000);
    checkBreakTime(); // Initial check

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      if (timeRemaining !== null && timeRemaining > 0) {
        setTimeRemaining(prev => prev - 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [sessionStartTime, gradeLevel, timeRemaining]);

  const handleStartBreak = () => {
    setShowBreakModal(false);
    if (onBreakStart) {
      onBreakStart(breakInfo.breakDuration);
    }
  };

  const handleDismiss = () => {
    setShowBreakModal(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Show countdown banner when break is approaching
  if (!showBreakModal && breakInfo && timeRemaining !== null && timeRemaining <= 5 && timeRemaining > 0) {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
          <span className="text-yellow-800 font-medium">
            Break in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}!
          </span>
        </div>
      </motion.div>
    );
  }

  // Break modal
  return (
    <AnimatePresence>
      {showBreakModal && breakInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Time for a Break!</h3>
                  <p className="text-sm text-gray-600">{breakInfo.message}</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  {breakInfo.breakDuration}-minute {breakInfo.breakType} break
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Take time to rest and recharge. You've earned it! 🎉
              </p>
            </div>

            {breakActivities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Break Activity Ideas:</h4>
                <ul className="space-y-1">
                  {breakActivities.slice(0, 3).map((activity, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleStartBreak}
                className="flex-1 btn btn-primary"
              >
                Start Break
              </button>
              <button
                onClick={handleDismiss}
                className="btn btn-secondary"
              >
                Continue Studying
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

