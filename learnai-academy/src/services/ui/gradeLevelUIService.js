import { logInfo, logError } from '../../lib/logger.js';

/**
 * GradeLevelUIService - Evaluates and provides grade-appropriate UI/UX configurations
 * 
 * Features:
 * - Grade-level UI evaluation
 * - Age-appropriate design guidelines
 * - UI configuration generation
 * - Accessibility considerations
 * - Engagement optimization
 */

class GradeLevelUIService {
  /**
   * Get UI configuration for grade level
   * @param {number} gradeLevel - Grade level (-1 to 12)
   * @returns {Object} UI configuration
   */
  getUIConfiguration(gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const ageGroup = this.getAgeGroup(gradeLevel);

    return {
      gradeLevel,
      gradeBand,
      ageGroup,
      ...this.getDesignSystem(gradeBand),
      ...this.getLayoutConfiguration(gradeBand),
      ...this.getInteractionPatterns(gradeBand),
      ...this.getContentPresentation(gradeBand),
      ...this.getAccessibilityFeatures(gradeBand),
      ...this.getEngagementFeatures(gradeBand),
    };
  }

  /**
   * Evaluate current UI setup against grade requirements
   * @param {number} gradeLevel - Grade level
   * @param {Object} currentUI - Current UI configuration
   * @returns {Object} Evaluation results
   */
  evaluateUISetup(gradeLevel, currentUI = {}) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const recommended = this.getUIConfiguration(gradeLevel);
    
    const evaluation = {
      gradeLevel,
      gradeBand,
      score: 0,
      passed: false,
      checks: {},
      recommendations: [],
      issues: [],
    };

    // Check design system
    evaluation.checks.designSystem = this.checkDesignSystem(currentUI, recommended);
    
    // Check layout
    evaluation.checks.layout = this.checkLayout(currentUI, recommended);
    
    // Check interactions
    evaluation.checks.interactions = this.checkInteractions(currentUI, recommended);
    
    // Check content presentation
    evaluation.checks.contentPresentation = this.checkContentPresentation(currentUI, recommended);
    
    // Check accessibility
    evaluation.checks.accessibility = this.checkAccessibility(currentUI, recommended);
    
    // Check engagement
    evaluation.checks.engagement = this.checkEngagement(currentUI, recommended);

    // Calculate overall score
    const scores = Object.values(evaluation.checks).map(c => c.score || 0);
    evaluation.score = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    evaluation.passed = evaluation.score >= 0.7;

    // Collect recommendations
    for (const check of Object.values(evaluation.checks)) {
      if (check.recommendations) {
        evaluation.recommendations.push(...check.recommendations);
      }
      if (check.issues) {
        evaluation.issues.push(...check.issues);
      }
    }

