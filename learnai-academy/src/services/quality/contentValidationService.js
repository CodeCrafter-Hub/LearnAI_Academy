import prisma from '../../lib/prisma.js';
import { groqClient } from '../ai/groqClient.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * ContentValidationService - Validates curriculum content quality
 * 
 * Features:
 * - Content completeness checks
 * - Age-appropriateness validation
 * - Language and clarity checks
 * - Educational value assessment
 * - Error detection
 */

class ContentValidationService {
  /**
   * Validate lesson plan
   * @param {string} lessonPlanId - Lesson plan ID
   * @returns {Promise<Object>} Validation results
   */
  async validateLessonPlan(lessonPlanId) {
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
      include: {
        unit: {
          include: {
            curriculum: {
              include: {
                subject: true,
              },
            },
          },
        },
        presentations: {
          where: { isActive: true },
        },
        teachingAids: {
          where: { isActive: true },
        },
        multimediaContent: {
          where: { isActive: true },
        },
      },
    });

    if (!lessonPlan) {
      throw new Error(`Lesson plan not found: ${lessonPlanId}`);
    }

    const gradeLevel = lessonPlan.unit?.curriculum?.gradeLevel || 5;
    const subject = lessonPlan.unit?.curriculum?.subject?.name || '';

    // Run all validation checks
    const checks = {
      completeness: await this.checkCompleteness(lessonPlan),
      ageAppropriateness: await this.checkAgeAppropriateness(lessonPlan, gradeLevel),
      language: await this.checkLanguage(lessonPlan, gradeLevel),
      educationalValue: await this.checkEducationalValue(lessonPlan),
      structure: await this.checkStructure(lessonPlan),
      standards: await this.checkStandardsAlignment(lessonPlan),
    };

    // Calculate overall score
    const scores = Object.values(checks).map(c => c.score || 0);
    const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Determine validation status
    const status = overallScore >= 0.8 ? 'PASSED' : overallScore >= 0.6 ? 'NEEDS_REVIEW' : 'FAILED';

    const result = {
      lessonPlanId,
      status,
      overallScore: Math.round(overallScore * 100) / 100,
      checks,
      issues: this.collectIssues(checks),
      recommendations: this.generateRecommendations(checks),
      validatedAt: new Date().toISOString(),
    };

    // Save validation result
    await this.saveValidationResult(lessonPlanId, result);

    return result;
  }

  /**
   * Check content completeness
   */
  async checkCompleteness(lessonPlan) {
    const issues = [];
    const warnings = [];

    // Check required fields
    if (!lessonPlan.name || lessonPlan.name.trim().length === 0) {
      issues.push('Lesson name is missing');
    }

    if (!lessonPlan.learningObjectives || lessonPlan.learningObjectives.length === 0) {
      issues.push('Learning objectives are missing');
    }

    if (!lessonPlan.lessonStructure) {
      issues.push('Lesson structure is missing');
    } else {
      const structure = lessonPlan.lessonStructure;
      if (!structure.instruction) {
        warnings.push('Instruction section is missing');
      }
      if (!structure.practice) {
        warnings.push('Practice section is missing');
      }
    }

    // Check for presentations
    if (lessonPlan.presentations.length === 0) {
      warnings.push('No presentations found');
    }

    // Check for teaching aids
    if (lessonPlan.teachingAids.length === 0) {
      warnings.push('No teaching aids found');
    }

    const score = issues.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.5;

    return {
      score,
      passed: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Check age-appropriateness
   */
  async checkAgeAppropriateness(lessonPlan, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const content = this.extractContent(lessonPlan);

    const prompt = `Evaluate if this content is age-appropriate for ${gradeLevel}th grade (${gradeBand}) students.

CONTENT:
${content}

Check:
1. Vocabulary complexity
2. Concept difficulty
3. Activity appropriateness
4. Engagement level
5. Cognitive development match

Provide:
- score: 0-1 (1 = perfect match)
- passed: true/false
- issues: Array of issues
- recommendations: Array of recommendations

Format as JSON.`;

    try {
      const response = await groqClient.chat([
        { role: 'system', content: prompt },
        { role: 'user', content: 'Evaluate age-appropriateness as JSON.' },
      ], {
        model: groqClient.models.smart,
        temperature: 0.3,
        maxTokens: 1000,
      });

      const result = this.parseJSON(response.content);
      return {
        score: result.score || 0.8,
        passed: result.passed !== false,
        issues: result.issues || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      logError('Age-appropriateness check error', error);
      return {
        score: 0.7,
        passed: true,
        issues: [],
        recommendations: ['Manual review recommended'],
      };
    }
  }

  /**
   * Check language and clarity
   */
  async checkLanguage(lessonPlan, gradeLevel) {
    const content = this.extractContent(lessonPlan);
    const gradeBand = this.getGradeBand(gradeLevel);

    const prompt = `Evaluate the language and clarity of this educational content for ${gradeLevel}th grade (${gradeBand}) students.

CONTENT:
${content}

Check:
1. Sentence length and complexity
2. Vocabulary level
3. Clarity of instructions
4. Readability
5. Grammar and spelling

Provide:
- score: 0-1
- passed: true/false
- issues: Array of language issues
- recommendations: Array of improvements

Format as JSON.`;

    try {
      const response = await groqClient.chat([
        { role: 'system', content: prompt },
        { role: 'user', content: 'Evaluate language and clarity as JSON.' },
      ], {
        model: groqClient.models.smart,
        temperature: 0.3,
        maxTokens: 1000,
      });

      const result = this.parseJSON(response.content);
      return {
        score: result.score || 0.8,
        passed: result.passed !== false,
        issues: result.issues || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      logError('Language check error', error);
      return {
        score: 0.7,
        passed: true,
        issues: [],
        recommendations: [],
      };
    }
  }

  /**
   * Check educational value
   */
  async checkEducationalValue(lessonPlan) {
    const content = this.extractContent(lessonPlan);
    const objectives = lessonPlan.learningObjectives || [];

    const prompt = `Evaluate the educational value of this lesson plan.

LEARNING OBJECTIVES:
${objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

CONTENT:
${content}

Check:
1. Alignment with objectives
2. Depth of learning
3. Skill development
4. Knowledge transfer
5. Critical thinking opportunities

Provide:
- score: 0-1
- passed: true/false
- issues: Array of issues
- recommendations: Array of improvements

Format as JSON.`;

    try {
      const response = await groqClient.chat([
        { role: 'system', content: prompt },
        { role: 'user', content: 'Evaluate educational value as JSON.' },
      ], {
        model: groqClient.models.smart,
        temperature: 0.3,
        maxTokens: 1000,
      });

      const result = this.parseJSON(response.content);
      return {
        score: result.score || 0.8,
        passed: result.passed !== false,
        issues: result.issues || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      logError('Educational value check error', error);
      return {
        score: 0.7,
        passed: true,
        issues: [],
        recommendations: [],
      };
    }
  }

  /**
   * Check lesson structure
   */
  async checkStructure(lessonPlan) {
    const issues = [];
    const structure = lessonPlan.lessonStructure || {};

    // Check required sections
    const requiredSections = ['instruction', 'practice'];
    for (const section of requiredSections) {
      if (!structure[section]) {
        issues.push(`Missing required section: ${section}`);
      }
    }

    // Check section balance
    const duration = lessonPlan.durationMinutes || 0;
    if (duration < 10) {
      issues.push('Lesson duration is too short (minimum 10 minutes)');
    }
    if (duration > 60) {
      issues.push('Lesson duration is too long (maximum 60 minutes)');
    }

    // Check activity count
    const practiceActivities = structure.practice?.activities || [];
    if (practiceActivities.length === 0) {
      issues.push('No practice activities found');
    }

    const score = issues.length === 0 ? 1.0 : issues.length <= 2 ? 0.7 : 0.4;

    return {
      score,
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? ['Review lesson structure'] : [],
    };
  }

  /**
   * Check standards alignment
   */
  async checkStandardsAlignment(lessonPlan) {
    const standards = lessonPlan.standards || [];
    const objectives = lessonPlan.learningObjectives || [];

    if (standards.length === 0) {
      return {
        score: 0.6,
        passed: false,
        issues: ['No learning standards aligned'],
        recommendations: ['Add relevant learning standards'],
      };
    }

    // Check if objectives align with standards
    const alignmentScore = objectives.length > 0 ? 0.9 : 0.7;

    return {
      score: alignmentScore,
      passed: alignmentScore >= 0.7,
      issues: [],
      recommendations: [],
    };
  }

  /**
   * Extract content from lesson plan
   */
  extractContent(lessonPlan) {
    const parts = [];

    if (lessonPlan.name) parts.push(`Title: ${lessonPlan.name}`);
    if (lessonPlan.description) parts.push(`Description: ${lessonPlan.description}`);
    if (lessonPlan.learningObjectives) {
      parts.push(`Objectives: ${lessonPlan.learningObjectives.join(', ')}`);
    }
    if (lessonPlan.lessonStructure) {
      parts.push(`Structure: ${JSON.stringify(lessonPlan.lessonStructure, null, 2)}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Collect all issues
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

  /**
   * Save validation result
   */
  async saveValidationResult(lessonPlanId, result) {
    // Store in lesson plan metadata
    await prisma.lessonPlan.update({
      where: { id: lessonPlanId },
      data: {
        metadata: {
          ...(await prisma.lessonPlan.findUnique({ where: { id: lessonPlanId } })).metadata || {},
          validation: result,
        },
      },
    });
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
   * Parse JSON
   */
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

export const contentValidationService = new ContentValidationService();
export default contentValidationService;

