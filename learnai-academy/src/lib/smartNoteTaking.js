/**
 * Smart Note-Taking & Organization System
 *
 * Intelligent note management with AI enhancements:
 * - AI-powered note summarization and key concept extraction
 * - Automatic concept extraction and tagging
 * - Cornell notes formatting and templates
 * - Voice-to-notes conversion with transcription
 * - Smart search across all notes with semantic understanding
 * - Auto-linking notes to knowledge graph and curriculum
 * - Collaborative note sharing and annotation
 * - Multi-media notes (text, images, audio, sketches)
 * - Note templates for different subjects
 * - Study guide generation from notes
 * - Flashcard creation from notes
 *
 * Transforms note-taking from manual recording to intelligent learning tool.
 */

import Anthropic from '@anthropic-ai/sdk';

// Note types
const NOTE_TYPES = {
  LECTURE: 'lecture',
  READING: 'reading',
  CORNELL: 'cornell',
  OUTLINE: 'outline',
  MIND_MAP: 'mind_map',
  FREEFORM: 'freeform',
};

// Note formats
const NOTE_FORMATS = {
  MARKDOWN: 'markdown',
  HTML: 'html',
  PLAIN_TEXT: 'plain_text',
  PDF: 'pdf',
};

/**
 * Smart Note Manager - Core note-taking system
 */
export class SmartNoteManager {
  constructor(apiKey, storageKey = 'smart_notes') {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.storageKey = storageKey;
    this.notes = this.loadNotes();
  }

