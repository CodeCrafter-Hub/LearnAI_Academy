/**
 * Knowledge Graph and Skill Tree Visualizer
 *
 * Revolutionary visualization system that maps the entire learning journey:
 * - Interactive knowledge graph showing concept relationships
 * - Skill tree with unlockable abilities (gamified progression)
 * - Prerequisite tracking and recommendations
 * - Visual learning path from beginner to mastery
 * - Real-time progress visualization
 * - Subject interconnections and dependencies
 * - Personalized learning roadmaps
 *
 * Transforms abstract learning into a visual, gamified journey.
 */

// Node types in the knowledge graph
const NODE_TYPES = {
  CONCEPT: 'concept',
  SKILL: 'skill',
  TOPIC: 'topic',
  SUBJECT: 'subject',
  MILESTONE: 'milestone',
  PROJECT: 'project',
};

// Relationship types between nodes
const RELATIONSHIP_TYPES = {
  PREREQUISITE: 'prerequisite', // Must learn A before B
  RELATED: 'related', // A and B are connected
  ENABLES: 'enables', // A unlocks ability to do B
  REINFORCES: 'reinforces', // A strengthens understanding of B
  APPLIES_TO: 'applies_to', // A is used in B
  PART_OF: 'part_of', // A is a component of B
};

// Mastery levels
const MASTERY_LEVELS = {
  LOCKED: 'locked', // Not yet accessible
  AVAILABLE: 'available', // Prerequisites met, can start
  STARTED: 'started', // Began learning (< 30%)
  LEARNING: 'learning', // Actively learning (30-70%)
  PRACTICING: 'practicing', // Understanding but needs practice (70-90%)
  MASTERED: 'mastered', // Fully mastered (90-100%)
};

// Visual styles for different states
const NODE_STYLES = {
  [MASTERY_LEVELS.LOCKED]: {
    color: '#9CA3AF',
    borderColor: '#6B7280',
    icon: '🔒',
    opacity: 0.5,
  },
  [MASTERY_LEVELS.AVAILABLE]: {
    color: '#3B82F6',
    borderColor: '#2563EB',
    icon: '📖',
    opacity: 0.8,
    glow: true,
  },
  [MASTERY_LEVELS.STARTED]: {
    color: '#F59E0B',
    borderColor: '#D97706',
    icon: '📝',
    opacity: 1,
  },
  [MASTERY_LEVELS.LEARNING]: {
    color: '#8B5CF6',
    borderColor: '#7C3AED',
    icon: '🎯',
    opacity: 1,
  },
  [MASTERY_LEVELS.PRACTICING]: {
    color: '#EC4899',
    borderColor: '#DB2777',
    icon: '⚡',
    opacity: 1,
  },
  [MASTERY_LEVELS.MASTERED]: {
    color: '#10B981',
    borderColor: '#059669',
    icon: '✅',
    opacity: 1,
    glow: true,
  },
};

/**
 * Knowledge Graph Node
 */
export class KnowledgeNode {
  constructor(id, data) {
    this.id = id;
    this.type = data.type || NODE_TYPES.CONCEPT;
    this.name = data.name;
    this.description = data.description || '';
    this.subject = data.subject;
    this.gradeLevel = data.gradeLevel;
    this.difficulty = data.difficulty || 1; // 1-10
    this.estimatedTime = data.estimatedTime || 30; // minutes
    this.prerequisites = data.prerequisites || []; // Array of node IDs
    this.unlocks = data.unlocks || []; // What this enables
    this.resources = data.resources || [];
    this.assessments = data.assessments || [];
    this.metadata = data.metadata || {};
  }

  /**
   * Check if prerequisites are met
   */
  arePrerequisitesMet(masteredNodes) {
    return this.prerequisites.every(prereqId => masteredNodes.includes(prereqId));
  }

  /**
   * Get required mastery level for access
   */
  getRequiredMastery() {
    return MASTERY_LEVELS.MASTERED; // Prerequisites must be mastered
  }
}

/**
 * Knowledge Graph - Manages the entire knowledge structure
 */
export class KnowledgeGraph {
  constructor(storageKey = 'knowledge_graph') {
    this.nodes = new Map();
    this.edges = [];
    this.storageKey = storageKey;
    this.loadGraph();
  }

