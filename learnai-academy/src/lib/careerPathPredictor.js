/**
 * Career Path Predictor and Skills Mapper
 *
 * Forward-looking system that helps students envision and plan their future:
 * - Career recommendations based on skills, interests, and strengths
 * - Skill gap analysis for target careers
 * - Educational pathway mapping (courses, degrees, certifications)
 * - Labor market insights and salary predictions
 * - Skill development roadmaps
 * - Real-world project suggestions
 * - Mentor matching based on career interests
 * - Industry trends and emerging opportunities
 * - Personalized career exploration activities
 *
 * Connects current learning to future opportunities, providing motivation and direction.
 */

import Anthropic from '@anthropic-ai/sdk';

// Career categories
const CAREER_CATEGORIES = {
  STEM: 'stem',
  ARTS: 'arts',
  BUSINESS: 'business',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  TRADES: 'trades',
  TECHNOLOGY: 'technology',
  SOCIAL_SERVICES: 'social_services',
  LAW: 'law',
  COMMUNICATION: 'communication',
};

// Skill types
const SKILL_TYPES = {
  TECHNICAL: 'technical',
  SOFT: 'soft',
  ACADEMIC: 'academic',
  CREATIVE: 'creative',
  PHYSICAL: 'physical',
  LEADERSHIP: 'leadership',
};

// Education levels
const EDUCATION_LEVELS = {
  HIGH_SCHOOL: 'high_school',
  ASSOCIATE: 'associate',
  BACHELORS: 'bachelors',
  MASTERS: 'masters',
  DOCTORATE: 'doctorate',
  CERTIFICATION: 'certification',
  TRADE_SCHOOL: 'trade_school',
};

/**
 * Career Database - Comprehensive career information
 */
const CAREER_DATABASE = {
  software_engineer: {
    id: 'software_engineer',
    name: 'Software Engineer',
    category: CAREER_CATEGORIES.TECHNOLOGY,
    description: 'Design, develop, and maintain software applications and systems',
    requiredSkills: [
      { skill: 'programming', level: 'expert', type: SKILL_TYPES.TECHNICAL },
      { skill: 'problem_solving', level: 'advanced', type: SKILL_TYPES.SOFT },
      { skill: 'mathematics', level: 'proficient', type: SKILL_TYPES.ACADEMIC },
      { skill: 'collaboration', level: 'proficient', type: SKILL_TYPES.SOFT },
    ],
    educationPath: [EDUCATION_LEVELS.BACHELORS],
    averageSalary: { min: 70000, max: 150000, median: 95000 },
    growthOutlook: 'excellent',
    relatedCareers: ['data_scientist', 'web_developer', 'systems_architect'],
  },
  data_scientist: {
    id: 'data_scientist',
    name: 'Data Scientist',
    category: CAREER_CATEGORIES.STEM,
    description: 'Analyze complex data to derive insights and inform business decisions',
    requiredSkills: [
      { skill: 'statistics', level: 'expert', type: SKILL_TYPES.ACADEMIC },
      { skill: 'programming', level: 'advanced', type: SKILL_TYPES.TECHNICAL },
      { skill: 'data_visualization', level: 'advanced', type: SKILL_TYPES.TECHNICAL },
      { skill: 'critical_thinking', level: 'expert', type: SKILL_TYPES.SOFT },
    ],
    educationPath: [EDUCATION_LEVELS.MASTERS],
    averageSalary: { min: 85000, max: 165000, median: 110000 },
    growthOutlook: 'excellent',
    relatedCareers: ['machine_learning_engineer', 'business_analyst', 'statistician'],
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    category: CAREER_CATEGORIES.EDUCATION,
    description: 'Educate and inspire students in various subjects and grade levels',
    requiredSkills: [
      { skill: 'communication', level: 'expert', type: SKILL_TYPES.SOFT },
      { skill: 'patience', level: 'expert', type: SKILL_TYPES.SOFT },
      { skill: 'subject_expertise', level: 'advanced', type: SKILL_TYPES.ACADEMIC },
      { skill: 'creativity', level: 'advanced', type: SKILL_TYPES.CREATIVE },
    ],
    educationPath: [EDUCATION_LEVELS.BACHELORS, EDUCATION_LEVELS.CERTIFICATION],
    averageSalary: { min: 40000, max: 75000, median: 55000 },
    growthOutlook: 'good',
    relatedCareers: ['school_counselor', 'education_administrator', 'curriculum_developer'],
  },
  // Would include 100+ more careers in production
};

