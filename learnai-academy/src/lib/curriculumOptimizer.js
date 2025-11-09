/**
 * Curriculum Optimization System
 * Continuously improves curriculum based on student performance data
 */

import { CurriculumAgent } from './curriculumAgent';
import { CurriculumStorage } from './curriculumStorage';
import { CurriculumService } from './curriculumService';

/**
 * Curriculum Optimizer - Continuous improvement engine
 */
export class CurriculumOptimizer {
  constructor(agent, storage, service) {
    this.agent = agent;
    this.storage = storage;
    this.service = service;
    this.optimizationSchedule = null;
  }

  /**
   * Analyze curriculum and determine if optimization is needed
   */
  async analyzeCurriculum(gradeLevel, subject) {
    const performanceData = await this.storage.getPerformanceData(gradeLevel, subject);
    const feedback = await this.storage.getFeedback(gradeLevel, subject);

    // Need minimum sample size for reliable optimization
    if (performanceData.sampleSize < 30) {
      return {
        needsOptimization: false,
        reason: 'insufficient-data',
        sampleSize: performanceData.sampleSize,
        minimumRequired: 30,
      };
    }

    // Analyze metrics
    const metrics = this.calculateOptimizationMetrics(performanceData, feedback);

    // Determine if optimization is needed
    const needsOptimization = this.shouldOptimize(metrics);

    return {
      needsOptimization,
      metrics,
      recommendations: this.generateRecommendations(metrics),
      priority: this.calculatePriority(metrics),
    };
  }

  /**
   * Calculate metrics for optimization decision
   */
  calculateOptimizationMetrics(performanceData, feedback) {
    const metrics = {
      overallAccuracy: performanceData.overallStats.accuracy,
      topicMetrics: {},
      feedbackScore: this.calculateFeedbackScore(feedback),
      issues: [],
    };

    // Analyze each topic
    Object.entries(performanceData.topicPerformance).forEach(([topicId, stats]) => {
      const topicMetrics = {
        accuracy: stats.accuracy,
        studentCount: stats.studentCount,
        averageTime: stats.averageTime,
        averageDifficulty: stats.averageDifficulty,
        issues: [],
      };

      // Identify issues
      if (stats.accuracy < 50) {
        topicMetrics.issues.push({
          type: 'low-accuracy',
          severity: 'high',
          message: `Only ${stats.accuracy.toFixed(1)}% accuracy - topic too difficult`,
        });
        metrics.issues.push({ topicId, issue: 'low-accuracy', severity: 'high' });
      } else if (stats.accuracy > 95) {
        topicMetrics.issues.push({
          type: 'too-easy',
          severity: 'medium',
          message: `${stats.accuracy.toFixed(1)}% accuracy - topic may be too easy`,
        });
        metrics.issues.push({ topicId, issue: 'too-easy', severity: 'medium' });
      }

      if (stats.averageTime < stats.expectedTime * 0.5) {
        topicMetrics.issues.push({
          type: 'rushing',
          severity: 'low',
          message: 'Students completing too quickly - may need depth',
        });
      }

      if (stats.studentCount < 5) {
        topicMetrics.issues.push({
          type: 'low-engagement',
          severity: 'medium',
          message: 'Few students reaching this topic - check prerequisites',
        });
      }

      metrics.topicMetrics[topicId] = topicMetrics;
    });

    return metrics;
  }

  /**
   * Calculate feedback score from teacher/student feedback
   */
  calculateFeedbackScore(feedback) {
    if (!feedback || feedback.length === 0) {
      return null;
    }

    const totalRating = feedback.reduce((sum, f) => sum + (f.rating || 3), 0);
    const averageRating = totalRating / feedback.length;

    const negativeFeedback = feedback.filter((f) => f.rating <= 2).length;
    const positiveFeedback = feedback.filter((f) => f.rating >= 4).length;

    return {
      averageRating,
      totalFeedback: feedback.length,
      negativeFeedback,
      positiveFeedback,
      needsAttention: averageRating < 3 || negativeFeedback > feedback.length * 0.3,
    };
  }

