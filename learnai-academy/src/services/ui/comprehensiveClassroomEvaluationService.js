import { groqClient } from '../ai/groqClient.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * ComprehensiveClassroomEvaluationService
 * 
 * Expert-level evaluation of classroom experience from every angle
 * Based on:
 * - Universal Design for Learning (UDL)
 * - WCAG 2.1 Accessibility Guidelines
 * - Cognitive Load Theory
 * - Multiple Intelligences Theory
 * - Learning Styles Research
 * - Inclusive Design Principles
 * - Educational Psychology Best Practices
 */

class ComprehensiveClassroomEvaluationService {
  /**
   * Comprehensive evaluation of classroom experience
   * @param {number} gradeLevel - Grade level
   * @param {Object} classroomConfig - Current classroom configuration
   * @returns {Promise<Object>} Comprehensive evaluation
   */
  async evaluateClassroomExperience(gradeLevel, classroomConfig = {}) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const ageGroup = this.getAgeGroup(gradeLevel);

    // Run all evaluation dimensions
    const evaluations = {
      universalDesign: await this.evaluateUniversalDesign(gradeLevel, classroomConfig),
      accessibility: await this.evaluateAccessibility(gradeLevel, classroomConfig),
      learningStyles: await this.evaluateLearningStyles(gradeLevel, classroomConfig),
      cognitiveLoad: await this.evaluateCognitiveLoad(gradeLevel, classroomConfig),
      attentionSpan: await this.evaluateAttentionSpan(gradeLevel, classroomConfig),
      motorSkills: await this.evaluateMotorSkills(gradeLevel, classroomConfig),
      culturalSensitivity: await this.evaluateCulturalSensitivity(gradeLevel, classroomConfig),
      languageAccessibility: await this.evaluateLanguageAccessibility(gradeLevel, classroomConfig),
      socioeconomicFactors: await this.evaluateSocioeconomicFactors(gradeLevel, classroomConfig),
      specialNeeds: await this.evaluateSpecialNeeds(gradeLevel, classroomConfig),
      multipleIntelligences: await this.evaluateMultipleIntelligences(gradeLevel, classroomConfig),
      engagement: await this.evaluateEngagement(gradeLevel, classroomConfig),
      assessment: await this.evaluateAssessment(gradeLevel, classroomConfig),
      technologyAccess: await this.evaluateTechnologyAccess(gradeLevel, classroomConfig),
      emotionalSafety: await this.evaluateEmotionalSafety(gradeLevel, classroomConfig),
      socialInteraction: await this.evaluateSocialInteraction(gradeLevel, classroomConfig),
    };

    // Calculate overall score
    const scores = Object.values(evaluations).map(e => e.score || 0);
    const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Generate expert recommendations
    const expertRecommendations = await this.generateExpertRecommendations(
      gradeLevel,
      evaluations
    );

    return {
      gradeLevel,
      gradeBand,
      ageGroup,
      overallScore: Math.round(overallScore * 100) / 100,
      evaluations,
      expertRecommendations,
      priorityActions: this.identifyPriorityActions(evaluations),
      complianceStatus: this.checkCompliance(evaluations),
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * 1. Universal Design for Learning (UDL) Evaluation
   * Based on CAST UDL Guidelines
   */
  async evaluateUniversalDesign(gradeLevel, config) {
    const checks = {
      multipleMeansOfRepresentation: {
        // Provide options for perception
        visualOptions: config.visualContent !== false,
        auditoryOptions: config.audioContent !== false,
        tactileOptions: config.tactileContent || false,
        // Provide options for language and symbols
        vocabularySupport: config.vocabularySupport !== false,
        symbolSupport: config.symbolSupport || false,
        // Provide options for comprehension
        backgroundKnowledge: config.backgroundKnowledge !== false,
        patternRecognition: config.patternRecognition !== false,
      },
      multipleMeansOfAction: {
        // Provide options for physical action
        navigationOptions: config.navigationOptions !== false,
        responseOptions: config.responseOptions !== false,
        // Provide options for expression
        communicationTools: config.communicationTools !== false,
        compositionTools: config.compositionTools !== false,
        // Provide options for executive functions
        goalSetting: config.goalSetting !== false,
        planning: config.planning !== false,
        progressMonitoring: config.progressMonitoring !== false,
      },
      multipleMeansOfEngagement: {
        // Provide options for recruiting interest
        choiceAndAutonomy: config.choiceAndAutonomy !== false,
        relevance: config.relevance !== false,
        minimizeThreats: config.minimizeThreats !== false,
        // Provide options for sustaining effort
        goalsAndObjectives: config.goalsAndObjectives !== false,
        collaboration: config.collaboration !== false,
        feedback: config.feedback !== false,
        // Provide options for self-regulation
        expectations: config.expectations !== false,
        copingStrategies: config.copingStrategies !== false,
        selfAssessment: config.selfAssessment !== false,
      },
    };

    const score = this.calculateUDLScore(checks);
    const recommendations = this.generateUDLRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Universal Design for Learning (CAST)',
    };
  }

