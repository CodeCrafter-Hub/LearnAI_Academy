# AI-Powered Curriculum Agent System

## Overview

The Curriculum Agent System is an AI-powered platform that automatically generates, stores, and continuously optimizes curriculum for K-12 education. It uses Claude AI to create pedagogically sound, engaging, and effective learning content that adapts based on real student performance data.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Curriculum Agent System                   │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Curriculum Agent │  │Curriculum Storage│  │Curriculum Service│
│                  │  │                  │  │                  │
│ - Generate       │  │ - IndexedDB      │  │ - getCurriculum  │
│ - Refine         │  │ - PostgreSQL     │  │ - getQuestions   │
│ - Questions      │  │ - localStorage   │  │ - getPath        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Curriculum Optimizer                             │
│                                                               │
│ - Analyze Performance                                         │
│ - Identify Issues                                             │
│ - Auto-optimize                                               │
│ - Quality Evaluation                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Teaching Agent                             │
│                                                               │
│ Uses optimized curriculum to teach students                   │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Curriculum Agent (`curriculumAgent.js`)

**Purpose:** AI-powered curriculum generation and refinement

**Key Features:**
- Generates comprehensive K-12 curriculum using Claude AI
- Creates 20+ topics per grade/subject with full details
- Generates assessment questions (20+ per topic)
- Refines curriculum based on performance data
- Ensures age-appropriate content and pedagogy

**Main Methods:**
```javascript
// Generate new curriculum
const curriculum = await agent.generateCurriculum(gradeLevel, subject, options);

// Refine existing curriculum
const refinements = await agent.refineCurriculum(curriculumId, performanceData, feedbackData);

// Generate assessment questions
const questions = await agent.generateAssessmentQuestions(topic, numberOfQuestions);
```

**Generated Curriculum Structure:**
- **Topics**: 20+ topics with learning objectives, activities, vocabulary
- **Assessments**: Multiple question types, varying difficulties
- **Differentiation**: Support for struggling/advanced students
- **Resources**: Videos, manipulatives, readings
- **Real-world Applications**: Practical connections
- **Progression**: Logical sequencing with prerequisites

### 2. Curriculum Storage (`curriculumStorage.js`)

**Purpose:** Persistent storage for curriculum data

**Storage Options:**
- **IndexedDB**: Browser-based (development/demo)
- **localStorage**: Fallback for older browsers
- **API**: Production backend (PostgreSQL recommended)

**Key Features:**
- Automatic curriculum versioning
- Performance data tracking
- Feedback collection
- Question bank management
- Caching for performance

**Main Methods:**
```javascript
// Save curriculum
await storage.saveCurriculum(curriculumData);

// Retrieve curriculum
const curriculum = await storage.getCurriculum(gradeLevel, subject);

// Save/get questions
await storage.saveQuestions(topicId, questions);
const questions = await storage.getQuestions(topicId, filters);

// Track performance
await storage.savePerformanceData(sessionData);
const performance = await storage.getPerformanceData(gradeLevel, subject);
```

**Database Schema:**
- `curricula`: Main curriculum storage
- `topics`: Individual topics (extracted for querying)
- `questions`: Question bank with metadata
- `student_performance`: Performance tracking
- `curriculum_feedback`: Teacher/student feedback

### 3. Curriculum Service (`curriculumService.js`)

**Purpose:** API layer for teaching agents to access curriculum

**Key Features:**
- Curriculum retrieval and caching
- Learning path generation
- Adaptive question selection
- Progress tracking
- Performance analytics

**Main Methods:**
```javascript
// Get curriculum
const curriculum = await service.getCurriculum(gradeLevel, subject);

// Get learning path
const path = await service.getLearningPath(gradeLevel, subject, studentProgress);

// Get questions with adaptive difficulty
const questions = await service.getQuestionsForTopic(topicId, {
  count: 20,
  adaptiveDifficulty: studentDifficulty
});

// Record performance
await service.recordPerformance(studentId, gradeLevel, subject, topicId, data);
```

**Teaching Agent Helper:**
```javascript
const helper = new TeachingAgentHelper(service);

// Start session (auto-selects topic, gets questions)
const session = await helper.startSession(student, subject);

// Complete session (records performance, gets next recommendation)
const completion = await helper.completeSession(student, subject, topicId, performanceData);
```

### 4. Curriculum Optimizer (`curriculumOptimizer.js`)

**Purpose:** Continuous improvement based on student data

