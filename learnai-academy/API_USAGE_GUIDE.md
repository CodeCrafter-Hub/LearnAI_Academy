# API Usage Guide - Curriculum & Assessment APIs

## Overview

New API endpoints have been created to support the role-based multi-agent architecture:
- **Curriculum Generation** - Generate lesson plans, practice problems, and content items
- **Assessment Generation** - Create diagnostic, formative, and summative assessments
- **Assessment Grading** - Grade student submissions with AI-powered feedback

---

## 📚 Curriculum Generation API

### Generate Curriculum Content

**Endpoint**: `POST /api/curriculum`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "task": "lessonPlan" | "practiceProblems" | "contentItems",
  "subjectId": "uuid",
  "topicId": "uuid",
  "gradeLevel": 0-12,
  "options": {
    "count": 10,                    // Number of items (for practiceProblems, contentItems)
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "contentType": "EXPLANATION" | "EXAMPLE" | "PRACTICE" | "QUIZ" | "PROJECT",
    "includeStandards": true,       // Include learning standards (for lessonPlan)
    "includeAssessments": true,      // Include assessments (for lessonPlan)
    "includePracticeProblems": true // Include practice problems (for lessonPlan)
  }
}
```

**Example: Generate Lesson Plan**
```javascript
const response = await fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    task: 'lessonPlan',
    subjectId: 'math-subject-uuid',
    topicId: 'fractions-topic-uuid',
    gradeLevel: 4,
    options: {
      includeStandards: true,
      includeAssessments: true,
      includePracticeProblems: true,
    },
  }),
});

const data = await response.json();
// Returns: { success: true, result: {...lessonPlan}, savedItems: [...] }
```

**Example: Generate Practice Problems**
```javascript
const response = await fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    task: 'practiceProblems',
    subjectId: 'math-subject-uuid',
    topicId: 'algebra-topic-uuid',
    gradeLevel: 8,
    options: {
      count: 20,
      difficulty: 'MEDIUM',
    },
  }),
});

const data = await response.json();
// Returns: { success: true, result: [...problems], savedItems: [...] }
```

**Example: Generate Content Items**
```javascript
const response = await fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    task: 'contentItems',
    subjectId: 'science-subject-uuid',
    topicId: 'photosynthesis-topic-uuid',
    gradeLevel: 5,
    options: {
      contentType: 'EXPLANATION',
      count: 5,
    },
  }),
});
```

### Get Generated Curriculum Content

**Endpoint**: `GET /api/curriculum?topicId=uuid&gradeLevel=4`

**Authentication**: Required

**Query Parameters**:
- `topicId` (required) - UUID of the topic
- `gradeLevel` (optional) - Filter by grade level

**Example**:
```javascript
const response = await fetch('/api/curriculum?topicId=uuid&gradeLevel=4', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
// Returns: { success: true, contentItems: [...] }
```

---

## 📝 Assessment Generation API

### Generate Assessment

**Endpoint**: `POST /api/assessments/generate`

**Authentication**: Required

**Request Body**:
```json
{
  "subjectId": "uuid",              // Optional if topicId provided
  "topicId": "uuid",                // Optional if topicName provided
  "topicName": "string",            // Optional if topicId provided
  "gradeLevel": 0-12,
  "assessmentType": "diagnostic" | "formative" | "summative",
  "questionCount": 15,
  "options": {
    "includeMultipleChoice": true,
    "includeShortAnswer": true,
    "includeProblemSolving": true,
    "timeLimitMinutes": 30
  }
}
```

**Example: Generate Diagnostic Assessment**
```javascript
const response = await fetch('/api/assessments/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    topicId: 'fractions-topic-uuid',
    gradeLevel: 4,
    assessmentType: 'diagnostic',
    questionCount: 15,
    options: {
      includeMultipleChoice: true,
      includeShortAnswer: true,
      includeProblemSolving: true,
      timeLimitMinutes: 30,
    },
  }),
});

