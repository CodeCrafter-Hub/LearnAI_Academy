import { gradeLevelUIService } from './gradeLevelUIService.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * ClassroomDesignService - Designs classrooms per grade and subject
 * 
 * Best Practices:
 * - Grade-level adaptation (age-appropriate)
 * - Subject-specific theming
 * - Learning style optimization
 * - Cognitive load management
 * - Engagement optimization
 */

class ClassroomDesignService {
  /**
   * Get classroom design for grade and subject
   * @param {number} gradeLevel - Grade level
   * @param {string} subjectSlug - Subject slug
   * @returns {Object} Classroom design configuration
   */
  getClassroomDesign(gradeLevel, subjectSlug) {
    const gradeConfig = gradeLevelUIService.getUIConfiguration(gradeLevel);
    const subjectConfig = this.getSubjectConfiguration(subjectSlug);
    
    return {
      gradeLevel,
      subjectSlug,
      ...this.mergeConfigurations(gradeConfig, subjectConfig),
      classroomLayout: this.getClassroomLayout(gradeLevel, subjectSlug),
      visualTheme: this.getVisualTheme(gradeLevel, subjectSlug),
      interactionDesign: this.getInteractionDesign(gradeLevel, subjectSlug),
      contentPresentation: this.getContentPresentation(gradeLevel, subjectSlug),
    };
  }

  /**
   * Get subject-specific configuration
   */
  getSubjectConfiguration(subjectSlug) {
    const subjectConfigs = {
      math: {
        colorScheme: {
          primary: '#3B82F6', // Blue
          secondary: '#60A5FA',
          accent: '#93C5FD',
          background: '#EFF6FF',
        },
        icon: 'Calculator',
        visualStyle: 'structured',
        interactionType: 'problem-solving',
        tools: ['calculator', 'graph', 'formula-sheet'],
        layout: 'workspace-focused',
      },
      english: {
        colorScheme: {
          primary: '#8B5CF6', // Purple
          secondary: '#A78BFA',
          accent: '#C4B5FD',
          background: '#F5F3FF',
        },
        icon: 'BookOpen',
        visualStyle: 'literary',
        interactionType: 'discussion',
        tools: ['dictionary', 'thesaurus', 'grammar-check'],
        layout: 'reading-focused',
      },
      science: {
        colorScheme: {
          primary: '#10B981', // Green
          secondary: '#34D399',
          accent: '#6EE7B7',
          background: '#ECFDF5',
        },
        icon: 'FlaskConical',
        visualStyle: 'experimental',
        interactionType: 'exploration',
        tools: ['periodic-table', 'calculator', 'diagrams'],
        layout: 'lab-focused',
      },
      history: {
        colorScheme: {
          primary: '#F59E0B', // Amber
          secondary: '#FBBF24',
          accent: '#FCD34D',
          background: '#FFFBEB',
        },
        icon: 'Landmark',
        visualStyle: 'timeline',
        interactionType: 'narrative',
        tools: ['timeline', 'maps', 'documents'],
        layout: 'story-focused',
      },
      coding: {
        colorScheme: {
          primary: '#6366F1', // Indigo
          secondary: '#818CF8',
          accent: '#A5B4FC',
          background: '#EEF2FF',
        },
        icon: 'Code',
        visualStyle: 'technical',
        interactionType: 'hands-on',
        tools: ['code-editor', 'terminal', 'debugger'],
        layout: 'coding-focused',
      },
    };

    return subjectConfigs[subjectSlug] || subjectConfigs.math;
  }

  /**
   * Merge grade and subject configurations
   */
  mergeConfigurations(gradeConfig, subjectConfig) {
    return {
      colors: {
        ...gradeConfig.colors,
        ...subjectConfig.colorScheme,
        // Blend primary colors
        primary: this.blendColors(gradeConfig.colors.primary, subjectConfig.colorScheme.primary),
      },
      typography: gradeConfig.typography,
      spacing: gradeConfig.spacing,
      layout: {
        ...gradeConfig.layoutConfiguration,
        ...subjectConfig.layout,
      },
      interactions: {
        ...gradeConfig.interactionPatterns,
        type: subjectConfig.interactionType,
      },
    };
  }

  /**
   * Get classroom layout
   */
  getClassroomLayout(gradeLevel, subjectSlug) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const subjectConfig = this.getSubjectConfiguration(subjectSlug);