**Key Features:**
- Performance analysis
- Issue detection (too hard, too easy, low engagement)
- AI-powered refinement
- Automatic optimization scheduling
- Quality evaluation

**Main Methods:**
```javascript
// Analyze if optimization needed
const analysis = await optimizer.analyzeCurriculum(gradeLevel, subject);

// Optimize curriculum
const result = await optimizer.optimizeCurriculum(gradeLevel, subject);

// Schedule auto-optimization (weekly)
optimizer.startAutoOptimization(7 * 24 * 60 * 60 * 1000);

// Generate optimization report
const report = await optimizer.generateOptimizationReport(gradeLevel, subject);
```

**Optimization Triggers:**
- Overall accuracy < 60%
- 3+ topics with high severity issues
- Negative feedback score
- 5+ topics too easy or too hard

**Quality Evaluator:**
```javascript
const quality = CurriculumQualityEvaluator.evaluateCurriculum(curriculum);
// Returns: A-F grade + detailed scores for:
// - Completeness
// - Pedagogical Soundness
// - Accessibility
// - Engagement
// - Assessment Quality
```

## Workflow

### Initial Setup: Generate All Curricula

```javascript
import { CurriculumAgent, CurriculumGenerator } from '@/lib/curriculumAgent';
import { CurriculumStorage } from '@/lib/curriculumStorage';

// Initialize
const agent = new CurriculumAgent(process.env.ANTHROPIC_API_KEY);
const storage = new CurriculumStorage({ storageType: 'indexeddb' });
const generator = new CurriculumGenerator(agent, storage);

// Generate all curricula
const subjects = ['math', 'reading', 'science', 'english', 'coding'];
const results = await generator.generateAllCurricula(subjects, {
  numberOfTopics: 20,
  learningStandards: 'Common Core',
});

console.log(`Generated ${results.totalGenerated} curricula`);
console.log(`Success: ${results.successful.length}`);
console.log(`Failed: ${results.failed.length}`);
```

### Teaching Session: Use Curriculum

```javascript
import { CurriculumService, TeachingAgentHelper } from '@/lib/curriculumService';

// Initialize
const service = new CurriculumService(storage);
const helper = new TeachingAgentHelper(service);

// Start learning session
const session = await helper.startSession(student, 'math');

console.log('Topic:', session.topic.name);
console.log('Learning Objectives:', session.topic.learningObjectives);
console.log('Questions:', session.questions.length);

// Present questions to student...
// Track answers...

// Complete session
const completion = await helper.completeSession(student, 'math', session.topic.id, {
  totalAttempts: 20,
  correctAttempts: 17,
  accuracy: 85,
  sessionDuration: 23,
  averageDifficulty: 4,
});

console.log('Mastered:', completion.mastered);
console.log('Next topic:', completion.nextRecommendation.nextTopic?.name);
```

### Continuous Optimization

```javascript
import { CurriculumOptimizer } from '@/lib/curriculumOptimizer';

// Initialize
const optimizer = new CurriculumOptimizer(agent, storage, service);

// Start automatic weekly optimization
optimizer.startAutoOptimization(7 * 24 * 60 * 60 * 1000);

// Or manually optimize specific curriculum
const analysis = await optimizer.analyzeCurriculum(4, 'math');

if (analysis.needsOptimization) {
  console.log('Optimization needed:', analysis.priority);
  console.log('Issues:', analysis.metrics.issues);

  const result = await optimizer.optimizeCurriculum(4, 'math');
  console.log('Updated to version:', result.newVersion);
}
```

## Data Flow

### 1. Curriculum Generation
```
User Request → CurriculumAgent → Claude AI → Parse Response →
Validate → Generate Questions → Store in Database → Cache
```

### 2. Teaching Session
```
Student Login → Get Learning Path → Select Topic →
Get Questions (Adaptive) → Present to Student → Track Answers →
Record Performance → Update Progress → Recommend Next Topic
```

### 3. Curriculum Optimization
```
Scheduled Trigger → Analyze All Curricula → Identify Issues →
Calculate Priority → For High Priority: AI Refinement →
Apply Changes → Update Version → Regenerate Questions → Store
```

## Performance Metrics

The system tracks and optimizes based on:

1. **Topic-Level Metrics:**
   - Accuracy rate (target: 70-85%)
   - Average time spent
   - Number of students reached
   - Question difficulty distribution

2. **Overall Metrics:**
   - Curriculum completion rate
   - Average session duration
   - Student engagement levels
   - Topic mastery rates

