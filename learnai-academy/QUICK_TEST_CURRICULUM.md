# 🚀 Quick Test: Curriculum Development

## Test Now in Browser!

### Option 1: Use the Test Page (Easiest)

1. **Deploy your app** (or run locally with `npm run dev`)
2. **Navigate to:** `http://localhost:3000/test-curriculum.html` (or your Vercel URL)
3. **Fill in the form:**
   - Task: Lesson Plan
   - Subject: Math
   - Topic: Fractions
   - Grade Level: 5
   - Check all options
4. **Click "Generate Curriculum"**
5. **Wait 10-30 seconds** for AI to generate content
6. **View the results!**

---

## Option 2: Test via Browser Console

1. **Log in** to your app
2. **Open browser console** (F12)
3. **Paste this code:**

```javascript
// Test Curriculum Generation
fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    task: 'lessonPlan',
    subject: 'math',
    topic: 'Fractions',
    gradeLevel: 5,
    options: {
      includeStandards: true,
      includeAssessments: true,
      includePracticeProblems: true,
      difficulty: 'MEDIUM'
    }
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Success!', data);
  console.log('Lesson Plan:', data.result);
})
.catch(error => {
  console.error('❌ Error:', error);
});
```

---

## Option 3: Test Practice Problems

```javascript
fetch('/api/curriculum', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    task: 'practiceProblems',
    subject: 'math',
    topic: 'Fractions',
    gradeLevel: 5,
    options: {
      count: 5,
      difficulty: 'MEDIUM'
    }
  })
})
.then(res => res.json())
.then(data => console.log('Practice Problems:', data.result))
.catch(error => console.error('Error:', error));
```

---

## What to Expect

### Successful Response:
```json
{
  "success": true,
  "result": {
    "objectives": ["Students will..."],
    "keyConcepts": ["Fractions represent..."],
    "structure": [...],
    "assessments": [...],
    "practiceProblems": [...]
  }
}
```

### Response Time:
- **First generation:** 10-30 seconds (AI processing)
- **Cached requests:** 1-2 seconds (if same topic/grade)

---

## Troubleshooting

### Error: "Authentication required"
- **Solution:** Make sure you're logged in
- Check that cookies are enabled

### Error: "Subject not found"
- **Solution:** Use subject slug: `math`, `english`, or `science`
- Or provide `subjectId` from database

### Error: "All AI providers failed"
- **Solution:** 
  - Check API keys in Vercel
  - Verify at least one provider is configured
  - Check provider dashboards for rate limits

### Slow Response
- **Normal:** First generation takes time
- **Tip:** Be patient, AI is generating comprehensive content

---

## Test Different Scenarios

### 1. Different Topics
```javascript
// Try different topics
topic: 'Multiplication'
topic: 'Reading Comprehension'
topic: 'Photosynthesis'
```

### 2. Different Grade Levels
```javascript
gradeLevel: 1  // Simple content
gradeLevel: 8  // More complex
gradeLevel: 12 // Advanced
```

### 3. Different Difficulties
```javascript
difficulty: 'EASY'   // More guidance
difficulty: 'MEDIUM' // Balanced
difficulty: 'HARD'   // Challenging
```

---

## What Gets Generated

### Lesson Plan Includes:
- ✅ Learning Objectives
- ✅ Key Concepts
- ✅ Lesson Structure (Warm-up, Instruction, Practice, Assessment, Closure)
- ✅ I do, We do, You do methodology
- ✅ Assessment Questions
- ✅ Practice Problems
- ✅ Standards Alignment

### Practice Problems Include:
- ✅ Problem Statement
- ✅ Correct Answer
- ✅ Step-by-step Solution
- ✅ Common Mistakes
- ✅ Hints

---

## Next Steps

1. ✅ Test basic generation
2. ✅ Try different topics and grades
3. ✅ Check the generated content quality
4. ✅ Integrate into your UI
5. ✅ Monitor AI provider costs

---

**Ready?** Open `/test-curriculum.html` and start testing! 🎉