    const layouts = {
      'Preschool': {
        type: 'centered-play',
        sections: ['warm-up', 'play', 'wrap-up'],
        sidebar: false,
        tools: false,
        maxWidth: '600px',
      },
      'Pre-K': {
        type: 'centered-structured',
        sections: ['warm-up', 'activity', 'practice', 'wrap-up'],
        sidebar: false,
        tools: false,
        maxWidth: '700px',
      },
      'K-2': {
        type: 'centered-guided',
        sections: ['warm-up', 'instruction', 'activity', 'wrap-up'],
        sidebar: 'optional',
        tools: 'simple',
        maxWidth: '800px',
      },
      '3-5': {
        type: 'standard',
        sections: ['warm-up', 'instruction', 'practice', 'assessment', 'wrap-up'],
        sidebar: 'optional',
        tools: 'standard',
        maxWidth: '1000px',
      },
      '6-8': {
        type: 'workspace',
        sections: ['instruction', 'practice', 'assessment', 'reflection'],
        sidebar: 'recommended',
        tools: 'advanced',
        maxWidth: '1200px',
      },
      '9-12': {
        type: 'professional',
        sections: ['instruction', 'practice', 'assessment', 'reflection'],
        sidebar: 'recommended',
        tools: 'full',
        maxWidth: '1400px',
      },
    };

    const baseLayout = layouts[gradeBand] || layouts['3-5'];

    // Adapt for subject
    if (subjectSlug === 'math') {
      baseLayout.tools = 'calculator, graph, formula-sheet';
      baseLayout.workspace = true;
    } else if (subjectSlug === 'science') {
      baseLayout.tools = 'periodic-table, calculator, diagrams';
      baseLayout.labMode = true;
    } else if (subjectSlug === 'coding') {
      baseLayout.tools = 'code-editor, terminal, debugger';
      baseLayout.splitView = true;
    } else if (subjectSlug === 'english') {
      baseLayout.tools = 'dictionary, thesaurus, grammar-check';
      baseLayout.readingMode = true;
    }

