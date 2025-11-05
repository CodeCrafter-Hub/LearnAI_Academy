'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import AssessmentCard from '@/components/assessment/AssessmentCard';
import Loading from '@/components/ui/Loading';
import { FileText, Plus, Search, Filter } from 'lucide-react';

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState('');
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

      // TODO: Load existing assessments from API
      // For now, we'll generate on demand
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAssessment = async () => {
    if (!selectedSubject) {
      alert('Please select a subject');
      return;
    }

    const topic = prompt('Enter a topic for the assessment:');
    if (!topic) return;

    const gradeLevel = prompt('Enter grade level (0-12):', '5');
    if (!gradeLevel) return;

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assessments/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: selectedSubject.slug,
          topicName: topic,
          gradeLevel: parseInt(gradeLevel),
          assessmentType: 'diagnostic',
          questionCount: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate assessment');
      }

      const data = await response.json();
      setAssessments([...assessments, data.assessment]);
      alert('Assessment generated successfully!');
    } catch (error) {
      console.error('Error generating assessment:', error);
      alert('Failed to generate assessment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartAssessment = (assessment) => {
    router.push(`/assessments/${assessment.id}/take`);
  };

  const handleViewAssessment = (assessment) => {
    router.push(`/assessments/${assessment.id}`);
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!assessment.name.toLowerCase().includes(query)) return false;
    }
    if (selectedType && assessment.assessmentType !== selectedType) return false;
    if (selectedSubject && assessment.subjectId !== selectedSubject.id) return false;
    return true;
  });

  if (isLoading) {
    return <Loading message="Loading assessments..." />;
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
                <FileText className="w-10 h-10 text-blue-600" />
                Assessments
              </h1>
              <p className="text-gray-600">Take assessments to test your knowledge</p>
            </div>
            <button
              onClick={handleGenerateAssessment}
              disabled={isGenerating || !selectedSubject}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-5 h-5" />
              {isGenerating ? 'Generating...' : 'Generate Assessment'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Subject Filter */}
            <select
              value={selectedSubject?.id || ''}
              onChange={(e) => {
                const subject = subjects.find(s => s.id === e.target.value);
                setSelectedSubject(subject || null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="formative">Formative</option>
              <option value="summative">Summative</option>
            </select>

            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Assessments Grid */}
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Assessments Yet</h3>
            <p className="text-gray-500 mb-6">
              Generate your first assessment by selecting a subject and clicking "Generate Assessment"
            </p>
            {!selectedSubject && (
              <p className="text-sm text-gray-400">
                Please select a subject above to get started
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onStart={handleStartAssessment}
                onView={handleViewAssessment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

