# Agent Architecture Proposal for K-12 AI Tutoring Platform

## Your Questions Summary

1. **Grade-level + Subject-specific agents**: Should we have agents for every grade level AND subject?
2. **Separate Curriculum Agents**: Should we have dedicated agents that create curriculum (formal teacher role)?
3. **Separate Tutoring Agents**: Should tutoring agents be separate from curriculum agents?
4. **Voice Communication**: Already partially implemented - how to enhance?
5. **AI Video Agents**: Future feature - how to architect for this?

---

## 🎯 My Recommendation: **Hybrid Multi-Agent Architecture**

### Core Principle: **Role-Based Agent Specialization** (NOT Grade-Level Duplication)

Instead of creating separate agents for every grade×subject combination (which would be 13 grades × 6+ subjects = 78+ agents), I recommend a **smarter, scalable architecture**:

---

## 📐 Proposed Architecture

### **Tier 1: Specialized Role Agents**

#### 1. **Curriculum Agent** (Formal Teacher Role)
- **Purpose**: Creates structured curriculum, lesson plans, assessments
- **When Used**: 
  - Pre-generating content for topics
  - Creating assessment questions
  - Building lesson sequences
  - Generating learning paths
- **Characteristics**:
  - More formal, structured
  - Curriculum-aligned (Common Core, state standards)
  - Creates reusable content
  - Batch processing (not real-time)

```javascript
// Example: CurriculumAgent
class CurriculumAgent extends BaseAgent {
  async generateLessonPlan(topic, gradeLevel, standards) {
    // Creates structured curriculum
    // Aligns with learning standards
    // Generates assessment questions
    // Creates content items
  }
}
```

#### 2. **Tutoring Agent** (Interactive Tutor Role)
- **Purpose**: Real-time interactive tutoring during sessions
- **When Used**: 
  - During live learning sessions
  - Answering student questions
  - Providing explanations
  - Adaptive difficulty adjustment
- **Characteristics**:
  - Conversational, encouraging
  - Real-time, interactive
  - Personalized to student
  - Context-aware (remembers conversation)

```javascript
// Example: TutoringAgent (current agents, enhanced)
class MathTutoringAgent extends BaseTutoringAgent {
  // Current MathAgent but with enhanced tutoring capabilities
  // Grade-aware through context, not separate instances
}
```

#### 3. **Assessment Agent** (Evaluator Role)
- **Purpose**: Creates and evaluates assessments
- **When Used**:
  - Generating diagnostic tests
  - Creating quizzes
  - Grading assessments
  - Identifying learning gaps

---

### **Tier 2: Grade-Aware Context System** (NOT Separate Agents)

Instead of separate agents per grade, use **context-aware prompts** with **grade-level specialists**:

#### Current System (Good Foundation):
- ✅ Subject-specific agents (MathAgent, EnglishAgent, etc.)
- ✅ Grade level passed in context
- ✅ Dynamic prompts based on grade

#### Enhanced System:
- ✅ **Grade-Level Prompt Templates**: Specialized prompt sections for K-2, 3-5, 6-8, 9-12
- ✅ **Curriculum Standards Database**: Links to learning standards per grade
- ✅ **Age-Appropriate Content Library**: Examples, vocabulary, complexity levels

```javascript
// Enhanced context system
class BaseAgent {
  buildSystemPrompt(context) {
    const gradeBand = this.getGradeBand(context.gradeLevel); // K-2, 3-5, 6-8, 9-12
    const standards = await this.getStandards(context.subject, context.gradeLevel);
    
    return `
      You are a ${this.name} for ${context.studentName}, ${gradeBand} level.
      
      GRADE-SPECIFIC GUIDELINES:
      ${this.getGradeBandGuidelines(gradeBand)}
      
      CURRICULUM STANDARDS:
      ${standards.map(s => `- ${s.description}`).join('\n')}
      
      ${this.getSubjectSpecificGuidelines()}
    `;
  }
  
  getGradeBand(grade) {
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }
}
```

---

## 🏗️ Recommended Architecture