  /**
   * Load graph from storage
   */
  loadGraph() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        data.nodes.forEach(nodeData => {
          const node = new KnowledgeNode(nodeData.id, nodeData);
          this.nodes.set(node.id, node);
        });
        this.edges = data.edges || [];
      } else {
        this.initializeDefaultGraph();
      }
    } catch (error) {
      console.error('Error loading knowledge graph:', error);
      this.initializeDefaultGraph();
    }
  }

  /**
   * Save graph to storage
   */
  saveGraph() {
    try {
      const data = {
        nodes: Array.from(this.nodes.values()),
        edges: this.edges,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving knowledge graph:', error);
    }
  }

  /**
   * Initialize with default knowledge structure
   */
  initializeDefaultGraph() {
    // Math skill tree example
    const mathNodes = [
      // Grade K-2
      { id: 'math_counting', name: 'Counting', subject: 'math', gradeLevel: 'K', difficulty: 1, type: NODE_TYPES.SKILL },
      { id: 'math_addition_basic', name: 'Basic Addition', subject: 'math', gradeLevel: 1, difficulty: 2, prerequisites: ['math_counting'] },
      { id: 'math_subtraction_basic', name: 'Basic Subtraction', subject: 'math', gradeLevel: 1, difficulty: 2, prerequisites: ['math_counting'] },

      // Grade 3-5
      { id: 'math_multiplication', name: 'Multiplication', subject: 'math', gradeLevel: 3, difficulty: 3, prerequisites: ['math_addition_basic'] },
      { id: 'math_division', name: 'Division', subject: 'math', gradeLevel: 3, difficulty: 3, prerequisites: ['math_subtraction_basic', 'math_multiplication'] },
      { id: 'math_fractions', name: 'Fractions', subject: 'math', gradeLevel: 4, difficulty: 4, prerequisites: ['math_division'] },
      { id: 'math_decimals', name: 'Decimals', subject: 'math', gradeLevel: 4, difficulty: 4, prerequisites: ['math_fractions'] },

      // Grade 6-8
      { id: 'math_ratios', name: 'Ratios & Proportions', subject: 'math', gradeLevel: 6, difficulty: 5, prerequisites: ['math_fractions'] },
      { id: 'math_percentages', name: 'Percentages', subject: 'math', gradeLevel: 6, difficulty: 5, prerequisites: ['math_decimals'] },
      { id: 'math_algebra_basics', name: 'Algebra Basics', subject: 'math', gradeLevel: 7, difficulty: 6, prerequisites: ['math_ratios'] },
      { id: 'math_geometry_basics', name: 'Geometry Basics', subject: 'math', gradeLevel: 7, difficulty: 6, prerequisites: ['math_multiplication'] },

      // Grade 9-12
      { id: 'math_linear_equations', name: 'Linear Equations', subject: 'math', gradeLevel: 9, difficulty: 7, prerequisites: ['math_algebra_basics'] },
      { id: 'math_quadratic', name: 'Quadratic Equations', subject: 'math', gradeLevel: 9, difficulty: 8, prerequisites: ['math_linear_equations'] },
      { id: 'math_trigonometry', name: 'Trigonometry', subject: 'math', gradeLevel: 10, difficulty: 8, prerequisites: ['math_geometry_basics'] },
      { id: 'math_calculus', name: 'Calculus', subject: 'math', gradeLevel: 11, difficulty: 10, prerequisites: ['math_quadratic', 'math_trigonometry'] },
    ];

    mathNodes.forEach(nodeData => {
      const node = new KnowledgeNode(nodeData.id, nodeData);
      this.nodes.set(node.id, node);
    });

    // Create edges for prerequisites
    this.nodes.forEach(node => {
      node.prerequisites.forEach(prereqId => {
        this.addEdge(prereqId, node.id, RELATIONSHIP_TYPES.PREREQUISITE);
      });
    });

    this.saveGraph();
  }

  /**
   * Add node to graph
   */
  addNode(nodeData) {
    const node = new KnowledgeNode(nodeData.id || `node_${Date.now()}`, nodeData);
    this.nodes.set(node.id, node);
    this.saveGraph();
    return node;
  }

  /**
   * Add edge (relationship) between nodes
   */
  addEdge(fromId, toId, type = RELATIONSHIP_TYPES.RELATED) {
    const edge = {
      id: `edge_${fromId}_${toId}_${type}`,
      from: fromId,
      to: toId,
      type,
    };

    this.edges.push(edge);
    this.saveGraph();
    return edge;
  }

  /**
   * Get node by ID
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(type) {
    return Array.from(this.nodes.values()).filter(node => node.type === type);
  }

  /**
   * Get all nodes for a subject
   */
  getNodesBySubject(subject) {
    return Array.from(this.nodes.values()).filter(node => node.subject === subject);
  }

  /**
   * Get prerequisites for a node
   */
  getPrerequisites(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    return node.prerequisites.map(prereqId => this.nodes.get(prereqId)).filter(Boolean);
  }

  /**
   * Get what a node unlocks
   */
  getUnlocks(nodeId) {
    return Array.from(this.nodes.values()).filter(node =>
      node.prerequisites.includes(nodeId)
    );
  }

  /**
   * Get learning path to a target node
   */
  getLearningPath(targetNodeId) {
    const target = this.nodes.get(targetNodeId);
    if (!target) return [];

    const path = [];
    const visited = new Set();

    const buildPath = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) return;

      // Add all prerequisites first
      node.prerequisites.forEach(prereqId => buildPath(prereqId));

      // Then add this node
      path.push(node);
    };

    buildPath(targetNodeId);
    return path;
  }

  /**
   * Get recommended next nodes based on what's mastered
   */
  getRecommendedNext(masteredNodeIds) {
    const available = [];

    this.nodes.forEach(node => {
      // Skip already mastered
      if (masteredNodeIds.includes(node.id)) return;

      // Check if prerequisites are met
      if (node.arePrerequisitesMet(masteredNodeIds)) {
        available.push(node);
      }
    });

    // Sort by difficulty
    return available.sort((a, b) => a.difficulty - b.difficulty);
  }
}