  /**
   * Determine if curriculum should be optimized
   */
  shouldOptimize(metrics) {
    // Optimize if overall accuracy is poor
    if (metrics.overallAccuracy < 60) {
      return true;
    }

    // Optimize if multiple topics have issues
    if (metrics.issues.filter((i) => i.severity === 'high').length >= 3) {
      return true;
    }

    // Optimize if feedback is negative
    if (metrics.feedbackScore?.needsAttention) {
      return true;
    }

    // Optimize if many topics are too easy or too hard
    const extremeTopics = Object.values(metrics.topicMetrics).filter(
      (tm) => tm.accuracy < 50 || tm.accuracy > 95
    );

    if (extremeTopics.length > 5) {
      return true;
    }

    return false;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(metrics) {
    const recommendations = [];

    // Topic-specific recommendations
    Object.entries(metrics.topicMetrics).forEach(([topicId, topicMetrics]) => {
      topicMetrics.issues.forEach((issue) => {
        const recommendation = {
          topicId,
          issueType: issue.type,
          severity: issue.severity,
          recommendation: this.getIssueRecommendation(issue.type),
          autoFixable: ['too-easy', 'low-accuracy'].includes(issue.type),
        };

        recommendations.push(recommendation);
      });
    });

    // Overall curriculum recommendations
    if (metrics.overallAccuracy < 60) {
      recommendations.push({
        type: 'overall',
        recommendation: 'Reduce overall difficulty and add more scaffolding',
        severity: 'high',
        autoFixable: true,
      });
    }

    if (metrics.feedbackScore?.needsAttention) {
      recommendations.push({
        type: 'feedback',
        recommendation: 'Address negative feedback in curriculum design',
        severity: 'high',
        autoFixable: false, // Needs human review
      });
    }

    return recommendations;
  }

  /**
   * Get recommendation for specific issue type
   */
  getIssueRecommendation(issueType) {
    const recommendations = {
      'low-accuracy': 'Lower difficulty, add more examples, improve scaffolding',
      'too-easy': 'Increase difficulty, add extension activities',
      'low-engagement': 'Review prerequisites, add real-world connections',
      'rushing': 'Add depth, include more problem-solving questions',
    };

    return recommendations[issueType] || 'Review and improve topic';
  }

  /**
   * Calculate priority for optimization
   */
  calculatePriority(metrics) {
    let priority = 0;

    // High priority if many students affected
    const avgStudentCount =
      Object.values(metrics.topicMetrics).reduce((sum, tm) => sum + tm.studentCount, 0) /
      Object.keys(metrics.topicMetrics).length;

    if (avgStudentCount > 50) priority += 3;
    else if (avgStudentCount > 20) priority += 2;
    else priority += 1;

    // High priority if severity is high
    const highSeverityIssues = metrics.issues.filter((i) => i.severity === 'high').length;
    priority += highSeverityIssues * 2;

    // High priority if overall accuracy is very low
    if (metrics.overallAccuracy < 50) priority += 5;
    else if (metrics.overallAccuracy < 60) priority += 3;

    // Priority levels: 1-3: low, 4-6: medium, 7+: high
    if (priority >= 7) return 'high';
    if (priority >= 4) return 'medium';
    return 'low';
  }

  /**
   * Optimize curriculum using AI
   */
  async optimizeCurriculum(gradeLevel, subject) {
    console.log(`Starting optimization for Grade ${gradeLevel} ${subject}...`);

    // Get current curriculum
    const curriculum = await this.storage.getCurriculum(gradeLevel, subject);

    // Get performance data
    const performanceData = await this.storage.getPerformanceData(gradeLevel, subject);

    // Get feedback
    const feedback = await this.storage.getFeedback(gradeLevel, subject);

    // Use AI to refine curriculum
    const refinements = await this.agent.refineCurriculum(
      curriculum.id,
      performanceData,
      feedback
    );

    // Apply refinements
    const updatedCurriculum = {
      ...curriculum,
      curriculum: this.applyRefinements(curriculum.curriculum, refinements),
      lastUpdated: new Date().toISOString(),
      metadata: {
        ...curriculum.metadata,
        version: (parseFloat(curriculum.metadata.version) + 0.1).toFixed(1),
        previousVersion: curriculum.metadata.version,
        optimizedAt: new Date().toISOString(),
        optimizationReason: refinements.analysis,
      },
    };

    // Save updated curriculum
    await this.storage.saveCurriculum(updatedCurriculum);

    // Generate new questions for updated topics if needed
    for (const refinement of refinements.refinements || []) {
      if (refinement.changes.assessmentQuestions) {
        const topic = updatedCurriculum.curriculum.topics.find(
          (t) => t.id === refinement.topicId
        );

        if (topic) {
          const questions = await this.agent.generateAssessmentQuestions(topic, 20);
          await this.storage.saveQuestions(topic.id, questions);
        }
      }
    }

    console.log(`✓ Optimized Grade ${gradeLevel} ${subject} to v${updatedCurriculum.metadata.version}`);

    return {
      success: true,
      previousVersion: curriculum.metadata.version,
      newVersion: updatedCurriculum.metadata.version,
      refinements,
      updatedCurriculum,
    };
  }

  /**
   * Apply refinements to curriculum
   */
  applyRefinements(curriculum, refinements) {
    const updated = { ...curriculum };

    // Apply topic refinements
    refinements.refinements?.forEach((refinement) => {
      const topicIndex = updated.topics.findIndex((t) => t.id === refinement.topicId);

      if (topicIndex !== -1) {
        updated.topics[topicIndex] = {
          ...updated.topics[topicIndex],
          ...refinement.changes,
        };
      }
    });

    // Add new topics
    if (refinements.newTopics && refinements.newTopics.length > 0) {
      updated.topics.push(...refinements.newTopics);
    }

    // Remove deprecated topics
    if (refinements.deprecatedTopics && refinements.deprecatedTopics.length > 0) {
      updated.topics = updated.topics.filter(
        (t) => !refinements.deprecatedTopics.includes(t.id)
      );
    }

    // Re-order topics if needed
    updated.topics.sort((a, b) => (a.order || 0) - (b.order || 0));

    return updated;
  }

  /**
   * Schedule automatic optimization
   */
  startAutoOptimization(interval = 7 * 24 * 60 * 60 * 1000) {
    // Default: weekly
    if (this.optimizationSchedule) {
      clearInterval(this.optimizationSchedule);
    }

    this.optimizationSchedule = setInterval(async () => {
      await this.runAutoOptimization();
    }, interval);

    console.log(`Auto-optimization scheduled every ${interval / (24 * 60 * 60 * 1000)} days`);
  }

  /**
   * Stop automatic optimization
   */
  stopAutoOptimization() {
    if (this.optimizationSchedule) {
      clearInterval(this.optimizationSchedule);
      this.optimizationSchedule = null;
      console.log('Auto-optimization stopped');
    }
  }

  /**
   * Run automatic optimization for all curricula
   */
  async runAutoOptimization() {
    console.log('Starting automatic curriculum optimization...');

    const curricula = await this.storage.getAllCurricula();
    const results = {
      analyzed: 0,
      optimized: 0,
      skipped: 0,
      failed: 0,
    };

    for (const curriculum of curricula) {
      try {
        results.analyzed++;

        // Analyze if optimization is needed
        const analysis = await this.analyzeCurriculum(
          curriculum.gradeLevel,
          curriculum.subject
        );

        if (!analysis.needsOptimization) {
          console.log(
            `Skipping Grade ${curriculum.gradeLevel} ${curriculum.subject}: ${analysis.reason}`
          );
          results.skipped++;
          continue;
        }

        // Only optimize high priority curricula automatically
        if (analysis.priority === 'high') {
          await this.optimizeCurriculum(curriculum.gradeLevel, curriculum.subject);
          results.optimized++;
        } else {
          console.log(
            `Skipping Grade ${curriculum.gradeLevel} ${curriculum.subject}: priority ${analysis.priority}`
          );
          results.skipped++;
        }

        // Rate limit
        await this.delay(2000);
      } catch (error) {
        console.error(
          `Failed to optimize Grade ${curriculum.gradeLevel} ${curriculum.subject}:`,
          error.message
        );
        results.failed++;
      }
    }

    console.log('Auto-optimization complete:', results);
    return results;
  }

  /**
   * Generate optimization report
   */
  async generateOptimizationReport(gradeLevel, subject) {
    const analysis = await this.analyzeCurriculum(gradeLevel, subject);
    const stats = await this.service.getCurriculumStats(gradeLevel, subject);

    return {
      curriculum: {
        gradeLevel,
        subject,
        version: stats.curriculum.version,
        totalTopics: stats.curriculum.totalTopics,
      },
      performance: {
        overallAccuracy: stats.performance.overallAccuracy,
        sampleSize: stats.performance.sampleSize,
      },
      analysis: {
        needsOptimization: analysis.needsOptimization,
        priority: analysis.priority,
        issues: analysis.metrics.issues,
        recommendations: analysis.recommendations,
      },
      topicBreakdown: Object.entries(analysis.metrics.topicMetrics).map(
        ([topicId, metrics]) => ({
          topicId,
          accuracy: metrics.accuracy,
          studentCount: metrics.studentCount,
          issues: metrics.issues,
        })
      ),
      generatedAt: new Date().toISOString(),
    };
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Curriculum Quality Evaluator
 */
export class CurriculumQualityEvaluator {
  /**
   * Evaluate curriculum quality
   */
  static evaluateCurriculum(curriculum) {
    const scores = {
      completeness: this.evaluateCompleteness(curriculum),
      pedagogicalSoundness: this.evaluatePedagogy(curriculum),
      accessibility: this.evaluateAccessibility(curriculum),
      engagement: this.evaluateEngagement(curriculum),
      assessment: this.evaluateAssessment(curriculum),
    };

    const overallScore =
      Object.values(scores).reduce((sum, score) => sum + score, 0) /
      Object.keys(scores).length;

    return {
      overallScore: Math.round(overallScore),
      scores,
      grade: this.getQualityGrade(overallScore),
      recommendations: this.getQualityRecommendations(scores),
    };
  }

  static evaluateCompleteness(curriculum) {
    let score = 100;

    curriculum.topics.forEach((topic) => {
      if (!topic.learningObjectives || topic.learningObjectives.length === 0) {
        score -= 5;
      }
      if (!topic.assessmentQuestions || topic.assessmentQuestions.length < 5) {
        score -= 3;
      }
      if (!topic.activities || topic.activities.length === 0) {
        score -= 3;
      }
    });

    return Math.max(0, score);
  }

  static evaluatePedagogy(curriculum) {
    let score = 100;

    // Check for logical progression
    const difficulties = curriculum.topics.map((t) => t.difficulty);
    for (let i = 1; i < difficulties.length; i++) {
      if (difficulties[i] < difficulties[i - 1] - 2) {
        score -= 5; // Difficulty shouldn't decrease dramatically
      }
    }

    // Check for scaffolding
    const withDifferentiation = curriculum.topics.filter(
      (t) => t.differentiation
    ).length;
    score -= (curriculum.topics.length - withDifferentiation) * 2;

    return Math.max(0, score);
  }

  static evaluateAccessibility(curriculum) {
    let score = 100;

    curriculum.topics.forEach((topic) => {
      // Check for multiple modalities
      const activityTypes = new Set(topic.activities?.map((a) => a.type) || []);
      if (activityTypes.size < 2) {
        score -= 3; // Should have variety
      }

      // Check for support materials
      if (!topic.differentiation?.support) {
        score -= 2;
      }
    });

    return Math.max(0, score);
  }

  static evaluateEngagement(curriculum) {
    let score = 100;

    curriculum.topics.forEach((topic) => {
      if (!topic.realWorldApplications || topic.realWorldApplications.length === 0) {
        score -= 3;
      }

      const hasInteractiveActivities = topic.activities?.some((a) =>
        ['interactive-game', 'drag-drop', 'project'].includes(a.type)
      );

      if (!hasInteractiveActivities) {
        score -= 2;
      }
    });

    return Math.max(0, score);
  }

  static evaluateAssessment(curriculum) {
    let score = 100;

    curriculum.topics.forEach((topic) => {
      const questions = topic.assessmentQuestions || [];

      if (questions.length < 10) {
        score -= 5;
      }

      // Check for variety in question types
      const types = new Set(questions.map((q) => q.type));
      if (types.size < 2) {
        score -= 3;
      }

      // Check for difficulty range
      const difficulties = questions.map((q) => q.difficulty);
      const range = Math.max(...difficulties) - Math.min(...difficulties);
      if (range < 3) {
        score -= 2; // Should have variety in difficulty
      }
    });

    return Math.max(0, score);
  }

  static getQualityGrade(score) {
    if (score >= 90) return 'A - Excellent';
    if (score >= 80) return 'B - Good';
    if (score >= 70) return 'C - Satisfactory';
    if (score >= 60) return 'D - Needs Improvement';
    return 'F - Poor';
  }

  static getQualityRecommendations(scores) {
    const recommendations = [];

    if (scores.completeness < 80) {
      recommendations.push('Add missing learning objectives and assessment questions');
    }

    if (scores.pedagogicalSoundness < 80) {
      recommendations.push('Review topic progression and add scaffolding');
    }

    if (scores.accessibility < 80) {
      recommendations.push('Add support materials and multiple learning modalities');
    }

    if (scores.engagement < 80) {
      recommendations.push('Include more real-world applications and interactive activities');
    }

    if (scores.assessment < 80) {
      recommendations.push('Expand question bank with varied types and difficulties');
    }

    return recommendations;
  }
}

/**
 * Example Usage
 */

/*
// Initialize
const agent = new CurriculumAgent(process.env.ANTHROPIC_API_KEY);
const storage = new CurriculumStorage();
const service = new CurriculumService(storage);
const optimizer = new CurriculumOptimizer(agent, storage, service);

// Analyze curriculum
const analysis = await optimizer.analyzeCurriculum(4, 'math');
console.log('Needs optimization:', analysis.needsOptimization);
console.log('Priority:', analysis.priority);

// Optimize if needed
if (analysis.needsOptimization) {
  const result = await optimizer.optimizeCurriculum(4, 'math');
  console.log('Optimized to version:', result.newVersion);
}

// Schedule auto-optimization (weekly)
optimizer.startAutoOptimization(7 * 24 * 60 * 60 * 1000);

// Generate quality report
const report = await optimizer.generateOptimizationReport(4, 'math');
console.log('Quality report:', report);

// Evaluate curriculum quality
const curriculum = await storage.getCurriculum(4, 'math');
const quality = CurriculumQualityEvaluator.evaluateCurriculum(curriculum.curriculum);
console.log('Quality grade:', quality.grade);
*/