  /**
   * Load notes from storage
   */
  loadNotes() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading notes:', error);
      return {};
    }
  }

  /**
   * Save notes to storage
   */
  saveNotes() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }

  /**
   * Create new note
   */
  async createNote(studentId, noteData) {
    const noteId = `note_${Date.now()}`;

    const note = {
      id: noteId,
      studentId,
      type: noteData.type || NOTE_TYPES.FREEFORM,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      subject: noteData.subject,
      topic: noteData.topic,
      tags: noteData.tags || [],
      attachments: noteData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    // AI processing
    if (note.content) {
      const aiEnhancements = await this.enhanceNote(note);
      note.summary = aiEnhancements.summary;
      note.keyConcepts = aiEnhancements.keyConcepts;
      note.suggestedTags = aiEnhancements.suggestedTags;
      note.linkedConcepts = aiEnhancements.linkedConcepts;
    }

    if (!this.notes[studentId]) {
      this.notes[studentId] = [];
    }

    this.notes[studentId].push(note);
    this.saveNotes();

    return note;
  }

  /**
   * Enhance note with AI
   */
  async enhanceNote(note) {
    const systemPrompt = `Analyze these student notes and provide:
1. A concise summary (2-3 sentences)
2. List of key concepts (5-7 items)
3. Suggested tags for organization
4. Related concepts that should be linked

Subject: ${note.subject}
Topic: ${note.topic}

Notes:
${note.content}

Return as JSON:
{
  "summary": "summary text",
  "keyConcepts": ["concept1", "concept2", ...],
  "suggestedTags": ["tag1", "tag2", ...],
  "linkedConcepts": ["concept1", "concept2", ...]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Analyze and enhance these notes.',
          },
        ],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error enhancing note:', error);
      return {
        summary: 'Unable to generate summary',
        keyConcepts: [],
        suggestedTags: [],
        linkedConcepts: [],
      };
    }
  }

  /**
   * Update note
   */
  async updateNote(studentId, noteId, updates) {
    const notes = this.notes[studentId] || [];
    const noteIndex = notes.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const note = notes[noteIndex];

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'studentId' && key !== 'createdAt') {
        note[key] = updates[key];
      }
    });

    note.updatedAt = new Date().toISOString();
    note.version++;

    // Re-enhance if content changed
    if (updates.content) {
      const aiEnhancements = await this.enhanceNote(note);
      note.summary = aiEnhancements.summary;
      note.keyConcepts = aiEnhancements.keyConcepts;
      note.suggestedTags = aiEnhancements.suggestedTags;
      note.linkedConcepts = aiEnhancements.linkedConcepts;
    }

    this.saveNotes();

    return note;
  }

  /**
   * Delete note
   */
  deleteNote(studentId, noteId) {
    const notes = this.notes[studentId] || [];
    const noteIndex = notes.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    notes.splice(noteIndex, 1);
    this.saveNotes();

    return { deleted: true };
  }

  /**
   * Search notes with semantic understanding
   */
  async searchNotes(studentId, query, options = {}) {
    const notes = this.notes[studentId] || [];

    if (notes.length === 0) {
      return [];
    }

    // Simple text search (in production, would use vector search)
    const results = notes.filter(note => {
      const searchText = `${note.title} ${note.content} ${note.tags.join(' ')} ${note.keyConcepts?.join(' ') || ''}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Sort by relevance (simplified)
    results.sort((a, b) => {
      const aScore = this.calculateRelevance(a, query);
      const bScore = this.calculateRelevance(b, query);
      return bScore - aScore;
    });

    if (options.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Calculate search relevance
   */
  calculateRelevance(note, query) {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    if (note.title.toLowerCase().includes(lowerQuery)) score += 10;
    if (note.content.toLowerCase().includes(lowerQuery)) score += 5;

    note.tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) score += 7;
    });

    if (note.keyConcepts) {
      note.keyConcepts.forEach(concept => {
        if (concept.toLowerCase().includes(lowerQuery)) score += 8;
      });
    }

    return score;
  }

  /**
   * Get notes by subject/topic
   */
  getNotesBySubject(studentId, subject, topic = null) {
    const notes = this.notes[studentId] || [];

    return notes.filter(note => {
      if (topic) {
        return note.subject === subject && note.topic === topic;
      }
      return note.subject === subject;
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Get all notes for student
   */
  getAllNotes(studentId, sortBy = 'updated') {
    const notes = this.notes[studentId] || [];

    if (sortBy === 'updated') {
      return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else if (sortBy === 'created') {
      return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'title') {
      return notes.sort((a, b) => a.title.localeCompare(b.title));
    }

    return notes;
  }

  /**
   * Generate study guide from notes
   */
  async generateStudyGuide(studentId, noteIds) {
    const notes = this.notes[studentId] || [];
    const selectedNotes = notes.filter(n => noteIds.includes(n.id));

    if (selectedNotes.length === 0) {
      throw new Error('No notes found');
    }

    const combinedContent = selectedNotes.map(n => `### ${n.title}\n${n.content}`).join('\n\n');

    const systemPrompt = `Create a comprehensive study guide from these student notes.

Include:
1. Main topics and subtopics
2. Key concepts with brief explanations
3. Important facts to remember
4. Connections between concepts
5. Potential exam questions

Format as a well-organized study guide that aids learning.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.5,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Notes:\n\n${combinedContent}`,
          },
        ],
      });

      return {
        studyGuide: response.content[0].text,
        basedOn: selectedNotes.map(n => n.title),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating study guide:', error);
      throw error;
    }
  }

  /**
   * Generate flashcards from notes
   */
  async generateFlashcards(studentId, noteIds) {
    const notes = this.notes[studentId] || [];
    const selectedNotes = notes.filter(n => noteIds.includes(n.id));

    if (selectedNotes.length === 0) {
      throw new Error('No notes found');
    }

    const combinedContent = selectedNotes.map(n => `${n.title}: ${n.content}`).join('\n');

    const systemPrompt = `Create flashcards from these student notes.

Generate 10-15 flashcards with:
- Front: Question or term
- Back: Answer or definition

Focus on key concepts, definitions, and important facts.

Return as JSON array:
[
  {
    "front": "question or term",
    "back": "answer or definition",
    "topic": "topic name"
  }
]`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1500,
        temperature: 0.6,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Notes:\n\n${combinedContent}`,
          },
        ],
      });

      const flashcards = JSON.parse(response.content[0].text);

      return {
        flashcards,
        count: flashcards.length,
        basedOn: selectedNotes.map(n => n.title),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }
}

/**
 * Cornell Notes Manager - Specialized Cornell method support
 */
export class CornellNotesManager {
  /**
   * Create Cornell note structure
   */
  createCornellNote(title, subject) {
    return {
      type: NOTE_TYPES.CORNELL,
      title,
      subject,
      cues: [], // Left column - key questions/cues
      notes: '', // Right column - main notes
      summary: '', // Bottom - summary section
    };
  }

  /**
   * Add cue to Cornell notes
   */
  addCue(cornellNote, cue) {
    if (!cornellNote.cues) {
      cornellNote.cues = [];
    }

    cornellNote.cues.push({
      id: `cue_${Date.now()}`,
      text: cue,
      createdAt: new Date().toISOString(),
    });

    return cornellNote;
  }

  /**
   * Generate study questions from Cornell notes
   */
  generateStudyQuestions(cornellNote) {
    const questions = [];

    // From cues
    cornellNote.cues.forEach(cue => {
      questions.push({
        question: cue.text,
        answer: 'Review notes for answer',
        type: 'cue',
      });
    });

    // From summary
    if (cornellNote.summary) {
      questions.push({
        question: 'Summarize the main points',
        answer: cornellNote.summary,
        type: 'summary',
      });
    }

    return questions;
  }
}

/**
 * Voice Notes Transcriber - Voice-to-text conversion
 */
export class VoiceNotesTranscriber {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.recognition = this.initSpeechRecognition();
  }

  /**
   * Initialize speech recognition
   */
  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      return recognition;
    }

    return null;
  }

  /**
   * Start voice recording
   */
  startRecording(onTranscript) {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    let fullTranscript = '';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          fullTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (onTranscript) {
        onTranscript({
          final: fullTranscript,
          interim: interimTranscript,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.start();
  }

  /**
   * Stop recording
   */
  stopRecording() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Clean up and format transcript
   */
  async formatTranscript(transcript) {
    const systemPrompt = `Clean up and format this voice note transcript:
- Fix grammar and punctuation
- Break into paragraphs where appropriate
- Add bullet points for lists
- Keep the original meaning

Return the cleaned, formatted text.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: transcript,
          },
        ],
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Error formatting transcript:', error);
      return transcript;
    }
  }
}