    return evaluation;
  }

  /**
   * Get design system for grade band
   */
  getDesignSystem(gradeBand) {
    const systems = {
      'Preschool': {
        colors: {
          primary: '#FF6B6B', // Bright, warm colors
          secondary: '#4ECDC4',
          accent: '#FFE66D',
          background: '#FFF8E7', // Soft, warm background
          text: '#2C3E50',
          success: '#95E1D3',
          warning: '#F38181',
          error: '#F38181',
        },
        typography: {
          fontFamily: 'Comic Sans MS, Arial, sans-serif', // Friendly, readable
          baseSize: '20px', // Large for young eyes
          headingSizes: {
            h1: '32px',
            h2: '28px',
            h3: '24px',
          },
          lineHeight: 1.8, // Extra spacing
          letterSpacing: '0.05em',
        },
        spacing: {
          base: '16px', // Larger touch targets
          small: '12px',
          medium: '20px',
          large: '32px',
          xlarge: '48px',
        },
        borderRadius: {
          small: '12px',
          medium: '16px',
          large: '24px',
        },
        shadows: {
          subtle: '0 2px 4px rgba(0,0,0,0.1)',
          medium: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
      'Pre-K': {
        colors: {
          primary: '#6C5CE7',
          secondary: '#A29BFE',
          accent: '#FD79A8',
          background: '#F8F9FA',
          text: '#2D3436',
          success: '#00B894',
          warning: '#FDCB6E',
          error: '#E17055',
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          baseSize: '18px',
          headingSizes: {
            h1: '30px',
            h2: '26px',
            h3: '22px',
          },
          lineHeight: 1.6,
          letterSpacing: '0.03em',
        },
        spacing: {
          base: '14px',
          small: '10px',
          medium: '18px',
          large: '28px',
          xlarge: '40px',
        },
        borderRadius: {
          small: '10px',
          medium: '14px',
          large: '20px',
        },
        shadows: {
          subtle: '0 2px 4px rgba(0,0,0,0.1)',
          medium: '0 4px 6px rgba(0,0,0,0.12)',
        },
      },
      'K-2': {
        colors: {
          primary: '#5F27CD',
          secondary: '#341F97',
          accent: '#00D2D3',
          background: '#FFFFFF',
          text: '#2C3E50',
          success: '#00D2D3',
          warning: '#FF9FF3',
          error: '#EE5A6F',
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          baseSize: '16px',
          headingSizes: {
            h1: '28px',
            h2: '24px',
            h3: '20px',
          },
          lineHeight: 1.5,
          letterSpacing: '0.02em',
        },
        spacing: {
          base: '12px',
          small: '8px',
          medium: '16px',
          large: '24px',
          xlarge: '36px',
        },
        borderRadius: {
          small: '8px',
          medium: '12px',
          large: '16px',
        },
        shadows: {
          subtle: '0 1px 3px rgba(0,0,0,0.12)',
          medium: '0 3px 6px rgba(0,0,0,0.15)',
        },
      },
      '3-5': {
        colors: {
          primary: '#4834D4',
          secondary: '#686DE0',
          accent: '#00D2D3',
          background: '#FFFFFF',
          text: '#2C3E50',
          success: '#00D2D3',
          warning: '#FF9FF3',
          error: '#EE5A6F',
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          baseSize: '15px',
          headingSizes: {
            h1: '26px',
            h2: '22px',
            h3: '18px',
          },
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        },
        spacing: {
          base: '12px',
          small: '8px',
          medium: '16px',
          large: '24px',
          xlarge: '32px',
        },
        borderRadius: {
          small: '6px',
          medium: '10px',
          large: '14px',
        },
        shadows: {
          subtle: '0 1px 3px rgba(0,0,0,0.12)',
          medium: '0 3px 6px rgba(0,0,0,0.15)',
        },
      },
      '6-8': {
        colors: {
          primary: '#2C3E50',
          secondary: '#34495E',
          accent: '#3498DB',
          background: '#FFFFFF',
          text: '#2C3E50',
          success: '#2ECC71',
          warning: '#F39C12',
          error: '#E74C3C',
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          baseSize: '14px',
          headingSizes: {
            h1: '24px',
            h2: '20px',
            h3: '16px',
          },
          lineHeight: 1.4,
          letterSpacing: '0',
        },
        spacing: {
          base: '10px',
          small: '6px',
          medium: '14px',
          large: '20px',
          xlarge: '28px',
        },
        borderRadius: {
          small: '4px',
          medium: '8px',
          large: '12px',
        },
        shadows: {
          subtle: '0 1px 2px rgba(0,0,0,0.1)',
          medium: '0 2px 4px rgba(0,0,0,0.12)',
        },
      },
      '9-12': {
        colors: {
          primary: '#2C3E50',
          secondary: '#34495E',
          accent: '#3498DB',
          background: '#FFFFFF',
          text: '#2C3E50',
          success: '#27AE60',
          warning: '#F39C12',
          error: '#C0392B',
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          baseSize: '14px',
          headingSizes: {
            h1: '22px',
            h2: '18px',
            h3: '16px',
          },
          lineHeight: 1.4,
          letterSpacing: '0',
        },
        spacing: {
          base: '8px',
          small: '4px',
          medium: '12px',
          large: '16px',
          xlarge: '24px',
        },
        borderRadius: {
          small: '4px',
          medium: '6px',
          large: '8px',
        },
        shadows: {
          subtle: '0 1px 2px rgba(0,0,0,0.1)',
          medium: '0 2px 4px rgba(0,0,0,0.12)',
        },
      },
    };

    return systems[gradeBand] || systems['3-5'];
  }

  /**
   * Get layout configuration
   */
  getLayoutConfiguration(gradeBand) {
    const layouts = {
      'Preschool': {
        layout: 'centered', // Simple, focused
        maxWidth: '600px', // Narrow for focus
        columns: 1, // Single column
        navigation: 'simple', // Minimal navigation
        headerHeight: '80px', // Large header
        sidebar: false, // No sidebar
        footer: false, // No footer
        contentDensity: 'sparse', // Lots of whitespace
        gridColumns: 2, // 2-column grid max
      },
      'Pre-K': {
        layout: 'centered',
        maxWidth: '700px',
        columns: 1,
        navigation: 'simple',
        headerHeight: '75px',
        sidebar: false,
        footer: false,
        contentDensity: 'sparse',
        gridColumns: 2,
      },
      'K-2': {
        layout: 'centered',
        maxWidth: '800px',
        columns: 1,
        navigation: 'simple',
        headerHeight: '70px',
        sidebar: false,
        footer: 'minimal',
        contentDensity: 'moderate',
        gridColumns: 3,
      },
      '3-5': {
        layout: 'standard',
        maxWidth: '1000px',
        columns: 1,
        navigation: 'standard',
        headerHeight: '65px',
        sidebar: 'optional',
        footer: 'standard',
        contentDensity: 'moderate',
        gridColumns: 3,
      },
      '6-8': {
        layout: 'standard',
        maxWidth: '1200px',
        columns: 1,
        navigation: 'standard',
        headerHeight: '60px',
        sidebar: 'optional',
        footer: 'standard',
        contentDensity: 'dense',
        gridColumns: 4,
      },
      '9-12': {
        layout: 'standard',
        maxWidth: '1400px',
        columns: 1,
        navigation: 'advanced',
        headerHeight: '55px',
        sidebar: 'optional',
        footer: 'standard',
        contentDensity: 'dense',
        gridColumns: 4,
      },
    };

    return layouts[gradeBand] || layouts['3-5'];
  }

  /**
   * Get interaction patterns
   */
  getInteractionPatterns(gradeBand) {
    const patterns = {
      'Preschool': {
        buttonSize: 'large', // 48px minimum
        touchTargets: 'large', // 48px minimum
        clickableElements: 'large', // Easy to tap
        hoverEffects: false, // No hover (touch devices)
        animations: 'playful', // Fun, engaging
        feedback: 'immediate', // Instant feedback
        gestures: 'simple', // Tap only
        keyboardNavigation: false, // Touch-focused
        dragAndDrop: false, // Too complex
        multiStep: false, // Single-step actions
      },
      'Pre-K': {
        buttonSize: 'large',
        touchTargets: 'large',
        clickableElements: 'large',
        hoverEffects: false,
        animations: 'playful',
        feedback: 'immediate',
        gestures: 'simple',
        keyboardNavigation: false,
        dragAndDrop: false,
        multiStep: false,
      },
      'K-2': {
        buttonSize: 'medium', // 44px
        touchTargets: 'medium',
        clickableElements: 'medium',
        hoverEffects: 'subtle',
        animations: 'smooth',
        feedback: 'immediate',
        gestures: 'basic', // Tap, swipe
        keyboardNavigation: 'basic',
        dragAndDrop: 'simple',
        multiStep: 'simple',
      },
      '3-5': {
        buttonSize: 'medium',
        touchTargets: 'medium',
        clickableElements: 'medium',
        hoverEffects: 'moderate',
        animations: 'smooth',
        feedback: 'immediate',
        gestures: 'standard',
        keyboardNavigation: 'standard',
        dragAndDrop: 'standard',
        multiStep: 'standard',
      },
      '6-8': {
        buttonSize: 'standard', // 40px
        touchTargets: 'standard',
        clickableElements: 'standard',
        hoverEffects: 'moderate',
        animations: 'subtle',
        feedback: 'quick',
        gestures: 'standard',
        keyboardNavigation: 'full',
        dragAndDrop: 'advanced',
        multiStep: 'advanced',
      },
      '9-12': {
        buttonSize: 'standard',
        touchTargets: 'standard',
        clickableElements: 'standard',
        hoverEffects: 'moderate',
        animations: 'subtle',
        feedback: 'quick',
        gestures: 'advanced',
        keyboardNavigation: 'full',
        dragAndDrop: 'advanced',
        multiStep: 'advanced',
      },
    };

    return patterns[gradeBand] || patterns['3-5'];
  }

  /**
   * Get content presentation
   */
  getContentPresentation(gradeBand) {
    const presentations = {
      'Preschool': {
        textDensity: 'low', // Short sentences
        imageRatio: 'high', // Lots of images
        videoLength: 'short', // 2-5 minutes
        audioEnabled: true, // Read aloud
        visualCues: 'high', // Many visual cues
        instructions: 'minimal', // Simple instructions
        examples: 'many', // Many examples
        scaffolding: 'high', // Lots of support
      },
      'Pre-K': {
        textDensity: 'low',
        imageRatio: 'high',
        videoLength: 'short',
        audioEnabled: true,
        visualCues: 'high',
        instructions: 'simple',
        examples: 'many',
        scaffolding: 'high',
      },
      'K-2': {
        textDensity: 'moderate',
        imageRatio: 'moderate',
        videoLength: 'medium', // 5-10 minutes
        audioEnabled: true,
        visualCues: 'moderate',
        instructions: 'clear',
        examples: 'moderate',
        scaffolding: 'moderate',
      },
      '3-5': {
        textDensity: 'moderate',
        imageRatio: 'moderate',
        videoLength: 'medium',
        audioEnabled: 'optional',
        visualCues: 'moderate',
        instructions: 'clear',
        examples: 'moderate',
        scaffolding: 'moderate',
      },
      '6-8': {
        textDensity: 'high',
        imageRatio: 'low',
        videoLength: 'long', // 10-15 minutes
        audioEnabled: false,
        visualCues: 'low',
        instructions: 'detailed',
        examples: 'few',
        scaffolding: 'low',
      },
      '9-12': {
        textDensity: 'high',
        imageRatio: 'low',
        videoLength: 'long',
        audioEnabled: false,
        visualCues: 'low',
        instructions: 'detailed',
        examples: 'few',
        scaffolding: 'low',
      },
    };

    return presentations[gradeBand] || presentations['3-5'];
  }

  /**
   * Get accessibility features
   */
  getAccessibilityFeatures(gradeBand) {
    const features = {
      'Preschool': {
        screenReader: true,
        highContrast: true,
        largeText: true,
        captions: true,
        audioDescriptions: true,
        keyboardAccess: false, // Touch-focused
        focusIndicators: false,
        skipLinks: false,
      },
      'Pre-K': {
        screenReader: true,
        highContrast: true,
        largeText: true,
        captions: true,
        audioDescriptions: true,
        keyboardAccess: false,
        focusIndicators: false,
        skipLinks: false,
      },
      'K-2': {
        screenReader: true,
        highContrast: true,
        largeText: true,
        captions: true,
        audioDescriptions: 'optional',
        keyboardAccess: true,
        focusIndicators: true,
        skipLinks: false,
      },
      '3-5': {
        screenReader: true,
        highContrast: 'optional',
        largeText: 'optional',
        captions: true,
        audioDescriptions: 'optional',
        keyboardAccess: true,
        focusIndicators: true,
        skipLinks: true,
      },
      '6-8': {
        screenReader: true,
        highContrast: 'optional',
        largeText: false,
        captions: true,
        audioDescriptions: false,
        keyboardAccess: true,
        focusIndicators: true,
        skipLinks: true,
      },
      '9-12': {
        screenReader: true,
        highContrast: 'optional',
        largeText: false,
        captions: true,
        audioDescriptions: false,
        keyboardAccess: true,
        focusIndicators: true,
        skipLinks: true,
      },
    };

    return features[gradeBand] || features['3-5'];
  }

  /**
   * Get engagement features
   */
  getEngagementFeatures(gradeBand) {
    const features = {
      'Preschool': {
        gamification: 'high', // Lots of games
        rewards: 'frequent', // Frequent rewards
        animations: 'playful',
        sounds: true,
        music: true,
        characters: true, // Mascots/characters
        progressVisualization: 'simple', // Simple progress bars
        celebrations: 'frequent',
      },
      'Pre-K': {
        gamification: 'high',
        rewards: 'frequent',
        animations: 'playful',
        sounds: true,
        music: true,
        characters: true,
        progressVisualization: 'simple',
        celebrations: 'frequent',
      },
      'K-2': {
        gamification: 'moderate',
        rewards: 'moderate',
        animations: 'smooth',
        sounds: 'optional',
        music: 'optional',
        characters: 'optional',
        progressVisualization: 'moderate',
        celebrations: 'moderate',
      },
      '3-5': {
        gamification: 'moderate',
        rewards: 'moderate',
        animations: 'smooth',
        sounds: false,
        music: false,
        characters: false,
        progressVisualization: 'moderate',
        celebrations: 'moderate',
      },
      '6-8': {
        gamification: 'low',
        rewards: 'occasional',
        animations: 'subtle',
        sounds: false,
        music: false,
        characters: false,
        progressVisualization: 'detailed',
        celebrations: 'occasional',
      },
      '9-12': {
        gamification: 'low',
        rewards: 'occasional',
        animations: 'subtle',
        sounds: false,
        music: false,
        characters: false,
        progressVisualization: 'detailed',
        celebrations: 'occasional',
      },
    };

    return features[gradeBand] || features['3-5'];
  }

  /**
   * Check design system
   */
  checkDesignSystem(current, recommended) {
    const issues = [];
    const recommendations = [];

    // Check font size
    if (current.typography?.baseSize) {
      const currentSize = parseInt(current.typography.baseSize);
      const recommendedSize = parseInt(recommended.typography.baseSize);
      if (Math.abs(currentSize - recommendedSize) > 2) {
        issues.push(`Font size (${currentSize}px) should be closer to ${recommendedSize}px for this grade level`);
        recommendations.push(`Adjust base font size to ${recommendedSize}px`);
      }
    }

    // Check button/touch target sizes
    if (current.buttonSize && current.buttonSize !== recommended.interactionPatterns.buttonSize) {
      recommendations.push(`Use ${recommended.interactionPatterns.buttonSize} button size for better usability`);
    }

    return {
      score: issues.length === 0 ? 0.9 : 0.6,
      passed: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Check layout
   */
  checkLayout(current, recommended) {
    const issues = [];
    const recommendations = [];

    if (current.maxWidth && current.maxWidth !== recommended.layoutConfiguration.maxWidth) {
      recommendations.push(`Consider max-width of ${recommended.layoutConfiguration.maxWidth} for better focus`);
    }

    if (current.contentDensity && current.contentDensity !== recommended.layoutConfiguration.contentDensity) {
      recommendations.push(`Adjust content density to ${recommended.layoutConfiguration.contentDensity} for this age group`);
    }

    return {
      score: 0.8,
      passed: true,
      issues,
      recommendations,
    };
  }

  /**
   * Check interactions
   */
  checkInteractions(current, recommended) {
    const issues = [];
    const recommendations = [];

    if (current.touchTargets && current.touchTargets !== recommended.interactionPatterns.touchTargets) {
      issues.push(`Touch targets should be ${recommended.interactionPatterns.touchTargets} for this grade level`);
      recommendations.push(`Increase touch target size to ${recommended.interactionPatterns.touchTargets}`);
    }

    return {
      score: issues.length === 0 ? 0.9 : 0.6,
      passed: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Check content presentation
   */
  checkContentPresentation(current, recommended) {
    const issues = [];
    const recommendations = [];

    if (recommended.contentPresentation.audioEnabled && !current.audioEnabled) {
      recommendations.push('Enable audio/read-aloud for this grade level');
    }

    if (recommended.contentPresentation.visualCues === 'high' && current.visualCues !== 'high') {
      recommendations.push('Add more visual cues and images for better comprehension');
    }

    return {
      score: 0.8,
      passed: true,
      issues,
      recommendations,
    };
  }

  /**
   * Check accessibility
   */
  checkAccessibility(current, recommended) {
    const issues = [];
    const recommendations = [];

    if (recommended.accessibilityFeatures.captions && !current.captions) {
      issues.push('Captions are required for this grade level');
      recommendations.push('Add captions to all video content');
    }

    if (recommended.accessibilityFeatures.largeText && !current.largeText) {
      recommendations.push('Enable large text option for better readability');
    }

    return {
      score: issues.length === 0 ? 0.9 : 0.6,
      passed: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Check engagement
   */
  checkEngagement(current, recommended) {
    const issues = [];
    const recommendations = [];

    if (recommended.engagementFeatures.gamification === 'high' && current.gamification !== 'high') {
      recommendations.push('Increase gamification elements for better engagement');
    }

    return {
      score: 0.8,
      passed: true,
      issues,
      recommendations,
    };
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
   * Get age group
   */
  getAgeGroup(grade) {
    if (grade <= -1) return '3-4 years';
    if (grade === 0) return '4-5 years';
    if (grade <= 2) return '5-8 years';
    if (grade <= 5) return '8-11 years';
    if (grade <= 8) return '11-14 years';
    return '14-18 years';
  }
}

export const gradeLevelUIService = new GradeLevelUIService();
export default gradeLevelUIService;

