import { standardsService } from './standardsService.js';

/**
 * ContentValidator - Validates generated curriculum content
 * 
 * Ensures content quality, age-appropriateness, and standards alignment
 */

class ContentValidator {
  /**
   * Validate lesson plan
   */
  async validateLessonPlan(lessonPlan, gradeLevel, standards) {
    const issues = [];
    const warnings = [];

    // Check 1: Required sections
    const requiredSections = ['objectives', 'keyConcepts', 'lessonStructure'];
    const optionalSections = ['examples', 'activities', 'assessments', 'practiceProblems'];
    
    for (const section of requiredSections) {
      if (!this.hasSection(lessonPlan, section)) {
        issues.push({
          type: 'missing_section',
          section,
          severity: 'error',
        });
      }
    }

    // Check 2: Standards alignment
    if (standards && standards.length > 0) {
      const alignment = standardsService.validateAgainstStandards(lessonPlan, standards);
      if (!alignment.aligned) {
        issues.push({
          type: 'no_standards_alignment',
          severity: 'error',
        });
      } else if (alignment.alignmentScore < 0.5) {
        warnings.push({
          type: 'low_standards_alignment',
          score: alignment.alignmentScore,
          severity: 'warning',
        });
      }
    }

    // Check 3: Age appropriateness
    const ageCheck = this.checkAgeAppropriateness(lessonPlan, gradeLevel);
    if (!ageCheck.valid) {
      issues.push({
        type: 'age_inappropriate',
        details: ageCheck.issues,
        severity: 'error',
      });
    }

    // Check 4: Content quality
    const qualityScore = this.assessQuality(lessonPlan);
    if (qualityScore < 0.7) {
      warnings.push({
        type: 'low_quality',
        score: qualityScore,
        severity: 'warning',
      });
    }

    // Check 5: Completeness
    const completeness = this.checkCompleteness(lessonPlan);
    if (completeness < 0.8) {
      warnings.push({
        type: 'incomplete',
        score: completeness,
        severity: 'warning',
      });
    }

    return {
      valid: issues.length === 0,
      qualityScore,
      completeness,
      issues,
      warnings,
    };
  }

