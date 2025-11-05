'use client';

import { useRouter } from 'next/navigation';
import { Brain, Zap, Trophy, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">LearnAI Academy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Personalized AI tutoring for K-12 students. Learn at your own pace with intelligent tutors that adapt to your needs.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border-2 border-gray-200"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <FeatureCard
            icon={Brain}
            title="AI-Powered Tutoring"
            description="Get personalized help from specialized AI tutors for every subject"
            color="bg-blue-500"
          />
          <FeatureCard
            icon={Zap}
            title="Instant Feedback"
            description="Learn faster with immediate responses and guidance"
            color="bg-purple-500"
          />
          <FeatureCard
            icon={Trophy}
            title="Gamified Learning"
            description="Earn achievements, build streaks, and track progress"
            color="bg-yellow-500"
          />
          <FeatureCard
            icon={Users}
            title="Parent Dashboard"
            description="Monitor progress and stay involved in your child's learning"
            color="bg-green-500"
          />
        </div>

        {/* Subjects */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            All Subjects Covered
          </h2>
          <p className="text-xl text-gray-600">
            From kindergarten to high school, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
          {['Math', 'English', 'Reading', 'Science', 'Writing', 'Coding'].map(subject => (
            <div
              key={subject}
              className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all"
            >
              <div className="text-3xl mb-2">
                {subject === 'Math' && '🔢'}
                {subject === 'English' && '📚'}
                {subject === 'Reading' && '📖'}
                {subject === 'Science' && '🔬'}
                {subject === 'Writing' && '✍️'}
                {subject === 'Coding' && '💻'}
              </div>
              <div className="font-semibold text-gray-800">{subject}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students learning smarter with AI
          </p>
          <button
            onClick={() => router.push('/register')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Learning Today
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
      <div className={`${color} rounded-xl p-3 inline-block mb-4`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