/**
 * Student Progress Tracker - Tracks individual student progress through the graph
 */
export class ProgressTracker {
  constructor(storageKey = 'student_progress') {
    this.storageKey = storageKey;
    this.progress = this.loadProgress();
  }

  /**
   * Load progress from storage
   */
  loadProgress() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading progress:', error);
      return {};
    }
  }

  /**
   * Save progress to storage
   */
  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Initialize progress for a student
   */
  initializeStudent(studentId) {
    if (!this.progress[studentId]) {
      this.progress[studentId] = {
        nodes: {},
        totalXP: 0,
        lastUpdated: new Date().toISOString(),
      };
      this.saveProgress();
    }
    return this.progress[studentId];
  }

  /**
   * Update progress for a node
   */
  updateNodeProgress(studentId, nodeId, progressData) {
    const student = this.initializeStudent(studentId);

    if (!student.nodes[nodeId]) {
      student.nodes[nodeId] = {
        masteryLevel: MASTERY_LEVELS.STARTED,
        progress: 0,
        timeSpent: 0,
        attempts: 0,
        assessmentScores: [],
        startedAt: new Date().toISOString(),
      };
    }

    const nodeProgress = student.nodes[nodeId];

    // Update progress data
    if (progressData.progress !== undefined) {
      nodeProgress.progress = Math.min(100, Math.max(0, progressData.progress));
    }

    if (progressData.timeSpent) {
      nodeProgress.timeSpent += progressData.timeSpent;
    }

    if (progressData.assessmentScore !== undefined) {
      nodeProgress.assessmentScores.push({
        score: progressData.assessmentScore,
        timestamp: new Date().toISOString(),
      });
      nodeProgress.attempts++;
    }

    // Calculate average assessment score
    if (nodeProgress.assessmentScores.length > 0) {
      const avgScore = nodeProgress.assessmentScores.reduce((sum, s) => sum + s.score, 0) / nodeProgress.assessmentScores.length;
      nodeProgress.progress = avgScore;
    }

    // Update mastery level based on progress
    nodeProgress.masteryLevel = this.calculateMasteryLevel(nodeProgress.progress);

    if (nodeProgress.masteryLevel === MASTERY_LEVELS.MASTERED && !nodeProgress.masteredAt) {
      nodeProgress.masteredAt = new Date().toISOString();

      // Award XP
      const xpEarned = this.calculateXP(nodeId, nodeProgress);
      student.totalXP += xpEarned;
      nodeProgress.xpEarned = xpEarned;
    }

    student.lastUpdated = new Date().toISOString();
    this.saveProgress();

    return {
      nodeProgress,
      totalXP: student.totalXP,
    };
  }

  /**
   * Calculate mastery level from progress percentage
   */
  calculateMasteryLevel(progress) {
    if (progress >= 90) return MASTERY_LEVELS.MASTERED;
    if (progress >= 70) return MASTERY_LEVELS.PRACTICING;
    if (progress >= 30) return MASTERY_LEVELS.LEARNING;
    if (progress > 0) return MASTERY_LEVELS.STARTED;
    return MASTERY_LEVELS.AVAILABLE;
  }

  /**
   * Calculate XP earned for mastering a node
   */
  calculateXP(nodeId, nodeProgress) {
    // Base XP (difficulty * 100)
    // Bonus for speed
    // Bonus for high scores
    const baseXP = 100;
    const difficultyMultiplier = 1; // Would get from node data
    const speedBonus = nodeProgress.attempts <= 3 ? 50 : 0;
    const scoreBonus = nodeProgress.progress >= 95 ? 25 : 0;

    return baseXP * difficultyMultiplier + speedBonus + scoreBonus;
  }

  /**
   * Get student's mastered nodes
   */
  getMasteredNodes(studentId) {
    const student = this.progress[studentId];
    if (!student) return [];

    return Object.entries(student.nodes)
      .filter(([_, progress]) => progress.masteryLevel === MASTERY_LEVELS.MASTERED)
      .map(([nodeId, _]) => nodeId);
  }

  /**
   * Get student's available nodes (prerequisites met)
   */
  getAvailableNodes(studentId, knowledgeGraph) {
    const mastered = this.getMasteredNodes(studentId);
    return knowledgeGraph.getRecommendedNext(mastered);
  }

  /**
   * Get student's current nodes (in progress)
   */
  getCurrentNodes(studentId) {
    const student = this.progress[studentId];
    if (!student) return [];

    return Object.entries(student.nodes)
      .filter(([_, progress]) =>
        progress.masteryLevel !== MASTERY_LEVELS.MASTERED &&
        progress.masteryLevel !== MASTERY_LEVELS.LOCKED
      )
      .map(([nodeId, progress]) => ({ nodeId, ...progress }));
  }

  /**
   * Get complete student progress summary
   */
  getProgressSummary(studentId, knowledgeGraph) {
    const student = this.progress[studentId];
    if (!student) return null;

    const mastered = this.getMasteredNodes(studentId);
    const current = this.getCurrentNodes(studentId);
    const available = this.getAvailableNodes(studentId, knowledgeGraph);
    const totalNodes = knowledgeGraph.nodes.size;

    return {
      studentId,
      totalXP: student.totalXP,
      nodesCompleted: mastered.length,
      nodesInProgress: current.length,
      nodesAvailable: available.length,
      totalNodes,
      completionPercentage: (mastered.length / totalNodes) * 100,
      mastered,
      current,
      available,
      lastUpdated: student.lastUpdated,
    };
  }
}

