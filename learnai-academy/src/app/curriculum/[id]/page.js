'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EnterpriseHeader from '@/components/layout/EnterpriseHeader';
import Loading from '@/components/ui/Loading';
import Card from '@/components/ui/Card';
import { BookOpen, ArrowLeft, Clock, Target, Users, Award, FileText, Lightbulb, CheckCircle } from 'lucide-react';

export default function LessonPlanDetailPage() {
  return (
    <Suspense fallback={<Loading message="Loading lesson plan..." />}>
      <LessonPlanDetailContent />
    </Suspense>
  );
}

function LessonPlanDetailContent() {
  const router = useRouter();
  const params = useParams();
  const lessonPlanId = params.id;

  const [lessonPlan, setLessonPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, we'll get lesson plan from localStorage or generate it
    // In production, this would fetch from API
    const savedPlans = JSON.parse(localStorage.getItem('lessonPlans') || '[]');
    const plan = savedPlans.find(p => p.id === lessonPlanId);
    
    if (plan) {
      setLessonPlan(plan);
    } else {
      // If not found, try to get from URL state or generate placeholder
      const planData = {
        id: lessonPlanId,
        topic: 'Sample Topic',
        subject: { name: 'Math' },
        gradeLevel: 5,
        learningObjectives: [
          'Understand the concept',
          'Apply the principles',
          'Solve related problems',
        ],
        prerequisites: ['Basic knowledge'],
        keyConcepts: ['Concept 1', 'Concept 2'],
        lessonStructure: [],
        examples: [],
        assessmentQuestions: [],
        practiceProblems: [],
        extensionActivities: [],
      };
      setLessonPlan(planData);
    }
    
    setIsLoading(false);
  }, [lessonPlanId]);

  if (isLoading) {
    return <Loading message="Loading lesson plan..." />;
  }

  if (!lessonPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <EnterpriseHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lesson Plan Not Found</h2>
            <p className="text-gray-600 mb-6">The lesson plan you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/curriculum')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Curriculum
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    learningObjectives = [],
    prerequisites = [],
    keyConcepts = [],
    lessonStructure = [],
    examples = [],
    assessmentQuestions = [],
    practiceProblems = [],
    extensionActivities = [],
    mathSpecific = null,
    englishSpecific = null,
    scienceSpecific = null,
  } = lessonPlan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <EnterpriseHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/curriculum')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Curriculum
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {lessonPlan.topic || 'Lesson Plan'}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {lessonPlan.subject?.name || 'Subject'}
                  </span>
                  <span>Grade {lessonPlan.gradeLevel === 0 ? 'K' : lessonPlan.gradeLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        {learningObjectives.length > 0 && (
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Learning Objectives</h2>
            </div>
            <ul className="space-y-2 ml-9">
              {learningObjectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{obj}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Prerequisites</h2>
            <p className="text-gray-700">Before starting this lesson, students should know:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-4 text-gray-700">
              {prerequisites.map((prereq, idx) => (
                <li key={idx}>{prereq}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Key Concepts */}
        {keyConcepts.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Key Concepts</h2>
            <div className="flex flex-wrap gap-2">
              {keyConcepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Lesson Structure */}
        {lessonStructure.length > 0 && (
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Lesson Structure</h2>
            </div>
            <div className="space-y-4">
              {lessonStructure.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    {typeof step === 'string' ? (
                      <p className="text-gray-700">{step}</p>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-800 mb-1">{step.title || `Step ${idx + 1}`}</h3>
                        <p className="text-gray-700">{step.description || step.content}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Subject-Specific Content */}
        {mathSpecific && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Math-Specific Elements</h2>
            {mathSpecific.visualAids && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Visual Aids</h3>
                <p className="text-gray-600">{JSON.stringify(mathSpecific.visualAids)}</p>
              </div>
            )}
            {mathSpecific.manipulatives && mathSpecific.manipulatives.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Manipulatives</h3>
                <div className="flex flex-wrap gap-2">
                  {mathSpecific.manipulatives.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {englishSpecific && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">English-Specific Elements</h2>
            {englishSpecific.readingComponents && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Reading Components</h3>
                <p className="text-gray-600 text-sm">{JSON.stringify(englishSpecific.readingComponents)}</p>
              </div>
            )}
            {englishSpecific.writingComponents && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Writing Components</h3>
                <p className="text-gray-600 text-sm">{JSON.stringify(englishSpecific.writingComponents)}</p>
              </div>
            )}
          </Card>
        )}

        {scienceSpecific && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Science-Specific Elements</h2>
            {scienceSpecific.experiments && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Experiments</h3>
                <p className="text-gray-600 text-sm">{JSON.stringify(scienceSpecific.experiments)}</p>
              </div>
            )}
            {scienceSpecific.safetyGuidelines && scienceSpecific.safetyGuidelines.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Safety Guidelines</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {scienceSpecific.safetyGuidelines.map((guideline, idx) => (
                    <li key={idx}>{guideline}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Practice Problems */}
        {practiceProblems.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Practice Problems</h2>
            <div className="space-y-4">
              {practiceProblems.slice(0, 5).map((problem, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  {typeof problem === 'string' ? (
                    <p className="text-gray-700">{problem}</p>
                  ) : (
                    <>
                      <p className="font-medium text-gray-800 mb-1">{problem.problem || problem.text}</p>
                      {problem.answer && (
                        <p className="text-sm text-gray-600">Answer: {problem.answer}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
              {practiceProblems.length > 5 && (
                <p className="text-sm text-gray-500">+{practiceProblems.length - 5} more problems</p>
              )}
            </div>
          </Card>
        )}

        {/* Extension Activities */}
        {extensionActivities.length > 0 && (
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">Extension Activities</h2>
            </div>
            <ul className="space-y-2 ml-9">
              {extensionActivities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-yellow-500">•</span>
                  <span>{typeof activity === 'string' ? activity : activity.description || activity}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

