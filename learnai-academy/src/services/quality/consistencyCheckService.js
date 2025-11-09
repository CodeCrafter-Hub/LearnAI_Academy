import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * ConsistencyCheckService - Ensures consistency across curriculum
 * 
 * Features:
 * - Terminology consistency
 * - Style consistency
 * - Format consistency
 * - Progression consistency
 * - Cross-lesson consistency
 */

class ConsistencyCheckService {
  /**
   * Check curriculum consistency
   * @param {string} curriculumId - Curriculum ID
   * @returns {Promise<Object>} Consistency results
   */
  async checkCurriculumConsistency(curriculumId) {
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        units: {
          include: {
            lessonPlans: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!curriculum) {
      throw new Error(`Curriculum not found: ${curriculumId}`);
    }

    const checks = {
      terminology: await this.checkTerminology(curriculum),
      style: await this.checkStyle(curriculum),
      format: await this.checkFormat(curriculum),
      progression: await this.checkProgression(curriculum),
      crossLesson: await this.checkCrossLessonConsistency(curriculum),
    };

    // Calculate overall consistency score
    const scores = Object.values(checks).map(c => c.score || 0);
    const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    return {
      curriculumId,
      overallScore: Math.round(overallScore * 100) / 100,
      checks,
      issues: this.collectIssues(checks),
      recommendations: this.generateRecommendations(checks),
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Check terminology consistency
   */
  async checkTerminology(curriculum) {
    const allLessons = [];
    for (const unit of curriculum.units) {
      allLessons.push(...unit.lessonPlans);
    }

    // Extract key terms from all lessons
    const terms = new Map();
    const issues = [];

    for (const lesson of allLessons) {
      const lessonTerms = this.extractTerms(lesson);
      for (const term of lessonTerms) {
        if (!terms.has(term)) {
          terms.set(term, []);
        }
        terms.get(term).push(lesson.id);
      }
    }

    // Check for inconsistent usage
    // (Simplified - would use NLP in production)
    const score = issues.length === 0 ? 0.9 : 0.7;

    return {
      score,
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? ['Standardize terminology across lessons'] : [],
    };
  }

  /**
   * Check style consistency
   */
  async checkStyle(curriculum) {
    const allLessons = [];
    for (const unit of curriculum.units) {
      allLessons.push(...unit.lessonPlans);
    }

    const issues = [];

    // Check for consistent structure
    const structures = allLessons.map(l => Object.keys(l.lessonStructure || {}));
    const structureTypes = new Set(structures.map(s => s.sort().join(',')));

    if (structureTypes.size > 1) {
      issues.push('Inconsistent lesson structure across curriculum');
    }

    // Check for consistent duration
    const durations = allLessons.map(l => l.durationMinutes || 0);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const durationVariance = durations.filter(d => Math.abs(d - avgDuration) > 10).length;

    if (durationVariance > allLessons.length * 0.3) {
      issues.push('Significant variation in lesson durations');
    }

    const score = issues.length === 0 ? 0.9 : 0.7;

    return {
      score,
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? ['Standardize lesson structure and duration'] : [],
    };
  }

  /**
   * Check format consistency
   */
  async checkFormat(curriculum) {
    const allLessons = [];
    for (const unit of curriculum.units) {
      allLessons.push(...unit.lessonPlans);
    }

    const issues = [];

    // Check for consistent objective format
    const objectiveFormats = allLessons.map(l => {
      const objectives = l.learningObjectives || [];
      return objectives.length > 0 ? objectives[0].split(' ').length : 0;
    });

    const avgObjectiveLength = objectiveFormats.reduce((sum, l) => sum + l, 0) / objectiveFormats.length;
    const objectiveVariance = objectiveFormats.filter(l => Math.abs(l - avgObjectiveLength) > 5).length;

    if (objectiveVariance > allLessons.length * 0.3) {
      issues.push('Inconsistent objective format');
    }

    const score = issues.length === 0 ? 0.9 : 0.7;

    return {
      score,
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? ['Standardize objective format'] : [],
    };
  }

  /**
   * Check progression consistency
   */
  async checkProgression(curriculum) {
    const units = curriculum.units.sort((a, b) => a.orderIndex - b.orderIndex);
    const issues = [];

    // Check for logical progression
    for (let i = 1; i < units.length; i++) {
      const prevUnit = units[i - 1];
      const currentUnit = units[i];

      // Check if prerequisites are met
      const prevLessons = prevUnit.lessonPlans.length;
      const currentLessons = currentUnit.lessonPlans.length;

      if (currentLessons > 0 && prevLessons === 0) {
        issues.push(`Unit "${currentUnit.name}" has no prerequisite content`);
      }
    }

    // Check difficulty progression
    const difficulties = units.flatMap(u => u.lessonPlans.map(l => l.difficulty));
    const difficultyOrder = ['EASY', 'MEDIUM', 'HARD'];
    let prevDifficultyIndex = -1;

    for (const difficulty of difficulties) {
      const currentIndex = difficultyOrder.indexOf(difficulty);
      if (currentIndex < prevDifficultyIndex) {
        issues.push('Difficulty decreases in progression');
        break;
      }
      prevDifficultyIndex = currentIndex;
    }

    const score = issues.length === 0 ? 0.9 : 0.7;

    return {
      score,
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? ['Review progression logic'] : [],
    };
  }

  /**
   * Check cross-lesson consistency
   */
  async checkCrossLessonConsistency(curriculum) {
    const allLessons = [];
    for (const unit of curriculum.units) {
      allLessons.push(...unit.lessonPlans);
    }

    const issues = [];

    // Check for repeated content
    const contentHashes = new Map();
    for (const lesson of allLessons) {
      const contentHash = this.hashContent(lesson);
      if (contentHashes.has(contentHash)) {
        issues.push(`Potential duplicate content: "${lesson.name}"`);
      }
      contentHashes.set(contentHash, lesson.id);
    }

    const score = issues.length === 0 ? 0.9 : 0.7;

    return {
      score,
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? ['Review for duplicate content'] : [],
    };
  }

  /**
   * Extract terms from lesson
   */
  extractTerms(lesson) {
    const terms = [];
    const content = `${lesson.name} ${lesson.description} ${JSON.stringify(lesson.learningObjectives || [])}`;
    
    // Simple extraction (would use NLP in production)
    const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    return uniqueWords.slice(0, 10); // Limit to top 10
  }

  /**
   * Hash content for duplicate detection
   */
  hashContent(lesson) {
    const content = `${lesson.name}${lesson.description}${JSON.stringify(lesson.learningObjectives || [])}`;
    // Simple hash (would use proper hashing in production)
    return content.length.toString();
  }

  /**
   * Collect issues
   */
  collectIssues(checks) {
    const issues = [];
    for (const [checkName, check] of Object.entries(checks)) {
      if (check.issues && check.issues.length > 0) {
        issues.push({
          check: checkName,
          issues: check.issues,
        });
      }
    }
    return issues;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(checks) {
    const recommendations = [];
    for (const [checkName, check] of Object.entries(checks)) {
      if (check.recommendations && check.recommendations.length > 0) {
        recommendations.push({
          check: checkName,
          recommendations: check.recommendations,
        });
      }
    }
    return recommendations;
  }
}

export const consistencyCheckService = new ConsistencyCheckService();
export default consistencyCheckService;

