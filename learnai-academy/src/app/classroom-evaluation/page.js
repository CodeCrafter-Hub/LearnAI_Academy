'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import EnterpriseHeader from '@/components/layout/EnterpriseHeader';
import ClassroomEvaluationRunner from '@/components/ui/ClassroomEvaluationRunner';
import Loading from '@/components/ui/Loading';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

export default function ClassroomEvaluationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [evaluation, setEvaluation] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Check for grade parameter in URL
    const params = new URLSearchParams(window.location.search);
    const gradeParam = params.get('grade');
    if (gradeParam) {
      setSelectedGrade(parseInt(gradeParam));
    }
  }, []);

  if (authLoading) {
    return <Loading message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const gradeLevel = selectedGrade !== null ? selectedGrade : (user?.students?.[0]?.gradeLevel || 5);
  const gradeName = gradeLevel === -1 ? 'Preschool' : gradeLevel === 0 ? 'Pre-K' : `Grade ${gradeLevel}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <EnterpriseHeader />

      <main className="container py-12 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Classroom Experience Evaluation
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive evaluation of your classroom setup for {gradeName} students
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="surface-elevated p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">16 Dimensions</h3>
            </div>
            <p className="text-sm text-gray-600">
              Evaluates UDL, accessibility, learning styles, cognitive load, and more
            </p>
          </div>

          <div className="surface-elevated p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Expert Recommendations</h3>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered insights based on educational research and best practices
            </p>
          </div>

          <div className="surface-elevated p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Compliance Check</h3>
            </div>
            <p className="text-sm text-gray-600">
              Verifies WCAG 2.1, UDL, and IDEA compliance
            </p>
          </div>
        </div>

        {/* Evaluation Runner */}
        <ClassroomEvaluationRunner
          onEvaluationComplete={(result) => {
            setEvaluation(result);
          }}
        />
      </main>
    </div>
  );
}

