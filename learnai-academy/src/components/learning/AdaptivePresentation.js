'use client';

import { useState, useEffect } from 'react';
import { Eye, Headphones, BookOpen, Activity as ActivityIcon, Gauge, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { LearningStyleDetector, ContentAdapter, VARK_STYLES } from '@/lib/learningStyleAdaptation';

/**
 * AdaptivePresentation - Adapts content presentation based on learning style
 * 
 * Features:
 * - Learning style detection
 * - Content adaptation
 * - Pace adaptation
 * - Difficulty adaptation
 * - Presentation order optimization
 */
export default function AdaptivePresentation({ 
  studentId, 
  content, 
  gradeLevel,
  onAdaptationChange 
}) {
  const [learningStyle, setLearningStyle] = useState(null);
  const [adaptedContent, setAdaptedContent] = useState(content);
  const [pace, setPace] = useState('normal');
  const [difficulty, setDifficulty] = useState('medium');
  const [detector] = useState(() => {
    if (typeof window !== 'undefined') {
      return new LearningStyleDetector();
    }
    return null;
  });
  const [adapter] = useState(() => {
    if (detector) {
      return new ContentAdapter(detector);
    }
    return null;
  });

  useEffect(() => {
    if (studentId && detector && adapter) {
      // Detect learning style
      const style = detector.calculateLearningStyle(studentId);
      setLearningStyle(style);

      // Adapt content
      const adapted = adapter.adaptContent(studentId, content);
      setAdaptedContent(adapted);

      if (onAdaptationChange) {
        onAdaptationChange({ learningStyle: style, adaptedContent: adapted });
      }
    } else {
      // Default adaptation if no detector available
      setAdaptedContent(content);
    }
  }, [studentId, content, detector, adapter, onAdaptationChange]);

  const getLearningStyleIcon = (style) => {
    const icons = {
      visual: Eye,
      auditory: Headphones,
      reading_writing: BookOpen,
      kinesthetic: ActivityIcon,
    };
    return icons[style] || Eye;
  };

  const getLearningStyleColor = (style) => {
    const colors = {
      visual: 'blue',
      auditory: 'green',
      reading_writing: 'purple',
      kinesthetic: 'orange',
    };
    return colors[style] || 'gray';
  };

  if (!learningStyle) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Detecting your learning style...</p>
      </div>
    );
  }

  const primaryStyle = learningStyle.primaryStyle?.style || 'visual';
  const StyleIcon = getLearningStyleIcon(primaryStyle);
  const color = getLearningStyleColor(primaryStyle);
  const confidence = learningStyle.primaryStyle?.confidence || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Learning Style Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
            <StyleIcon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 capitalize">{primaryStyle.replace('_', ' ')} Learner</h4>
            <p className="text-xs text-gray-600">Confidence: {confidence}%</p>
          </div>
        </div>

        {/* Pace Control */}
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-gray-500" />
          <select
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="slow">Slower</option>
            <option value="normal">Normal</option>
            <option value="fast">Faster</option>
          </select>
        </div>
      </div>

      {/* Adaptation Info */}
      {adaptedContent.presentationOrder && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 mb-2">Content optimized for your learning style:</p>
          <div className="flex flex-wrap gap-2">
            {adaptedContent.presentationOrder.map((type, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700 capitalize"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Style-Specific Enhancements */}
      {adaptedContent.visualEnhancements && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <p className="text-xs text-blue-800">✨ Visual enhancements enabled</p>
        </div>
      )}

      {adaptedContent.audioEnhancements && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
          <p className="text-xs text-green-800">🔊 Audio enhancements enabled</p>
        </div>
      )}

      {adaptedContent.interactiveEnhancements && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
          <p className="text-xs text-orange-800">🎮 Interactive enhancements enabled</p>
        </div>
      )}

      {/* Difficulty Adaptation */}
      <div className="flex items-center gap-2 mt-4">
        <Zap className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-600">Difficulty:</span>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="easy">Easier</option>
          <option value="medium">Medium</option>
          <option value="hard">Harder</option>
        </select>
      </div>
    </div>
  );
}

