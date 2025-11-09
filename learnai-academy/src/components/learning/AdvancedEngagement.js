'use client';

import { useState } from 'react';
import { Users, Share2, Puzzle, Theater, Lightbulb, MessageSquare, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AdvancedEngagement - Advanced engagement techniques for collaborative learning
 * 
 * Techniques:
 * - Think-Pair-Share
 * - Gallery Walk
 * - Jigsaw
 * - Role Play
 * - Problem-Based Learning
 */
export default function AdvancedEngagement({ 
  technique, 
  content, 
  onComplete,
  gradeLevel 
}) {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});

  const renderTechnique = () => {
    switch (technique) {
      case 'think-pair-share':
        return <ThinkPairShare content={content} onComplete={onComplete} step={step} setStep={setStep} />;
      case 'gallery-walk':
        return <GalleryWalk content={content} onComplete={onComplete} step={step} setStep={setStep} />;
      case 'jigsaw':
        return <Jigsaw content={content} onComplete={onComplete} step={step} setStep={setStep} gradeLevel={gradeLevel} />;
      case 'role-play':
        return <RolePlay content={content} onComplete={onComplete} step={step} setStep={setStep} />;
      case 'problem-based':
        return <ProblemBasedLearning content={content} onComplete={onComplete} step={step} setStep={setStep} />;
      default:
        return <div>Unknown technique</div>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      {renderTechnique()}
    </div>
  );
}

/**
 * Think-Pair-Share Component
 */
