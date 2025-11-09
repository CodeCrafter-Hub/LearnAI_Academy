'use client';

import { useState } from 'react';
import { getGradeTheme, getClassroomStyles } from '@/lib/classroomThemes';

/**
 * Grade-Appropriate Learning Tools Component
 * Provides virtual manipulatives and learning aids specific to each grade level
 */

/**
 * Learning Tools Sidebar
 */
export function LearningToolsSidebar({ gradeLevel, subject, onToolSelect }) {
  const tools = getToolsForGrade(gradeLevel, subject);
  const styles = getClassroomStyles(gradeLevel, subject);

  return (
    <div className={`${styles.card} ${styles.spacing} h-full overflow-y-auto`}>
      <h3 className={`${styles.text.heading} font-bold mb-4 text-center`}>
        🛠️ Learning Tools
      </h3>

      <div className="space-y-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool)}
            className={`w-full ${styles.card} ${styles.spacing} hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br ${tool.color} text-white text-left`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tool.icon}</span>
              <div>
                <div className={`${styles.text.body} font-bold`}>{tool.name}</div>
                {gradeLevel <= 5 && (
                  <div className="text-sm opacity-90">{tool.description}</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Virtual Number Line (K-5, especially helpful for K-2)
 */
export function NumberLine({ gradeLevel, min = 0, max = 20, showJumps = true }) {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const styles = getClassroomStyles(gradeLevel, 'math');

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={`${styles.card} ${styles.spacing}`}>
      <h3 className={`${styles.text.heading} font-bold mb-6 text-center`}>
        📏 Number Line
      </h3>

      <div className="relative">
        {/* Number Line */}
        <div className="flex items-center justify-between gap-2 mb-4 overflow-x-auto pb-4">
          {numbers.map((num) => (
            <div key={num} className="flex flex-col items-center min-w-[60px]">
              {/* Number */}
              <button
                onClick={() => setSelectedNumber(num)}
                className={`${
                  gradeLevel <= 2 ? 'w-14 h-14 text-2xl' : 'w-12 h-12 text-xl'
                } rounded-full font-bold transition-all transform hover:scale-110 ${
                  selectedNumber === num
                    ? 'bg-blue-500 text-white scale-125'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {num}
              </button>
              {/* Tick mark */}
              <div className="w-0.5 h-6 bg-gray-400 mt-2" />
            </div>
          ))}
        </div>

        {/* Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" style={{ top: '60%' }} />
      </div>

      {selectedNumber !== null && (
        <div className="mt-6 text-center">
          <div
            className={`${styles.card} ${styles.spacing} bg-blue-50 border-4 border-blue-300 inline-block`}
          >
            <p className={`${styles.text.body} font-bold`}>
              Selected: <span className="text-blue-600 text-3xl">{selectedNumber}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Virtual Manipulatives (K-5)
 */
export function VirtualManipulatives({ gradeLevel, type = 'counters' }) {
  const [items, setItems] = useState([]);
  const styles = getClassroomStyles(gradeLevel, 'math');

  const manipulativeTypes = {
    counters: { icon: '🔵', name: 'Counters', colors: ['🔵', '🔴', '🟢', '🟡', '🟣'] },
    blocks: { icon: '🟦', name: 'Base-10 Blocks', sizes: ['ones', 'tens', 'hundreds'] },
    fractionCircles: { icon: '🍕', name: 'Fraction Circles', parts: [2, 3, 4, 6, 8] },
  };

  const current = manipulativeTypes[type];

  const addItem = (item) => {
    setItems([...items, { id: Date.now(), value: item }]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <div className={`${styles.card} ${styles.spacing}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`${styles.text.heading} font-bold`}>
          {current.icon} {current.name}
        </h3>
        <div className="flex gap-2">
          <div className="bg-blue-100 px-4 py-2 rounded-lg font-bold text-blue-600">
            Count: {items.length}
          </div>
          <button
            onClick={clearAll}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Add Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {type === 'counters' &&
          current.colors.map((color, i) => (
            <button
              key={i}
              onClick={() => addItem(color)}
              className={`${styles.card} ${styles.spacing} hover:shadow-lg transition-all transform hover:scale-110 text-4xl`}
            >
              {color}
            </button>
          ))}
      </div>

      {/* Workspace */}
      <div
        className={`${styles.card} bg-gray-50 min-h-[400px] p-6 border-4 border-dashed border-gray-300`}
      >
        <div className="flex flex-wrap gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => removeItem(item.id)}
              className="text-5xl hover:scale-125 transition-transform cursor-pointer"
              title="Click to remove"
            >
              {item.value}
            </button>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className={`${styles.text.body}`}>
              Click the buttons above to add {current.name.toLowerCase()}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Simple Calculator (Grades 3+)
 */
export function Calculator({ gradeLevel, mode = 'basic' }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const styles = getClassroomStyles(gradeLevel, 'math');

  const handleNumber = (num) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const handleOperation = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(result.toString());
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div className={`${styles.card} ${styles.spacing} max-w-md mx-auto`}>
      <h3 className={`${styles.text.heading} font-bold mb-4 text-center`}>
        🔢 Calculator
      </h3>

      {/* Display */}
      <div className="bg-gray-800 text-white p-6 rounded-lg mb-4">
        {equation && (
          <div className="text-sm text-gray-400 mb-2 min-h-[20px]">{equation}</div>
        )}
        <div className="text-4xl font-bold text-right">{display}</div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-3">
        {/* Numbers */}
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num.toString())}
            className={`${styles.card} p-4 text-2xl font-bold hover:bg-blue-100 transition-all transform hover:scale-105`}
          >
            {num}
          </button>
        ))}

        {/* Operations */}
        {['+', '-', '×', '÷'].map((op) => (
          <button
            key={op}
            onClick={() => handleOperation(op === '×' ? '*' : op === '÷' ? '/' : op)}
            className="bg-blue-500 text-white p-4 text-2xl font-bold rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
          >
            {op}
          </button>
        ))}

        {/* Clear */}
        <button
          onClick={clear}
          className="bg-red-500 text-white p-4 text-xl font-bold rounded-lg hover:bg-red-600 col-span-2"
        >
          Clear
        </button>

        {/* Equals */}
        <button
          onClick={calculate}
          className="bg-green-500 text-white p-4 text-2xl font-bold rounded-lg hover:bg-green-600 col-span-2"
        >
          =
        </button>
      </div>
    </div>
  );
}

/**
 * Graphing Tool (Grades 6+)
 */
export function GraphingTool({ gradeLevel }) {
  const [points, setPoints] = useState([]);
  const styles = getClassroomStyles(gradeLevel, 'math');

  const gridSize = 20;
  const scale = 20; // pixels per unit

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - rect.width / 2) / scale);
    const y = Math.round((rect.height / 2 - (e.clientY - rect.top)) / scale);
    setPoints([...points, { x, y }]);
  };

  return (
    <div className={`${styles.card} ${styles.spacing}`}>
      <h3 className={`${styles.text.heading} font-bold mb-4 text-center`}>
        📊 Coordinate Plane
      </h3>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-blue-50 p-3 rounded-lg">
          <div className="font-bold text-blue-600">Points: {points.length}</div>
          <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
            {points.map((p, i) => (
              <div key={i}>
                ({p.x}, {p.y})
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setPoints([])}
          className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      {/* Graph */}
      <div
        onClick={handleClick}
        className="relative bg-white border-4 border-gray-300 cursor-crosshair"
        style={{ width: '500px', height: '500px' }}
      >
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Vertical grid lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * scale}
              y1={0}
              x2={i * scale}
              y2={500}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {/* Horizontal grid lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * scale}
              x2={500}
              y2={i * scale}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {/* Axes */}
          <line x1={250} y1={0} x2={250} y2={500} stroke="#000" strokeWidth="2" />
          <line x1={0} y1={250} x2={500} y2={250} stroke="#000" strokeWidth="2" />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={250 + p.x * scale}
              cy={250 - p.y * scale}
              r="5"
              fill="#3b82f6"
            />
          ))}

          {/* Connect points with lines */}
          {points.length > 1 &&
            points.map((p, i) => {
              if (i === 0) return null;
              const prev = points[i - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1={250 + prev.x * scale}
                  y1={250 - prev.y * scale}
                  x2={250 + p.x * scale}
                  y2={250 - p.y * scale}
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              );
            })}
        </svg>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        Click on the graph to plot points
      </div>
    </div>
  );
}

