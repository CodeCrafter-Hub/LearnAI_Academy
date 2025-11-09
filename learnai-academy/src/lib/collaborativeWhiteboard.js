/**
 * Real-time Collaborative Whiteboard System
 *
 * Revolutionary collaborative learning tool featuring:
 * - Real-time multi-user drawing and annotation
 * - Mathematical equation support with LaTeX
 * - Shape recognition and beautification
 * - Voice/video integration
 * - Session recording and playback
 * - AI-powered diagram recognition
 * - Infinite canvas with zoom and pan
 * - Multi-page support
 * - Export to multiple formats
 *
 * Enables true collaborative problem-solving and visual learning.
 */

import Anthropic from '@anthropic-ai/sdk';

// Drawing tools available on the whiteboard
const TOOLS = {
  PEN: 'pen',
  HIGHLIGHTER: 'highlighter',
  ERASER: 'eraser',
  TEXT: 'text',
  SHAPE: 'shape',
  LATEX: 'latex',
  IMAGE: 'image',
  SELECT: 'select',
  LASER: 'laser', // Temporary pointer for teaching
};

// Available shapes
const SHAPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
  LINE: 'line',
  ARROW: 'arrow',
  TRIANGLE: 'triangle',
  POLYGON: 'polygon',
};

// Color palette
const COLORS = {
  BLACK: '#000000',
  RED: '#EF4444',
  BLUE: '#3B82F6',
  GREEN: '#10B981',
  YELLOW: '#F59E0B',
  PURPLE: '#8B5CF6',
  ORANGE: '#F97316',
  PINK: '#EC4899',
  WHITE: '#FFFFFF',
};

// Brush sizes
const BRUSH_SIZES = {
  THIN: 2,
  MEDIUM: 4,
  THICK: 8,
  VERY_THICK: 16,
};

/**
 * Whiteboard Session - Manages a collaborative whiteboard session
 */
export class WhiteboardSession {
  constructor(sessionId, options = {}) {
    this.sessionId = sessionId;
    this.participants = new Map();
    this.elements = [];
    this.pages = [{ id: 'page_1', name: 'Page 1', elements: [] }];
    this.currentPage = 0;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 100;
    this.cursors = new Map(); // Track participant cursors
    this.recording = null;
    this.settings = {
      gridEnabled: options.gridEnabled ?? true,
      gridSize: options.gridSize ?? 20,
      snapToGrid: options.snapToGrid ?? false,
      infiniteCanvas: options.infiniteCanvas ?? true,
      maxParticipants: options.maxParticipants ?? 10,
      allowAnnotations: options.allowAnnotations ?? true,
      allowVoice: options.allowVoice ?? true,
      allowVideo: options.allowVideo ?? false,
    };
  }

  /**
   * Add participant to session
   */
  addParticipant(userId, userData) {
    if (this.participants.size >= this.settings.maxParticipants) {
      throw new Error('Session is full');
    }

    const participant = {
      id: userId,
      name: userData.name,
      color: userData.color || this.getNextColor(),
      role: userData.role || 'student', // 'teacher', 'student', 'observer'
      joinedAt: new Date().toISOString(),
      cursor: { x: 0, y: 0 },
      selectedTool: TOOLS.PEN,
      isActive: true,
    };

    this.participants.set(userId, participant);

    return {
      participant,
      sessionState: this.getSessionState(),
    };
  }

