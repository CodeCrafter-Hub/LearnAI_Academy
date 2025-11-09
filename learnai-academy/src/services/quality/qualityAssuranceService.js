import prisma from '../../lib/prisma.js';
import { contentValidationService } from './contentValidationService.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * QualityAssuranceService - Comprehensive quality checks
 * 
 * Features:
 * - Quality scoring
 * - Quality gates
 * - Automated quality checks
 * - Quality reports
 */

class QualityAssuranceService {
  /**
   * Run quality assurance check
   * @param {string} lessonPlanId - Lesson plan ID
   * @returns {Promise<Object>} QA results
   */
  async runQualityCheck(lessonPlanId) {
    // Run validation first
    const validation = await contentValidationService.validateLessonPlan(lessonPlanId);

    // Additional quality checks
    const qualityChecks = {
      validation,
      accessibility: await this.checkAccessibility(lessonPlanId),
      engagement: await this.checkEngagement(lessonPlanId),
      diversity: await this.checkDiversity(lessonPlanId),
      safety: await this.checkSafety(lessonPlanId),
    };

    // Calculate overall quality score
    const scores = [
      validation.overallScore,
      qualityChecks.accessibility.score,
      qualityChecks.engagement.score,
      qualityChecks.diversity.score,
      qualityChecks.safety.score,
    ];

    const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Determine quality level
    const qualityLevel = this.getQualityLevel(overallScore);

    // Check if passes quality gates
    const passesGates = this.checkQualityGates(qualityChecks);

    const result = {
      lessonPlanId,
      overallScore: Math.round(overallScore * 100) / 100,
      qualityLevel,
      passesGates,
      checks: qualityChecks,
      approved: passesGates && overallScore >= 0.7,
      recommendations: this.generateQualityRecommendations(qualityChecks),
      checkedAt: new Date().toISOString(),
    };

    // Save QA result
    await this.saveQAResult(lessonPlanId, result);

    return result;
  }

  /**
   * Check accessibility
   */
  async checkAccessibility(lessonPlanId) {
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
      include: {
        presentations: {
          where: { isActive: true },
        },
        multimediaContent: {
          where: { isActive: true },
        },
      },
    });

    const issues = [];
    const warnings = [];

    // Check for captions in videos
    const videos = lessonPlan.multimediaContent.filter(m => m.contentType === 'VIDEO');
    for (const video of videos) {
      if (!video.captions) {
        issues.push(`Video "${video.title}" is missing captions`);
      }
    }

    // Check for transcripts in audio
    const audio = lessonPlan.multimediaContent.filter(m => m.contentType === 'AUDIO');
    for (const aud of audio) {
      if (!aud.transcript) {
        warnings.push(`Audio "${aud.title}" is missing transcript`);
      }
    }

    // Check for alt text in presentations (would need to check presentation content)
    if (lessonPlan.presentations.length > 0) {
      warnings.push('Verify alt text for images in presentations');
    }

    const score = issues.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.6;

    return {
      score,
      passed: issues.length === 0,
      issues,
      warnings,
      recommendations: issues.length > 0 ? ['Add captions to videos', 'Add transcripts to audio'] : [],
    };
  }

  /**
   * Check engagement
   */
  async checkEngagement(lessonPlanId) {
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
    });

    const structure = lessonPlan.lessonStructure || {};
    const issues = [];

    // Check for interactive elements
    const practiceActivities = structure.practice?.activities || [];
    if (practiceActivities.length === 0) {
      issues.push('No interactive activities found');
    }

    // Check for multimedia
    const hasMultimedia = await prisma.multimediaContent.count({
      where: {
        lessonPlanId,
        isActive: true,
      },
    }) > 0;

    if (!hasMultimedia) {
      issues.push('No multimedia content found');
    }

    // Check for variety
    const hasVariety = practiceActivities.length >= 3;
    if (!hasVariety) {
      warnings.push('Limited activity variety');
    }

    const score = issues.length === 0 ? (hasVariety ? 1.0 : 0.8) : 0.6;

    return {
      score,
      passed: issues.length === 0,
      issues,
      warnings: warnings || [],
      recommendations: issues.length > 0 ? ['Add interactive activities', 'Include multimedia content'] : [],
    };
  }

  /**
   * Check diversity and inclusion
   */
  async checkDiversity(lessonPlanId) {
    // Placeholder - would check for diverse examples, inclusive language, etc.
    return {
      score: 0.8,
      passed: true,
      issues: [],
      warnings: [],
      recommendations: ['Review content for diversity and inclusion'],
    };
  }

  /**
   * Check safety
   */
  async checkSafety(lessonPlanId) {
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
    });

    const content = this.extractContent(lessonPlan);
    const issues = [];

    // Check for inappropriate content (basic keyword check)
    const inappropriateKeywords = ['violence', 'weapon', 'dangerous'];
    const lowerContent = content.toLowerCase();

    for (const keyword of inappropriateKeywords) {
      if (lowerContent.includes(keyword)) {
        issues.push(`Potential safety concern: "${keyword}" found in content`);
      }
    }

    const score = issues.length === 0 ? 1.0 : 0.5;

    return {
      score,
      passed: issues.length === 0,
      issues,
      warnings: [],
      recommendations: issues.length > 0 ? ['Review content for safety concerns'] : [],
    };
  }

  /**
   * Get quality level
   */
  getQualityLevel(score) {
    if (score >= 0.9) return 'EXCELLENT';
    if (score >= 0.8) return 'GOOD';
    if (score >= 0.7) return 'ACCEPTABLE';
    if (score >= 0.6) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }

  /**
   * Check quality gates
   */
  checkQualityGates(checks) {
    // All critical checks must pass
    const criticalChecks = ['validation', 'safety'];
    
    for (const checkName of criticalChecks) {
      if (!checks[checkName]?.passed) {
        return false;
      }
    }

    // Overall score threshold
    const scores = Object.values(checks).map(c => c.score || 0);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    return avgScore >= 0.7;
  }

  /**
   * Generate quality recommendations
   */
  generateQualityRecommendations(checks) {
    const recommendations = [];

    for (const [checkName, check] of Object.entries(checks)) {
      if (check.recommendations && check.recommendations.length > 0) {
        recommendations.push({
          area: checkName,
          recommendations: check.recommendations,
        });
      }
    }

    return recommendations;
  }

  /**
   * Save QA result
   */
  async saveQAResult(lessonPlanId, result) {
    await prisma.lessonPlan.update({
      where: { id: lessonPlanId },
      data: {
        metadata: {
          ...(await prisma.lessonPlan.findUnique({ where: { id: lessonPlanId } })).metadata || {},
          qualityAssurance: result,
        },
      },
    });
  }

  /**
   * Extract content
   */
  extractContent(lessonPlan) {
    return `${lessonPlan.name || ''} ${lessonPlan.description || ''} ${JSON.stringify(lessonPlan.lessonStructure || {})}`;
  }
}

export const qualityAssuranceService = new QualityAssuranceService();
export default qualityAssuranceService;

