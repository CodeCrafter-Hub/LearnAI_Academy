'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import EnterpriseHeader from '@/components/layout/EnterpriseHeader';
import ClassroomEvaluationWidget from '@/components/ui/ClassroomEvaluationWidget';
import Loading from '@/components/ui/Loading';
import { GraduationCap, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';

export default function GradesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [gradeEvaluations, setGradeEvaluations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const grades = [
    { level: -1, name: 'Preschool', age: '3-4 years', color: 'from-pink-500 to-rose-500' },
    { level: 0, name: 'Pre-K / Kindergarten', age: '4-6 years', color: 'from-purple-500 to-indigo-500' },
    { level: 1, name: 'Grade 1', age: '6-7 years', color: 'from-blue-500 to-cyan-500' },
    { level: 2, name: 'Grade 2', age: '7-8 years', color: 'from-teal-500 to-green-500' },
    { level: 3, name: 'Grade 3', age: '8-9 years', color: 'from-green-500 to-emerald-500' },
    { level: 4, name: 'Grade 4', age: '9-10 years', color: 'from-yellow-500 to-orange-500' },
    { level: 5, name: 'Grade 5', age: '10-11 years', color: 'from-orange-500 to-red-500' },
    { level: 6, name: 'Grade 6', age: '11-12 years', color: 'from-red-500 to-pink-500' },
    { level: 7, name: 'Grade 7', age: '12-13 years', color: 'from-indigo-500 to-purple-500' },
    { level: 8, name: 'Grade 8', age: '13-14 years', color: 'from-violet-500 to-fuchsia-500' },
    { level: 9, name: 'Grade 9', age: '14-15 years', color: 'from-slate-500 to-gray-500' },
    { level: 10, name: 'Grade 10', age: '15-16 years', color: 'from-gray-500 to-zinc-500' },
    { level: 11, name: 'Grade 11', age: '16-17 years', color: 'from-zinc-500 to-neutral-500' },
    { level: 12, name: 'Grade 12', age: '17-18 years', color: 'from-neutral-500 to-stone-500' },
  ];

  const currentStudentGrade = user?.students?.[0]?.gradeLevel || 5;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <EnterpriseHeader />
        <main className="container py-12">
          <Loading message="Loading grades..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <EnterpriseHeader />

      <main className="container py-12 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            All Grade Levels
          </h1>
          <p className="text-lg text-gray-600">
            Explore learning content and evaluate classroom experience for each grade
          </p>
        </div>

        {/* Grade Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {grades.map((grade) => {
            const isCurrentGrade = grade.level === currentStudentGrade;

            return (
              <div
                key={grade.level}
                className={`surface-elevated rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  isCurrentGrade ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                {/* Grade Header */}
                <div className={`bg-gradient-to-r ${grade.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">{grade.name}</h2>
                    {isCurrentGrade && (
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        Your Grade
                      </span>
                    )}
                  </div>
                  <p className="text-white/90 text-sm">{grade.age}</p>
                </div>

                {/* Grade Content */}
                <div className="p-6 space-y-4">
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/learn/grade/${grade.level}`)}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Learn
                    </button>
                    <button
                      onClick={() => router.push(`/classroom-evaluation?grade=${grade.level}`)}
                      className="btn btn-secondary flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Evaluate
                    </button>
                  </div>

                  {/* Evaluation Widget (Compact) */}
                  <ClassroomEvaluationWidget gradeLevel={grade.level} compact={true} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Grade Highlight */}
        {currentStudentGrade !== undefined && (
          <div className="surface-elevated p-6 rounded-xl shadow-md bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Your Current Grade</h2>
            </div>
            <p className="text-gray-600 mb-4">
              You're currently enrolled in <strong>{grades.find(g => g.level === currentStudentGrade)?.name}</strong>.
              Click the grade card above to access your personalized learning hub.
            </p>
            <button
              onClick={() => router.push(`/learn/grade/${currentStudentGrade}`)}
              className="btn btn-primary flex items-center gap-2"
            >
              Go to My Grade Hub
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

