'use client';

import { useState, useEffect } from 'react';
import { getGradeTheme, getClassroomStyles } from '@/lib/classroomThemes';
import { getCurriculumTopics } from '@/lib/curriculumData';

/**
 * Interactive Activity Component
 * Provides grade-appropriate interactive learning activities
 */
export default function InteractiveActivity({
  gradeLevel,
  subject,
  topic,
  activityType,
  onComplete,
}) {
  const gradeTheme = getGradeTheme(gradeLevel);
  const styles = getClassroomStyles(gradeLevel, subject);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Activity components by type
  const activityComponents = {
    'multiple-choice': MultipleChoiceActivity,
    'drag-drop': DragDropActivity,
    'matching': MatchingActivity,
    'fill-blank': FillBlankActivity,
    'interactive-game': InteractiveGameActivity,
  };

  const ActivityComponent = activityComponents[activityType] || MultipleChoiceActivity;

  return (
    <div className={`${styles.card} ${styles.spacing}`}>
      <ActivityComponent
        gradeLevel={gradeLevel}
        subject={subject}
        topic={topic}
        styles={styles}
        gradeTheme={gradeTheme}
        onAnswer={(correct) => handleAnswer(correct)}
        onComplete={onComplete}
        score={score}
        feedback={feedback}
      />
    </div>
  );

  function handleAnswer(correct) {
    setAttempts(attempts + 1);
    if (correct) {
      setScore(score + 1);
      setFeedback(getGradeFeedback(gradeLevel, 'correct'));
    } else {
      setFeedback(getGradeFeedback(gradeLevel, 'encourage'));
    }
  }
}

/**
 * Multiple Choice Activity (All Grades)
 */
