'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, Award, Target, TrendingUp, Flame } from 'lucide-react';

/**
 * ProgressCelebration Component
 * Animated celebrations for milestones and achievements
 */
export default function ProgressCelebration({ 
  type, 
  message, 
  show, 
  onComplete,
  duration = 3000 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 500); // Wait for exit animation
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show || !isVisible) return null;

  const getCelebrationConfig = () => {
    const configs = {
      milestone: {
        icon: Trophy,
        color: 'from-yellow-400 to-orange-500',
        emoji: '🎉',
        particles: 'stars',
      },
      achievement: {
        icon: Award,
        color: 'from-purple-400 to-pink-500',
        emoji: '🏆',
        particles: 'sparkles',
      },
      streak: {
        icon: Flame,
        color: 'from-red-400 to-orange-500',
        emoji: '🔥',
        particles: 'flames',
      },
      mastery: {
        icon: Target,
        color: 'from-blue-400 to-cyan-500',
        emoji: '🎯',
        particles: 'circles',
      },
      progress: {
        icon: TrendingUp,
        color: 'from-green-400 to-emerald-500',
        emoji: '📈',
        particles: 'dots',
      },
      perfect: {
        icon: Star,
        color: 'from-yellow-300 to-yellow-600',
        emoji: '⭐',
        particles: 'stars',
      },
    };

    return configs[type] || configs.milestone;
  };

  const config = getCelebrationConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Celebration card */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center pointer-events-auto"
          >
            {/* Icon with gradient background */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 0.6,
                repeat: 2,
              }}
              className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Emoji */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0],
              }}
              transition={{ 
                duration: 0.5,
                repeat: 2,
              }}
              className="text-6xl mb-4"
            >
              {config.emoji}
            </motion.div>

            {/* Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-800 mb-2"
            >
              {message || 'Congratulations!'}
            </motion.h2>

            {/* Particles effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: '50%',
                    y: '50%',
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className={`absolute w-2 h-2 rounded-full ${
                    config.particles === 'stars' ? 'bg-yellow-400' :
                    config.particles === 'sparkles' ? 'bg-purple-400' :
                    config.particles === 'flames' ? 'bg-orange-400' :
                    config.particles === 'circles' ? 'bg-blue-400' :
                    'bg-green-400'
                  }`}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * MiniCelebration Component
 * Smaller celebration for inline use
 */
export function MiniCelebration({ type, message, show, onComplete }) {
  const configs = {
    milestone: { emoji: '🎉', color: 'text-yellow-500' },
    achievement: { emoji: '🏆', color: 'text-purple-500' },
    streak: { emoji: '🔥', color: 'text-orange-500' },
    mastery: { emoji: '🎯', color: 'text-blue-500' },
    progress: { emoji: '📈', color: 'text-green-500' },
    perfect: { emoji: '⭐', color: 'text-yellow-500' },
  };

  const config = configs[type] || configs.milestone;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-lg ${config.color}`}
          onAnimationComplete={onComplete}
        >
          <span className="text-xl">{config.emoji}</span>
          <span className="text-sm font-semibold">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