    return baseLayout;
  }

  /**
   * Get visual theme
   */
  getVisualTheme(gradeLevel, subjectSlug) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const subjectConfig = this.getSubjectConfiguration(subjectSlug);

    return {
      colors: subjectConfig.colorScheme,
      background: this.getBackgroundStyle(gradeLevel, subjectSlug),
      decorations: this.getDecorations(gradeLevel, subjectSlug),
      animations: this.getAnimations(gradeBand),
      mascots: gradeBand === 'Preschool' || gradeBand === 'Pre-K' ? true : false,
    };
  }

  /**
   * Get interaction design
   */
  getInteractionDesign(gradeLevel, subjectSlug) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const subjectConfig = this.getSubjectConfiguration(subjectSlug);

    return {
      inputMethods: this.getInputMethods(gradeBand, subjectSlug),
      feedbackStyle: this.getFeedbackStyle(gradeBand),
      helpSystem: this.getHelpSystem(gradeBand, subjectSlug),
      navigation: this.getNavigation(gradeBand),
    };
  }

  /**
   * Get content presentation
   */
  getContentPresentation(gradeLevel, subjectSlug) {
    const gradeBand = this.getGradeBand(gradeLevel);

    return {
      textDensity: this.getTextDensity(gradeBand, subjectSlug),
      mediaRatio: this.getMediaRatio(gradeBand, subjectSlug),
      examples: this.getExamplesStyle(gradeBand, subjectSlug),
      scaffolding: this.getScaffolding(gradeBand),
    };
  }

  /**
   * Get input methods based on grade and subject
   */
  getInputMethods(gradeBand, subjectSlug) {
    const methods = {
      'Preschool': ['voice', 'touch', 'simple-buttons'],
      'Pre-K': ['voice', 'touch', 'simple-buttons'],
      'K-2': ['voice', 'touch', 'keyboard-basic', 'drawing'],
      '3-5': ['keyboard', 'touch', 'voice', 'drawing'],
      '6-8': ['keyboard', 'mouse', 'touch'],
      '9-12': ['keyboard', 'mouse'],
    };

    const baseMethods = methods[gradeBand] || methods['3-5'];

    // Add subject-specific methods
    if (subjectSlug === 'math') {
      baseMethods.push('equation-editor', 'graph-input');
    } else if (subjectSlug === 'coding') {
      baseMethods.push('code-editor', 'terminal');
    } else if (subjectSlug === 'science') {
      baseMethods.push('diagram-editor', 'data-input');
    }

    return baseMethods;
  }

  /**
   * Get feedback style
   */
  getFeedbackStyle(gradeBand) {
    const styles = {
      'Preschool': {
        type: 'immediate-visual',
        tone: 'encouraging',
        animations: 'playful',
        sounds: true,
        celebrations: 'frequent',
      },
      'Pre-K': {
        type: 'immediate-visual',
        tone: 'encouraging',
        animations: 'playful',
        sounds: true,
        celebrations: 'frequent',
      },
      'K-2': {
        type: 'immediate',
        tone: 'positive',
        animations: 'smooth',
        sounds: 'optional',
        celebrations: 'moderate',
      },
      '3-5': {
        type: 'immediate',
        tone: 'constructive',
        animations: 'subtle',
        sounds: false,
        celebrations: 'moderate',
      },
      '6-8': {
        type: 'detailed',
        tone: 'constructive',
        animations: 'minimal',
        sounds: false,
        celebrations: 'occasional',
      },
      '9-12': {
        type: 'detailed',
        tone: 'professional',
        animations: 'minimal',
        sounds: false,
        celebrations: 'occasional',
      },
    };

    return styles[gradeBand] || styles['3-5'];
  }

  /**
   * Get help system
   */
  getHelpSystem(gradeBand, subjectSlug) {
    return {
      hints: gradeBand <= 'K-2' ? 'visual' : 'text',
      examples: 'many',
      stepByStep: gradeBand <= '3-5' ? true : false,
      glossary: subjectSlug === 'english' || subjectSlug === 'science' ? true : false,
      calculator: subjectSlug === 'math' ? true : false,
      formulaSheet: subjectSlug === 'math' && gradeBand >= '6-8' ? true : false,
    };
  }

  /**
   * Get navigation
   */
  getNavigation(gradeBand) {
    return {
      complexity: gradeBand <= 'K-2' ? 'simple' : gradeBand <= '5' ? 'moderate' : 'standard',
      breadcrumbs: gradeBand >= '3-5' ? true : false,
      progressIndicator: true,
      backButton: true,
      menu: gradeBand >= '6-8' ? true : false,
    };
  }

  /**
   * Get background style
   */
  getBackgroundStyle(gradeLevel, subjectSlug) {
    const subjectConfig = this.getSubjectConfiguration(subjectSlug);
    const gradeBand = this.getGradeBand(gradeLevel);

    if (gradeBand === 'Preschool' || gradeBand === 'Pre-K') {
      return {
        type: 'pattern',
        pattern: 'playful',
        color: subjectConfig.colorScheme.background,
        decorations: true,
      };
    }

    return {
      type: 'gradient',
      gradient: `linear-gradient(135deg, ${subjectConfig.colorScheme.background} 0%, white 100%)`,
      decorations: false,
    };
  }

  /**
   * Get decorations
   */
  getDecorations(gradeLevel, subjectSlug) {
    const gradeBand = this.getGradeBand(gradeLevel);

    if (gradeBand === 'Preschool' || gradeBand === 'Pre-K') {
      return {
        borders: 'rounded-playful',
        icons: 'large-colorful',
        illustrations: true,
        characters: true,
      };
    }

    return {
      borders: 'rounded-clean',
      icons: 'standard',
      illustrations: false,
      characters: false,
    };
  }

  /**
   * Get animations
   */
  getAnimations(gradeBand) {
    return {
      style: gradeBand <= 'K-2' ? 'playful' : gradeBand <= '5' ? 'smooth' : 'subtle',
      transitions: true,
      microInteractions: gradeBand <= '5' ? true : false,
    };
  }

  /**
   * Get text density
   */
  getTextDensity(gradeBand, subjectSlug) {
    const densities = {
      'Preschool': 'very-low',
      'Pre-K': 'low',
      'K-2': 'low',
      '3-5': 'moderate',
      '6-8': 'moderate',
      '9-12': 'high',
    };

    // Adjust for subject
    if (subjectSlug === 'english' || subjectSlug === 'history') {
      return 'moderate-to-high';
    }

    return densities[gradeBand] || 'moderate';
  }

  /**
   * Get media ratio
   */
  getMediaRatio(gradeBand, subjectSlug) {
    const ratios = {
      'Preschool': 'high', // 70% media, 30% text
      'Pre-K': 'high',
      'K-2': 'moderate', // 50% media, 50% text
      '3-5': 'moderate',
      '6-8': 'low', // 30% media, 70% text
      '9-12': 'low',
    };

    // Adjust for subject
    if (subjectSlug === 'science') {
      return 'high'; // More diagrams and videos
    } else if (subjectSlug === 'math') {
      return 'moderate'; // Mix of visuals and text
    } else if (subjectSlug === 'english') {
      return 'low'; // More text-focused
    }

    return ratios[gradeBand] || 'moderate';
  }

  /**
   * Get examples style
   */
  getExamplesStyle(gradeBand, subjectSlug) {
    return {
      count: gradeBand <= 'K-2' ? 'many' : gradeBand <= '5' ? 'moderate' : 'few',
      detail: gradeBand <= 'K-2' ? 'simple' : gradeBand <= '5' ? 'clear' : 'detailed',
      visual: subjectSlug === 'math' || subjectSlug === 'science' ? true : false,
    };
  }

  /**
   * Get scaffolding
   */
  getScaffolding(gradeBand) {
    return {
      level: gradeBand <= 'K-2' ? 'high' : gradeBand <= '5' ? 'moderate' : 'low',
      hints: gradeBand <= '5' ? 'frequent' : 'on-demand',
      stepByStep: gradeBand <= '5' ? true : false,
    };
  }

  /**
   * Blend two colors
   */
  blendColors(color1, color2) {
    // Simple color blending (would use proper color library in production)
    // For now, return the subject color as it's more specific
    return color2;
  }

  /**
   * Get grade band
   */
  getGradeBand(grade) {
    if (grade <= -1) return 'Preschool';
    if (grade === 0) return 'Pre-K';
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  /**
   * Generate classroom design recommendations
   * @param {number} gradeLevel - Grade level
   * @param {string} subjectSlug - Subject slug
   * @returns {Object} Design recommendations
   */
  generateDesignRecommendations(gradeLevel, subjectSlug) {
    const design = this.getClassroomDesign(gradeLevel, subjectSlug);
    const gradeBand = this.getGradeBand(gradeLevel);

    const recommendations = {
      layout: {
        recommended: design.classroomLayout.type,
        maxWidth: design.classroomLayout.maxWidth,
        sections: design.classroomLayout.sections,
        sidebar: design.classroomLayout.sidebar,
      },
      visual: {
        colorScheme: design.visualTheme.colors,
        background: design.visualTheme.background,
        decorations: design.visualTheme.decorations,
      },
      interactions: {
        inputMethods: design.interactionDesign.inputMethods,
        feedback: design.interactionDesign.feedbackStyle,
        help: design.interactionDesign.helpSystem,
      },
      content: {
        textDensity: design.contentPresentation.textDensity,
        mediaRatio: design.contentPresentation.mediaRatio,
        examples: design.contentPresentation.examples,
      },
      bestPractices: this.getBestPractices(gradeBand, subjectSlug),
    };

    return recommendations;
  }

  /**
   * Get best practices for grade and subject
   */
  getBestPractices(gradeBand, subjectSlug) {
    const practices = [];

    // Grade-based practices
    if (gradeBand === 'Preschool' || gradeBand === 'Pre-K') {
      practices.push('Use large, colorful buttons (48px+)');
      practices.push('Include playful animations and sounds');
      practices.push('Minimize text, maximize visuals');
      practices.push('Provide immediate, encouraging feedback');
      practices.push('Use simple, one-step interactions');
    } else if (gradeBand === 'K-2') {
      practices.push('Use medium buttons (44px)');
      practices.push('Include visual aids and illustrations');
      practices.push('Provide clear, simple instructions');
      practices.push('Use positive reinforcement');
      practices.push('Allow voice input for early readers');
    } else if (gradeBand === '3-5') {
      practices.push('Balance text and visuals');
      practices.push('Provide scaffolding and hints');
      practices.push('Use clear, structured layout');
      practices.push('Include progress indicators');
      practices.push('Offer multiple input methods');
    } else if (gradeBand === '6-8') {
      practices.push('Use professional, clean design');
      practices.push('Provide detailed feedback');
      practices.push('Include advanced tools when needed');
      practices.push('Support keyboard navigation');
      practices.push('Offer workspace layout');
    } else {
      practices.push('Use professional, minimal design');
      practices.push('Provide comprehensive tools');
      practices.push('Support advanced interactions');
      practices.push('Focus on content over decoration');
      practices.push('Enable full keyboard shortcuts');
    }

    // Subject-based practices
    if (subjectSlug === 'math') {
      practices.push('Include calculator and formula tools');
      practices.push('Use graph and diagram support');
      practices.push('Provide step-by-step problem solving');
      practices.push('Show worked examples');
    } else if (subjectSlug === 'science') {
      practices.push('Include visual diagrams and models');
      practices.push('Provide lab simulation tools');
      practices.push('Use interactive experiments');
      practices.push('Include periodic table and references');
    } else if (subjectSlug === 'english') {
      practices.push('Include dictionary and thesaurus');
      practices.push('Provide grammar checking');
      practices.push('Support reading comprehension tools');
      practices.push('Use text highlighting and annotation');
    } else if (subjectSlug === 'coding') {
      practices.push('Include code editor with syntax highlighting');
      practices.push('Provide terminal/console');
      practices.push('Include debugger tools');
      practices.push('Support split-screen view');
    }

    return practices;
  }
}

export const classroomDesignService = new ClassroomDesignService();
export default classroomDesignService;

