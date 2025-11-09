/**
 * Learning Path Visualizer
 * Interactive visualization of student's learning journey
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getSubjectColor, getGradeTheme } from '@/lib/classroomThemes';

/**
 * Main Learning Path Visualizer Component
 */
export default function LearningPathVisualizer({ student, subject, learningPath }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [view, setView] = useState('path'); // path, tree, linear
  const gradeTheme = getGradeTheme(student.gradeLevel);
  const subjectColor = getSubjectColor(subject);

  if (!learningPath) {
    return <div>Loading learning path...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <PathHeader
        subject={subject}
        learningPath={learningPath}
        gradeTheme={gradeTheme}
        subjectColor={subjectColor}
      />

      {/* View Selector */}
      <div className="flex gap-2 mb-6">
        {['path', 'tree', 'linear'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              view === v
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {v === 'path' && '🗺️ Path View'}
            {v === 'tree' && '🌳 Tree View'}
            {v === 'linear' && '📊 Linear View'}
          </button>
        ))}
      </div>

      {/* Visualization */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {view === 'path' && (
          <PathView
            learningPath={learningPath}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            gradeTheme={gradeTheme}
            subjectColor={subjectColor}
          />
        )}
        {view === 'tree' && (
          <TreeView
            learningPath={learningPath}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            gradeTheme={gradeTheme}
            subjectColor={subjectColor}
          />
        )}
        {view === 'linear' && (
          <LinearView
            learningPath={learningPath}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            gradeTheme={gradeTheme}
            subjectColor={subjectColor}
          />
        )}
      </div>

      {/* Topic Detail Panel */}
      {selectedTopic && (
        <TopicDetailPanel
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          gradeTheme={gradeTheme}
          subjectColor={subjectColor}
        />
      )}
    </div>
  );
}

/**
 * Path Header
 */
function PathHeader({ subject, learningPath, gradeTheme, subjectColor }) {
  const completionRate =
    (learningPath.completedTopics / learningPath.totalTopics) * 100;

  return (
    <div
      className="rounded-xl shadow-lg p-6 mb-6 text-white"
      style={{ background: `linear-gradient(135deg, ${subjectColor}, ${adjustColor(subjectColor, -30)})` }}
    >
      <h1 className={`font-bold mb-2 ${gradeTheme.textSize.title}`}>
        {subject.charAt(0).toUpperCase() + subject.slice(1)} Learning Path
      </h1>
      <p className={gradeTheme.textSize.large}>
        {learningPath.completedTopics} of {learningPath.totalTopics} topics completed
      </p>

      {/* Progress Bar */}
      <div className="mt-4 bg-white bg-opacity-20 rounded-full h-4">
        <div
          className="h-4 rounded-full bg-white transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        ></div>
      </div>
      <div className={`mt-2 text-right ${gradeTheme.textSize.base}`}>
        {Math.round(completionRate)}% Complete
      </div>
    </div>
  );
}

/**
 * Path View - Interactive map-like visualization
 */
