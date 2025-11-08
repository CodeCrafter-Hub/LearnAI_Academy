/**
 * Grade-Specific Curriculum Data
 * Comprehensive learning content tailored to each grade level and subject
 */

/**
 * MATH CURRICULUM BY GRADE
 */
export const MATH_CURRICULUM = {
  // Kindergarten - Grade 2
  EARLY_ELEMENTARY: {
    grades: [0, 1, 2],
    topics: [
      {
        id: 'counting-1-20',
        name: '🔢 Counting 1-20',
        description: 'Learn to count with fun animals and objects!',
        difficulty: 1,
        activities: ['counting-game', 'number-match', 'story-problems'],
        skills: ['number recognition', 'one-to-one correspondence', 'counting sequence'],
        visuals: ['🐶', '🐱', '🐰', '🦊', '🐻'],
      },
      {
        id: 'shapes-colors',
        name: '🔷 Shapes & Colors',
        description: 'Explore circles, squares, triangles, and more!',
        difficulty: 1,
        activities: ['shape-hunt', 'color-match', 'pattern-create'],
        skills: ['shape recognition', 'color identification', 'pattern making'],
        visuals: ['⭐', '❤️', '🔵', '🟢', '🟡'],
      },
      {
        id: 'simple-addition',
        name: '➕ Adding Fun',
        description: 'Add numbers with pictures and friends!',
        difficulty: 2,
        activities: ['picture-addition', 'number-line-hop', 'story-add'],
        skills: ['addition facts to 10', 'visual addition', 'word problems'],
        visuals: ['🎈', '🍎', '🌟', '🎁', '🧸'],
      },
      {
        id: 'simple-subtraction',
        name: '➖ Taking Away',
        description: 'Learn subtraction with colorful objects!',
        difficulty: 2,
        activities: ['picture-subtraction', 'count-down', 'story-subtract'],
        skills: ['subtraction facts to 10', 'visual subtraction', 'comparison'],
        visuals: ['🍪', '🎨', '🌸', '⚽', '🎵'],
      },
      {
        id: 'measurement-basics',
        name: '📏 Measurement Fun',
        description: 'Compare big and small, long and short!',
        difficulty: 1,
        activities: ['compare-sizes', 'measure-objects', 'sort-by-length'],
        skills: ['comparison', 'length', 'weight', 'capacity'],
        visuals: ['📐', '⚖️', '🥤', '📦', '🎒'],
      },
    ],
    learningStyle: 'hands-on',
    sessionDuration: 15, // minutes
    attentionTechniques: ['movement breaks', 'songs', 'games', 'stories'],
  },

  // Grades 3-5
  UPPER_ELEMENTARY: {
    grades: [3, 4, 5],
    topics: [
      {
        id: 'multiplication-tables',
        name: '✖️ Multiplication Mastery',
        description: 'Master times tables through fun strategies',
        difficulty: 3,
        activities: ['times-table-game', 'array-builder', 'word-problems'],
        skills: ['multiplication facts', 'arrays', 'repeated addition', 'patterns'],
        strategies: ['skip counting', 'arrays', 'number patterns', 'area models'],
      },
      {
        id: 'division-concepts',
        name: '➗ Division Adventures',
        description: 'Learn division and equal sharing',
        difficulty: 3,
        activities: ['equal-groups', 'division-game', 'real-world-division'],
        skills: ['division facts', 'remainders', 'equal sharing', 'inverse operations'],
        strategies: ['equal groups', 'repeated subtraction', 'fact families'],
      },
      {
        id: 'fractions-intro',
        name: '🍕 Fractions & Parts',
        description: 'Understand fractions with pizza and more!',
        difficulty: 4,
        activities: ['fraction-pizza', 'equivalent-fractions', 'compare-fractions'],
        skills: ['parts of a whole', 'numerator/denominator', 'equivalence', 'comparison'],
        visuals: ['🍕', '🍫', '🎂', '🍎', '🧩'],
      },
      {
        id: 'geometry-advanced',
        name: '📐 Geometry Explorer',
        description: 'Angles, area, perimeter, and 3D shapes',
        difficulty: 4,
        activities: ['angle-hunt', 'area-builder', 'perimeter-problems', '3d-models'],
        skills: ['angles', 'area', 'perimeter', 'volume', 'geometric properties'],
        strategies: ['formula application', 'decomposition', 'nets'],
      },
      {
        id: 'decimals',
        name: '💵 Decimals & Money',
        description: 'Master decimals through money and measurement',
        difficulty: 4,
        activities: ['money-problems', 'decimal-place-value', 'operations'],
        skills: ['place value', 'decimal operations', 'money', 'rounding'],
        realWorld: ['shopping', 'measuring', 'sports statistics'],
      },
    ],
    learningStyle: 'guided-discovery',
    sessionDuration: 25,
    attentionTechniques: ['challenges', 'puzzles', 'competitions', 'real-world problems'],
  },

  // Grades 6-8
  MIDDLE_SCHOOL: {
    grades: [6, 7, 8],
    topics: [
      {
        id: 'integers-operations',
        name: 'Integer Operations',
        description: 'Master positive and negative numbers',
        difficulty: 5,
        activities: ['integer-game', 'number-line-practice', 'word-problems'],
        skills: ['negative numbers', 'absolute value', 'operations', 'number line'],
        applications: ['temperature', 'elevation', 'banking', 'coordinates'],
      },
      {
        id: 'ratios-proportions',
        name: 'Ratios & Proportions',
        description: 'Solve ratio and proportion problems',
        difficulty: 5,
        activities: ['ratio-problems', 'scale-drawings', 'unit-rates'],
        skills: ['equivalent ratios', 'proportions', 'scale', 'unit rate', 'percent'],
        applications: ['recipes', 'maps', 'scale models', 'rates'],
      },
      {
        id: 'algebraic-expressions',
        name: 'Algebraic Expressions',
        description: 'Introduction to variables and expressions',
        difficulty: 6,
        activities: ['expression-builder', 'equation-solver', 'word-to-equation'],
        skills: ['variables', 'expressions', 'equations', 'inequalities', 'simplifying'],
        foundations: ['order of operations', 'combining like terms', 'distributive property'],
      },
      {
        id: 'linear-equations',
        name: 'Linear Equations & Graphs',
        description: 'Solve and graph linear relationships',
        difficulty: 6,
        activities: ['equation-solver', 'graphing-practice', 'slope-explorer'],
        skills: ['solving equations', 'graphing lines', 'slope', 'y-intercept', 'systems'],
        tools: ['coordinate plane', 'graphing calculator', 'tables'],
      },
      {
        id: 'statistics-probability',
        name: 'Statistics & Probability',
        description: 'Analyze data and predict outcomes',
        difficulty: 5,
        activities: ['data-analysis', 'probability-games', 'surveys'],
        skills: ['mean/median/mode', 'graphs', 'probability', 'sampling', 'predictions'],
        projects: ['class survey', 'sports statistics', 'weather prediction'],
      },
    ],
    learningStyle: 'problem-solving',
    sessionDuration: 35,
    attentionTechniques: ['challenging problems', 'projects', 'technology', 'collaboration'],
  },

  // Grades 9-12
  HIGH_SCHOOL: {
    grades: [9, 10, 11, 12],
    topics: [
      {
        id: 'algebra-fundamentals',
        name: 'Algebra I Fundamentals',
        description: 'Core algebraic concepts and techniques',
        difficulty: 7,
        activities: ['problem-sets', 'application-problems', 'proof-practice'],
        skills: ['polynomial operations', 'factoring', 'quadratic equations', 'functions'],
        assessments: ['skill checks', 'application problems', 'conceptual understanding'],
      },
      {
        id: 'geometry-proofs',
        name: 'Geometric Reasoning',
        description: 'Formal geometry and proofs',
        difficulty: 7,
        activities: ['proof-writing', 'theorem-application', 'construction'],
        skills: ['deductive reasoning', 'theorems', 'proofs', 'constructions', 'trigonometry'],
        rigor: ['formal proofs', 'logical reasoning', 'geometric relationships'],
      },
      {
        id: 'advanced-algebra',
        name: 'Algebra II & Trigonometry',
        description: 'Advanced algebraic and trigonometric functions',
        difficulty: 8,
        activities: ['complex-problems', 'graphing-analysis', 'modeling'],
        skills: ['exponential/logarithmic', 'rational functions', 'trigonometry', 'sequences'],
        applications: ['physics', 'engineering', 'economics', 'modeling'],
      },
      {
        id: 'precalculus',
        name: 'Pre-Calculus',
        description: 'Preparation for calculus',
        difficulty: 9,
        activities: ['advanced-problems', 'function-analysis', 'limit-exploration'],
        skills: ['functions', 'polar coordinates', 'vectors', 'matrices', 'limits'],
        preparation: ['calculus readiness', 'analytical thinking', 'abstract reasoning'],
      },
      {
        id: 'calculus',
        name: 'Calculus',
        description: 'Differential and integral calculus',
        difficulty: 10,
        activities: ['derivation', 'integration', 'optimization', 'applications'],
        skills: ['limits', 'derivatives', 'integrals', 'applications', 'theorems'],
        depth: ['theoretical understanding', 'computational skills', 'real-world application'],
      },
    ],
    learningStyle: 'rigorous-analytical',
    sessionDuration: 45,
    attentionTechniques: ['complex challenges', 'real applications', 'independent work', 'peer discussion'],
  },
};