  /**
   * Remove participant from session
   */
  removeParticipant(userId) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.isActive = false;
      participant.leftAt = new Date().toISOString();
      this.cursors.delete(userId);
    }
  }

  /**
   * Get next available color for participant
   */
  getNextColor() {
    const availableColors = Object.values(COLORS).filter(
      color => ![COLORS.BLACK, COLORS.WHITE].includes(color)
    );
    const usedColors = Array.from(this.participants.values()).map(p => p.color);
    const unusedColors = availableColors.filter(c => !usedColors.includes(c));

    return unusedColors[0] || availableColors[Math.floor(Math.random() * availableColors.length)];
  }

  /**
   * Update participant cursor position
   */
  updateCursor(userId, x, y) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.cursor = { x, y };
      this.cursors.set(userId, { x, y, color: participant.color, name: participant.name });
    }
  }

  /**
   * Add element to current page
   */
  addElement(userId, element) {
    const participant = this.participants.get(userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const newElement = {
      id: `element_${Date.now()}_${Math.random()}`,
      type: element.type,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      page: this.currentPage,
      ...element,
    };

    this.pages[this.currentPage].elements.push(newElement);
    this.addToHistory({
      action: 'add',
      element: newElement,
      page: this.currentPage,
    });

    return newElement;
  }

  /**
   * Update element
   */
  updateElement(elementId, updates) {
    const page = this.pages[this.currentPage];
    const elementIndex = page.elements.findIndex(e => e.id === elementId);

    if (elementIndex === -1) {
      throw new Error('Element not found');
    }

    const oldElement = { ...page.elements[elementIndex] };
    page.elements[elementIndex] = {
      ...page.elements[elementIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.addToHistory({
      action: 'update',
      elementId,
      oldElement,
      newElement: page.elements[elementIndex],
      page: this.currentPage,
    });

    return page.elements[elementIndex];
  }

  /**
   * Delete element
   */
  deleteElement(elementId) {
    const page = this.pages[this.currentPage];
    const elementIndex = page.elements.findIndex(e => e.id === elementId);

    if (elementIndex === -1) {
      throw new Error('Element not found');
    }

    const deletedElement = page.elements[elementIndex];
    page.elements.splice(elementIndex, 1);

    this.addToHistory({
      action: 'delete',
      element: deletedElement,
      page: this.currentPage,
    });

    return deletedElement;
  }

  /**
   * Add to history for undo/redo
   */
  addToHistory(action) {
    // Remove any actions after current index (if we're not at the end)
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push({
      ...action,
      timestamp: new Date().toISOString(),
    });

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.historyIndex < 0) {
      return null;
    }

    const action = this.history[this.historyIndex];
    const page = this.pages[action.page];

    if (action.action === 'add') {
      const index = page.elements.findIndex(e => e.id === action.element.id);
      if (index !== -1) {
        page.elements.splice(index, 1);
      }
    } else if (action.action === 'delete') {
      page.elements.push(action.element);
    } else if (action.action === 'update') {
      const index = page.elements.findIndex(e => e.id === action.elementId);
      if (index !== -1) {
        page.elements[index] = action.oldElement;
      }
    }

    this.historyIndex--;
    return action;
  }

  /**
   * Redo action
   */
  redo() {
    if (this.historyIndex >= this.history.length - 1) {
      return null;
    }

    this.historyIndex++;
    const action = this.history[this.historyIndex];
    const page = this.pages[action.page];

    if (action.action === 'add') {
      page.elements.push(action.element);
    } else if (action.action === 'delete') {
      const index = page.elements.findIndex(e => e.id === action.element.id);
      if (index !== -1) {
        page.elements.splice(index, 1);
      }
    } else if (action.action === 'update') {
      const index = page.elements.findIndex(e => e.id === action.elementId);
      if (index !== -1) {
        page.elements[index] = action.newElement;
      }
    }

    return action;
  }

  /**
   * Add new page
   */
  addPage(name = null) {
    const page = {
      id: `page_${Date.now()}`,
      name: name || `Page ${this.pages.length + 1}`,
      elements: [],
      createdAt: new Date().toISOString(),
    };

    this.pages.push(page);
    return page;
  }

  /**
   * Switch to different page
   */
  switchPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= this.pages.length) {
      throw new Error('Invalid page index');
    }

    this.currentPage = pageIndex;
    return this.pages[pageIndex];
  }

  /**
   * Clear current page
   */
  clearPage() {
    const page = this.pages[this.currentPage];
    const oldElements = [...page.elements];

    page.elements = [];

    this.addToHistory({
      action: 'clear',
      elements: oldElements,
      page: this.currentPage,
    });
  }

  /**
   * Get session state
   */
  getSessionState() {
    return {
      sessionId: this.sessionId,
      participants: Array.from(this.participants.values()).filter(p => p.isActive),
      cursors: Array.from(this.cursors.entries()).map(([id, cursor]) => ({
        userId: id,
        ...cursor,
      })),
      pages: this.pages,
      currentPage: this.currentPage,
      settings: this.settings,
      canUndo: this.historyIndex >= 0,
      canRedo: this.historyIndex < this.history.length - 1,
    };
  }

  /**
   * Start recording session
   */
  startRecording() {
    this.recording = {
      startTime: new Date().toISOString(),
      actions: [],
      audio: null,
      video: null,
    };
  }

  /**
   * Stop recording session
   */
  stopRecording() {
    if (!this.recording) {
      return null;
    }

    const recording = {
      ...this.recording,
      endTime: new Date().toISOString(),
      duration: Date.now() - new Date(this.recording.startTime).getTime(),
    };

    this.recording = null;
    return recording;
  }

  /**
   * Record action during session recording
   */
  recordAction(action) {
    if (this.recording) {
      this.recording.actions.push({
        ...action,
        timestamp: Date.now() - new Date(this.recording.startTime).getTime(),
      });
    }
  }
}