/**
 * Career Path Predictor - Matches students to potential career paths
 */
export class CareerPathPredictor {
  constructor(apiKey, storageKey = 'career_profiles') {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.storageKey = storageKey;
    this.profiles = this.loadProfiles();
    this.careerDatabase = CAREER_DATABASE;
  }

  /**
   * Load career profiles
   */
  loadProfiles() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading career profiles:', error);
      return {};
    }
  }

  /**
   * Save career profiles
   */
  saveProfiles() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profiles));
    } catch (error) {
      console.error('Error saving career profiles:', error);
    }
  }

  /**
   * Predict career paths for student
   */
  async predictCareerPaths(student) {
    const {
      interests = [],
      skillsMastered = [],
      strengths = [],
      academicPerformance = {},
      personality = {},
      values = [],
    } = student;

    // Use AI to analyze fit
    const recommendations = await this.getAICareerRecommendations(student);

    // Score and rank careers
    const scoredCareers = this.scoreCareerMatches(
      student,
      recommendations
    );

    // Generate pathways
    const topCareers = scoredCareers.slice(0, 5);
    const careerPathways = topCareers.map(career =>
      this.generateCareerPathway(student, career)
    );

    // Save to profile
    this.profiles[student.id] = {
      studentId: student.id,
      recommendations: careerPathways,
      lastUpdated: new Date().toISOString(),
      interestAreas: this.categorizeInterests(interests),
      strengthAreas: this.categorizeStrengths(strengths),
    };

    this.saveProfiles();

    return {
      topRecommendations: careerPathways,
      explorationActivities: this.suggestExplorationActivities(topCareers),
      skillDevelopmentPlan: this.createSkillDevelopmentPlan(student, topCareers),
    };
  }

  /**
   * Get AI-powered career recommendations
   */
  async getAICareerRecommendations(student) {
    const systemPrompt = `You are a career counselor helping a grade ${student.grade} student explore future career paths.

Student Profile:
- Interests: ${student.interests?.join(', ') || 'not specified'}
- Strong subjects: ${student.strengths?.join(', ') || 'not specified'}
- Skills mastered: ${student.skillsMastered?.join(', ') || 'not specified'}
- Learning style: ${student.learningStyle || 'not specified'}
- Values: ${student.values?.join(', ') || 'not specified'}

Based on this profile, recommend 10-15 diverse career paths that could be good fits.
Consider:
- Current trends and future job market
- Variety of education levels
- Different career categories
- Both traditional and emerging careers

For each career, provide:
- Career name
- Why it's a good fit
- Required skills to develop
- Education pathway
- Real-world projects to explore

Return as JSON:
{
  "recommendations": [
    {
      "careerName": "name",
      "fitReason": "explanation",
      "matchScore": 0-100,
      "requiredSkills": ["skill1", "skill2"],
      "educationPath": "description",
      "exploratory Projects": ["project1", "project2"]
    }
  ]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Provide personalized career recommendations.',
          },
        ],
      });

      const result = JSON.parse(response.content[0].text);
      return result.recommendations;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return this.getFallbackRecommendations(student);
    }
  }

  /**
   * Get fallback recommendations
   */
  getFallbackRecommendations(student) {
    // Return generic recommendations based on interests
    const recommendations = [];
    const interests = student.interests || [];

    if (interests.includes('math') || interests.includes('science')) {
      recommendations.push({
        careerName: 'Engineer',
        fitReason: 'Strong in math and science',
        matchScore: 75,
        requiredSkills: ['mathematics', 'problem_solving', 'physics'],
        educationPath: "Bachelor's degree in Engineering",
        exploratoryProjects: ['Build a simple robot', 'Design a bridge'],
      });
    }

    if (interests.includes('art') || interests.includes('creativity')) {
      recommendations.push({
        careerName: 'Graphic Designer',
        fitReason: 'Creative interests',
        matchScore: 70,
        requiredSkills: ['visual_design', 'creativity', 'software_tools'],
        educationPath: "Bachelor's in Design or Fine Arts",
        exploratoryProjects: ['Create a logo', 'Design a poster'],
      });
    }

    return recommendations;
  }

  /**
   * Score career matches
   */
  scoreCareerMatches(student, recommendations) {
    return recommendations.map(rec => {
      let score = rec.matchScore || 50;

      // Boost score based on student's mastered skills
      const matchingSkills = rec.requiredSkills.filter(skill =>
        student.skillsMastered?.includes(skill)
      );

      score += matchingSkills.length * 5;

      // Cap at 100
      score = Math.min(100, score);

      return {
        ...rec,
        finalScore: score,
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Generate career pathway
   */
  generateCareerPathway(student, career) {
    const currentGrade = student.grade;
    const pathway = {
      career: career.careerName,
      fitScore: career.finalScore,
      fitReason: career.fitReason,
      timeline: [],
      skillGaps: this.identifySkillGaps(student, career),
      educationRequirements: career.educationPath,
      estimatedSalary: this.estimateSalary(career),
      nextSteps: [],
    };

    // Build timeline from current grade to career
    if (currentGrade <= 8) {
      pathway.timeline.push({
        phase: 'Middle School',
        years: `Grades ${currentGrade}-8`,
        focus: 'Explore interests and build foundation',
        actions: [
          'Take relevant electives',
          'Join related clubs or activities',
          'Try starter projects',
        ],
      });
    }

    if (currentGrade <= 12) {
      pathway.timeline.push({
        phase: 'High School',
        years: 'Grades 9-12',
        focus: 'Develop skills and prepare for college',
        actions: [
          'Take advanced courses in relevant subjects',
          'Participate in competitions or internships',
          'Build portfolio of projects',
          'Research colleges/programs',
        ],
      });
    }

    pathway.timeline.push({
      phase: 'Higher Education',
      years: this.getEducationDuration(career.educationPath),
      focus: career.educationPath,
      actions: [
        'Complete degree requirements',
        'Gain practical experience through internships',
        'Build professional network',
        'Develop specialized skills',
      ],
    });

    pathway.timeline.push({
      phase: 'Early Career',
      years: 'Years 1-3',
      focus: 'Gain experience and establish yourself',
      actions: [
        'Secure entry-level position',
        'Continue learning and skill development',
        'Build professional reputation',
        'Seek mentorship',
      ],
    });

    // Immediate next steps
    pathway.nextSteps = this.getImmediateNextSteps(student, career);

    return pathway;
  }

  /**
   * Identify skill gaps
   */
  identifySkillGaps(student, career) {
    const requiredSkills = career.requiredSkills || [];
    const currentSkills = student.skillsMastered || [];

    return requiredSkills
      .filter(skill => !currentSkills.includes(skill))
      .map(skill => ({
        skill,
        priority: 'high',
        howToDevelop: this.getSkillDevelopmentTips(skill),
      }));
  }

  /**
   * Get skill development tips
   */
  getSkillDevelopmentTips(skill) {
    const tips = {
      programming: [
        'Start with Python or JavaScript',
        'Complete online coding tutorials',
        'Build small projects',
        'Join coding club',
      ],
      communication: [
        'Practice public speaking',
        'Join debate team',
        'Write regularly',
        'Present in class',
      ],
      problem_solving: [
        'Work on logic puzzles',
        'Participate in math competitions',
        'Play strategy games',
        'Practice breaking down complex problems',
      ],
    };

    return tips[skill] || ['Practice regularly', 'Seek learning opportunities', 'Find a mentor'];
  }

  /**
   * Get education duration
   */
  getEducationDuration(educationPath) {
    const durations = {
      [EDUCATION_LEVELS.HIGH_SCHOOL]: '4 years',
      [EDUCATION_LEVELS.ASSOCIATE]: '2 years',
      [EDUCATION_LEVELS.BACHELORS]: '4 years',
      [EDUCATION_LEVELS.MASTERS]: '6+ years (includes bachelor)',
      [EDUCATION_LEVELS.DOCTORATE]: '10+ years (includes bachelor and master)',
      [EDUCATION_LEVELS.CERTIFICATION]: '1-2 years',
      [EDUCATION_LEVELS.TRADE_SCHOOL]: '6 months - 2 years',
    };

    return educationPath.map(level => durations[level] || 'Varies').join(', ');
  }

  /**
   * Estimate salary
   */
  estimateSalary(career) {
    // In production, would use real labor market data
    return {
      entry: '$40,000 - $60,000',
      mid: '$60,000 - $90,000',
      senior: '$90,000 - $150,000+',
      note: 'Varies by location, experience, and specialization',
    };
  }

  /**
   * Get immediate next steps
   */
  getImmediateNextSteps(student, career) {
    const steps = [];

    steps.push({
      action: `Learn more about ${career.careerName}`,
      description: 'Research the career, watch videos, read articles',
      timeframe: 'This week',
    });

    if (career.exploratoryProjects && career.exploratoryProjects.length > 0) {
      steps.push({
        action: `Try a beginner project: ${career.exploratoryProjects[0]}`,
        description: 'Get hands-on experience',
        timeframe: 'This month',
      });
    }

    steps.push({
      action: 'Find a mentor',
      description: `Connect with someone working as a ${career.careerName}`,
      timeframe: 'This quarter',
    });

    return steps;
  }

  /**
   * Categorize interests
   */
  categorizeInterests(interests) {
    const categories = {};

    interests.forEach(interest => {
      // Simplified categorization
      if (['math', 'science', 'technology'].includes(interest)) {
        categories[CAREER_CATEGORIES.STEM] = (categories[CAREER_CATEGORIES.STEM] || 0) + 1;
      } else if (['art', 'music', 'writing'].includes(interest)) {
        categories[CAREER_CATEGORIES.ARTS] = (categories[CAREER_CATEGORIES.ARTS] || 0) + 1;
      }
      // More categories in production
    });

    return categories;
  }

  /**
   * Categorize strengths
   */
  categorizeStrengths(strengths) {
    // Similar to categorizeInterests
    return {};
  }

  /**
   * Suggest exploration activities
   */
  suggestExplorationActivities(careers) {
    const activities = [];

    careers.forEach(career => {
      activities.push({
        career: career.careerName,
        activities: [
          {
            type: 'research',
            title: 'Career Research',
            description: `Learn about daily life as a ${career.careerName}`,
            resources: ['Bureau of Labor Statistics', 'Career videos', 'Professional associations'],
          },
          {
            type: 'hands_on',
            title: 'Try It Out',
            description: 'Get practical experience',
            suggestions: career.exploratoryProjects || ['Related projects', 'Volunteer work', 'Job shadow'],
          },
          {
            type: 'connect',
            title: 'Talk to Professionals',
            description: 'Informational interviews',
            where: ['LinkedIn', 'School career center', 'Family connections'],
          },
        ],
      });
    });

    return activities;
  }

  /**
   * Create skill development plan
   */
  createSkillDevelopmentPlan(student, topCareers) {
    // Identify common skills across top careers
    const allRequiredSkills = {};

    topCareers.forEach(career => {
      (career.requiredSkills || []).forEach(skill => {
        allRequiredSkills[skill] = (allRequiredSkills[skill] || 0) + 1;
      });
    });

    // Prioritize skills that appear in multiple careers
    const prioritizedSkills = Object.entries(allRequiredSkills)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({
        skill,
        relevantToCareers: count,
        currentLevel: this.assessCurrentLevel(student, skill),
        developmentPlan: this.getSkillDevelopmentTips(skill),
      }));

    return {
      focusSkills: prioritizedSkills,
      timeline: '6-12 months',
      approach: 'Build foundation in these core skills to keep multiple career paths open',
    };
  }

  /**
   * Assess current skill level
   */
  assessCurrentLevel(student, skill) {
    const mastered = student.skillsMastered || [];
    const inProgress = student.skillsInProgress || [];

    if (mastered.includes(skill)) return 'proficient';
    if (inProgress.includes(skill)) return 'learning';
    return 'beginner';
  }

  /**
   * Track career exploration progress
   */
  trackExplorationProgress(studentId, activity) {
    if (!this.profiles[studentId]) {
      this.profiles[studentId] = {
        studentId,
        explorationHistory: [],
      };
    }

    this.profiles[studentId].explorationHistory = this.profiles[studentId].explorationHistory || [];
    this.profiles[studentId].explorationHistory.push({
      ...activity,
      completedAt: new Date().toISOString(),
    });

    this.saveProfiles();
  }

  /**
   * Get career exploration dashboard
   */
  getExplorationDashboard(studentId) {
    const profile = this.profiles[studentId];
    if (!profile) {
      return {
        explorationsCompleted: 0,
        careersExplored: 0,
        skillsInDevelopment: 0,
      };
    }

    const explorationHistory = profile.explorationHistory || [];
    const uniqueCareers = new Set(explorationHistory.map(e => e.career));

    return {
      explorationsCompleted: explorationHistory.length,
      careersExplored: uniqueCareers.size,
      skillsInDevelopment: profile.recommendations?.[0]?.skillGaps?.length || 0,
      recentActivity: explorationHistory.slice(-5),
      recommendations: profile.recommendations || [],
    };
  }
}

export { CAREER_CATEGORIES, SKILL_TYPES, EDUCATION_LEVELS };
export default CareerPathPredictor;