function ThinkPairShare({ content, onComplete, step, setStep }) {
  const [thinkResponse, setThinkResponse] = useState('');
  const [pairResponse, setPairResponse] = useState('');
  const [shareResponse, setShareResponse] = useState('');

  const steps = [
    { name: 'Think', icon: Lightbulb, description: 'Think about the question individually' },
    { name: 'Pair', icon: Users, description: 'Discuss with a partner' },
    { name: 'Share', icon: Share2, description: 'Share with the class' },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ thinkResponse, pairResponse, shareResponse });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Think-Pair-Share</h3>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === idx;
          const isCompleted = step > idx;

          return (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <p className={`text-sm mt-2 ${isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                {s.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">{steps[step].name} Step</h4>
        <p className="text-gray-700 mb-4">{steps[step].description}</p>
        <p className="text-lg text-gray-800 mb-4">{content.question || content}</p>

        {step === 0 && (
          <textarea
            value={thinkResponse}
            onChange={(e) => setThinkResponse(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {step === 1 && (
          <div>
            <p className="text-gray-600 mb-3">Discuss with your partner:</p>
            <textarea
              value={pairResponse}
              onChange={(e) => setPairResponse(e.target.value)}
              placeholder="What did you and your partner discuss?"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-gray-600 mb-3">Share your combined ideas:</p>
            <textarea
              value={shareResponse}
              onChange={(e) => setShareResponse(e.target.value)}
              placeholder="What would you like to share with the class?"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {step < steps.length - 1 ? 'Next Step' : 'Complete'}
      </button>
    </div>
  );
}

/**
 * Gallery Walk Component
 */
function GalleryWalk({ content, onComplete, step, setStep }) {
  const [observations, setObservations] = useState([]);
  const items = content.items || [];

  const handleObservation = (itemId, observation) => {
    setObservations(prev => ({
      ...prev,
      [itemId]: observation,
    }));
  };

  const handleComplete = () => {
    onComplete({ observations });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Gallery Walk</h3>
      </div>

      <p className="text-gray-700 mb-6">
        Review each item and write your observations. Click through to see all items.
      </p>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Item {idx + 1}</h4>
            <p className="text-gray-700 mb-3">{item.content || item}</p>
            <textarea
              value={observations[idx] || ''}
              onChange={(e) => handleObservation(idx, e.target.value)}
              placeholder="Write your observations here..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleComplete}
        className="w-full mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Complete Gallery Walk
      </button>
    </div>
  );
}

/**
 * Jigsaw Component
 */
function Jigsaw({ content, onComplete, step, setStep, gradeLevel }) {
  const [expertGroup, setExpertGroup] = useState(null);
  const [expertNotes, setExpertNotes] = useState('');
  const [jigsawGroup, setJigsawGroup] = useState(null);
  const [sharedKnowledge, setSharedKnowledge] = useState({});

  const topics = content.topics || [];
  const isElementary = gradeLevel <= 5;

  if (step === 0) {
    // Step 1: Assign to expert group
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Puzzle className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Jigsaw Activity</h3>
        </div>

        <p className="text-gray-700 mb-6">
          {isElementary 
            ? 'You will become an expert on one topic, then teach others!'
            : 'You will become an expert on one topic, then share your knowledge with your group.'}
        </p>

        <div className="space-y-3">
          {topics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => {
                setExpertGroup(idx);
                setStep(1);
              }}
              className="w-full p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <h4 className="font-semibold text-green-900">Expert Group {idx + 1}</h4>
              <p className="text-sm text-gray-700">{topic.name || topic}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 1) {
    // Step 2: Learn in expert group
    const topic = topics[expertGroup];
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Become an Expert</h3>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
          <h4 className="font-semibold text-green-900 mb-2">Your Topic: {topic.name || topic}</h4>
          <p className="text-gray-700 mb-4">{topic.content || topic.description || 'Study this topic carefully.'}</p>

          <textarea
            value={expertNotes}
            onChange={(e) => setExpertNotes(e.target.value)}
            placeholder="Take notes as you learn about this topic..."
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          I'm Ready to Teach!
        </button>
      </div>
    );
  }

  // Step 3: Share in jigsaw group
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">Share Your Knowledge</h3>
      </div>

      <p className="text-gray-700 mb-6">
        Now teach others about your topic and learn from them about their topics.
      </p>

      <div className="space-y-4 mb-6">
        {topics.map((topic, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {idx === expertGroup ? 'Your Topic' : `Topic ${idx + 1}`}
            </h4>
            {idx === expertGroup ? (
              <p className="text-gray-700">{expertNotes || 'Share what you learned!'}</p>
            ) : (
              <textarea
                value={sharedKnowledge[idx] || ''}
                onChange={(e) => setSharedKnowledge(prev => ({ ...prev, [idx]: e.target.value }))}
                placeholder="What did you learn about this topic?"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => onComplete({ expertGroup, expertNotes, sharedKnowledge })}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Complete Jigsaw
      </button>
    </div>
  );
}

/**
 * Role Play Component
 */
function RolePlay({ content, onComplete, step, setStep }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleNotes, setRoleNotes] = useState('');
  const [performance, setPerformance] = useState('');

  const roles = content.roles || [];
  const scenario = content.scenario || '';

  if (step === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Theater className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-900">Role Play</h3>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-orange-900 mb-2">Scenario</h4>
          <p className="text-gray-700">{scenario}</p>
        </div>

        <p className="text-gray-700 mb-4">Choose your role:</p>
        <div className="space-y-3">
          {roles.map((role, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedRole(role);
                setStep(1);
              }}
              className="w-full p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
            >
              <h4 className="font-semibold text-orange-900">{role.name}</h4>
              <p className="text-sm text-gray-700">{role.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Theater className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-900">Prepare Your Role</h3>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
          <h4 className="font-semibold text-orange-900 mb-2">Your Role: {selectedRole.name}</h4>
          <p className="text-gray-700 mb-4">{selectedRole.description}</p>
          <p className="text-sm text-gray-600 mb-4">Scenario: {scenario}</p>

          <textarea
            value={roleNotes}
            onChange={(e) => setRoleNotes(e.target.value)}
            placeholder="How will you act in this role? What will you say?"
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Ready to Perform
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-orange-600" />
        <h3 className="text-xl font-bold text-gray-900">Reflect on Your Performance</h3>
      </div>

      <textarea
        value={performance}
        onChange={(e) => setPerformance(e.target.value)}
        placeholder="How did the role play go? What did you learn?"
        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
      />

      <button
        onClick={() => onComplete({ selectedRole, roleNotes, performance })}
        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        Complete Role Play
      </button>
    </div>
  );
}

/**
 * Problem-Based Learning Component
 */
function ProblemBasedLearning({ content, onComplete, step, setStep }) {
  const [problemAnalysis, setProblemAnalysis] = useState('');
  const [solutions, setSolutions] = useState([]);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [reflection, setReflection] = useState('');

  const problem = content.problem || '';

  if (step === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Problem-Based Learning</h3>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-4">
          <h4 className="font-semibold text-indigo-900 mb-2">Real-World Problem</h4>
          <p className="text-gray-700">{problem}</p>
        </div>

        <p className="text-gray-700 mb-4">Analyze the problem:</p>
        <textarea
          value={problemAnalysis}
          onChange={(e) => setProblemAnalysis(e.target.value)}
          placeholder="What do you know? What do you need to find out? What are the constraints?"
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        <button
          onClick={() => setStep(1)}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Next: Generate Solutions
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Generate Solutions</h3>
        </div>

        <div className="space-y-3 mb-4">
          {solutions.map((solution, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
              <textarea
                value={solution}
                onChange={(e) => {
                  const newSolutions = [...solutions];
                  newSolutions[idx] = e.target.value;
                  setSolutions(newSolutions);
                }}
                placeholder={`Solution ${idx + 1}`}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setSolutions([...solutions, ''])}
          className="w-full mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          + Add Another Solution
        </button>

        <button
          onClick={() => setStep(2)}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Next: Select Best Solution
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">Select and Reflect</h3>
      </div>

      <div className="space-y-3 mb-4">
        {solutions.map((solution, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSolution(idx)}
            className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
              selectedSolution === idx
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <p className="text-gray-700">{solution}</p>
          </button>
        ))}
      </div>

      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Reflect on the problem-solving process. What did you learn?"
        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
      />

      <button
        onClick={() => onComplete({ problemAnalysis, solutions, selectedSolution, reflection })}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Complete Problem-Based Learning
      </button>
    </div>
  );
}