  /**
   * 2. Accessibility Evaluation (WCAG 2.1)
   */
  async evaluateAccessibility(gradeLevel, config) {
    const checks = {
      perceivable: {
        textAlternatives: config.altText !== false,
        captions: config.captions !== false,
        audioDescriptions: config.audioDescriptions || false,
        colorContrast: config.colorContrast !== false,
        textResize: config.textResize !== false,
        textSpacing: config.textSpacing !== false,
      },
      operable: {
        keyboardAccessible: config.keyboardAccess !== false,
        noTiming: config.noTiming !== false,
        noSeizures: config.noSeizures !== false,
        navigation: config.navigation !== false,
        inputModalities: config.inputModalities !== false,
      },
      understandable: {
        language: config.language !== false,
        predictable: config.predictable !== false,
        inputAssistance: config.inputAssistance !== false,
      },
      robust: {
        compatible: config.compatible !== false,
        assistiveTech: config.assistiveTech !== false,
      },
    };

    const score = this.calculateAccessibilityScore(checks);
    const recommendations = this.generateAccessibilityRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.9, // Higher threshold for accessibility
      checks,
      recommendations,
      framework: 'WCAG 2.1 Level AA',
      complianceLevel: score >= 0.9 ? 'AA' : score >= 0.7 ? 'A' : 'Not Compliant',
    };
  }

  /**
   * 3. Learning Styles Evaluation
   * Visual, Auditory, Kinesthetic, Reading/Writing (VARK)
   */
  async evaluateLearningStyles(gradeLevel, config) {
    const styles = {
      visual: {
        images: config.visualContent !== false,
        diagrams: config.diagrams !== false,
        charts: config.charts !== false,
        videos: config.videos !== false,
        colorCoding: config.colorCoding || false,
        spatialLayout: config.spatialLayout !== false,
      },
      auditory: {
        audioNarration: config.audioNarration !== false,
        music: config.music || false,
        soundEffects: config.soundEffects || false,
        verbalInstructions: config.verbalInstructions !== false,
        discussions: config.discussions || false,
        podcasts: config.podcasts || false,
      },
      kinesthetic: {
        handsOn: config.handsOnActivities || false,
        simulations: config.simulations || false,
        interactive: config.interactiveElements !== false,
        movement: config.movementActivities || false,
        experiments: config.experiments || false,
        manipulatives: config.manipulatives || false,
      },
      readingWriting: {
        textContent: config.textContent !== false,
        noteTaking: config.noteTaking !== false,
        readingMaterials: config.readingMaterials !== false,
        writingPrompts: config.writingPrompts !== false,
        summaries: config.summaries !== false,
        glossaries: config.glossaries || false,
      },
    };

    const score = this.calculateLearningStylesScore(styles);
    const recommendations = this.generateLearningStylesRecommendations(styles, gradeLevel);

    return {
      score,
      passed: score >= 0.75,
      styles,
      recommendations,
      framework: 'VARK Learning Styles',
    };
  }

  /**
   * 4. Cognitive Load Theory Evaluation
   */
  async evaluateCognitiveLoad(gradeLevel, config) {
    const checks = {
      intrinsicLoad: {
        complexity: this.assessComplexity(gradeLevel, config),
        priorKnowledge: config.priorKnowledgeSupport !== false,
        chunking: config.chunking !== false,
        scaffolding: config.scaffolding !== false,
      },
      extraneousLoad: {
        splitAttention: config.splitAttention === false,
        redundancy: config.redundancy === false,
        modality: config.modality !== false,
        coherence: config.coherence !== false,
        signaling: config.signaling !== false,
        workedExamples: config.workedExamples !== false,
      },
      germaneLoad: {
        schemaConstruction: config.schemaConstruction !== false,
        automation: config.automation !== false,
        variability: config.variability !== false,
      },
    };

    const score = this.calculateCognitiveLoadScore(checks, gradeLevel);
    const recommendations = this.generateCognitiveLoadRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Cognitive Load Theory (Sweller)',
    };
  }

  /**
   * 5. Attention Span Evaluation
   */
  async evaluateAttentionSpan(gradeLevel, config) {
    const ageGroup = this.getAgeGroup(gradeLevel);
    const expectedAttentionSpan = this.getExpectedAttentionSpan(gradeLevel);

    const checks = {
      sessionLength: {
        appropriate: config.sessionLength <= expectedAttentionSpan * 1.5,
        breaks: config.breaks !== false,
        microLearning: config.microLearning || false,
      },
      contentChunking: {
        chunked: config.chunked !== false,
        chunkSize: config.chunkSize <= expectedAttentionSpan,
        transitions: config.transitions !== false,
      },
      engagement: {
        variety: config.variety !== false,
        interactivity: config.interactivity !== false,
        rewards: config.rewards !== false,
      },
    };

    const score = this.calculateAttentionSpanScore(checks, gradeLevel);
    const recommendations = this.generateAttentionSpanRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.7,
      checks,
      expectedAttentionSpan,
      recommendations,
      framework: 'Developmental Psychology',
    };
  }

  /**
   * 6. Motor Skills Evaluation
   */
  async evaluateMotorSkills(gradeLevel, config) {
    const motorDevelopment = this.getMotorDevelopment(gradeLevel);

    const checks = {
      fineMotor: {
        buttonSize: config.buttonSize >= motorDevelopment.minButtonSize,
        touchTargets: config.touchTargets >= motorDevelopment.minTouchTarget,
        precision: config.precisionTasks !== false,
        writing: config.writingSupport !== false,
      },
      grossMotor: {
        movement: config.movementActivities || false,
        breaks: config.movementBreaks !== false,
        posture: config.postureSupport !== false,
      },
      coordination: {
        dragDrop: config.dragDrop || motorDevelopment.canDragDrop,
        multiTouch: config.multiTouch || motorDevelopment.canMultiTouch,
        timing: config.timingTasks || motorDevelopment.canTiming,
      },
    };

    const score = this.calculateMotorSkillsScore(checks, gradeLevel);
    const recommendations = this.generateMotorSkillsRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.7,
      checks,
      motorDevelopment,
      recommendations,
      framework: 'Developmental Motor Skills',
    };
  }

  /**
   * 7. Cultural Sensitivity Evaluation
   */
  async evaluateCulturalSensitivity(gradeLevel, config) {
    const checks = {
      representation: {
        diverseImages: config.diverseImages !== false,
        diverseNames: config.diverseNames !== false,
        diverseContexts: config.diverseContexts !== false,
      },
      inclusivity: {
        culturalRelevance: config.culturalRelevance !== false,
        avoidStereotypes: config.avoidStereotypes !== false,
        multiplePerspectives: config.multiplePerspectives || false,
      },
      language: {
        multilingual: config.multilingual || false,
        culturalContext: config.culturalContext !== false,
        idioms: config.avoidIdioms || false,
      },
    };

    const score = this.calculateCulturalSensitivityScore(checks);
    const recommendations = this.generateCulturalSensitivityRecommendations(checks);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Culturally Responsive Teaching',
    };
  }

  /**
   * 8. Language Accessibility Evaluation
   */
  async evaluateLanguageAccessibility(gradeLevel, config) {
    const checks = {
      readability: {
        gradeLevel: config.readabilityLevel <= gradeLevel + 1,
        vocabulary: config.vocabularySupport !== false,
        definitions: config.definitions !== false,
        glossaries: config.glossaries || false,
      },
      multilingual: {
        translations: config.translations || false,
        languageOptions: config.languageOptions || false,
        nativeLanguage: config.nativeLanguageSupport || false,
      },
      languageSupport: {
        audio: config.audioNarration !== false,
        visual: config.visualSupport !== false,
        simplified: config.simplifiedLanguage || false,
      },
    };

    const score = this.calculateLanguageAccessibilityScore(checks, gradeLevel);
    const recommendations = this.generateLanguageAccessibilityRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Language Accessibility Standards',
    };
  }

  /**
   * 9. Socioeconomic Factors Evaluation
   */
  async evaluateSocioeconomicFactors(gradeLevel, config) {
    const checks = {
      technologyAccess: {
        lowBandwidth: config.lowBandwidth !== false,
        offlineAccess: config.offlineAccess || false,
        deviceCompatibility: config.deviceCompatibility !== false,
      },
      resourceAccess: {
        noExternalResources: config.noExternalResources !== false,
        freeContent: config.freeContent !== false,
        openSource: config.openSource || false,
      },
      support: {
        noParentHelp: config.noParentHelp !== false,
        clearInstructions: config.clearInstructions !== false,
        helpAvailable: config.helpAvailable !== false,
      },
    };

    const score = this.calculateSocioeconomicScore(checks);
    const recommendations = this.generateSocioeconomicRecommendations(checks);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Equity in Education',
    };
  }

  /**
   * 10. Special Needs Accommodations
   */
  async evaluateSpecialNeeds(gradeLevel, config) {
    const checks = {
      learningDisabilities: {
        dyslexia: config.dyslexiaSupport || false,
        dyscalculia: config.dyscalculiaSupport || false,
        adhd: config.adhdSupport || false,
        processing: config.processingSupport !== false,
      },
      physicalDisabilities: {
        motor: config.motorSupport !== false,
        vision: config.visionSupport !== false,
        hearing: config.hearingSupport !== false,
      },
      cognitiveDisabilities: {
        intellectual: config.intellectualSupport || false,
        autism: config.autismSupport || false,
        memory: config.memorySupport !== false,
      },
      accommodations: {
        extendedTime: config.extendedTime || false,
        breaks: config.breaks !== false,
        alternativeFormats: config.alternativeFormats !== false,
        assistiveTech: config.assistiveTech !== false,
      },
    };

    const score = this.calculateSpecialNeedsScore(checks);
    const recommendations = this.generateSpecialNeedsRecommendations(checks);

    return {
      score,
      passed: score >= 0.6, // Lower threshold as accommodations vary
      checks,
      recommendations,
      framework: 'IDEA & Section 504',
    };
  }

  /**
   * 11. Multiple Intelligences Evaluation
   */
  async evaluateMultipleIntelligences(gradeLevel, config) {
    const intelligences = {
      linguistic: config.textContent !== false,
      logicalMathematical: config.problemSolving !== false,
      spatial: config.visualContent !== false,
      bodilyKinesthetic: config.handsOnActivities || false,
      musical: config.music || false,
      interpersonal: config.collaboration !== false,
      intrapersonal: config.selfReflection !== false,
      naturalistic: config.natureContent || false,
    };

    const score = this.calculateMultipleIntelligencesScore(intelligences);
    const recommendations = this.generateMultipleIntelligencesRecommendations(intelligences);

    return {
      score,
      passed: score >= 0.6,
      intelligences,
      recommendations,
      framework: 'Gardner\'s Multiple Intelligences',
    };
  }

  /**
   * 12. Engagement Evaluation
   */
  async evaluateEngagement(gradeLevel, config) {
    const checks = {
      motivation: {
        relevance: config.relevance !== false,
        choice: config.choice !== false,
        autonomy: config.autonomy !== false,
      },
      interest: {
        variety: config.variety !== false,
        novelty: config.novelty || false,
        personalization: config.personalization !== false,
      },
      flow: {
        challenge: config.appropriateChallenge !== false,
        feedback: config.feedback !== false,
        progress: config.progressVisible !== false,
      },
    };

    const score = this.calculateEngagementScore(checks);
    const recommendations = this.generateEngagementRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Flow Theory & Self-Determination Theory',
    };
  }

  /**
   * 13. Assessment Accommodations
   */
  async evaluateAssessment(gradeLevel, config) {
    const checks = {
      formats: {
        multiple: config.assessmentFormats !== false,
        alternative: config.alternativeAssessments || false,
        authentic: config.authenticAssessments || false,
      },
      accommodations: {
        extendedTime: config.extendedTime || false,
        breaks: config.breaks !== false,
        readAloud: config.readAloud || false,
        calculator: config.calculator || false,
      },
      feedback: {
        immediate: config.immediateFeedback !== false,
        formative: config.formativeFeedback !== false,
        constructive: config.constructiveFeedback !== false,
      },
    };

    const score = this.calculateAssessmentScore(checks);
    const recommendations = this.generateAssessmentRecommendations(checks);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Fair Assessment Practices',
    };
  }

  /**
   * 14. Technology Access Evaluation
   */
  async evaluateTechnologyAccess(gradeLevel, config) {
    const checks = {
      deviceCompatibility: {
        mobile: config.mobileCompatible !== false,
        tablet: config.tabletCompatible !== false,
        desktop: config.desktopCompatible !== false,
        lowEnd: config.lowEndDevices || false,
      },
      connectivity: {
        offline: config.offlineMode || false,
        lowBandwidth: config.lowBandwidth !== false,
        progressive: config.progressiveLoading !== false,
      },
      browserSupport: {
        modern: config.modernBrowsers !== false,
        legacy: config.legacyBrowsers || false,
        noPlugins: config.noPlugins !== false,
      },
    };

    const score = this.calculateTechnologyAccessScore(checks);
    const recommendations = this.generateTechnologyAccessRecommendations(checks);

    return {
      score,
      passed: score >= 0.7,
      checks,
      recommendations,
      framework: 'Digital Equity',
    };
  }

  /**
   * 15. Emotional Safety & Well-being
   */
  async evaluateEmotionalSafety(gradeLevel, config) {
    const checks = {
      safety: {
        noBullying: config.noBullying !== false,
        positiveEnvironment: config.positiveEnvironment !== false,
        respect: config.respect !== false,
      },
      wellBeing: {
        breaks: config.breaks !== false,
        stressManagement: config.stressManagement || false,
        mindfulness: config.mindfulness || false,
      },
      support: {
        helpAvailable: config.helpAvailable !== false,
        encouragement: config.encouragement !== false,
        growthMindset: config.growthMindset !== false,
      },
    };

    const score = this.calculateEmotionalSafetyScore(checks);
    const recommendations = this.generateEmotionalSafetyRecommendations(checks);

    return {
      score,
      passed: score >= 0.8,
      checks,
      recommendations,
      framework: 'Social-Emotional Learning (SEL)',
    };
  }

  /**
   * 16. Social Interaction Evaluation
   */
  async evaluateSocialInteraction(gradeLevel, config) {
    const checks = {
      collaboration: {
        groupWork: config.groupWork || false,
        peerLearning: config.peerLearning || false,
        discussions: config.discussions || false,
      },
      communication: {
        chat: config.chat || false,
        forums: config.forums || false,
        video: config.videoChat || false,
      },
      community: {
        sharedGoals: config.sharedGoals || false,
        recognition: config.recognition !== false,
        belonging: config.belonging !== false,
      },
    };

    const score = this.calculateSocialInteractionScore(checks, gradeLevel);
    const recommendations = this.generateSocialInteractionRecommendations(checks, gradeLevel);

    return {
      score,
      passed: score >= 0.6,
      checks,
      recommendations,
      framework: 'Social Learning Theory',
    };
  }

  // Helper methods for calculations and recommendations
  calculateUDLScore(checks) {
    // Calculate based on UDL principles
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateUDLRecommendations(checks, gradeLevel) {
    const recommendations = [];
    
    if (!checks.multipleMeansOfRepresentation.visualOptions) {
      recommendations.push('Add visual content options (images, videos, diagrams)');
    }
    if (!checks.multipleMeansOfAction.navigationOptions) {
      recommendations.push('Provide multiple navigation options (keyboard, mouse, touch)');
    }
    if (!checks.multipleMeansOfEngagement.choiceAndAutonomy) {
      recommendations.push('Allow students to choose learning paths and activities');
    }
    
    return recommendations;
  }

  calculateAccessibilityScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateAccessibilityRecommendations(checks, gradeLevel) {
    const recommendations = [];
    
    if (!checks.perceivable.captions) {
      recommendations.push('Add captions to all video content (WCAG 2.1 requirement)');
    }
    if (!checks.operable.keyboardAccessible) {
      recommendations.push('Ensure all functionality is keyboard accessible');
    }
    if (!checks.understandable.language) {
      recommendations.push('Specify language and provide translations where needed');
    }
    
    return recommendations;
  }

  calculateLearningStylesScore(styles) {
    const scores = Object.values(styles).map(style => {
      const values = Object.values(style);
      return values.filter(v => v === true).length / values.length;
    });
    
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }

  generateLearningStylesRecommendations(styles, gradeLevel) {
    const recommendations = [];
    
    if (!styles.visual.images) {
      recommendations.push('Add visual content (images, diagrams, charts) for visual learners');
    }
    if (!styles.auditory.audioNarration) {
      recommendations.push('Add audio narration for auditory learners');
    }
    if (!styles.kinesthetic.handsOn) {
      recommendations.push('Include hands-on activities for kinesthetic learners');
    }
    if (!styles.readingWriting.textContent) {
      recommendations.push('Provide text content and note-taking for reading/writing learners');
    }
    
    return recommendations;
  }

  calculateCognitiveLoadScore(checks, gradeLevel) {
    // Cognitive load should be lower for younger grades
    const ageFactor = gradeLevel <= 2 ? 0.9 : gradeLevel <= 5 ? 0.8 : 0.7;
    
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        if (typeof check === 'boolean') {
          total += check === true ? 1 : 0;
        } else if (typeof check === 'number') {
          total += check;
        }
        count++;
      }
    }
    
    return count > 0 ? (total / count) * ageFactor : 0;
  }

  generateCognitiveLoadRecommendations(checks, gradeLevel) {
    const recommendations = [];
    
    if (!checks.intrinsicLoad.chunking) {
      recommendations.push('Break content into smaller chunks to reduce cognitive load');
    }
    if (checks.extraneousLoad.splitAttention) {
      recommendations.push('Avoid split attention by integrating related information');
    }
    if (!checks.germaneLoad.schemaConstruction) {
      recommendations.push('Help students build mental schemas through examples and patterns');
    }
    
    return recommendations;
  }

  getExpectedAttentionSpan(gradeLevel) {
    // In minutes
    const spans = {
      '-1': 5,   // Preschool
      '0': 7,    // Pre-K
      '1': 10,   // Grade 1
      '2': 12,   // Grade 2
      '3': 15,   // Grade 3
      '4': 18,   // Grade 4
      '5': 20,   // Grade 5
      '6': 25,   // Grade 6
      '7': 30,   // Grade 7
      '8': 35,   // Grade 8
      '9': 40,   // Grade 9
      '10': 45,  // Grade 10
      '11': 50,  // Grade 11
      '12': 55,  // Grade 12
    };
    
    return spans[gradeLevel.toString()] || 20;
  }

  calculateAttentionSpanScore(checks, gradeLevel) {
    const expectedSpan = this.getExpectedAttentionSpan(gradeLevel);
    let score = 0.5;
    
    if (checks.sessionLength.appropriate) score += 0.2;
    if (checks.sessionLength.breaks) score += 0.1;
    if (checks.contentChunking.chunked) score += 0.1;
    if (checks.engagement.variety) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  generateAttentionSpanRecommendations(checks, gradeLevel) {
    const expectedSpan = this.getExpectedAttentionSpan(gradeLevel);
    const recommendations = [];
    
    if (!checks.sessionLength.appropriate) {
      recommendations.push(`Limit sessions to ${expectedSpan} minutes for this age group`);
    }
    if (!checks.sessionLength.breaks) {
      recommendations.push('Include regular breaks to maintain attention');
    }
    if (!checks.contentChunking.chunked) {
      recommendations.push('Chunk content into smaller segments');
    }
    
    return recommendations;
  }

  getMotorDevelopment(gradeLevel) {
    const development = {
      '-1': { minButtonSize: 48, minTouchTarget: 48, canDragDrop: false, canMultiTouch: false, canTiming: false },
      '0': { minButtonSize: 48, minTouchTarget: 48, canDragDrop: false, canMultiTouch: false, canTiming: false },
      '1': { minButtonSize: 44, minTouchTarget: 44, canDragDrop: false, canMultiTouch: false, canTiming: false },
      '2': { minButtonSize: 44, minTouchTarget: 44, canDragDrop: true, canMultiTouch: false, canTiming: false },
      '3': { minButtonSize: 40, minTouchTarget: 40, canDragDrop: true, canMultiTouch: false, canTiming: true },
      '4': { minButtonSize: 40, minTouchTarget: 40, canDragDrop: true, canMultiTouch: true, canTiming: true },
      '5': { minButtonSize: 40, minTouchTarget: 40, canDragDrop: true, canMultiTouch: true, canTiming: true },
    };
    
    return development[gradeLevel.toString()] || development['5'];
  }

  calculateMotorSkillsScore(checks, gradeLevel) {
    let score = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        if (typeof check === 'boolean') {
          score += check === true ? 1 : 0;
        } else if (typeof check === 'number') {
          score += check >= 0.8 ? 1 : 0.5;
        }
        count++;
      }
    }
    
    return count > 0 ? score / count : 0;
  }

  generateMotorSkillsRecommendations(checks, gradeLevel) {
    const motorDev = this.getMotorDevelopment(gradeLevel);
    const recommendations = [];
    
    if (checks.fineMotor.buttonSize < motorDev.minButtonSize) {
      recommendations.push(`Increase button size to at least ${motorDev.minButtonSize}px for fine motor development`);
    }
    if (!checks.grossMotor.movement) {
      recommendations.push('Include movement activities and breaks for gross motor development');
    }
    
    return recommendations;
  }

  calculateCulturalSensitivityScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateCulturalSensitivityRecommendations(checks) {
    const recommendations = [];
    
    if (!checks.representation.diverseImages) {
      recommendations.push('Include diverse images representing various cultures and backgrounds');
    }
    if (!checks.inclusivity.culturalRelevance) {
      recommendations.push('Ensure content is culturally relevant and avoids stereotypes');
    }
    
    return recommendations;
  }

  calculateLanguageAccessibilityScore(checks, gradeLevel) {
    let score = 0.5;
    
    if (checks.readability.gradeLevel) score += 0.2;
    if (checks.readability.vocabulary) score += 0.1;
    if (checks.languageSupport.audio) score += 0.1;
    if (checks.languageSupport.visual) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  generateLanguageAccessibilityRecommendations(checks, gradeLevel) {
    const recommendations = [];
    
    if (!checks.readability.vocabulary) {
      recommendations.push('Provide vocabulary support and definitions');
    }
    if (!checks.languageSupport.audio) {
      recommendations.push('Add audio narration for language accessibility');
    }
    
    return recommendations;
  }

  calculateSocioeconomicScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateSocioeconomicRecommendations(checks) {
    const recommendations = [];
    
    if (!checks.technologyAccess.lowBandwidth) {
      recommendations.push('Optimize for low bandwidth connections');
    }
    if (!checks.resourceAccess.freeContent) {
      recommendations.push('Ensure all content is free and accessible without external purchases');
    }
    
    return recommendations;
  }

  calculateSpecialNeedsScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateSpecialNeedsRecommendations(checks) {
    const recommendations = [];
    
    if (!checks.accommodations.extendedTime) {
      recommendations.push('Allow extended time for assessments');
    }
    if (!checks.accommodations.alternativeFormats) {
      recommendations.push('Provide alternative formats (audio, large print, etc.)');
    }
    
    return recommendations;
  }

  calculateMultipleIntelligencesScore(intelligences) {
    const values = Object.values(intelligences);
    return values.filter(v => v === true).length / values.length;
  }

  generateMultipleIntelligencesRecommendations(intelligences) {
    const recommendations = [];
    const missing = Object.entries(intelligences)
      .filter(([_, value]) => !value)
      .map(([intelligence, _]) => intelligence);
    
    if (missing.length > 0) {
      recommendations.push(`Consider adding content for: ${missing.join(', ')} intelligences`);
    }
    
    return recommendations;
  }

  calculateEngagementScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateEngagementRecommendations(checks, gradeLevel) {
    const recommendations = [];
    
    if (!checks.motivation.choice) {
      recommendations.push('Provide choices to increase student autonomy and motivation');
    }
    if (!checks.flow.feedback) {
      recommendations.push('Provide immediate and constructive feedback');
    }
    
    return recommendations;
  }

  calculateAssessmentScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateAssessmentRecommendations(checks) {
    const recommendations = [];
    
    if (!checks.formats.multiple) {
      recommendations.push('Offer multiple assessment formats (multiple choice, essay, project, etc.)');
    }
    if (!checks.feedback.immediate) {
      recommendations.push('Provide immediate feedback on assessments');
    }
    
    return recommendations;
  }

  calculateTechnologyAccessScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateTechnologyAccessRecommendations(checks) {
    const recommendations = [];
    
    if (!checks.connectivity.offline) {
      recommendations.push('Provide offline mode for areas with limited connectivity');
    }
    if (!checks.deviceCompatibility.mobile) {
      recommendations.push('Ensure mobile device compatibility');
    }
    
    return recommendations;
  }

  calculateEmotionalSafetyScore(checks) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateEmotionalSafetyRecommendations(checks) {
    const recommendations = [];
    
    if (!checks.safety.positiveEnvironment) {
      recommendations.push('Create a positive, supportive learning environment');
    }
    if (!checks.wellBeing.breaks) {
      recommendations.push('Include regular breaks for stress management');
    }
    
    return recommendations;
  }

  calculateSocialInteractionScore(checks, gradeLevel) {
    let total = 0;
    let count = 0;
    
    for (const category of Object.values(checks)) {
      for (const check of Object.values(category)) {
        total += check === true ? 1 : 0;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  generateSocialInteractionRecommendations(checks, gradeLevel) {
    const recommendations = [];
    
    if (!checks.collaboration.groupWork) {
      recommendations.push('Include group work and collaboration opportunities');
    }
    if (!checks.communication.chat) {
      recommendations.push('Provide communication tools for peer interaction');
    }
    
    return recommendations;
  }

  assessComplexity(gradeLevel, config) {
    // Simplified complexity assessment
    return 0.7; // Would use actual content analysis
  }

  async generateExpertRecommendations(gradeLevel, evaluations) {
    const prompt = `As an expert in educational technology and inclusive design, provide comprehensive recommendations for improving the classroom experience for ${gradeLevel}th grade students.

EVALUATION RESULTS:
${JSON.stringify(evaluations, null, 2)}

Provide:
1. Top 5 priority recommendations
2. Quick wins (easy to implement)
3. Long-term improvements
4. Expert insights from educational research

Format as JSON.`;

    try {
      const response = await groqClient.chat([
        { role: 'system', content: prompt },
        { role: 'user', content: 'Generate expert recommendations as JSON.' },
      ], {
        model: groqClient.models.smart,
        temperature: 0.5,
        maxTokens: 2000,
      });

      return this.parseJSON(response.content);
    } catch (error) {
      logError('Expert recommendations error', error);
      return {
        priorities: [],
        quickWins: [],
        longTerm: [],
        insights: [],
      };
    }
  }

  identifyPriorityActions(evaluations) {
    const priorities = [];
    
    // Find lowest scoring areas
    const scores = Object.entries(evaluations)
      .map(([key, evaluation]) => ({ key, score: evaluation.score || 0 }))
      .sort((a, b) => a.score - b.score);
    
    // Top 3 priorities
    for (let i = 0; i < Math.min(3, scores.length); i++) {
      priorities.push({
        area: scores[i].key,
        score: scores[i].score,
        action: `Improve ${scores[i].key} (current score: ${Math.round(scores[i].score * 100)}%)`,
      });
    }
    
    return priorities;
  }

  checkCompliance(evaluations) {
    const compliance = {
      wcag: evaluations.accessibility?.complianceLevel || 'Not Assessed',
      udl: evaluations.universalDesign?.passed ? 'Compliant' : 'Needs Improvement',
      idea: evaluations.specialNeeds?.passed ? 'Compliant' : 'Needs Improvement',
    };
    
    return compliance;
  }

  getGradeBand(grade) {
    if (grade <= -1) return 'Preschool';
    if (grade === 0) return 'Pre-K';
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  getAgeGroup(grade) {
    if (grade <= -1) return '3-4 years';
    if (grade === 0) return '4-5 years';
    if (grade <= 2) return '5-8 years';
    if (grade <= 5) return '8-11 years';
    if (grade <= 8) return '11-14 years';
    return '14-18 years';
  }

  parseJSON(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      return {};
    }
  }
}

export const comprehensiveClassroomEvaluationService = new ComprehensiveClassroomEvaluationService();
export default comprehensiveClassroomEvaluationService;