/**
 * Reference Materials (All Grades)
 */
export function ReferenceCard({ gradeLevel, subject, referenceType }) {
  const styles = getClassroomStyles(gradeLevel, subject);
  const content = getReferenceContent(gradeLevel, subject, referenceType);

  return (
    <div className={`${styles.card} ${styles.spacing}`}>
      <h3 className={`${styles.text.heading} font-bold mb-4`}>
        {content.icon} {content.title}
      </h3>

      <div className={`${styles.text.body} space-y-4`}>
        {content.items.map((item, i) => (
          <div
            key={i}
            className={`${styles.card} ${styles.spacing} bg-gradient-to-br ${item.color || 'from-gray-50 to-gray-100'}`}
          >
            <div className="font-bold text-lg mb-2">{item.heading}</div>
            <div>{item.content}</div>
            {item.example && (
              <div className="mt-2 bg-white/50 p-3 rounded-lg">
                <div className="text-sm font-semibold mb-1">Example:</div>
                <div className="font-mono">{item.example}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Word Bank (K-8, especially helpful for writing)
 */
export function WordBank({ gradeLevel, topic, onWordSelect }) {
  const styles = getClassroomStyles(gradeLevel, 'english');
  const words = getWordBankForTopic(gradeLevel, topic);

  return (
    <div className={`${styles.card} ${styles.spacing}`}>
      <h3 className={`${styles.text.heading} font-bold mb-4`}>
        📝 Word Bank
      </h3>

      <div className="flex flex-wrap gap-3">
        {words.map((word, i) => (
          <button
            key={i}
            onClick={() => onWordSelect && onWordSelect(word)}
            className={`${styles.card} px-4 py-2 hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 hover:border-blue-400`}
          >
            <span className={`${styles.text.body} font-semibold`}>
              {word.emoji && gradeLevel <= 5 && (
                <span className="mr-2">{word.emoji}</span>
              )}
              {word.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper Functions
 */
function getToolsForGrade(gradeLevel, subject) {
  const baseTools = [];

  // Math tools
  if (subject === 'math') {
    if (gradeLevel <= 2) {
      baseTools.push(
        { id: 'number-line', name: 'Number Line', icon: '📏', color: 'from-blue-400 to-blue-600', description: 'Count and add!' },
        { id: 'counters', name: 'Counters', icon: '🔵', color: 'from-green-400 to-green-600', description: 'Count with colors!' }
      );
    } else if (gradeLevel <= 5) {
      baseTools.push(
        { id: 'calculator', name: 'Calculator', icon: '🔢', color: 'from-blue-400 to-blue-600', description: 'Do math fast!' },
        { id: 'blocks', name: 'Base-10 Blocks', icon: '🟦', color: 'from-purple-400 to-purple-600', description: 'Learn place value!' },
        { id: 'fractions', name: 'Fraction Circles', icon: '🍕', color: 'from-orange-400 to-orange-600', description: 'Visualize fractions!' }
      );
    } else if (gradeLevel <= 8) {
      baseTools.push(
        { id: 'calculator', name: 'Calculator', icon: '🔢', color: 'from-blue-500 to-blue-700' },
        { id: 'graph', name: 'Graphing Tool', icon: '📊', color: 'from-purple-500 to-purple-700' },
        { id: 'formulas', name: 'Formula Sheet', icon: '📐', color: 'from-green-500 to-green-700' }
      );
    } else {
      baseTools.push(
        { id: 'calculator', name: 'Scientific Calculator', icon: '🔢', color: 'from-blue-600 to-blue-800' },
        { id: 'graph', name: 'Graphing Calculator', icon: '📊', color: 'from-purple-600 to-purple-800' },
        { id: 'formulas', name: 'Reference Formulas', icon: '📐', color: 'from-green-600 to-green-800' }
      );
    }
  }

  // Reading/English tools
  if (subject === 'reading' || subject === 'english') {
    if (gradeLevel <= 5) {
      baseTools.push(
        { id: 'word-bank', name: 'Word Bank', icon: '📝', color: 'from-amber-400 to-amber-600', description: 'Helpful words!' },
        { id: 'dictionary', name: 'Picture Dictionary', icon: '📖', color: 'from-green-400 to-green-600', description: 'Look up words!' }
      );
    } else {
      baseTools.push(
        { id: 'thesaurus', name: 'Thesaurus', icon: '📚', color: 'from-amber-500 to-amber-700' },
        { id: 'grammar', name: 'Grammar Guide', icon: '✍️', color: 'from-green-500 to-green-700' }
      );
    }
  }

  return baseTools;
}

function getReferenceContent(gradeLevel, subject, type) {
  // Sample reference content
  if (subject === 'math' && type === 'formulas') {
    return {
      icon: '📐',
      title: 'Math Formulas',
      items: [
        {
          heading: 'Area of Rectangle',
          content: 'Area = length × width',
          example: 'A = 5 × 3 = 15 square units',
          color: 'from-blue-50 to-blue-100',
        },
        {
          heading: 'Perimeter of Rectangle',
          content: 'Perimeter = 2 × (length + width)',
          example: 'P = 2 × (5 + 3) = 16 units',
          color: 'from-green-50 to-green-100',
        },
      ],
    };
  }

  return {
    icon: '📚',
    title: 'Reference Guide',
    items: [],
  };
}

function getWordBankForTopic(gradeLevel, topic) {
  // Sample word bank
  const words = [
    { text: 'beautiful', emoji: '✨' },
    { text: 'happy', emoji: '😊' },
    { text: 'quickly', emoji: '⚡' },
    { text: 'carefully', emoji: '🎯' },
    { text: 'amazing', emoji: '🌟' },
  ];

  return words;
}