/**
 * READING CURRICULUM BY GRADE
 */
export const READING_CURRICULUM = {
  EARLY_ELEMENTARY: {
    grades: [0, 1, 2],
    topics: [
      {
        id: 'letter-sounds',
        name: '🔤 Letter Sounds & Phonics',
        description: 'Learn letters and their sounds!',
        difficulty: 1,
        activities: ['letter-matching', 'sound-game', 'alphabet-song'],
        skills: ['letter recognition', 'phonemic awareness', 'sound-letter correspondence'],
        visuals: ['🎵', '🔤', '📖', '✨', '🌈'],
      },
      {
        id: 'sight-words',
        name: '👀 Sight Words',
        description: 'Master common words by sight!',
        difficulty: 1,
        activities: ['word-flash', 'word-hunt', 'sentence-build'],
        skills: ['high-frequency words', 'word recognition', 'fluency'],
        wordLists: ['Dolch', 'Fry', 'grade-level'],
      },
      {
        id: 'simple-stories',
        name: '📚 Reading Simple Stories',
        description: 'Read fun stories with pictures!',
        difficulty: 2,
        activities: ['guided-reading', 'picture-clues', 'story-retell'],
        skills: ['decoding', 'comprehension', 'prediction', 'retelling'],
        genres: ['fairy tales', 'animal stories', 'rhyming books'],
      },
      {
        id: 'story-elements',
        name: '🎭 Story Parts',
        description: 'Find characters, setting, and events!',
        difficulty: 2,
        activities: ['character-identify', 'setting-draw', 'sequence-events'],
        skills: ['characters', 'setting', 'plot', 'beginning-middle-end'],
        interactive: ['story maps', 'character cards', 'sequence pictures'],
      },
    ],
    learningStyle: 'multisensory',
    sessionDuration: 15,
    bookLevels: ['A-J', 'early readers', 'picture books'],
  },

  UPPER_ELEMENTARY: {
    grades: [3, 4, 5],
    topics: [
      {
        id: 'fluency-building',
        name: '🎯 Reading Fluency',
        description: 'Read smoothly and with expression',
        difficulty: 3,
        activities: ['repeated-reading', 'reader-theater', 'timed-practice'],
        skills: ['accuracy', 'rate', 'expression', 'phrasing'],
        practice: ['leveled passages', 'poetry', 'dialogue'],
      },
      {
        id: 'comprehension-strategies',
        name: '🧠 Understanding Stories',
        description: 'Master reading comprehension strategies',
        difficulty: 4,
        activities: ['question-answer', 'summarize', 'predict-confirm'],
        skills: ['main idea', 'details', 'inference', 'summary', 'questioning'],
        strategies: ['think-alouds', 'graphic organizers', 'annotation'],
      },
      {
        id: 'vocabulary-building',
        name: '📖 Vocabulary Power',
        description: 'Expand your word knowledge',
        difficulty: 3,
        activities: ['context-clues', 'word-roots', 'vocabulary-games'],
        skills: ['context clues', 'word parts', 'synonyms/antonyms', 'multiple meanings'],
        tools: ['word walls', 'vocabulary journals', 'word maps'],
      },
      {
        id: 'literary-elements',
        name: '✨ Story Analysis',
        description: 'Analyze themes, conflicts, and more',
        difficulty: 4,
        activities: ['theme-identify', 'conflict-analysis', 'character-development'],
        skills: ['theme', 'conflict', 'point of view', 'character traits', 'plot structure'],
        depth: ['compare/contrast', 'cause/effect', 'author\'s purpose'],
      },
      {
        id: 'informational-text',
        name: '📰 Reading to Learn',
        description: 'Read and understand informational texts',
        difficulty: 4,
        activities: ['text-features', 'note-taking', 'research'],
        skills: ['text features', 'main idea/details', 'compare texts', 'research'],
        texts: ['articles', 'biographies', 'how-to books', 'science texts'],
      },
    ],
    learningStyle: 'strategy-based',
    sessionDuration: 25,
    bookLevels: ['K-Z', 'chapter books', 'novels'],
  },

  MIDDLE_SCHOOL: {
    grades: [6, 7, 8],
    topics: [
      {
        id: 'close-reading',
        name: 'Close Reading Analysis',
        description: 'Analyze texts deeply and critically',
        difficulty: 6,
        activities: ['annotation', 'textual-evidence', 'literary-analysis'],
        skills: ['close reading', 'text evidence', 'analysis', 'interpretation'],
        techniques: ['annotation strategies', 'SOAPSTone', 'rhetorical analysis'],
      },
      {
        id: 'literary-analysis',
        name: 'Literary Analysis',
        description: 'Examine literary devices and themes',
        difficulty: 6,
        activities: ['device-identification', 'theme-analysis', 'comparative-reading'],
        skills: ['figurative language', 'symbolism', 'theme', 'motif', 'irony'],
        genres: ['fiction', 'poetry', 'drama', 'mythology'],
      },
      {
        id: 'nonfiction-analysis',
        name: 'Informational Text Analysis',
        description: 'Analyze arguments and informational texts',
        difficulty: 5,
        activities: ['argument-analysis', 'source-evaluation', 'synthesis'],
        skills: ['claims/evidence', 'text structure', 'author\'s purpose', 'bias'],
        texts: ['articles', 'speeches', 'essays', 'primary sources'],
      },
      {
        id: 'critical-thinking',
        name: 'Critical Reading',
        description: 'Evaluate texts and form judgments',
        difficulty: 7,
        activities: ['critique', 'compare-texts', 'perspective-analysis'],
        skills: ['evaluation', 'synthesis', 'perspective', 'credibility'],
        depth: ['multiple perspectives', 'historical context', 'contemporary relevance'],
      },
    ],
    learningStyle: 'analytical',
    sessionDuration: 35,
    bookLevels: ['young adult', 'classic literature', 'contemporary fiction'],
  },

  HIGH_SCHOOL: {
    grades: [9, 10, 11, 12],
    topics: [
      {
        id: 'literary-criticism',
        name: 'Literary Criticism',
        description: 'Apply critical lenses to literature',
        difficulty: 8,
        activities: ['lens-application', 'scholarly-analysis', 'research-paper'],
        skills: ['critical theory', 'scholarly analysis', 'research', 'argumentation'],
        approaches: ['feminist', 'marxist', 'psychoanalytic', 'post-colonial', 'formalist'],
      },
      {
        id: 'classic-literature',
        name: 'Classic Literature',
        description: 'Engage with canonical texts',
        difficulty: 8,
        activities: ['novel-study', 'socratic-seminar', 'essay-writing'],
        skills: ['complex analysis', 'historical context', 'universal themes', 'literary merit'],
        works: ['Shakespeare', 'British literature', 'American classics', 'world literature'],
      },
      {
        id: 'rhetorical-analysis',
        name: 'Rhetorical Analysis',
        description: 'Analyze persuasive techniques',
        difficulty: 7,
        activities: ['speech-analysis', 'argument-evaluation', 'rhetoric-practice'],
        skills: ['ethos/pathos/logos', 'rhetorical devices', 'argument structure', 'persuasion'],
        texts: ['speeches', 'essays', 'editorials', 'advertisements'],
      },
      {
        id: 'advanced-interpretation',
        name: 'Advanced Interpretation',
        description: 'Develop sophisticated interpretations',
        difficulty: 9,
        activities: ['independent-analysis', 'discussion-leadership', 'thesis-development'],
        skills: ['interpretation', 'thesis development', 'scholarly writing', 'presentation'],
        rigor: ['independent thinking', 'academic discourse', 'intellectual engagement'],
      },
    ],
    learningStyle: 'scholarly',
    sessionDuration: 45,
    bookLevels: ['AP-level', 'college prep', 'canonical literature'],
  },
};

