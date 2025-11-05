'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import LessonPlanCard from '@/components/curriculum/LessonPlanCard';
import Loading from '@/components/ui/Loading';
import { BookOpen, Plus, Search } from 'lucide-react';

export default function CurriculumPage() {
  const router = useRouter();
  const [lessonPlans, setLessonPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Load subjects
      const subjectsRes = await fetch('/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);

      // Get user's student grade level
      const userData = JSON.parse(localStorage.getItem('user'));
      const studentGrade = userData?.students?.[0]?.gradeLevel || 5;
      setSelectedGrade(studentGrade);

      // Load existing curriculum (if any)
      // TODO: Implement API to fetch saved curriculum
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCurriculum = async () => {
    if (!selectedSubject || !selectedGrade) {
      alert('Please select a subject and grade level');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const topic = prompt('Enter a topic for the lesson plan:');
      if (!topic) {
        setIsGenerating(false);
        return;
      }

      const response = await fetch('/api/curriculum', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: 'lessonPlan',
          subject: selectedSubject.slug,
          topic,
          gradeLevel: selectedGrade,
          options: {
            includeStandards: true,
            includeAssessments: true,
            includePracticeProblems: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate curriculum');
      }

      const data = await response.json();
      setLessonPlans([...lessonPlans, data]);
      alert('Lesson plan generated successfully!');
    } catch (error) {
      console.error('Error generating curriculum:', error);
      alert('Failed to generate curriculum. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPlans = lessonPlans.filter(plan => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      plan.topic?.toLowerCase().includes(query) ||
      plan.subject?.toLowerCase().includes(query) ||
      plan.learningObjectives?.some(obj => obj.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return <Loading message="Loading curriculum..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <BookOpen className="w-10 h-10 text-blue-600" />
                Curriculum Library
              </h1>
              <p className="text-gray-600">Generate and manage lesson plans for all subjects</p>
            </div>
            <button
              onClick={handleGenerateCurriculum}
              disabled={isGenerating || !selectedSubject}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-5 h-5" />
              {isGenerating ? 'Generating...' : 'Generate Lesson Plan'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Subject Filter */}
            <select
              value={selectedSubject?.slug || ''}
              onChange={(e) => {
                const subject = subjects.find(s => s.slug === e.target.value);
                setSelectedSubject(subject || null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.slug}>
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Grade Filter */}
            <select
              value={selectedGrade || ''}
              onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              {Array.from({ length: 13 }, (_, i) => i).map(grade => (
                <option key={grade} value={grade}>
                  Grade {grade === 0 ? 'K' : grade}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lesson plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lesson Plans Grid */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Lesson Plans Yet</h3>
            <p className="text-gray-500 mb-6">
              Generate your first lesson plan by selecting a subject and clicking "Generate Lesson Plan"
            </p>
            {!selectedSubject && (
              <p className="text-sm text-gray-400">
                Please select a subject above to get started
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPlans.map((plan, idx) => (
              <LessonPlanCard
                key={idx}
                lessonPlan={plan}
                subject={selectedSubject || subjects.find(s => s.slug === plan.subject)}
                onView={() => {
                  // Save plan to localStorage for detail view
                  const savedPlans = JSON.parse(localStorage.getItem('lessonPlans') || '[]');
                  const planId = `plan-${Date.now()}`;
                  const planWithId = { ...plan, id: planId };
                  savedPlans.push(planWithId);
                  localStorage.setItem('lessonPlans', JSON.stringify(savedPlans));
                  router.push(`/curriculum/${planId}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

