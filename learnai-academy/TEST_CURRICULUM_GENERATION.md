# 🧪 Testing Curriculum Development

## Overview

Now that you have AI provider APIs configured, you can test the curriculum development system. This guide shows you how to test curriculum generation.

## Quick Test via API

### 1. Test the API Endpoint

Use curl or Postman to test:

```bash
# First, get your auth token by logging in
# Then use it to call the curriculum API

curl -X POST https://your-vercel-app.vercel.app/api/curriculum/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "topic": "Fractions",
    "gradeLevel": 5,
    "subjectId": "math",
    "includeStandards": true,
    "includeAssessments": true,
    "includePracticeProblems": true,
    "difficultyLevel": "MEDIUM"
  }'
```

### 2. Test via Browser Console

Open your browser console on the deployed app and run:

```javascript
// First, make sure you're logged in
// Then test the API

fetch('/api/curriculum/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include auth cookie
  body: JSON.stringify({
    topic: 'Fractions',
    gradeLevel: 5,
    subjectId: 'math',
    includeStandards: true,
    includeAssessments: true,
    includePracticeProblems: true,
    difficultyLevel: 'MEDIUM'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Curriculum Generated!', data);
  console.log('Lesson Plan:', data.lessonPlan);
})
.catch(error => {
  console.error('❌ Error:', error);
});
```

## Test Script (Node.js)

### Setup

1. Make sure you're in the project directory:
```bash
cd learnai-academy
```

2. Ensure environment variables are set (or use `.env.local`):
```bash
# At least one AI provider key
GROQ_API_KEY=your_key_here
# or
OPENAI_API_KEY=your_key_here
# or
GEMINI_API_KEY=your_key_here
# or
KIMI_API_KEY=your_key_here
```

3. Run the test script:
```bash
node scripts/testCurriculumGeneration.js
```

### What the Script Tests

1. **AI Provider Status** - Checks which providers are available
2. **AI Chat** - Tests basic AI communication
3. **Lesson Plan Generation** - Generates a complete lesson plan
4. **Practice Problem Generation** - Creates practice problems
5. **Full Curriculum** - Tests complete curriculum generation

## Expected Output

```
🚀 Starting Curriculum Development Tests...

============================================================

📊 Testing AI Provider Status...

Available Providers:
  ✅ Groq (groq) - Priority: 1

🎯 Current Provider: Groq

💬 Testing AI Chat...

✅ AI Response received:
   Provider: Groq
   Model: llama-3.1-70b-versatile
   Response Time: 1234ms
   Tokens Used: 45
   Cost: $0.000012

   Content: Fractions are numbers that represent parts of a whole...

📚 Testing Lesson Plan Generation...

Generating lesson plan for: Fractions (Grade 5)...
✅ Lesson Plan Generated Successfully!

📋 Lesson Plan Structure:
   - Learning Objectives: 5 objectives
   - Key Concepts: 4 concepts
   - Lesson Sections: 6 sections
   - Assessment Questions: 5 questions
   - Practice Problems: 10 problems

📌 Sample Learning Objective:
   Students will be able to identify and represent fractions...

💡 Sample Key Concept:
   A fraction represents a part of a whole...

============================================================
📊 Test Results Summary:

✅ AI Provider Status
✅ AI Chat
✅ Lesson Plan Generation
✅ Practice Problem Generation
✅ Full Curriculum Generation

📈 Passed: 5/5 tests

🎉 All tests passed! Curriculum development is working correctly.
```

## API Endpoint Details

### POST `/api/curriculum/generate`

**Request Body:**
```json
{
  "topic": "Fractions",
  "gradeLevel": 5,
  "subjectId": "math",
  "includeStandards": true,
  "includeAssessments": true,
  "includePracticeProblems": true,
  "difficultyLevel": "MEDIUM"
}
```

**Response:**
```json
{
  "success": true,
  "lessonPlan": {
    "objectives": ["..."],
    "keyConcepts": ["..."],
    "structure": [...],
    "assessments": [...],
    "practiceProblems": [...]
  },
  "metadata": {
    "topic": "Fractions",
    "gradeLevel": 5,
    "subjectId": "math",
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Troubleshooting

### Error: "No AI providers available"

**Solution:** Make sure at least one API key is configured:
- Check Vercel Environment Variables
- Verify the key is correct
- Redeploy if you just added it

### Error: "Authentication required"

**Solution:** 
- Make sure you're logged in
- Check that the auth cookie is being sent
- Verify JWT_SECRET is configured

### Error: "Failed to generate curriculum"

**Possible Causes:**
1. AI provider rate limit exceeded
2. Invalid API key
3. Network issues

**Solution:**
- Check AI provider dashboard for rate limits
- Verify API key is valid
- Try a different provider (system will auto-fallback)

### Slow Response Times

**Normal:** First generation can take 10-30 seconds
**Cached:** Subsequent requests are faster (if cache is enabled)

## Next Steps

1. ✅ Test basic generation
2. ✅ Try different topics and grade levels
3. ✅ Test with different difficulty levels
4. ✅ Integrate into your UI
5. ✅ Monitor costs in provider dashboards

## Cost Monitoring

Keep an eye on API usage:
- **Groq:** Check dashboard at console.groq.com
- **OpenAI:** Check usage at platform.openai.com
- **Gemini:** Check usage at console.cloud.google.com
- **Kimi:** Check usage in your account dashboard

---

**Ready to test?** Run the test script or use the API endpoint!