3. **Quality Metrics:**
   - Pedagogical soundness (A-F)
   - Content completeness (0-100)
   - Accessibility score (0-100)
   - Engagement score (0-100)

## Issue Detection

The optimizer automatically detects:

- **Too Hard**: Accuracy < 50% → Reduce difficulty, add scaffolding
- **Too Easy**: Accuracy > 95% → Increase challenge, add depth
- **Low Engagement**: Few students reach topic → Check prerequisites
- **Rushing**: Too fast completion → Add complexity
- **Negative Feedback**: Low ratings → Human review needed

## API Reference

### CurriculumAgent

```typescript
class CurriculumAgent {
  constructor(apiKey: string)

  generateCurriculum(
    gradeLevel: number,
    subject: string,
    options?: {
      numberOfTopics?: number,
      learningStandards?: string,
      focus?: string,
      existingCurriculum?: object
    }
  ): Promise<Curriculum>

  refineCurriculum(
    curriculumId: string,
    performanceData: object,
    feedbackData: object
  ): Promise<Refinements>

  generateAssessmentQuestions(
    topic: Topic,
    numberOfQuestions?: number,
    difficultyDistribution?: object
  ): Promise<Questions>
}
```

### CurriculumService

```typescript
class CurriculumService {
  constructor(storage: CurriculumStorage)

  getCurriculum(gradeLevel: number, subject: string): Promise<Curriculum>
  getTopic(gradeLevel: number, subject: string, topicId: string): Promise<Topic>
  getNextTopic(gradeLevel: number, subject: string, currentTopicId: string): Promise<Topic>
  getLearningPath(gradeLevel: number, subject: string, studentProgress: object): Promise<LearningPath>
  getQuestionsForTopic(topicId: string, options: object): Promise<Question[]>
  recordPerformance(studentId: string, ...): Promise<PerformanceRecord>
}
```

### CurriculumOptimizer

```typescript
class CurriculumOptimizer {
  constructor(agent: CurriculumAgent, storage: CurriculumStorage, service: CurriculumService)

  analyzeCurriculum(gradeLevel: number, subject: string): Promise<Analysis>
  optimizeCurriculum(gradeLevel: number, subject: string): Promise<OptimizationResult>
  startAutoOptimization(interval: number): void
  generateOptimizationReport(gradeLevel: number, subject: string): Promise<Report>
}
```

## Environment Setup

### Required Environment Variables

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/learnai  # For production
```

### Installation

```bash
npm install @anthropic-ai/sdk
```

### Database Migration (Production)

```sql
-- Run the schema from curriculumStorage.js
-- Creates tables: curricula, topics, questions, student_performance, curriculum_feedback
```

## Best Practices

1. **Generate Once, Use Many Times:**
   - Generate curricula during initial setup
   - Cache aggressively for read performance
   - Optimize periodically (weekly), not constantly

2. **Monitor Quality:**
   - Run quality evaluations monthly
   - Review optimization reports
   - Collect teacher/student feedback

3. **Data-Driven Decisions:**
   - Wait for minimum sample size (30+ students)
   - Consider statistical significance
   - Balance automation with human oversight

4. **Version Control:**
   - Keep old curriculum versions
   - Allow rollback if optimization makes things worse
   - A/B test major changes

5. **Performance:**
   - Use caching liberally
   - Lazy load questions (don't load all at once)
   - Index database properly
   - Use connection pooling

## Troubleshooting

### Issue: Curriculum generation fails

**Solutions:**
- Check API key is valid
- Verify rate limits not exceeded
- Check response parsing (Claude's response format changed?)
- Try reducing numberOfTopics temporarily

### Issue: Optimization not triggering

**Solutions:**
- Check minimum sample size requirement (30+)
- Verify performance data is being saved
- Check priority calculation (may be too low)
- Manually trigger for testing

### Issue: Questions too easy/hard

**Solutions:**
- Review difficulty distribution in generation
- Check adaptive difficulty algorithm
- Manually refine topic difficulty levels
- Add more question variety

## Future Enhancements

- [ ] Multi-language support
- [ ] Custom learning standards (IB, state-specific)
- [ ] Parent/teacher curriculum customization
- [ ] Video/interactive content generation
- [ ] Peer comparison analytics
- [ ] ML-based question difficulty prediction
- [ ] Real-time curriculum adaptation
- [ ] Collaborative curriculum sharing

## License

Proprietary - LearnAI Academy

## Support

For questions or issues: [Your support contact]

---

**Last Updated:** November 2024
**Version:** 1.0.0
**Maintainer:** LearnAI Academy Development Team
