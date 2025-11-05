'use client';

import { BookOpen, Inbox, Search, AlertCircle } from 'lucide-react';

export function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action, 
  type = 'default' 
}) {
  const colors = {
    default: 'text-gray-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className={`w-16 h-16 ${colors[type]} mb-4`} />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 max-w-md mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
}

export function EmptySubjects() {
  return (
    <EmptyState
      icon={BookOpen}
      title="No subjects available"
      description="Subjects will appear here once they're configured for your grade level."
    />
  );
}

export function EmptyAssessments() {
  return (
    <EmptyState
      icon={Search}
      title="No assessments found"
      description="Generate your first assessment to get started with testing your knowledge."
    />
  );
}

export function EmptyProgress() {
  return (
    <EmptyState
      icon={Inbox}
      title="No progress data yet"
      description="Start learning sessions to see your progress and achievements here."
    />
  );
}

export function EmptyRecommendations() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No recommendations yet"
      description="Complete some learning sessions to get personalized recommendations."
    />
  );
}