/**
 * SCIENCE CURRICULUM BY GRADE
 */
export const SCIENCE_CURRICULUM = {
  EARLY_ELEMENTARY: {
    grades: [0, 1, 2],
    topics: [
      {
        id: 'five-senses',
        name: '👀 Five Senses',
        description: 'Explore the world with your senses!',
        difficulty: 1,
        activities: ['sense-exploration', 'sorting-game', 'observation'],
        skills: ['observation', 'description', 'classification'],
        experiments: ['taste test', 'texture box', 'sound identification'],
      },
      {
        id: 'living-things',
        name: '🌱 Living Things',
        description: 'Learn about plants and animals!',
        difficulty: 1,
        activities: ['animal-sorting', 'plant-growing', 'habitat-match'],
        skills: ['living vs non-living', 'basic needs', 'habitats', 'life cycles'],
        visuals: ['🌸', '🦋', '🐠', '🌳', '🐝'],
      },
      {
        id: 'weather-seasons',
        name: '🌤️ Weather & Seasons',
        description: 'Discover weather patterns and seasons!',
        difficulty: 1,
        activities: ['weather-watch', 'season-sort', 'temperature'],
        skills: ['weather patterns', 'seasons', 'measurement', 'prediction'],
        observations: ['daily weather', 'seasonal changes', 'clothing choices'],
      },
      {
        id: 'simple-machines',
        name: '⚙️ Simple Machines',
        description: 'Explore how machines help us!',
        difficulty: 2,
        activities: ['machine-hunt', 'ramp-experiment', 'lever-play'],
        skills: ['push/pull', 'inclined planes', 'levers', 'wheels'],
        handson: ['playground equipment', 'toys', 'classroom objects'],
      },
    ],
    learningStyle: 'exploration',
    sessionDuration: 15,
    emphasis: ['hands-on', 'observation', 'wonder', 'questioning'],
  },

  UPPER_ELEMENTARY: {
    grades: [3, 4, 5],
    topics: [
      {
        id: 'life-cycles',
        name: '🦋 Life Cycles & Adaptations',
        description: 'Study how organisms grow and adapt',
        difficulty: 3,
        activities: ['lifecycle-diagram', 'adaptation-game', 'ecosystem-study'],
        skills: ['life cycles', 'adaptations', 'ecosystems', 'food chains'],
        investigations: ['butterfly garden', 'plant growth', 'animal research'],
      },
      {
        id: 'matter-changes',
        name: '⚗️ Matter & Changes',
        description: 'Explore states of matter and changes',
        difficulty: 4,
        activities: ['state-changes', 'mixing-experiments', 'properties-testing'],
        skills: ['states of matter', 'physical/chemical changes', 'properties', 'mixtures'],
        experiments: ['ice melting', 'dissolving', 'reactions'],
      },
      {
        id: 'forces-motion',
        name: '🎯 Forces & Motion',
        description: 'Investigate how things move',
        difficulty: 4,
        activities: ['force-experiments', 'motion-tracking', 'friction-testing'],
        skills: ['forces', 'motion', 'friction', 'gravity', 'magnetism'],
        handson: ['ramps', 'pendulums', 'magnets', 'balanced/unbalanced forces'],
      },
      {
        id: 'earth-systems',
        name: '🌍 Earth Systems',
        description: 'Understand Earth\'s land, water, and air',
        difficulty: 4,
        activities: ['rock-classification', 'water-cycle-model', 'erosion-demo'],
        skills: ['rock cycle', 'water cycle', 'erosion', 'weathering', 'landforms'],
        models: ['Earth layers', 'water cycle', 'rock cycle'],
      },
      {
        id: 'energy-forms',
        name: '⚡ Energy Forms',
        description: 'Discover different types of energy',
        difficulty: 4,
        activities: ['energy-transfer', 'heat-experiments', 'sound-waves'],
        skills: ['energy forms', 'energy transfer', 'heat', 'light', 'sound'],
        exploration: ['circuits', 'solar power', 'renewable energy'],
      },
    ],
    learningStyle: 'inquiry-based',
    sessionDuration: 30,
    emphasis: ['experiments', 'scientific method', 'data collection', 'conclusions'],
  },

  MIDDLE_SCHOOL: {
    grades: [6, 7, 8],
    topics: [
      {
        id: 'cell-biology',
        name: 'Cell Structure & Function',
        description: 'Explore the building blocks of life',
        difficulty: 6,
        activities: ['cell-models', 'microscope-lab', 'organelle-function'],
        skills: ['cell theory', 'organelles', 'cell processes', 'prokaryotic/eukaryotic'],
        labs: ['microscopy', 'cell membrane diffusion', 'cellular respiration'],
      },
      {
        id: 'chemistry-basics',
        name: 'Chemical Reactions',
        description: 'Understand atoms, molecules, and reactions',
        difficulty: 6,
        activities: ['atom-models', 'reaction-experiments', 'equation-balancing'],
        skills: ['atomic structure', 'periodic table', 'chemical reactions', 'equations'],
        experiments: ['acid-base reactions', 'combustion', 'indicators'],
      },
      {
        id: 'physics-mechanics',
        name: 'Motion & Forces',
        description: 'Apply Newton\'s laws and analyze motion',
        difficulty: 6,
        activities: ['force-calculations', 'motion-graphs', 'machine-efficiency'],
        skills: ['Newton\'s laws', 'momentum', 'work', 'power', 'simple machines'],
        calculations: ['speed', 'acceleration', 'force', 'mechanical advantage'],
      },
      {
        id: 'earth-science',
        name: 'Earth & Space Science',
        description: 'Study Earth\'s systems and the universe',
        difficulty: 5,
        activities: ['plate-tectonics', 'weather-systems', 'astronomy'],
        skills: ['plate tectonics', 'weather patterns', 'solar system', 'universe'],
        topics: ['earthquakes', 'volcanoes', 'climate', 'planets', 'stars'],
      },
      {
        id: 'genetics-evolution',
        name: 'Genetics & Evolution',
        description: 'Understand heredity and natural selection',
        difficulty: 7,
        activities: ['punnett-squares', 'trait-analysis', 'evolution-evidence'],
        skills: ['DNA', 'genes', 'heredity', 'evolution', 'natural selection'],
        concepts: ['Mendel\'s laws', 'genetic variation', 'adaptation', 'speciation'],
      },
    ],
    learningStyle: 'investigation',
    sessionDuration: 40,
    emphasis: ['hypothesis testing', 'data analysis', 'scientific reasoning', 'lab safety'],
  },

  HIGH_SCHOOL: {
    grades: [9, 10, 11, 12],
    topics: [
      {
        id: 'advanced-biology',
        name: 'Advanced Biology',
        description: 'Molecular biology and ecology',
        difficulty: 8,
        activities: ['lab-investigations', 'data-analysis', 'research-projects'],
        skills: ['molecular biology', 'ecology', 'evolution', 'systems biology'],
        depth: ['biochemistry', 'genetics', 'physiology', 'environmental science'],
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        description: 'Comprehensive chemistry study',
        difficulty: 8,
        activities: ['lab-experiments', 'stoichiometry', 'equilibrium'],
        skills: ['atomic theory', 'bonding', 'reactions', 'stoichiometry', 'thermodynamics'],
        topics: ['organic chemistry', 'electrochemistry', 'nuclear chemistry'],
      },
      {
        id: 'physics',
        name: 'Physics',
        description: 'Classical and modern physics',
        difficulty: 9,
        activities: ['problem-solving', 'lab-experiments', 'mathematical-modeling'],
        skills: ['mechanics', 'waves', 'electricity', 'magnetism', 'modern physics'],
        mathematics: ['calculus-based', 'vector analysis', 'differential equations'],
      },
      {
        id: 'environmental-science',
        name: 'Environmental Science',
        description: 'Earth systems and sustainability',
        difficulty: 7,
        activities: ['field-studies', 'data-collection', 'sustainability-projects'],
        skills: ['ecology', 'conservation', 'environmental issues', 'sustainability'],
        applications: ['climate change', 'resource management', 'pollution', 'renewable energy'],
      },
    ],
    learningStyle: 'rigorous-scientific',
    sessionDuration: 50,
    emphasis: ['advanced concepts', 'quantitative analysis', 'research skills', 'critical thinking'],
  },
};