/**
 * Skill Tree Visualizer - Creates visual representation
 */
export class SkillTreeVisualizer {
  constructor(knowledgeGraph, progressTracker) {
    this.graph = knowledgeGraph;
    this.tracker = progressTracker;
  }

  /**
   * Generate skill tree visualization data
   */
  generateVisualization(studentId, subject = null) {
    const mastered = this.tracker.getMasteredNodes(studentId);
    const student = this.tracker.progress[studentId];

    // Get nodes to visualize
    let nodes = Array.from(this.graph.nodes.values());
    if (subject) {
      nodes = nodes.filter(n => n.subject === subject);
    }

    // Create visualization nodes
    const vizNodes = nodes.map(node => {
      const progress = student?.nodes[node.id];
      const masteryLevel = progress?.masteryLevel ||
        (node.arePrerequisitesMet(mastered) ? MASTERY_LEVELS.AVAILABLE : MASTERY_LEVELS.LOCKED);

      const style = NODE_STYLES[masteryLevel];

      return {
        id: node.id,
        label: node.name,
        type: node.type,
        difficulty: node.difficulty,
        masteryLevel,
        progress: progress?.progress || 0,
        style: {
          ...style,
          size: 40 + node.difficulty * 5, // Larger nodes for higher difficulty
        },
        data: {
          ...node,
          timeSpent: progress?.timeSpent || 0,
          attempts: progress?.attempts || 0,
          xpEarned: progress?.xpEarned || 0,
        },
      };
    });

    // Create visualization edges
    const vizEdges = this.graph.edges
      .filter(edge => {
        if (subject) {
          const fromNode = this.graph.getNode(edge.from);
          const toNode = this.graph.getNode(edge.to);
          return fromNode?.subject === subject && toNode?.subject === subject;
        }
        return true;
      })
      .map(edge => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        type: edge.type,
        style: this.getEdgeStyle(edge, mastered),
      }));

    return {
      nodes: vizNodes,
      edges: vizEdges,
      stats: this.tracker.getProgressSummary(studentId, this.graph),
      layout: this.calculateLayout(vizNodes, vizEdges),
    };
  }

  /**
   * Get edge style based on progress
   */
  getEdgeStyle(edge, masteredNodes) {
    const fromMastered = masteredNodes.includes(edge.from);

    return {
      color: fromMastered ? '#10B981' : '#9CA3AF',
      width: edge.type === RELATIONSHIP_TYPES.PREREQUISITE ? 3 : 1,
      dashed: edge.type !== RELATIONSHIP_TYPES.PREREQUISITE,
      opacity: fromMastered ? 1 : 0.3,
    };
  }

  /**
   * Calculate layout positions for nodes
   */
  calculateLayout(nodes, edges) {
    // Group nodes by difficulty level (acts as vertical layer)
    const layers = {};
    nodes.forEach(node => {
      const level = node.difficulty;
      if (!layers[level]) {
        layers[level] = [];
      }
      layers[level].push(node);
    });

    // Position nodes
    const positions = {};
    const layerHeight = 150;
    const nodeSpacing = 200;

    Object.entries(layers).forEach(([level, layerNodes]) => {
      const y = level * layerHeight;
      const totalWidth = layerNodes.length * nodeSpacing;
      const startX = -totalWidth / 2;

      layerNodes.forEach((node, index) => {
        positions[node.id] = {
          x: startX + index * nodeSpacing,
          y,
        };
      });
    });

    return {
      type: 'hierarchical',
      positions,
      direction: 'bottom-to-top', // Start at bottom, progress upward
    };
  }

  /**
   * Generate learning path visualization
   */
  generatePathVisualization(studentId, targetNodeId) {
    const path = this.graph.getLearningPath(targetNodeId);
    const mastered = this.tracker.getMasteredNodes(studentId);

    return path.map((node, index) => {
      const isMastered = mastered.includes(node.id);
      const isCurrent = !isMastered && (index === 0 || mastered.includes(path[index - 1].id));

      return {
        step: index + 1,
        node,
        status: isMastered ? 'completed' : isCurrent ? 'current' : 'upcoming',
        estimatedTime: node.estimatedTime,
      };
    });
  }

  /**
   * Export visualization as SVG
   */
  exportAsSVG(visualization) {
    const { nodes, edges, layout } = visualization;
    const width = 1200;
    const height = 800;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>`;

    // Draw edges
    edges.forEach(edge => {
      const fromPos = layout.positions[edge.from];
      const toPos = layout.positions[edge.to];

      if (fromPos && toPos) {
        svg += `<line
          x1="${fromPos.x + width / 2}"
          y1="${fromPos.y + height / 2}"
          x2="${toPos.x + width / 2}"
          y2="${toPos.y + height / 2}"
          stroke="${edge.style.color}"
          stroke-width="${edge.style.width}"
          stroke-dasharray="${edge.style.dashed ? '5,5' : '0'}"
          opacity="${edge.style.opacity}"
        />`;
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = layout.positions[node.id];
      if (!pos) return;

      const x = pos.x + width / 2;
      const y = pos.y + height / 2;

      svg += `<circle
        cx="${x}"
        cy="${y}"
        r="${node.style.size / 2}"
        fill="${node.style.color}"
        stroke="${node.style.borderColor}"
        stroke-width="3"
        opacity="${node.style.opacity}"
        ${node.style.glow ? 'filter="url(#glow)"' : ''}
      />`;

      svg += `<text
        x="${x}"
        y="${y + 5}"
        text-anchor="middle"
        fill="white"
        font-size="14"
        font-weight="bold"
      >${node.style.icon}</text>`;

      svg += `<text
        x="${x}"
        y="${y + node.style.size / 2 + 20}"
        text-anchor="middle"
        font-size="12"
      >${node.label}</text>`;
    });

    svg += '</svg>';
    return svg;
  }
}

export {
  NODE_TYPES,
  RELATIONSHIP_TYPES,
  MASTERY_LEVELS,
  NODE_STYLES,
  KnowledgeNode,
};

export default KnowledgeGraph;