### **Option A: Role-Based (RECOMMENDED)** ⭐

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                    │
│                  (Routes by role + context)              │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │Curriculum│   │ Tutoring │   │Assessment│
    │  Agents  │   │  Agents  │   │  Agents  │
    └──────────┘   └──────────┘   └──────────┘
          │               │               │
          └───────────────┼───────────────┘
                         │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Math     │   │ English  │   │ Science  │
    │ Agent    │   │ Agent    │   │ Agent    │
    │ (Grade-  │   │ (Grade-  │   │ (Grade-  │
    │  aware)  │   │  aware)  │   │  aware)  │
    └──────────┘   └──────────┘   └──────────┘
```

**Benefits**:
- ✅ Scalable: 3 roles × 6 subjects = 18 agents (vs 78+)
- ✅ Maintainable: Update grade logic in one place
- ✅ Flexible: Same agent handles all grades via context
- ✅ Cost-effective: Fewer agents to maintain

**Implementation**:
- Keep current subject agents (they're tutoring agents)
- Add CurriculumAgent base class
- Add AssessmentAgent base class
- Enhance context system with grade bands

---

### **Option B: Grade-Level Specific (NOT RECOMMENDED)** ❌

```
MathAgent
  ├── MathAgentK2 (Kindergarten-2nd)
  ├── MathAgent35 (3rd-5th)
  ├── MathAgent68 (6th-8th)
  └── MathAgent912 (9th-12th)