  /**
   * Validate practice problems
   */
  async validatePracticeProblems(problems, gradeLevel, difficulty) {
    const issues = [];
    const warnings = [];

    if (!Array.isArray(problems) || problems.length === 0) {
      issues.push({
        type: 'no_problems',
        severity: 'error',
      });
      return { valid: false, issues, warnings };
    }

    for (const [index, problem] of problems.entries()) {
      // Check required fields
      if (!problem.problem || !problem.answer) {
        issues.push({
          type: 'incomplete_problem',
          index,
          severity: 'error',
        });
      }

      // Check age appropriateness
      const ageCheck = this.checkProblemAgeAppropriateness(problem, gradeLevel);
      if (!ageCheck.valid) {
        warnings.push({
          type: 'age_inappropriate_problem',
          index,
          details: ageCheck.issues,
          severity: 'warning',
        });
      }

      // Check difficulty match
      if (problem.difficulty && problem.difficulty !== difficulty) {
        warnings.push({
          type: 'difficulty_mismatch',
          index,
          expected: difficulty,
          actual: problem.difficulty,
          severity: 'warning',
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Check if lesson plan has a section
   */
  hasSection(lessonPlan, section) {
    if (typeof lessonPlan === 'string') {
      return lessonPlan.toLowerCase().includes(section.toLowerCase());
    }
    
    if (typeof lessonPlan === 'object') {
      // Check various possible formats
      return (
        lessonPlan[section] ||
        lessonPlan[section.toLowerCase()] ||
        lessonPlan[this.camelCase(section)] ||
        JSON.stringify(lessonPlan).toLowerCase().includes(section.toLowerCase())
      );
    }

    return false;
  }

  /**
   * Check age appropriateness
   */
  checkAgeAppropriateness(content, gradeLevel) {
    const issues = [];
    const contentText = typeof content === 'string' 
      ? content 
      : JSON.stringify(content);

    // Check for inappropriate vocabulary
    const gradeBand = this.getGradeBand(gradeLevel);
    const inappropriateTerms = this.getInappropriateTerms(gradeBand);

    for (const term of inappropriateTerms) {
      if (contentText.toLowerCase().includes(term.toLowerCase())) {
        issues.push(`Contains term inappropriate for ${gradeBand}: ${term}`);
      }
    }

    // Check reading level (simple heuristic)
    const avgWordsPerSentence = this.calculateAvgWordsPerSentence(contentText);
    const expectedRange = this.getExpectedSentenceLength(gradeBand);

    if (avgWordsPerSentence > expectedRange.max) {
      issues.push(`Sentences too complex for ${gradeBand} (avg ${avgWordsPerSentence.toFixed(1)} words, expected <${expectedRange.max})`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Assess content quality
   */
  assessQuality(content) {
    let score = 0;
    const contentText = typeof content === 'string' 
      ? content 
      : JSON.stringify(content);

    // Factor 1: Length (20%)
    const length = contentText.length;
    if (length > 500) score += 0.2;
    else if (length > 200) score += 0.1;

    // Factor 2: Structure (30%)
    const hasStructure = this.hasStructure(content);
    if (hasStructure) score += 0.3;

    // Factor 3: Completeness (30%)
    const completeness = this.checkCompleteness(content);
    score += completeness * 0.3;

    // Factor 4: Clarity (20%)
    const clarity = this.assessClarity(contentText);
    score += clarity * 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * Check completeness
   */
  checkCompleteness(content) {
    if (typeof content === 'string') {
      // Simple heuristic: check for key indicators
      const indicators = ['objective', 'concept', 'example', 'activity', 'assessment'];
      const found = indicators.filter(ind => 
        content.toLowerCase().includes(ind)
      );
      return found.length / indicators.length;
    }

    if (typeof content === 'object') {
      const requiredKeys = ['objectives', 'keyConcepts', 'lessonStructure'];
      const found = requiredKeys.filter(key => content[key]);
      return found.length / requiredKeys.length;
    }

    return 0.5; // Default score
  }

  /**
   * Assess clarity
   */
  assessClarity(text) {
    // Simple heuristic: check for clear language
    const unclearPatterns = [
      /\b(?:very|extremely|quite|rather)\s+(?:very|extremely|quite|rather)\b/gi,
      /\b(?:thing|stuff|something|anything)\b/gi,
    ];

    let clarityScore = 1.0;
    for (const pattern of unclearPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        clarityScore -= matches.length * 0.05;
      }
    }

    return Math.max(0, clarityScore);
  }

  /**
   * Check if content has structure
   */
  hasStructure(content) {
    if (typeof content === 'object') {
      return Object.keys(content).length > 3;
    }
    
    if (typeof content === 'string') {
      // Check for structured formatting
      return (
        content.includes('\n') ||
        content.includes('#') ||
        content.includes('1.') ||
        content.includes('-')
      );
    }

    return false;
  }

  /**
   * Check problem age appropriateness
   */
  checkProblemAgeAppropriateness(problem, gradeLevel) {
    const issues = [];
    const problemText = problem.problem || '';

    // Check number complexity
    const numbers = problemText.match(/\d+/g) || [];
    const maxNumber = numbers.length > 0 
      ? Math.max(...numbers.map(n => parseInt(n)))
      : 0;

    const gradeBand = this.getGradeBand(gradeLevel);
    const maxExpected = this.getMaxNumberForGrade(gradeBand);

    if (maxNumber > maxExpected) {
      issues.push(`Numbers too large for ${gradeBand} (found ${maxNumber}, expected <${maxExpected})`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Helper methods
   */
  getGradeBand(grade) {
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  getInappropriateTerms(gradeBand) {
    // Terms that might be too advanced or inappropriate
    const terms = {
      'K-2': ['calculus', 'quantum', 'philosophical', 'abstract'],
      '3-5': ['calculus', 'quantum', 'philosophical'],
      '6-8': ['calculus'],
      '9-12': [],
    };
    return terms[gradeBand] || [];
  }

  getExpectedSentenceLength(gradeBand) {
    return {
      'K-2': { max: 10 },
      '3-5': { max: 15 },
      '6-8': { max: 20 },
      '9-12': { max: 25 },
    }[gradeBand] || { max: 15 };
  }

  getMaxNumberForGrade(gradeBand) {
    return {
      'K-2': 100,
      '3-5': 1000,
      '6-8': 10000,
      '9-12': 1000000,
    }[gradeBand] || 1000;
  }

  calculateAvgWordsPerSentence(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = sentences.reduce((sum, s) => {
      return sum + s.trim().split(/\s+/).length;
    }, 0);
    
    return totalWords / sentences.length;
  }

  camelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
}

export const contentValidator = new ContentValidator();
export default contentValidator;