function PathView({ learningPath, selectedTopic, onSelectTopic, gradeTheme, subjectColor }) {
  return (
    <div className="relative" style={{ minHeight: '600px' }}>
      <svg
        width="100%"
        height="600"
        viewBox="0 0 1000 600"
        className="absolute top-0 left-0"
      >
        {/* Draw connections */}
        {learningPath.path.map((item, index) => {
          if (index === learningPath.path.length - 1) return null;

          const startX = 100 + (index % 5) * 180;
          const startY = 100 + Math.floor(index / 5) * 120;
          const endX = 100 + ((index + 1) % 5) * 180;
          const endY = 100 + Math.floor((index + 1) / 5) * 120;

          return (
            <line
              key={`line-${index}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={item.status === 'mastered' ? subjectColor : '#cbd5e0'}
              strokeWidth="4"
              strokeDasharray={item.status === 'locked' ? '5,5' : '0'}
            />
          );
        })}
      </svg>

      {/* Draw topic nodes */}
      <div className="relative">
        {learningPath.path.map((item, index) => {
          const x = 100 + (index % 5) * 180;
          const y = 100 + Math.floor(index / 5) * 120;

          return (
            <TopicNode
              key={item.topic.id}
              item={item}
              x={x}
              y={y}
              isSelected={selectedTopic?.id === item.topic.id}
              onClick={() => onSelectTopic(item)}
              gradeTheme={gradeTheme}
              subjectColor={subjectColor}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tree View - Hierarchical visualization
 */
function TreeView({ learningPath, selectedTopic, onSelectTopic, gradeTheme, subjectColor }) {
  // Group by prerequisites
  const levels = organizeByPrerequisites(learningPath.path);

  return (
    <div className="space-y-8">
      {levels.map((level, levelIndex) => (
        <div key={levelIndex}>
          <div className={`font-semibold mb-3 ${gradeTheme.textSize.large}`}>
            Level {levelIndex + 1}
          </div>
          <div className="flex flex-wrap gap-4">
            {level.map((item) => (
              <TopicCard
                key={item.topic.id}
                item={item}
                isSelected={selectedTopic?.id === item.topic.id}
                onClick={() => onSelectTopic(item)}
                gradeTheme={gradeTheme}
                subjectColor={subjectColor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Linear View - Simple list visualization
 */
function LinearView({ learningPath, selectedTopic, onSelectTopic, gradeTheme, subjectColor }) {
  return (
    <div className="space-y-3">
      {learningPath.path.map((item, index) => (
        <LinearTopicItem
          key={item.topic.id}
          item={item}
          index={index}
          isSelected={selectedTopic?.id === item.topic.id}
          onClick={() => onSelectTopic(item)}
          gradeTheme={gradeTheme}
          subjectColor={subjectColor}
        />
      ))}
    </div>
  );
}

/**
 * Topic Node (for path view)
 */
function TopicNode({ item, x, y, isSelected, onClick, gradeTheme, subjectColor }) {
  const status = item.status;
  const statusColors = {
    mastered: subjectColor,
    'in-progress': '#3b82f6',
    'not-started': '#9ca3af',
    locked: '#d1d5db',
  };

  const statusIcons = {
    mastered: '⭐',
    'in-progress': '📚',
    'not-started': '○',
    locked: '🔒',
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all hover:scale-110 ${
        isSelected ? 'scale-125 z-10' : ''
      }`}
      style={{
        left: `${x - 40}px`,
        top: `${y - 40}px`,
        width: '80px',
        height: '80px',
      }}
      onClick={onClick}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-3xl shadow-lg"
        style={{
          backgroundColor: statusColors[status],
          border: isSelected ? '4px solid #000' : 'none',
        }}
      >
        {statusIcons[status]}
      </div>
      <div className={`text-center mt-2 ${gradeTheme.textSize.tiny} font-medium truncate`}>
        {item.topic.name}
      </div>
    </div>
  );
}

/**
 * Topic Card (for tree view)
 */
function TopicCard({ item, isSelected, onClick, gradeTheme, subjectColor }) {
  const statusColors = {
    mastered: 'from-green-400 to-green-600',
    'in-progress': 'from-blue-400 to-blue-600',
    'not-started': 'from-gray-300 to-gray-400',
    locked: 'from-gray-200 to-gray-300',
  };

  const statusIcons = {
    mastered: '⭐',
    'in-progress': '📚',
    'not-started': '○',
    locked: '🔒',
  };

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-xl ${
        isSelected ? 'ring-4 ring-blue-500 scale-105' : ''
      } bg-gradient-to-br ${statusColors[item.status]}`}
      style={{ minWidth: '150px' }}
      onClick={onClick}
    >
      <div className="text-3xl mb-2 text-center">{statusIcons[item.status]}</div>
      <div className={`text-white font-semibold text-center ${gradeTheme.textSize.small}`}>
        {item.topic.name}
      </div>
      {item.readiness < 100 && item.status === 'not-started' && (
        <div className={`text-white text-center mt-1 ${gradeTheme.textSize.tiny}`}>
          {Math.round(item.readiness)}% ready
        </div>
      )}
    </div>
  );
}

/**
 * Linear Topic Item
 */
function LinearTopicItem({ item, index, isSelected, onClick, gradeTheme, subjectColor }) {
  const statusIcons = {
    mastered: '✅',
    'in-progress': '⏳',
    'not-started': '⭕',
    locked: '🔒',
  };

  const statusColors = {
    mastered: 'bg-green-50 border-green-500',
    'in-progress': 'bg-blue-50 border-blue-500',
    'not-started': 'bg-gray-50 border-gray-300',
    locked: 'bg-gray-50 border-gray-200',
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
        statusColors[item.status]
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      <div className="text-3xl">{statusIcons[item.status]}</div>
      <div className="flex-1">
        <div className={`font-semibold ${gradeTheme.textSize.base}`}>
          {index + 1}. {item.topic.name}
        </div>
        <div className={`text-gray-600 ${gradeTheme.textSize.small}`}>
          {item.topic.description || 'No description'}
        </div>
        {item.readiness < 100 && item.status === 'not-started' && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Readiness</span>
              <span>{Math.round(item.readiness)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${item.readiness}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      <div className={`${gradeTheme.textSize.small} text-gray-500`}>
        ~{item.estimatedDuration} min
      </div>
    </div>
  );
}

/**
 * Topic Detail Panel
 */
function TopicDetailPanel({ topic, onClose, gradeTheme, subjectColor }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="p-6 text-white rounded-t-xl"
          style={{ backgroundColor: subjectColor }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`font-bold ${gradeTheme.textSize.xl}`}>
                {topic.topic.name}
              </h2>
              <p className={`mt-1 ${gradeTheme.textSize.base}`}>
                {topic.topic.description || 'Learn about this topic'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-3xl hover:scale-110 transition-transform"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div>
            <div className={`font-semibold mb-2 ${gradeTheme.textSize.base}`}>
              Status
            </div>
            <StatusBadge status={topic.status} gradeTheme={gradeTheme} />
          </div>

          {/* Duration */}
          <div>
            <div className={`font-semibold mb-2 ${gradeTheme.textSize.base}`}>
              ⏱️ Estimated Duration
            </div>
            <div className={gradeTheme.textSize.base}>
              {topic.estimatedDuration || 20} minutes
            </div>
          </div>

          {/* Prerequisites */}
          {topic.topic.prerequisites && topic.topic.prerequisites.length > 0 && (
            <div>
              <div className={`font-semibold mb-2 ${gradeTheme.textSize.base}`}>
                📋 Prerequisites
              </div>
              <div className="flex flex-wrap gap-2">
                {topic.topic.prerequisites.map((prereq) => (
                  <span
                    key={prereq}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Readiness */}
          {topic.status === 'not-started' && topic.readiness < 100 && (
            <div>
              <div className={`font-semibold mb-2 ${gradeTheme.textSize.base}`}>
                🎯 Readiness
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full"
                    style={{
                      width: `${topic.readiness}%`,
                      backgroundColor: subjectColor,
                    }}
                  ></div>
                </div>
                <div className="font-semibold">{Math.round(topic.readiness)}%</div>
              </div>
              <p className={`mt-2 text-gray-600 ${gradeTheme.textSize.small}`}>
                Complete prerequisites to increase readiness
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            {topic.status === 'locked' ? (
              <button
                disabled
                className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold"
              >
                🔒 Locked - Complete Prerequisites First
              </button>
            ) : topic.status === 'mastered' ? (
              <button
                className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
              >
                ✅ Review This Topic
              </button>
            ) : topic.status === 'in-progress' ? (
              <button
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
              >
                📚 Continue Learning
              </button>
            ) : (
              <button
                className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90"
                style={{ backgroundColor: subjectColor }}
              >
                🚀 Start Learning
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Status Badge
 */
function StatusBadge({ status, gradeTheme }) {
  const statusConfig = {
    mastered: { bg: 'bg-green-100', text: 'text-green-800', icon: '⭐', label: 'Mastered' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📚', label: 'In Progress' },
    'not-started': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '○', label: 'Not Started' },
    locked: { bg: 'bg-gray-100', text: 'text-gray-500', icon: '🔒', label: 'Locked' },
  };

  const config = statusConfig[status] || statusConfig['not-started'];

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${config.bg} ${config.text}`}>
      <span className="text-xl">{config.icon}</span>
      <span className={`font-semibold ${gradeTheme.textSize.base}`}>{config.label}</span>
    </div>
  );
}

/* ========== Helper Functions ========== */

/**
 * Organize topics by prerequisite levels
 */
function organizeByPrerequisites(path) {
  const levels = [];
  const processed = new Set();

  // Start with topics that have no prerequisites
  let currentLevel = path.filter(
    (item) => !item.topic.prerequisites || item.topic.prerequisites.length === 0
  );

  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    currentLevel.forEach((item) => processed.add(item.topic.id));

    // Find topics whose prerequisites are all processed
    currentLevel = path.filter((item) => {
      if (processed.has(item.topic.id)) return false;
      if (!item.topic.prerequisites || item.topic.prerequisites.length === 0) return false;

      return item.topic.prerequisites.every((prereq) => processed.has(prereq));
    });
  }

  // Add any remaining topics
  const remaining = path.filter((item) => !processed.has(item.topic.id));
  if (remaining.length > 0) {
    levels.push(remaining);
  }

  return levels;
}

/**
 * Adjust color brightness
 */
function adjustColor(color, amount) {
  // Simple color adjustment - in production, use a proper color library
  return color;
}

export default LearningPathVisualizer;
