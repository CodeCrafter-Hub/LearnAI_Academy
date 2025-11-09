'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import ClassroomEvaluationWidget from '@/components/ui/ClassroomEvaluationWidget';
import SubjectCard from '@/components/learning/SubjectCard';
import Loading from '@/components/ui/Loading';
import { BookOpen, ArrowLeft, TrendingUp, Award } from 'lucide-react';

function GradePageContent() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gradeInfo, setGradeInfo] = useState(null);

  const gradeLevel = parseInt(params.grade);
  const gradeName = gradeLevel === -1 ? 'Preschool' : 
                    gradeLevel === 0 ? 'Pre-K' : 
                    gradeLevel === 0 ? 'Kindergarten' : 
                    `Grade ${gradeLevel}`;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadGradeData();
      }
    }
  }, [authLoading, isAuthenticated, gradeLevel]);

  const loadGradeData = async () => {
    try {
      setIsLoading(true);

      // Load subjects for this grade
      const subjectsRes = await fetch(`/api/subjects?gradeLevel=${gradeLevel}`, {
        credentials: 'include',
      });

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }

      // Get grade-level UI config for info
      const uiConfigRes = await fetch(`/api/ui/grade-level?gradeLevel=${gradeLevel}`, {
        credentials: 'include',
      });

      if (uiConfigRes.ok) {
        const uiConfig = await uiConfigRes.json();
        setGradeInfo({
          gradeLevel,
          gradeName,
          ageGroup: uiConfig.config?.ageGroup,
          uiConfig: uiConfig.config,
        });
      }
    } catch (error) {
      console.error('Error loading grade data:', error);
      addToast('Failed to load grade data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <main className="container py-12">
          <Loading message="Loading grade page..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <main className="container py-12 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/learn')}
            className="btn btn-ghost mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {gradeName} Learning Hub
          </h1>
          {gradeInfo?.ageGroup && (
            <p className="text-lg text-gray-600">
              Age Group: {gradeInfo.ageGroup}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Subjects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subjects Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Choose Your Subject
              </h2>

              {subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subject, idx) => (
                    <div
                      key={subject.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <SubjectCard
                        subject={subject}
                        onClick={() => router.push(`/learn?subject=${subject.slug}&grade=${gradeLevel}`)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="surface-subtle p-8 rounded-xl text-center">
                  <p className="text-gray-600">No subjects available for {gradeName} yet.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - Evaluation & Info */}
          <div className="space-y-6">
            {/* Classroom Evaluation Widget */}
            <ClassroomEvaluationWidget gradeLevel={gradeLevel} />

            {/* Grade Info Card */}
            {gradeInfo?.uiConfig && (
              <div className="surface-elevated p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Grade Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Age Group:</span>
                    <span className="ml-2 text-gray-600">{gradeInfo.ageGroup}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Font Size:</span>
                    <span className="ml-2 text-gray-600">{gradeInfo.uiConfig.typography?.baseSize}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Button Size:</span>
                    <span className="ml-2 text-gray-600 capitalize">
                      {gradeInfo.uiConfig.interactionPatterns?.buttonSize}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Max Width:</span>
                    <span className="ml-2 text-gray-600">
                      {gradeInfo.uiConfig.layoutConfiguration?.maxWidth}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="surface-elevated p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subjects Available</span>
                  <span className="font-bold text-blue-600">{subjects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Grade Level</span>
                  <span className="font-bold text-gray-800">{gradeName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GradePage() {
  return (
    <Suspense fallback={<Loading message="Loading grade page..." />}>
      <GradePageContent />
    </Suspense>
  );
}

