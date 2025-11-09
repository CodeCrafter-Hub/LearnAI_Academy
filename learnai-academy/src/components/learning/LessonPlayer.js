'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, CheckCircle, Circle, BookOpen, Video, FileText, Activity, Award, Clock, X, Zap, Target, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import BreakReminder from '@/components/study/BreakReminder';
import engagementService from '@/services/curriculum/engagementService';
import AdvancedEngagement from './AdvancedEngagement';
import AdaptivePresentation from './AdaptivePresentation';
import PreTraining from './PreTraining';
import WorkedExample from './WorkedExample';
import RealWorldConnections from './RealWorldConnections';
import LessonSummary from './LessonSummary';
import ProgressCelebration from '@/components/celebration/ProgressCelebration';

/**
 * LessonPlayer - Visual interface for students to view and interact with lessons
 * 
 * Features:
 * - Section navigation (Warm-up → Instruction → Practice → Assessment → Closure)
 * - Progress tracking
 * - Content display (slides, videos, interactive)
 * - Activity completion
 * - Note-taking
 * - Pause/Resume functionality
 */
export default function LessonPlayer({ lessonPlanId, onComplete, onExit }) {
  const [lesson, setLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState('warmUp');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [currentActivityType, setCurrentActivityType] = useState(null);
  const [activityVarietyPlan, setActivityVarietyPlan] = useState([]);
  const [showMovementBreak, setShowMovementBreak] = useState(false);
  const [movementBreaks, setMovementBreaks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [chunks, setChunks] = useState([]);
  const [showPreTraining, setShowPreTraining] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [currentWorkedExample, setCurrentWorkedExample] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showLessonCelebration, setShowLessonCelebration] = useState(false);
  const { addToast } = useToast();

  const sections = ['warmUp', 'instruction', 'practice', 'assessment', 'closure'];
  const sectionNames = {
    warmUp: 'Warm-Up',
    instruction: 'Instruction',
    practice: 'Practice',
    assessment: 'Assessment',
    closure: 'Closure',
  };

  const sectionIcons = {
    warmUp: Activity,
    instruction: BookOpen,
    practice: Activity,
    assessment: CheckCircle,
    closure: Award,
  };

  // Initialize lesson
  useEffect(() => {
    initializeLesson();
  }, [lessonPlanId]);

  // Update progress
  useEffect(() => {
    if (lesson) {
      updateProgress();
    }
  }, [currentSection, currentSlideIndex, lesson]);

  const initializeLesson = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lessons/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'lesson',
          action: 'initialize',
          lessonPlanId,
          resume: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize lesson');
      }

      const data = await response.json();
      setLesson(data.result);
      
      // Get student ID from lesson
      if (data.result?.lesson?.studentId) {
        setStudentId(data.result.lesson.studentId);
      }
      
      // Initialize activity variety and movement breaks
      if (data.result?.lessonPlan) {
        const gradeLevel = data.result.lessonPlan.gradeLevel || 5;
        const durationMinutes = data.result.lessonPlan.durationMinutes || 30;
        
        // Generate activity variety plan
        const varietyPlan = engagementService.generateActivityVariety(durationMinutes, gradeLevel);
        setActivityVarietyPlan(varietyPlan);
        
        // Generate movement breaks (for K-5)
        if (gradeLevel <= 5) {
          const breaks = engagementService.generateMovementBreaks(durationMinutes, gradeLevel);
          setMovementBreaks(breaks);
        }
        
        // Initialize chunks for cognitive load management
        initializeChunks(data.result);
        
        // Check for prerequisites (pre-training)
        const structure = data.result.content?.structure;
        if (structure?.instruction?.prerequisites) {
          setShowPreTraining(true);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing lesson:', error);
      addToast('Failed to load lesson', 'error');
      setIsLoading(false);
    }
  };

  // Initialize content chunks for cognitive load management
  const initializeChunks = (lessonData) => {
    if (!lessonData?.content?.structure) return;
    
    const structure = lessonData.content.structure;
    const allChunks = [];
    
    // Break each section into 5-10 minute chunks
    Object.keys(structure).forEach(section => {
      const sectionData = structure[section];
      if (!sectionData) return;
      
      const duration = sectionData.duration || 5;
      const chunkSize = Math.max(5, Math.min(10, Math.round(duration / 2))); // 5-10 min chunks
      const numChunks = Math.ceil(duration / chunkSize);
      
      for (let i = 0; i < numChunks; i++) {
        allChunks.push({
          section,
          chunkIndex: i,
          totalChunks: numChunks,
          startTime: i * chunkSize,
          duration: Math.min(chunkSize, duration - (i * chunkSize)),
          content: sectionData,
        });
      }
    });
    
    setChunks(allChunks);
  };

  // Check for movement break time
  useEffect(() => {
    if (movementBreaks.length === 0 || isPaused) return;
    
    const checkInterval = setInterval(() => {
      const elapsedMinutes = Math.floor((new Date() - sessionStartTime) / (1000 * 60));
      const upcomingBreak = movementBreaks.find(breakItem => 
        breakItem.time <= elapsedMinutes && breakItem.time + 1 > elapsedMinutes
      );
      
      if (upcomingBreak && !showMovementBreak) {
        setShowMovementBreak(true);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(checkInterval);
  }, [movementBreaks, sessionStartTime, isPaused, showMovementBreak]);

  // Update current activity type based on time
  useEffect(() => {
    if (activityVarietyPlan.length === 0 || isPaused) return;
    
    const updateInterval = setInterval(() => {
      const elapsedMinutes = Math.floor((new Date() - sessionStartTime) / (1000 * 60));
      const currentPlan = activityVarietyPlan.find(plan => 
        elapsedMinutes >= plan.startTime && elapsedMinutes < plan.endTime
      );
      
      if (currentPlan && currentPlan.activityType !== currentActivityType) {
        setCurrentActivityType(currentPlan.activityType);
        addToast(`Switching to ${currentPlan.activityType} activity`, 'info');
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(updateInterval);
  }, [activityVarietyPlan, sessionStartTime, isPaused, currentActivityType, addToast]);

  const updateProgress = async () => {
    if (!lesson?.lesson?.id) return;

    try {
      const sectionIndex = sections.indexOf(currentSection);
      const sectionProgress = (sectionIndex + 1) / sections.length;
      const slideProgress = currentSlideIndex > 0 ? 0.1 : 0; // Rough estimate
      const totalProgress = Math.min(100, Math.round((sectionProgress + slideProgress) * 100));

      setProgress(totalProgress);

      await fetch('/api/lessons/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'lesson',
          action: 'updateProgress',
          lessonId: lesson.lesson.id,
          progressData: { progress: totalProgress / 100 },
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handlePause = async () => {
    if (!lesson?.lesson?.id) return;

    try {
      const response = await fetch('/api/lessons/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'lesson',
          action: 'pause',
          lessonId: lesson.lesson.id,
        }),
      });

      if (response.ok) {
        setIsPaused(true);
        addToast('Lesson paused', 'success');
      }
    } catch (error) {
      console.error('Error pausing lesson:', error);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    addToast('Lesson resumed', 'success');
  };

  const handleComplete = async () => {
    if (!lesson?.lesson?.id) return;

    try {
      const response = await fetch('/api/lessons/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'lesson',
          action: 'complete',
          lessonId: lesson.lesson.id,
        }),
      });

      if (response.ok) {
        addToast('Lesson completed! 🎉', 'success');
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const goToNextSection = () => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
      setCurrentSlideIndex(0);
    } else {
      handleComplete();
    }
  };

  const goToPreviousSection = () => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
      setCurrentSlideIndex(0);
    }
  };

  const getCurrentSectionContent = () => {
    if (!lesson?.content) return null;

    const structure = lesson.content.structure || {};
    return structure[currentSection] || null;
  };

  const getCurrentPresentations = () => {
    if (!lesson?.content?.presentations) return [];
    return lesson.content.presentations.filter(p => {
      const metadata = p.metadata || {};
      return metadata.section === currentSection || !metadata.section;
    });
  };

  const getCurrentActivities = () => {
    if (!lesson?.activities) return [];
    return lesson.activities.filter(a => a.section === currentSection);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">Failed to load lesson</p>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const sectionContent = getCurrentSectionContent();
  const presentations = getCurrentPresentations();
  const activities = getCurrentActivities();
  const currentPresentation = presentations[currentSlideIndex] || presentations[0];
  const SectionIcon = sectionIcons[currentSection] || BookOpen;

  // Get current activity type icon
  const getActivityTypeIcon = (type) => {
    const icons = {
      visual: Target,
      interactive: Zap,
      practice: Activity,
      game: Award,
      discussion: BookOpen,
      project: Lightbulb,
    };
    return icons[type] || Activity;
  };

  const ActivityTypeIcon = currentActivityType ? getActivityTypeIcon(currentActivityType) : null;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Movement Break Modal */}
      {showMovementBreak && movementBreaks.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4"
          >
            <BreakReminder
              sessionStartTime={sessionStartTime}
              gradeLevel={lesson?.lessonPlan?.gradeLevel || 5}
              onBreakStart={() => {
                setIsPaused(true);
              }}
              onDismiss={() => {
                setShowMovementBreak(false);
                setIsPaused(false);
              }}
            />
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {lesson.lessonPlan?.name || 'Lesson'}
              </h1>
              <p className="text-sm text-gray-600">
                {lesson.lessonPlan?.description || 'Learning session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Pause/Resume */}
            {isPaused ? (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}

            {/* Notes Toggle */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle Notes"
            >
              <FileText className="w-5 h-5 text-gray-600" />
            </button>

            {/* Activity Type Indicator */}
            {currentActivityType && ActivityTypeIcon && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                <ActivityTypeIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 capitalize">
                  {currentActivityType}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section Navigation */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sections.map((section, index) => {
                  const Icon = sectionIcons[section];
                  const isActive = section === currentSection;
                  const isCompleted = sections.indexOf(currentSection) > index;

                  return (
                    <button
                      key={section}
                      onClick={() => {
                        setCurrentSection(section);
                        setCurrentSlideIndex(0);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{sectionNames[section]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousSection}
                  disabled={sections.indexOf(currentSection) === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNextSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {sections.indexOf(currentSection) === sections.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="w-4 h-4 inline-block ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                {/* Pre-Training (if prerequisites exist) */}
                {showPreTraining && currentSection === 'warmUp' && lesson?.content?.structure?.instruction?.prerequisites && (
                  <div className="mb-6">
                    <PreTraining
                      prerequisites={lesson.content.structure.instruction.prerequisites}
                      subjectSlug={lesson.lessonPlan?.subject?.slug || 'math'}
                      gradeLevel={lesson.lessonPlan?.gradeLevel || 5}
                      onComplete={() => setShowPreTraining(false)}
                      onSkip={() => setShowPreTraining(false)}
                    />
                  </div>
                )}

                {/* Real-World Connections */}
                {currentSection === 'warmUp' && lesson?.lessonPlan && (
                  <div className="mb-6">
                    <RealWorldConnections
                      lessonPlan={lesson.lessonPlan}
                      subjectSlug={lesson.lessonPlan?.subject?.slug || 'math'}
                      gradeLevel={lesson.lessonPlan?.gradeLevel || 5}
                    />
                  </div>
                )}

                {/* Adaptive Presentation */}
                {studentId && lesson?.content && (
                  <div className="mb-6">
                    <AdaptivePresentation
                      studentId={studentId}
                      content={lesson.content}
                      gradeLevel={lesson.lessonPlan?.gradeLevel || 5}
                    />
                  </div>
                )}

                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <SectionIcon className="w-6 h-6 text-blue-600" />
                      <h2 className="text-2xl font-bold text-gray-900">
                        {sectionNames[currentSection]}
                      </h2>
                    </div>
                    
                    {/* Chunk Indicator (Cognitive Load Management) */}
                    {chunks.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Part {currentChunk + 1} of {chunks.filter(c => c.section === currentSection).length || 1}</span>
                      </div>
                    )}
                  </div>
                  {sectionContent?.duration && (
                    <p className="text-sm text-gray-600">
                      Estimated time: {sectionContent.duration} minutes
                    </p>
                  )}
                  
                  {/* Activity Variety Indicator */}
                  {currentActivityType && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded text-xs text-purple-700">
                        <Zap className="w-3 h-3" />
                        <span className="capitalize">{currentActivityType} Activity</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Content */}
                {sectionContent && (
                  <div className="mb-6">
                    {/* Hook (for warm-up) */}
                    {sectionContent.hook && currentSection === 'warmUp' && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🎣</span>
                          <div>
                            <h3 className="font-semibold text-purple-900 mb-2">Let's Get Started!</h3>
                            <p className="text-gray-800">{sectionContent.hook.content || sectionContent.hook}</p>
                            {sectionContent.hook.visualDescription && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                {sectionContent.hook.visualDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionContent.activity && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-gray-800">{sectionContent.activity}</p>
                      </div>
                    )}
                    {sectionContent.content && (
                      <div className="prose max-w-none mb-6">
                        {typeof sectionContent.content === 'string' ? (
                          <p className="text-gray-700">{sectionContent.content}</p>
                        ) : (
                          <div className="text-gray-700">
                            {Array.isArray(sectionContent.content) ? (
                              <ul className="list-disc list-inside space-y-2">
                                {sectionContent.content.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(sectionContent.content, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* I do, We do, You do (for instruction section) */}
                    {currentSection === 'instruction' && sectionContent.iDo && (
                      <div className="space-y-6 mb-6">
                        {/* I Do - Teacher Demonstrates */}
                        {sectionContent.iDo && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                I
                              </div>
                              <div>
                                <h3 className="font-semibold text-green-900">I Do - Watch and Learn</h3>
                                <p className="text-sm text-green-700">{sectionContent.iDo.description}</p>
                              </div>
                            </div>
                            {sectionContent.iDo.thinkAloud && (
                              <div className="bg-white rounded-lg p-4 mb-3">
                                <p className="text-gray-800">{sectionContent.iDo.thinkAloud}</p>
                              </div>
                            )}
                            {sectionContent.iDo.examples && sectionContent.iDo.examples.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Examples:</h4>
                                {sectionContent.iDo.examples.map((example, idx) => (
                                  <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-gray-700">{example}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionContent.iDo.keyPoints && sectionContent.iDo.keyPoints.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {sectionContent.iDo.keyPoints.map((point, idx) => (
                                    <li key={idx} className="text-gray-700">{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* We Do - Guided Practice */}
                        {sectionContent.weDo && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                We
                              </div>
                              <div>
                                <h3 className="font-semibold text-blue-900">We Do - Let's Work Together</h3>
                                <p className="text-sm text-blue-700">{sectionContent.weDo.description}</p>
                              </div>
                            </div>
                            {sectionContent.weDo.scaffolding && (
                              <div className="bg-white rounded-lg p-4 mb-3">
                                <p className="text-gray-800">{sectionContent.weDo.scaffolding}</p>
                              </div>
                            )}
                            {sectionContent.weDo.activities && sectionContent.weDo.activities.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Guided Activities:</h4>
                                {sectionContent.weDo.activities.map((activity, idx) => (
                                  <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-gray-700">{activity}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* You Do - Independent Practice */}
                        {sectionContent.youDo && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                You
                              </div>
                              <div>
                                <h3 className="font-semibold text-purple-900">You Do - Try It Yourself</h3>
                                <p className="text-sm text-purple-700">{sectionContent.youDo.description}</p>
                              </div>
                            </div>
                            {sectionContent.youDo.support && (
                              <div className="bg-white rounded-lg p-4 mb-3">
                                <p className="text-gray-800">{sectionContent.youDo.support}</p>
                              </div>
                            )}
                            {sectionContent.youDo.activities && sectionContent.youDo.activities.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Independent Activities:</h4>
                                {sectionContent.youDo.activities.map((activity, idx) => (
                                  <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-gray-700">{activity}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionContent.youDo.checkForUnderstanding && (
                              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-900 mb-2">Check Your Understanding:</h4>
                                <p className="text-gray-800">{sectionContent.youDo.checkForUnderstanding}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Presentations (Slides/Videos) with Multimedia Principles */}
                {currentPresentation && (
                  <div className="mb-6">
                    {currentPresentation.contentType === 'SLIDES' && (
                      <SlidePresentation
                        presentation={currentPresentation}
                        currentIndex={currentSlideIndex}
                        onIndexChange={setCurrentSlideIndex}
                        applyMultimediaPrinciples={true}
                      />
                    )}
                    {currentPresentation.contentType === 'VIDEO' && (
                      <VideoPresentation 
                        presentation={currentPresentation}
                        applyMultimediaPrinciples={true}
                      />
                    )}
                    {currentPresentation.contentType === 'INTERACTIVE' && (
                      <InteractivePresentation 
                        presentation={currentPresentation}
                        applyMultimediaPrinciples={true}
                      />
                    )}
                  </div>
                )}

                {/* Worked Example (for complex problems) */}
                {showWorkedExample && currentWorkedExample && (
                  <div className="mb-6">
                    <WorkedExample
                      problem={currentWorkedExample}
                      subjectSlug={lesson?.lessonPlan?.subject?.slug || 'math'}
                      gradeLevel={lesson?.lessonPlan?.gradeLevel || 5}
                      onComplete={() => {
                        setShowWorkedExample(false);
                        setCurrentWorkedExample(null);
                      }}
                    />
                  </div>
                )}

                {/* Advanced Engagement Techniques */}
                {sectionContent?.engagementTechnique && (
                  <div className="mb-6">
                    <AdvancedEngagement
                      technique={sectionContent.engagementTechnique}
                      content={sectionContent.engagementContent || {}}
                      gradeLevel={lesson?.lessonPlan?.gradeLevel || 5}
                      onComplete={(result) => {
                        addToast('Great work on the activity!', 'success');
                      }}
                    />
                  </div>
                )}

                {/* Activities */}
                {activities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <ActivityCard 
                          key={activity.id} 
                          activity={activity}
                          onShowWorkedExample={(problem) => {
                            setCurrentWorkedExample(problem);
                            setShowWorkedExample(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Teaching Aids */}
                {lesson.content?.teachingAids && lesson.content.teachingAids.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Aids</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {lesson.content.teachingAids.map((aid, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <p className="font-medium text-gray-900">{aid.name}</p>
                          {aid.description && (
                            <p className="text-sm text-gray-600 mt-1">{aid.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Lesson Summary (shown when lesson is complete) */}
        {showSummary && (
          <div className="flex-1 overflow-y-auto p-6">
            <LessonSummary
              lesson={lesson}
              onComplete={handleLessonComplete}
              onContinue={() => {
                setShowSummary(false);
                if (onComplete) {
                  onComplete();
                }
              }}
            />
          </div>
        )}

        {/* Notes Panel */}
        {showNotes && !showSummary && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">My Notes</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes here..."
                className="w-full h-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Slide Presentation Component with Multimedia Principles
 */
function SlidePresentation({ presentation, currentIndex, onIndexChange, applyMultimediaPrinciples = false, gradeLevel = 5 }) {
  const slides = presentation.slides || [];
  const currentSlide = slides[currentIndex] || slides[0];

  if (!currentSlide) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No slides available</p>
      </div>
    );
  }

  // Calculate font sizes based on grade level (6x6 rule compliance)
  const getFontSizes = () => {
    if (gradeLevel <= 2) {
      return {
        title: 'text-4xl',
        content: 'text-2xl',
        visual: 'text-lg',
      };
    } else if (gradeLevel <= 5) {
      return {
        title: 'text-3xl',
        content: 'text-xl',
        visual: 'text-base',
      };
    } else {
      return {
        title: 'text-2xl',
        content: 'text-lg',
        visual: 'text-sm',
      };
    }
  };

  const fontSizes = getFontSizes();
  
  // Count words per line (6x6 rule: max 6 words per line, 6 lines per slide)
  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  };

  const titleWords = countWords(currentSlide.title);
  const contentWords = countWords(currentSlide.content);
  const isCompliant = titleWords <= 6 && contentWords <= 36; // 6 words per line * 6 lines

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
      {/* Slide Content with Spatial Contiguity (text near graphics) */}
      <div className="aspect-video p-8 flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-50 relative">
        {/* Key Point Highlighting (Signaling) */}
        {currentSlide.keyPoint && applyMultimediaPrinciples && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold z-10">
            ⭐ Key Point
          </div>
        )}

        {/* 6x6 Rule Compliance Indicator */}
        {applyMultimediaPrinciples && (
          <div className={`absolute top-4 left-4 px-2 py-1 rounded text-xs font-semibold ${
            isCompliant ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {isCompliant ? '✓ 6x6 Compliant' : '⚠ Too much text'}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-center w-full">
          {/* Text Content (Spatial Contiguity - text near visual) */}
          <div className="flex-1">
            {/* Title with proper hierarchy */}
            <h3 className={`${fontSizes.title} font-bold text-gray-900 mb-4 leading-tight`}>
              {currentSlide.title}
            </h3>
            
            {/* Content with proper chunking (6x6 rule) */}
            <div className={`${fontSizes.content} text-gray-700 mb-4 space-y-2`}>
              {currentSlide.content && (
                <div className="leading-relaxed">
                  {currentSlide.content.split('\n').slice(0, 6).map((line, idx) => (
                    <p key={idx} className="mb-1">
                      {line.trim().split(/\s+/).slice(0, 6).join(' ')}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visual Description (Spatial Contiguity - placed next to text) */}
          {currentSlide.visualDescription && (
            <div className="flex-1 mt-4 md:mt-0 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <p className={`${fontSizes.visual} font-semibold text-gray-800 mb-2`}>Visual:</p>
              <p className={`${fontSizes.visual} text-gray-600 italic leading-relaxed`}>
                {currentSlide.visualDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slide Navigation */}
      {slides.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 inline-block" /> Previous
          </button>
          <span className="text-sm text-gray-600">
            Slide {currentIndex + 1} of {slides.length}
          </span>
          <button
            onClick={() => onIndexChange(Math.min(slides.length - 1, currentIndex + 1))}
            disabled={currentIndex === slides.length - 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4 inline-block" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Video Presentation Component with Multimedia Principles
 */
function VideoPresentation({ presentation, applyMultimediaPrinciples = false, gradeLevel = 5 }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [pausedAt, setPausedAt] = useState(null);
  const [pausePoints, setPausePoints] = useState([]);
  const videoRef = useRef(null);

  // Generate pause points for reflection (every 2-3 minutes for younger, 3-5 for older)
  useEffect(() => {
    if (applyMultimediaPrinciples && presentation.videoUrl) {
      const interval = gradeLevel <= 5 ? 120 : 180; // 2 min for K-5, 3 min for 6-12
      const points = [];
      for (let i = interval; i < 600; i += interval) { // Up to 10 minutes
        points.push({
          time: i,
          question: `Take a moment to think: What did you learn in this section?`,
          answered: false,
        });
      }
      setPausePoints(points);
    }
  }, [applyMultimediaPrinciples, presentation.videoUrl, gradeLevel]);

  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    // Check if we should pause for reflection
    const pausePoint = pausePoints.find(p => 
      currentTime >= p.time - 1 && currentTime <= p.time + 1 && !p.answered
    );
    if (pausePoint && videoRef.current) {
      videoRef.current.pause();
      setPausedAt(pausePoint);
    }
  };

  const handleResume = () => {
    if (pausedAt) {
      const updatedPoints = pausePoints.map(p => 
        p.time === pausedAt.time ? { ...p, answered: true } : p
      );
      setPausePoints(updatedPoints);
      setPausedAt(null);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
      {presentation.videoUrl ? (
        <div className="relative">
          {/* Temporal Contiguity - Synchronized captions/transcript */}
          <video
            ref={videoRef}
            src={presentation.videoUrl}
            controls
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
          >
            Your browser does not support the video tag.
          </video>

          {/* Pause Point Reflection Modal */}
          {pausedAt && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Reflection Point</h4>
                <p className="text-gray-700 mb-4">{pausedAt.question}</p>
                <button
                  onClick={handleResume}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Watching
                </button>
              </div>
            </div>
          )}
          
          {/* Transcript Toggle (Temporal Contiguity) */}
          {applyMultimediaPrinciples && presentation.voiceScript && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm hover:bg-opacity-70"
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </button>
            </div>
          )}
          
          {/* Transcript Display (Temporal Contiguity - synchronized with video) */}
          {showTranscript && presentation.voiceScript && (
            <div className="bg-gray-900 text-white p-4 max-h-32 overflow-y-auto">
              <p className="text-sm">{presentation.voiceScript}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Video will be available here</p>
            {presentation.voiceScript && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 max-w-md mx-auto">
                <p className="text-sm font-semibold text-gray-800 mb-2">Script Preview:</p>
                <p className="text-sm text-gray-600">{presentation.voiceScript.substring(0, 200)}...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Interactive Presentation Component
 */
function InteractivePresentation({ presentation }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Content</h3>
      <p className="text-gray-600">Interactive presentation will be displayed here</p>
      {/* TODO: Implement interactive elements */}
    </div>
  );
}

/**
 * Activity Card Component
 */
function ActivityCard({ activity, onShowWorkedExample }) {
  const [isCompleted, setIsCompleted] = useState(activity.status === 'COMPLETED');

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/lessons/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'activity',
          action: 'submit',
          activityId: activity.id,
          submission: { completed: true },
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">{activity.name}</h4>
          {activity.instructions && (
            <p className="text-sm text-gray-600 mb-3">{activity.instructions}</p>
          )}
          {activity.activityData && (
            <div className="text-sm text-gray-700 mb-3">
              {typeof activity.activityData === 'string' ? (
                <p>{activity.activityData}</p>
              ) : (
                <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {JSON.stringify(activity.activityData, null, 2)}
                </pre>
              )}
            </div>
          )}
          {/* Show Worked Example button for complex problems */}
          {activity.activityType === 'PRACTICE' && activity.activityData?.problem && onShowWorkedExample && (
            <button
              onClick={() => onShowWorkedExample(activity.activityData.problem)}
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <Lightbulb className="w-4 h-4" />
              Show Worked Example
            </button>
          )}
        </div>
        {!isCompleted && (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete
          </button>
        )}
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}