```

**Problems**:
- ❌ 78+ agents to maintain (13 grades × 6 subjects)
- ❌ Code duplication
- ❌ Hard to update grade logic
- ❌ Expensive to scale
- ❌ Unnecessary complexity

**When to Consider**: Only if grade-specific behaviors are SO different that shared logic doesn't work (rarely the case)

---

## 🎓 Curriculum Agent vs Tutoring Agent: The Key Distinction

### **Curriculum Agent** (Formal Teacher)
```
Role: Plan and prepare structured learning content
Mode: Batch/Asynchronous
Output: Structured curriculum, lesson plans, assessments
Tone: Formal, educational, standards-aligned
When: Before sessions, content generation, planning
```

**Example Use Cases**:
- Generate 50 practice problems for "Fractions" for 4th grade
- Create lesson plan sequence for "Photosynthesis" unit
- Build diagnostic assessment for "Algebra Basics"
- Generate curriculum aligned to Common Core standards

### **Tutoring Agent** (Interactive Tutor)
```
Role: Real-time interactive teaching
Mode: Real-time/Synchronous
Output: Conversational explanations, adaptive feedback
Tone: Encouraging, conversational, supportive
When: During live learning sessions
```

**Example Use Cases**:
- Student asks "Why do we need fractions?"
- Student solves problem: "Is 15 correct?"
- Student struggles: "I don't understand this step"
- Adaptive difficulty: "Let's try a harder problem"

---

## 🗣️ Voice Communication Enhancement

### Current State: ✅ Basic Implementation
- Voice input (speech recognition)
- Voice output (text-to-speech)
- Browser-based API

### Recommended Enhancements:

#### 1. **Voice-Aware Agent Prompts**
```javascript
// Detect voice mode and adjust prompts
if (context.isVoiceMode) {
  prompt += `
    VOICE MODE GUIDELINES:
    - Use shorter sentences (under 20 words)
    - Pause indicators: "..."
    - Numbered lists: "First... Second... Third..."
    - Clear pronunciation: "two times three" not "2×3"
    - Avoid complex punctuation in speech
  `;
}
```

#### 2. **Voice Response Optimization**
- Break long responses into chunks
- Add natural pauses
- Use SSML for better pronunciation
- Adjust speech rate based on grade level

#### 3. **Voice-Specific Features**
- "Repeat that" command handling
- "Speak slower" / "Speak faster"
- "What did you say?" detection
- Voice activity detection (VAD)

#### 4. **Multi-language Support** (Future)
- Detect student's primary language
- Bilingual tutoring support
- Language learning subjects

---

## 🎥 AI Video Agents: Future Architecture

### Recommended Approach: **Layered Video System**

#### Layer 1: **Avatar Generation**
- Use services like:
  - **HeyGen** / **Synthesia** (AI avatars)
  - **D-ID** (talking avatars)
  - **RunwayML** (video generation)
  - **Custom**: Build with stable diffusion + voice

#### Layer 2: **Agent Integration**
```javascript
class VideoTutoringAgent extends TutoringAgent {
  async processWithVideo(context, message) {
    // 1. Get text response (existing)
    const textResponse = await super.process(context, message);
    
    // 2. Generate video prompt
    const videoPrompt = this.createVideoPrompt(textResponse, context);
    
    // 3. Generate avatar video
    const videoUrl = await this.generateAvatarVideo(videoPrompt);
    
    // 4. Return combined response
    return {
      ...textResponse,
      videoUrl,
      videoMetadata: {
        avatar: this.selectAvatar(context),
        gestures: this.determineGestures(textResponse),
        expressions: this.determineExpression(textResponse),
      }
    };
  }
}
```

#### Layer 3: **Video Features**
- **Avatar Selection**: Different avatars per subject/grade
- **Gestures**: Hand movements for math, pointing for reading
- **Expressions**: Encouraging smiles, thoughtful looks
- **Background**: Subject-specific environments
- **Interactive Elements**: Draw on screen, show examples

#### Layer 4: **Real-time vs Pre-generated**
- **Real-time**: For live tutoring (more expensive, lower quality)
- **Pre-generated**: For common explanations (cheaper, higher quality)
- **Hybrid**: Pre-generate common responses, real-time for unique questions

---

## 📊 Implementation Roadmap

### **Phase 1: Separate Roles (2-3 weeks)**
1. Create `CurriculumAgent` base class
2. Create `AssessmentAgent` base class
3. Keep existing agents as `TutoringAgent` subclasses
4. Update orchestrator to route by role

### **Phase 2: Grade Band Enhancement (1-2 weeks)**
1. Add grade band logic (K-2, 3-5, 6-8, 9-12)
2. Create grade-specific prompt templates
3. Integrate curriculum standards database
4. Test grade-appropriate responses

### **Phase 3: Voice Enhancement (2-3 weeks)**
1. Optimize prompts for voice mode
2. Add SSML support
3. Implement voice commands
4. Add voice activity detection

### **Phase 4: Video Preparation (4-6 weeks)**
1. Research and select video generation service
2. Build video prompt generation system
3. Create avatar selection logic
4. Implement video caching strategy
5. Build video player component

---

## 💡 Key Design Decisions

### ✅ **DO:**
- Use role-based agents (Curriculum, Tutoring, Assessment)
- Keep grade awareness in context, not separate agents
- Build grade band templates (K-2, 3-5, 6-8, 9-12)
- Separate curriculum generation from tutoring
- Optimize for voice from the start
- Plan video architecture early but implement later

### ❌ **DON'T:**
- Create separate agents for each grade level
- Duplicate agent logic across grades
- Mix curriculum creation with tutoring
- Ignore voice-specific optimizations
- Rush video implementation before voice is solid

---

## 🎯 Final Recommendation Summary

1. **Grade-Level Agents**: ❌ NO - Use context-aware grade bands instead
2. **Subject-Specific Agents**: ✅ YES - Keep current structure
3. **Curriculum Agents**: ✅ YES - Separate role for content generation
4. **Tutoring Agents**: ✅ YES - Enhance current agents (they're already tutors)
5. **Voice Communication**: ✅ YES - Enhance current implementation
6. **AI Video Agents**: ✅ YES - Plan architecture now, implement later

**Architecture**: **Role-Based Multi-Agent System** with **Grade-Aware Context**

This gives you:
- ✅ Scalability (18 agents vs 78+)
- ✅ Maintainability (grade logic centralized)
- ✅ Flexibility (easy to add subjects/grades)
- ✅ Cost-effectiveness (fewer agents)
- ✅ Clear separation of concerns (curriculum vs tutoring)

---

## 📝 Next Steps

1. **Review this proposal** and decide on approach
2. **Implement CurriculumAgent** for content generation
3. **Enhance grade band system** in BaseAgent
4. **Optimize voice prompts** for better speech interaction
5. **Plan video architecture** (select service, design integration)

Would you like me to:
1. Implement the CurriculumAgent architecture?
2. Enhance the grade band system?
3. Optimize voice communication?
4. Create a detailed video agent implementation plan?