/**
 * Get curriculum topics for specific grade and subject
 */
export function getCurriculumTopics(gradeLevel, subject) {
  const curriculumMap = {
    math: MATH_CURRICULUM,
    reading: READING_CURRICULUM,
    science: SCIENCE_CURRICULUM,
  };

  const curriculum = curriculumMap[subject.toLowerCase()];
  if (!curriculum) return null;

  // Determine grade band
  let gradeBand;
  if (gradeLevel <= 2) gradeBand = curriculum.EARLY_ELEMENTARY;
  else if (gradeLevel <= 5) gradeBand = curriculum.UPPER_ELEMENTARY;
  else if (gradeLevel <= 8) gradeBand = curriculum.MIDDLE_SCHOOL;
  else gradeBand = curriculum.HIGH_SCHOOL;

  return gradeBand;
}

/**
 * Get appropriate difficulty level for grade
 */
export function getDifficultyRange(gradeLevel) {
  if (gradeLevel <= 2) return { min: 1, max: 2 };
  if (gradeLevel <= 5) return { min: 3, max: 4 };
  if (gradeLevel <= 8) return { min: 5, max: 7 };
  return { min: 7, max: 10 };
}

/**
 * Get session duration for grade level
 */
export function getSessionDuration(gradeLevel) {
  if (gradeLevel <= 2) return 15;
  if (gradeLevel <= 5) return 25;
  if (gradeLevel <= 8) return 35;
  return 45;
}