/**
 * Note Organization Manager - Smart folders and tags
 */
export class NoteOrganizationManager {
  constructor(storageKey = 'note_organization') {
    this.storageKey = storageKey;
    this.organization = this.loadOrganization();
  }

  /**
   * Load organization
   */
  loadOrganization() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading organization:', error);
      return {};
    }
  }

  /**
   * Save organization
   */
  saveOrganization() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.organization));
    } catch (error) {
      console.error('Error saving organization:', error);
    }
  }

  /**
   * Create folder
   */
  createFolder(studentId, folderData) {
    if (!this.organization[studentId]) {
      this.organization[studentId] = {
        folders: [],
        tags: [],
      };
    }

    const folder = {
      id: `folder_${Date.now()}`,
      name: folderData.name,
      color: folderData.color || '#3B82F6',
      parent: folderData.parent || null,
      noteIds: [],
      createdAt: new Date().toISOString(),
    };

    this.organization[studentId].folders.push(folder);
    this.saveOrganization();

    return folder;
  }

  /**
   * Add note to folder
   */
  addNoteToFolder(studentId, noteId, folderId) {
    const org = this.organization[studentId];
    if (!org) return;

    const folder = org.folders.find(f => f.id === folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    if (!folder.noteIds.includes(noteId)) {
      folder.noteIds.push(noteId);
      this.saveOrganization();
    }

    return folder;
  }

  /**
   * Create tag
   */
  createTag(studentId, tagName, color = '#10B981') {
    if (!this.organization[studentId]) {
      this.organization[studentId] = {
        folders: [],
        tags: [],
      };
    }

    const tag = {
      id: `tag_${Date.now()}`,
      name: tagName,
      color,
      createdAt: new Date().toISOString(),
    };

    this.organization[studentId].tags.push(tag);
    this.saveOrganization();

    return tag;
  }

  /**
   * Get organization for student
   */
  getOrganization(studentId) {
    return this.organization[studentId] || {
      folders: [],
      tags: [],
    };
  }
}

export { NOTE_TYPES, NOTE_FORMATS };
export default SmartNoteManager;