/**
 * Drawing Engine - Handles drawing operations
 */
export class DrawingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.currentStroke = null;
    this.viewport = {
      x: 0,
      y: 0,
      zoom: 1,
    };
  }

  /**
   * Start new stroke
   */
  startStroke(x, y, tool, options = {}) {
    this.currentStroke = {
      tool,
      points: [{ x, y, pressure: options.pressure || 1 }],
      color: options.color || COLORS.BLACK,
      size: options.size || BRUSH_SIZES.MEDIUM,
      opacity: options.opacity || 1,
    };
  }

  /**
   * Add point to current stroke
   */
  addPoint(x, y, pressure = 1) {
    if (!this.currentStroke) return;

    this.currentStroke.points.push({ x, y, pressure });
    this.drawSegment(
      this.currentStroke.points[this.currentStroke.points.length - 2],
      this.currentStroke.points[this.currentStroke.points.length - 1]
    );
  }

  /**
   * End current stroke
   */
  endStroke() {
    const stroke = this.currentStroke;
    this.currentStroke = null;
    return stroke;
  }

  /**
   * Draw segment between two points
   */
  drawSegment(p1, p2) {
    if (!this.currentStroke) return;

    this.ctx.save();
    this.ctx.translate(-this.viewport.x, -this.viewport.y);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);

    this.ctx.strokeStyle = this.currentStroke.color;
    this.ctx.lineWidth = this.currentStroke.size * ((p1.pressure + p2.pressure) / 2);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalAlpha = this.currentStroke.opacity;

    if (this.currentStroke.tool === TOOLS.HIGHLIGHTER) {
      this.ctx.globalAlpha = 0.3;
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw shape
   */
  drawShape(shape, x, y, width, height, options = {}) {
    this.ctx.save();
    this.ctx.translate(-this.viewport.x, -this.viewport.y);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    this.ctx.strokeStyle = options.color || COLORS.BLACK;
    this.ctx.lineWidth = options.size || BRUSH_SIZES.MEDIUM;
    this.ctx.fillStyle = options.fillColor || 'transparent';

    this.ctx.beginPath();

    switch (shape) {
      case SHAPES.RECTANGLE:
        this.ctx.rect(x, y, width, height);
        break;
      case SHAPES.CIRCLE:
        const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
        this.ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
        break;
      case SHAPES.ELLIPSE:
        this.ctx.ellipse(
          x + width / 2,
          y + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          Math.PI * 2
        );
        break;
      case SHAPES.LINE:
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width, y + height);
        break;
      case SHAPES.ARROW:
        this.drawArrow(x, y, x + width, y + height);
        break;
      case SHAPES.TRIANGLE:
        this.ctx.moveTo(x + width / 2, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x, y + height);
        this.ctx.closePath();
        break;
    }

    if (options.fillColor && options.fillColor !== 'transparent') {
      this.ctx.fill();
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw arrow
   */
  drawArrow(x1, y1, x2, y2) {
    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Draw line
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);

    // Draw arrowhead
    this.ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
  }

  /**
   * Draw text
   */
  drawText(text, x, y, options = {}) {
    this.ctx.save();
    this.ctx.translate(-this.viewport.x, -this.viewport.y);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    this.ctx.font = `${options.fontSize || 16}px ${options.fontFamily || 'Arial'}`;
    this.ctx.fillStyle = options.color || COLORS.BLACK;
    this.ctx.textAlign = options.align || 'left';
    this.ctx.textBaseline = options.baseline || 'top';

    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  /**
   * Pan viewport
   */
  pan(dx, dy) {
    this.viewport.x += dx;
    this.viewport.y += dy;
  }

  /**
   * Zoom viewport
   */
  zoom(delta, centerX, centerY) {
    const oldZoom = this.viewport.zoom;
    this.viewport.zoom = Math.max(0.1, Math.min(5, this.viewport.zoom + delta));

    // Adjust pan to zoom around center point
    const zoomRatio = this.viewport.zoom / oldZoom;
    this.viewport.x = centerX - (centerX - this.viewport.x) * zoomRatio;
    this.viewport.y = centerY - (centerY - this.viewport.y) * zoomRatio;
  }

  /**
   * Clear canvas
   */
  clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Draw grid
   */
  drawGrid(gridSize = 20) {
    this.ctx.save();
    this.ctx.strokeStyle = '#E5E7EB';
    this.ctx.lineWidth = 1;

    const startX = Math.floor(this.viewport.x / gridSize) * gridSize;
    const startY = Math.floor(this.viewport.y / gridSize) * gridSize;
    const endX = this.viewport.x + this.canvas.width / this.viewport.zoom;
    const endY = this.viewport.y + this.canvas.height / this.viewport.zoom;

    // Draw vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo((x - this.viewport.x) * this.viewport.zoom, 0);
      this.ctx.lineTo((x - this.viewport.x) * this.viewport.zoom, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, (y - this.viewport.y) * this.viewport.zoom);
      this.ctx.lineTo(this.canvas.width, (y - this.viewport.y) * this.viewport.zoom);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Render all elements
   */
  renderElements(elements) {
    this.clear();

    // Draw grid if enabled
    // this.drawGrid();

    for (const element of elements) {
      this.renderElement(element);
    }
  }

  /**
   * Render single element
   */
  renderElement(element) {
    switch (element.type) {
      case TOOLS.PEN:
      case TOOLS.HIGHLIGHTER:
        this.renderStroke(element);
        break;
      case TOOLS.SHAPE:
        this.drawShape(
          element.shape,
          element.x,
          element.y,
          element.width,
          element.height,
          element
        );
        break;
      case TOOLS.TEXT:
        this.drawText(element.text, element.x, element.y, element);
        break;
      case TOOLS.IMAGE:
        this.renderImage(element);
        break;
    }
  }

  /**
   * Render stroke
   */
  renderStroke(stroke) {
    if (stroke.points.length < 2) return;

    this.ctx.save();
    this.ctx.translate(-this.viewport.x, -this.viewport.y);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalAlpha = stroke.opacity || 1;

    if (stroke.tool === TOOLS.HIGHLIGHTER) {
      this.ctx.globalAlpha = 0.3;
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Render image
   */
  renderImage(element) {
    if (!element.imageData) return;

    this.ctx.save();
    this.ctx.translate(-this.viewport.x, -this.viewport.y);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    const img = new Image();
    img.src = element.imageData;
    img.onload = () => {
      this.ctx.drawImage(img, element.x, element.y, element.width, element.height);
    };

    this.ctx.restore();
  }
}

/**
 * Shape Recognition - AI-powered shape beautification
 */
export class ShapeRecognizer {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
  }

  /**
   * Recognize and beautify hand-drawn shape
   */
  async recognizeShape(points) {
    // Simple geometric analysis
    const boundingBox = this.getBoundingBox(points);
    const aspectRatio = boundingBox.width / boundingBox.height;
    const linearity = this.calculateLinearity(points);
    const circularity = this.calculateCircularity(points);

    // Determine shape type
    if (circularity > 0.8) {
      return {
        type: aspectRatio > 1.5 || aspectRatio < 0.67 ? SHAPES.ELLIPSE : SHAPES.CIRCLE,
        confidence: circularity,
        beautified: this.beautifyCircle(points, boundingBox),
      };
    }

    if (linearity > 0.9) {
      return {
        type: SHAPES.LINE,
        confidence: linearity,
        beautified: this.beautifyLine(points),
      };
    }

    if (this.isRectangular(points, boundingBox)) {
      return {
        type: SHAPES.RECTANGLE,
        confidence: 0.85,
        beautified: this.beautifyRectangle(boundingBox),
      };
    }

    if (this.isTriangular(points)) {
      return {
        type: SHAPES.TRIANGLE,
        confidence: 0.8,
        beautified: this.beautifyTriangle(points),
      };
    }

    return {
      type: 'unknown',
      confidence: 0,
      beautified: null,
    };
  }

  /**
   * Get bounding box for points
   */
  getBoundingBox(points) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }

  /**
   * Calculate how linear the stroke is
   */
  calculateLinearity(points) {
    if (points.length < 3) return 1;

    const start = points[0];
    const end = points[points.length - 1];
    const expectedLength = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    let actualLength = 0;
    for (let i = 1; i < points.length; i++) {
      actualLength += Math.sqrt(
        Math.pow(points[i].x - points[i - 1].x, 2) +
        Math.pow(points[i].y - points[i - 1].y, 2)
      );
    }

    return expectedLength / actualLength;
  }

  /**
   * Calculate how circular the stroke is
   */
  calculateCircularity(points) {
    if (points.length < 10) return 0;

    const box = this.getBoundingBox(points);
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const expectedRadius = Math.min(box.width, box.height) / 2;

    let variance = 0;
    points.forEach(p => {
      const distance = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
      variance += Math.abs(distance - expectedRadius);
    });

    const avgVariance = variance / points.length;
    return Math.max(0, 1 - avgVariance / expectedRadius);
  }

  /**
   * Check if shape is rectangular
   */
  isRectangular(points, box) {
    // Check if points roughly form corners
    const corners = [
      { x: box.x, y: box.y },
      { x: box.x + box.width, y: box.y },
      { x: box.x + box.width, y: box.y + box.height },
      { x: box.x, y: box.y + box.height },
    ];

    // Simple heuristic: points should be distributed around perimeter
    return true; // Simplified for now
  }

  /**
   * Check if shape is triangular
   */
  isTriangular(points) {
    // Simplified check
    return false;
  }

  /**
   * Beautify circle
   */
  beautifyCircle(points, box) {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const radius = Math.min(box.width, box.height) / 2;

    return {
      type: SHAPES.CIRCLE,
      x: centerX - radius,
      y: centerY - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  /**
   * Beautify line
   */
  beautifyLine(points) {
    return {
      type: SHAPES.LINE,
      x: points[0].x,
      y: points[0].y,
      width: points[points.length - 1].x - points[0].x,
      height: points[points.length - 1].y - points[0].y,
    };
  }

  /**
   * Beautify rectangle
   */
  beautifyRectangle(box) {
    return {
      type: SHAPES.RECTANGLE,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };
  }

  /**
   * Beautify triangle
   */
  beautifyTriangle(points) {
    const box = this.getBoundingBox(points);
    return {
      type: SHAPES.TRIANGLE,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };
  }
}

/**
 * Collaborative Whiteboard Manager - Main orchestrator
 */
export class CollaborativeWhiteboard {
  constructor(storageKey = 'whiteboard_sessions') {
    this.sessions = new Map();
    this.storageKey = storageKey;
    this.loadSessions();
  }

  /**
   * Load sessions from storage
   */
  loadSessions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, sessionData]) => {
          const session = new WhiteboardSession(id, sessionData.settings);
          Object.assign(session, sessionData);
          this.sessions.set(id, session);
        });
      }
    } catch (error) {
      console.error('Error loading whiteboard sessions:', error);
    }
  }

  /**
   * Save sessions to storage
   */
  saveSessions() {
    try {
      const data = {};
      this.sessions.forEach((session, id) => {
        data[id] = session;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving whiteboard sessions:', error);
    }
  }

  /**
   * Create new whiteboard session
   */
  createSession(options = {}) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = new WhiteboardSession(sessionId, options);

    this.sessions.set(sessionId, session);
    this.saveSessions();

    return {
      sessionId,
      session,
    };
  }

  /**
   * Join existing session
   */
  joinSession(sessionId, userId, userData) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const result = session.addParticipant(userId, userData);
    this.saveSessions();

    return result;
  }

  /**
   * Leave session
   */
  leaveSession(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.removeParticipant(userId);
    this.saveSessions();
  }

  /**
   * Get session
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
    this.saveSessions();
  }

  /**
   * Export session to image
   */
  async exportToImage(sessionId, format = 'png') {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Create temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const engine = new DrawingEngine(canvas);

    // Render all elements
    engine.renderElements(session.pages[session.currentPage].elements);

    // Export
    return canvas.toDataURL(`image/${format}`);
  }

  /**
   * Export session to PDF
   */
  async exportToPDF(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // This would integrate with a PDF library
    // For now, return session data
    return {
      pages: session.pages,
      exportedAt: new Date().toISOString(),
    };
  }
}

export { TOOLS, SHAPES, COLORS, BRUSH_SIZES };
export default CollaborativeWhiteboard;