const data = await response.json();
// Returns: { success: true, assessment: { id, name, questions: [...], ... } }
```

**Response Structure**:
```json
{
  "success": true,
  "assessment": {
    "id": "assessment-uuid",
    "name": "Diagnostic Assessment: Fractions",
    "assessmentType": "diagnostic",
    "gradeLevel": 4,
    "totalQuestions": 15,
    "timeLimitMinutes": 30,
    "questions": [
      {
        "id": 1,
        "text": "What is 1/2 + 1/4?",
        "type": "multiple_choice",
        "options": ["3/4", "2/6", "1/3", "1/4"],
        "answer": "3/4",
        "points": 10
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Assessment Details

**Endpoint**: `GET /api/assessments/[id]`

**Authentication**: Required

**Example**:
```javascript
const response = await fetch('/api/assessments/assessment-uuid', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
// Returns assessment with questions
```

---

## ✅ Assessment Grading API

### Grade Assessment Submission

**Endpoint**: `POST /api/assessments/[id]/grade`

**Authentication**: Required

**Request Body**:
```json
{
  "studentId": "uuid",
  "answers": [
    {
      "questionId": 1,
      "answer": "3/4"
    },
    {
      "questionId": 2,
      "answer": "The answer is..."
    }
  ]
}
```

**Example**:
```javascript
const response = await fetch('/api/assessments/assessment-uuid/grade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    studentId: 'student-uuid',
    answers: [
      { questionId: 1, answer: '3/4' },
      { questionId: 2, answer: 'The mitochondria' },
      // ... more answers
    ],
  }),
});

const data = await response.json();
```

**Response Structure**:
```json
{
  "success": true,
  "result": {
    "id": "result-uuid",
    "score": 85.5,
    "totalCorrect": 12,
    "totalQuestions": 15,
    "questionResults": [
      {
        "questionId": 1,
        "question": "What is 1/2 + 1/4?",
        "studentAnswer": "3/4",
        "correctAnswer": "3/4",
        "isCorrect": true,
        "points": 10,
        "feedback": "Great job! You correctly added the fractions."
      },
      {
        "questionId": 2,
        "question": "Explain photosynthesis...",
        "studentAnswer": "Plants make food",
        "correctAnswer": "Plants convert sunlight into energy...",
        "isCorrect": false,
        "points": 0,
        "feedback": "You're on the right track! Photosynthesis is when plants convert sunlight into energy..."
      }
    ],
    "learningGaps": [
      {
        "topic": "Fractions",
        "concept": "Adding fractions with different denominators",
        "questionIndex": 5
      }
    ],
    "recommendations": {
      "text": "Based on your assessment, here are some recommendations...",
      "learningGaps": [...],
      "score": 85.5,
      "nextSteps": [
        "Review adding fractions with different denominators",
        "Practice converting improper fractions",
        "Work on word problems involving fractions"
      ]
    },
    "takenAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🎯 Session Creation with Voice Mode

### Updated Session API

**Endpoint**: `POST /api/sessions`

**New Fields**:
```json
{
  "studentId": "uuid",
  "subjectId": "uuid",
  "topicId": "uuid",
  "mode": "PRACTICE" | "HELP" | "ASSESSMENT",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "isVoiceMode": true,              // NEW: Enable voice mode
  "agentRole": "tutoring"           // NEW: Agent role (default: "tutoring")
}
```

**Example**:
```javascript
const response = await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    studentId: 'student-uuid',
    subjectId: 'math-subject-uuid',
    topicId: 'fractions-topic-uuid',
    mode: 'PRACTICE',
    difficulty: 'MEDIUM',
    isVoiceMode: true,  // Enable voice-optimized prompts
    agentRole: 'tutoring',
  }),
});
```

---

## 🔄 Complete Workflow Examples

### Workflow 1: Generate Practice Problems for a Topic

```javascript
// 1. Generate practice problems
const curriculumResponse = await fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    task: 'practiceProblems',
    subjectId: 'math-uuid',
    topicId: 'fractions-uuid',
    gradeLevel: 4,
    options: {
      count: 10,
      difficulty: 'MEDIUM',
    },
  }),
});

const { result: problems } = await curriculumResponse.json();

// 2. Use problems in a practice session
// Display problems to student one by one
// Collect student answers
// Track progress
```

### Workflow 2: Diagnostic Assessment Flow

```javascript
// 1. Generate diagnostic assessment
const assessmentResponse = await fetch('/api/assessments/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    topicId: 'algebra-uuid',
    gradeLevel: 8,
    assessmentType: 'diagnostic',
    questionCount: 15,
  }),
});

const { assessment } = await assessmentResponse.json();

// 2. Present assessment to student
// Student answers questions
const studentAnswers = [
  { questionId: 1, answer: 'x = 5' },
  { questionId: 2, answer: 'y = 10' },
  // ... more answers
];

// 3. Grade the assessment
const gradeResponse = await fetch(`/api/assessments/${assessment.id}/grade`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    studentId: 'student-uuid',
    answers: studentAnswers,
  }),
});

const { result } = await gradeResponse.json();

// 4. Use results to personalize learning
// - Show learning gaps
// - Generate recommendations
// - Update student progress
// - Suggest next topics
```

### Workflow 3: Lesson Plan Generation

```javascript
// Generate a complete lesson plan
const lessonPlanResponse = await fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    task: 'lessonPlan',
    subjectId: 'science-uuid',
    topicId: 'photosynthesis-uuid',
    gradeLevel: 5,
    options: {
      includeStandards: true,
      includeAssessments: true,
      includePracticeProblems: true,
    },
  }),
});

const { result: lessonPlan } = await lessonPlanResponse.json();

// Use lesson plan:
// - Display to teacher/parent
// - Use as guide for tutoring sessions
// - Extract practice problems
// - Use assessments for evaluation
```

---

## ⚠️ Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error message",
  "details": [...]  // For validation errors
}
```

**Status Codes**:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (access denied)
- `404` - Not Found
- `500` - Server Error

**Example Error Handling**:
```javascript
try {
  const response = await fetch('/api/curriculum', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  const data = await response.json();
  // Use data...
} catch (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

---

## 📊 Response Time Considerations

- **Curriculum Generation**: 5-15 seconds (AI generation)
- **Assessment Generation**: 5-20 seconds (AI generation)
- **Assessment Grading**: 2-10 seconds (AI semantic checking)
- **Content Retrieval**: < 1 second (database query)

**Recommendations**:
- Show loading indicators for generation endpoints
- Cache generated content when possible
- Use background jobs for batch generation
- Pre-generate common curriculum content

---

## 🔐 Security Notes

1. **Authentication Required**: All endpoints require valid JWT token
2. **Student Access Control**: Students can only access their own data
3. **Parent/Teacher Access**: Parents/teachers can access their students' data
4. **Rate Limiting**: Consider implementing rate limiting for generation endpoints
5. **Input Validation**: All inputs are validated using Zod schemas

---

## 🚀 Next Steps

1. **Frontend Integration**: Create UI components for:
   - Curriculum generation interface
   - Assessment taking interface
   - Results display with learning gaps
   - Recommendations display

2. **Caching**: Implement caching for generated content to reduce API costs

3. **Background Jobs**: For batch generation, use background job queues

4. **Analytics**: Track:
   - Most requested curriculum items
   - Assessment completion rates
   - Learning gap patterns
   - Curriculum effectiveness