function MultipleChoiceActivity({
  gradeLevel,
  topic,
  styles,
  gradeTheme,
  onAnswer,
  score,
  feedback,
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const questions = getGradeAppropriateQuestions(gradeLevel, topic);
  const question = questions[currentQuestion];

  const handleSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    const isCorrect = answerIndex === question.correctAnswer;
    onAnswer(isCorrect);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="text-center">
        <h3 className={`${styles.text.heading} font-bold mb-4`}>
          {gradeTheme.emojis ? '🤔 ' : ''}
          Question {currentQuestion + 1} of {questions.length}
        </h3>
        {gradeLevel <= 2 && (
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: questions.length }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full ${
                  i === currentQuestion ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
        <div className="text-yellow-600 font-bold text-lg mb-4">
          Score: {score} / {currentQuestion + 1}
        </div>
      </div>

      {/* Question Text */}
      <div
        className={`${styles.card} bg-blue-50 ${styles.spacing} border-4 border-blue-200`}
      >
        <p className={`${styles.text.body} font-semibold text-center`}>
          {question.text}
        </p>
        {question.image && gradeLevel <= 5 && (
          <div className="text-center text-6xl mt-4">{question.image}</div>
        )}
      </div>

      {/* Answer Choices */}
      <div className="grid gap-4">
        {question.answers.map((answer, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => !showResult && handleSelect(index)}
              disabled={showResult}
              className={`${styles.card} ${styles.spacing} text-left transition-all transform hover:scale-105 border-4 ${
                showCorrect
                  ? 'bg-green-100 border-green-500'
                  : showIncorrect
                  ? 'bg-red-100 border-red-500'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${
                    gradeLevel <= 2 ? 'text-4xl' : gradeLevel <= 5 ? 'text-3xl' : 'text-2xl'
                  } font-bold ${showCorrect ? 'text-green-600' : showIncorrect ? 'text-red-600' : 'text-blue-600'}`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <div className={`${styles.text.body} flex-1`}>
                  {answer.emoji && gradeLevel <= 5 && (
                    <span className="text-3xl mr-2">{answer.emoji}</span>
                  )}
                  {answer.text}
                </div>
                {showCorrect && (
                  <div className="text-3xl">{gradeTheme.emojis ? '✅' : '✓'}</div>
                )}
                {showIncorrect && (
                  <div className="text-3xl">{gradeTheme.emojis ? '❌' : '✗'}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback && showResult && (
        <div
          className={`${styles.card} ${styles.spacing} text-center ${
            selectedAnswer === question.correctAnswer
              ? 'bg-green-100 border-4 border-green-300'
              : 'bg-yellow-100 border-4 border-yellow-300'
          }`}
        >
          <p className={`${styles.text.body} font-bold`}>{feedback}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Drag and Drop Activity (K-8, more visual and interactive)
 */
function DragDropActivity({ gradeLevel, topic, styles, gradeTheme, onAnswer }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState({});

  const items = getDragDropItems(gradeLevel, topic);

  const handleDrop = (targetId, itemId) => {
    setMatches({ ...matches, [targetId]: itemId });
    const isCorrect = items.pairs[targetId] === itemId;
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-6">
      <h3 className={`${styles.text.heading} font-bold text-center mb-6`}>
        {gradeTheme.emojis ? '🎯 ' : ''}Match the Items!
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Items to drag */}
        <div className="space-y-4">
          <h4 className={`${styles.text.body} font-bold text-center mb-4`}>
            Drag These:
          </h4>
          {items.sources.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDraggedItem(item.id)}
              className={`${styles.card} ${styles.spacing} cursor-move hover:shadow-lg transition-all transform hover:scale-105 bg-blue-50 border-2 border-blue-300`}
            >
              <div className="flex items-center gap-3">
                {item.emoji && gradeLevel <= 5 && (
                  <span className="text-4xl">{item.emoji}</span>
                )}
                <span className={`${styles.text.body} font-semibold`}>
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Drop targets */}
        <div className="space-y-4">
          <h4 className={`${styles.text.body} font-bold text-center mb-4`}>
            To Here:
          </h4>
          {items.targets.map((target) => {
            const matchedItem = items.sources.find((s) => s.id === matches[target.id]);
            const isCorrect = matches[target.id] === items.pairs[target.id];

            return (
              <div
                key={target.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(target.id, draggedItem)}
                className={`${styles.card} ${styles.spacing} min-h-[80px] border-4 border-dashed transition-all ${
                  matchedItem
                    ? isCorrect
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : 'bg-gray-50 border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {target.emoji && gradeLevel <= 5 && (
                      <span className="text-4xl">{target.emoji}</span>
                    )}
                    <span className={`${styles.text.body} font-semibold`}>
                      {target.text}
                    </span>
                  </div>
                  {matchedItem && (
                    <div className="text-2xl">
                      {isCorrect
                        ? gradeTheme.emojis
                          ? '✅'
                          : '✓'
                        : gradeTheme.emojis
                        ? '❌'
                        : '✗'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Matching Activity (Great for K-5)
 */
function MatchingActivity({ gradeLevel, topic, styles, gradeTheme, onAnswer }) {
  const [selected, setSelected] = useState([]);
  const [matches, setMatches] = useState([]);

  const items = getMatchingItems(gradeLevel, topic);

  const handleSelect = (item) => {
    if (selected.length === 0) {
      setSelected([item]);
    } else if (selected.length === 1) {
      const pair = [...selected, item];
      const isMatch = checkMatch(pair[0], pair[1], items.pairs);

      if (isMatch) {
        setMatches([...matches, ...pair]);
        onAnswer(true);
      } else {
        onAnswer(false);
      }

      setTimeout(() => setSelected([]), 500);
    }
  };

  const isMatched = (item) => matches.some((m) => m.id === item.id);
  const isSelected = (item) => selected.some((s) => s.id === item.id);

  return (
    <div className="space-y-6">
      <h3 className={`${styles.text.heading} font-bold text-center mb-6`}>
        {gradeTheme.emojis ? '🔗 ' : ''}Find the Matches!
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.all.map((item) => {
          const matched = isMatched(item);
          const selected = isSelected(item);

          return (
            <button
              key={item.id}
              onClick={() => !matched && handleSelect(item)}
              disabled={matched}
              className={`${styles.card} ${styles.spacing} aspect-square flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                matched
                  ? 'bg-green-100 border-4 border-green-500 opacity-50'
                  : selected
                  ? 'bg-blue-100 border-4 border-blue-500 scale-110'
                  : 'bg-white border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              {item.emoji && (
                <div
                  className={`${
                    gradeLevel <= 2 ? 'text-5xl' : gradeLevel <= 5 ? 'text-4xl' : 'text-3xl'
                  } mb-2`}
                >
                  {item.emoji}
                </div>
              )}
              <div className={`${styles.text.body} font-semibold text-center`}>
                {item.text}
              </div>
              {matched && (
                <div className="text-2xl mt-2">
                  {gradeTheme.emojis ? '✅' : '✓'}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Fill in the Blank Activity (Grades 3+)
 */
function FillBlankActivity({ gradeLevel, topic, styles, gradeTheme, onAnswer }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = getFillBlankQuestions(gradeLevel, topic);

  const handleSubmit = () => {
    setSubmitted(true);
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        correctCount++;
        onAnswer(true);
      } else {
        onAnswer(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className={`${styles.text.heading} font-bold text-center mb-6`}>
        Fill in the Blanks!
      </h3>

      {questions.map((question, index) => {
        const isCorrect =
          submitted &&
          answers[question.id]?.toLowerCase().trim() ===
            question.answer.toLowerCase().trim();
        const isIncorrect = submitted && !isCorrect;

        return (
          <div key={question.id} className={`${styles.card} ${styles.spacing}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl font-bold text-blue-600">{index + 1}.</div>
              <p className={`${styles.text.body} flex-1`}>
                {question.text}
              </p>
            </div>

            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) =>
                setAnswers({ ...answers, [question.id]: e.target.value })
              }
              disabled={submitted}
              placeholder="Type your answer here..."
              className={`w-full ${styles.text.body} p-4 rounded-lg border-4 ${
                isCorrect
                  ? 'bg-green-50 border-green-500'
                  : isIncorrect
                  ? 'bg-red-50 border-red-500'
                  : 'border-gray-300'
              } focus:outline-none focus:border-blue-500 transition-all`}
            />

            {submitted && (
              <div className="mt-3">
                {isCorrect ? (
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <span className="text-2xl">
                      {gradeTheme.emojis ? '✅' : '✓'}
                    </span>
                    <span>Correct!</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 text-red-600">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-2xl">
                        {gradeTheme.emojis ? '❌' : '✗'}
                      </span>
                      <span>Not quite!</span>
                    </div>
                    {gradeLevel <= 5 && (
                      <div className="text-sm text-gray-600">
                        Correct answer: {question.answer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className={`${styles.button} w-full`}
        >
          Check Answers
        </button>
      )}
    </div>
  );
}

/**
 * Interactive Game Activity (K-8, highly engaging)
 */
function InteractiveGameActivity({ gradeLevel, topic, styles, gradeTheme, onAnswer, score }) {
  const [gameState, setGameState] = useState('playing');
  const [currentRound, setCurrentRound] = useState(1);
  const maxRounds = gradeLevel <= 2 ? 5 : gradeLevel <= 5 ? 8 : 10;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`${styles.text.heading} font-bold mb-2`}>
          {gradeTheme.emojis ? '🎮 ' : ''}Learning Game!
        </h3>
        <div className="flex justify-center gap-6 text-lg font-bold">
          <div className="text-blue-600">
            Round: {currentRound}/{maxRounds}
          </div>
          <div className="text-yellow-600">Score: {score}</div>
        </div>
      </div>

      {/* Game content would go here - this is a placeholder for game logic */}
      <div
        className={`${styles.card} ${styles.spacing} bg-gradient-to-br from-purple-100 to-blue-100 min-h-[400px] flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className={`${styles.text.body} text-gray-600`}>
            Interactive game content for {topic.name}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper Functions
 */

function getGradeFeedback(gradeLevel, type) {
  const feedback = {
    correct: {
      K2: ['Amazing! 🌟', 'Super job! ⭐', 'You got it! 🎉', 'Fantastic! ✨'],
      '3-5': ['Excellent! 🎯', 'Well done! 👏', 'Perfect! ⭐', 'Great work! 🌟'],
      '6-8': ['Correct! ✓', 'Well done', 'Excellent', 'Nice work'],
      '9-12': ['Correct', 'Well done', 'Excellent', 'Good'],
    },
    encourage: {
      K2: ['Try again! 💪', 'You can do it! 🌈', 'Almost there! ✨'],
      '3-5': ['Give it another try! 🔄', 'Think it through! 💡', 'Try again!'],
      '6-8': ['Try again', 'Reconsider', 'Review the question'],
      '9-12': ['Incorrect', 'Try again', 'Review'],
    },
  };

  const band = gradeLevel <= 2 ? 'K2' : gradeLevel <= 5 ? '3-5' : gradeLevel <= 8 ? '6-8' : '9-12';
  const messages = feedback[type][band];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getGradeAppropriateQuestions(gradeLevel, topic) {
  // Sample questions - these would come from the curriculum
  if (gradeLevel <= 2) {
    return [
      {
        text: 'What comes after the number 5?',
        image: '🔢',
        answers: [
          { text: '4', emoji: '4️⃣' },
          { text: '6', emoji: '6️⃣' },
          { text: '7', emoji: '7️⃣' },
          { text: '3', emoji: '3️⃣' },
        ],
        correctAnswer: 1,
      },
    ];
  }
  // Add more grade-appropriate questions
  return [];
}

function getDragDropItems(gradeLevel, topic) {
  return {
    sources: [
      { id: 'item1', text: 'Apple', emoji: '🍎' },
      { id: 'item2', text: 'Banana', emoji: '🍌' },
    ],
    targets: [
      { id: 'target1', text: 'Red Fruit', emoji: '🔴' },
      { id: 'target2', text: 'Yellow Fruit', emoji: '🟡' },
    ],
    pairs: {
      target1: 'item1',
      target2: 'item2',
    },
  };
}

function getMatchingItems(gradeLevel, topic) {
  return {
    all: [
      { id: '1', text: '2 + 2', emoji: '➕' },
      { id: '2', text: '4', emoji: '4️⃣' },
      { id: '3', text: '5 - 1', emoji: '➖' },
      { id: '4', text: '4', emoji: '4️⃣' },
    ],
    pairs: {
      '1': '2',
      '3': '4',
    },
  };
}

function getFillBlankQuestions(gradeLevel, topic) {
  return [
    {
      id: 'q1',
      text: '2 + 2 = ___',
      answer: '4',
    },
    {
      id: 'q2',
      text: '10 - 5 = ___',
      answer: '5',
    },
  ];
}

function checkMatch(item1, item2, pairs) {
  return pairs[item1.id] === item2.id || pairs[item2.id] === item1.id;
}
