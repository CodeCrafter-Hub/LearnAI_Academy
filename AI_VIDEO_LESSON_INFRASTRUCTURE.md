# AI Video Lesson Infrastructure Plan

**Status**: Architecture Planning (To Be Implemented Later)
**Created**: 2025-11-05
**Purpose**: Define infrastructure for AI-generated video lessons integrated with tutoring system

---

## Overview

AI Video Lessons will provide personalized, on-demand video instruction complementing the interactive tutoring agents. Videos will feature AI avatars delivering lessons tailored to student grade level, learning style, and current progress.

---

## Architecture Components

### 1. Video Generation Pipeline

#### **Script Generation Service**
```
Input:
  - Topic (e.g., "Fractions - Adding Unlike Denominators")
  - Grade Level (K-2, 3-5, 6-8, 9-12)
  - Student Context (strengths, weaknesses, learning style)
  - Lesson Duration (5, 10, 15 minutes)

Process:
  1. Curriculum Agent generates lesson outline
  2. GPT-4 generates video script with:
     - Introduction hook
     - Concept explanation with examples
     - Practice problems
     - Summary and next steps
  3. Script optimization for visual presentation
  4. Timing markers for scene transitions

Output:
  - Structured script with timestamps
  - Visual cue suggestions (diagrams, animations)
  - Practice problem inserts
```

#### **Avatar Video Generation**
**Options to Evaluate**:
- **D-ID** - API for AI avatars, good quality, $0.10/video minute
- **Synthesia** - Enterprise-grade, 160+ avatars, $30/month
- **HeyGen** - High quality, custom avatars, $29/month
- **ElevenLabs + Wav2Lip** - DIY: Voice synthesis + lip sync

**Recommended**: Start with **HeyGen** or **D-ID** for MVP

```
Video Generation Flow:
  1. Select avatar (teacher persona based on subject/grade)
  2. Generate voice narration (ElevenLabs or built-in TTS)
  3. Create avatar video with lip-sync
  4. Add visual overlays:
     - On-screen text for key concepts
     - Diagrams and illustrations
     - Problem-solving step animations
  5. Render final video (MP4, 1080p)
```

#### **Visual Enhancement Pipeline**
```
Enhancements:
  - Auto-generate diagrams (D3.js, Manim for math)
  - LaTeX rendering for equations
  - Code syntax highlighting for coding lessons
  - Animated problem-solving sequences
  - Screen recording inserts for tutorials
```

---

### 2. Video Storage & Delivery

#### **Storage Strategy**
```
Option A: AWS S3 + CloudFront CDN
  - S3 buckets: learnai-video-lessons-{env}
  - CloudFront for global CDN delivery
  - Cost: $0.023/GB storage, $0.085/GB transfer

Option B: Cloudflare R2 + Workers
  - R2 for object storage (S3-compatible)
  - Cloudflare CDN built-in (global edge network)
  - Cost: $0.015/GB storage, $0 egress fees 💰

Recommended: Cloudflare R2 (zero egress costs)
```

#### **Video Encoding & Formats**
```
Adaptive Bitrate Streaming (HLS/DASH):
  - 1080p (5 Mbps) - Desktop, high bandwidth
  - 720p (2.5 Mbps) - Default for most devices
  - 480p (1 Mbps) - Mobile, low bandwidth
  - 360p (500 Kbps) - Fallback for very slow connections

Tools:
  - FFmpeg for transcoding
  - AWS MediaConvert or Cloudflare Stream for automation
```

#### **Video Metadata Database**
```sql
CREATE TABLE video_lessons (
  id UUID PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id),
  topic VARCHAR(255),
  grade_level_min INTEGER,
  grade_level_max INTEGER,
  title VARCHAR(255),
  description TEXT,
  duration_seconds INTEGER,
  thumbnail_url VARCHAR(500),
  video_url VARCHAR(500),
  transcript TEXT,
  captions_url VARCHAR(500),
  difficulty ENUM('EASY', 'MEDIUM', 'HARD'),
  created_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2)
);

CREATE TABLE video_lesson_views (
  id UUID PRIMARY KEY,
  video_lesson_id UUID REFERENCES video_lessons(id),
  student_id INTEGER REFERENCES students(id),
  watched_duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP
);

CREATE INDEX idx_video_lessons_subject ON video_lessons(subject_id);
CREATE INDEX idx_video_lessons_grade ON video_lessons(grade_level_min, grade_level_max);
CREATE INDEX idx_video_lesson_views_student ON video_lesson_views(student_id);
```

---

### 3. Video Playback UI

#### **Video Player Component**
```jsx
// /app/components/VideoPlayer.js

Features:
  - Video.js or Plyr for player UI
  - Playback controls (play, pause, seek, speed, volume)
  - Quality selector (auto, 1080p, 720p, 480p, 360p)
  - Captions/subtitles toggle
  - Full-screen mode
  - Picture-in-picture support
  - Progress tracking (resume from last position)
  - Interactive quizzes at timestamps
  - Note-taking sidebar (timestamp-linked notes)
  - Ask tutor button (launches chat with context)
```

#### **Video Lesson Library**
```
/app/learn/videos/page.js - Video library dashboard
  - Grid view of video lessons
  - Filters: Subject, Grade, Topic, Difficulty, Duration
  - Search by keyword
  - Sort by: Recent, Popular, Recommended
  - Continue watching section
  - Recommended for you (based on progress)

/app/learn/videos/[id]/page.js - Video lesson detail
  - Video player
  - Lesson description and objectives
  - Related resources (practice problems, reading)
  - Related videos (next in series)
  - Comments/discussion (optional)
  - Progress indicator
```

---

### 4. Personalization Engine

#### **Video Recommendation System**
```javascript
Recommendation Factors:
  1. Current learning gaps (from StudentProgress)
  2. Recently studied topics
  3. Grade-appropriate content
  4. Difficulty level (adaptive based on performance)
  5. Learning style preference (visual, auditory, kinesthetic)
  6. Time of day / session length preferences
  7. Collaborative filtering (students like you watched...)

Algorithm:
  - Content-based filtering (topic similarity)
  - Collaborative filtering (viewing patterns)
  - Knowledge graph (prerequisite relationships)
  - Reinforcement learning (optimize for engagement + mastery)
```

#### **Dynamic Video Generation**
```
Personalized Video Parameters:
  - Student name in introduction
  - Examples from student's interests (sports, games, hobbies)
  - Pace adjustment (faster for advanced, slower for struggling)
  - Review segments (insert quick recap if prerequisite weak)
  - Practice problems at student's difficulty level

Implementation:
  - Template-based script generation
  - Variable insertion (name, examples, problems)
  - Conditional content blocks (if struggling, add review)
  - Real-time generation (generate on-demand vs. pre-render)
```

---

### 5. Video Analytics & Insights

#### **Tracking Metrics**
```javascript
Student-Level Metrics:
  - Videos watched (count, duration)
  - Completion rate (% of video watched)
  - Engagement score (pauses, rewinds, speed changes)
  - Quiz performance (embedded assessments)
  - Time to mastery (topic completion time)

Video-Level Metrics:
  - View count
  - Average completion rate
  - Drop-off points (where students stop watching)
  - Average rating
  - Quiz pass rate
  - Re-watch rate (indicator of difficulty)

Teacher-Level Insights:
  - Most watched videos
  - Low-performing videos (high drop-off)
  - Student engagement trends
  - Prerequisite gap detection
```

#### **A/B Testing Framework**
```
Test Variables:
  - Avatar style (friendly vs. professional)
  - Video length (5 vs. 10 vs. 15 minutes)
  - Teaching approach (direct instruction vs. inquiry-based)
  - Visual aids (heavy vs. minimal)
  - Pacing (slower vs. faster)

Metrics to Optimize:
  - Completion rate
  - Mastery improvement (pre/post assessment)
  - Student satisfaction (rating)
  - Retention (next-day recall)
```

---

### 6. Integration with Tutoring System

#### **Video ↔ Tutor Handoff**
```javascript
// During video playback:
"Ask Tutor" button → Opens ChatInterface with context:
  - Current video topic
  - Timestamp where question arose
  - Related content from video transcript

// During tutoring session:
Tutor suggests video:
  "Would you like to watch a 5-minute video on this topic?"
  → Launches VideoPlayer modal with recommended video
  → Returns to chat after completion

// Curriculum flow:
1. Watch video (concept introduction)
2. Practice with tutor (interactive problems)
3. Assessment (formative quiz)
4. Review video (if struggling) OR Advanced video (if mastered)
```

#### **Video as Learning Resource**
```javascript
// Update Subject/Topic metadata:
{
  topic: "Adding Fractions",
  resources: [
    { type: "VIDEO", title: "Introduction to Adding Fractions", duration: 8 },
    { type: "TUTOR", title: "Practice Adding Fractions", mode: "PRACTICE" },
    { type: "ASSESSMENT", title: "Fraction Addition Quiz", questions: 10 }
  ]
}

// TopicSelector shows all resource types:
- 📹 Video Lesson (8 min)
- 💬 Practice with Tutor
- 📝 Take Quiz
```

---

### 7. Cost Analysis

#### **Video Generation Costs**
```
Assumptions:
  - 6 subjects × 50 topics = 300 topics
  - 3 grade bands (K-2/3-5, 6-8, 9-12) = 900 videos
  - Average 10 minutes per video
  - HeyGen: $29/month (unlimited generations) OR D-ID: $0.10/min

Option A (HeyGen):
  - Monthly subscription: $29
  - Generation time: ~15 min to generate 10 min video
  - Total generation time: 900 × 15 min = 225 hours
  - Cost: $29/month (one-time generation batch)

Option B (D-ID):
  - Per-video cost: 10 min × $0.10 = $1.00/video
  - Total: 900 × $1.00 = $900 one-time
  - No monthly subscription

Recommended: HeyGen subscription for generation phase, then cancel
```

#### **Storage & Delivery Costs**
```
Assumptions:
  - 900 videos × 10 min × ~100MB/min (HLS multi-bitrate) = 900GB
  - 1,000 students × 30 min video/month = 30,000 min/month
  - 30,000 min × 100MB = 3TB transfer/month

Cloudflare R2 + CDN:
  - Storage: 900GB × $0.015 = $13.50/month
  - Egress: 3TB × $0 = $0/month (free!)
  - Total: ~$14/month

AWS S3 + CloudFront:
  - Storage: 900GB × $0.023 = $20.70/month
  - Egress: 3TB × $0.085 = $255/month
  - Total: ~$276/month

Savings with Cloudflare: $262/month = $3,144/year 💰
```

#### **Total Infrastructure Cost**
```
Initial Setup:
  - Video generation (900 videos): $29 (HeyGen 1 month)
  - Storage setup: $0 (Cloudflare R2 free tier)
  - Development time: ~2-3 weeks (engineer time)

Ongoing Monthly (1,000 students):
  - Storage: $14/month
  - API costs (script generation): ~$50/month (GPT-4)
  - Monitoring/analytics: $0 (included in existing stack)
  - Total: ~$64/month or $0.064/student/month
```

---

### 8. Implementation Roadmap

#### **Phase 1: MVP (Weeks 1-3)**
- [ ] Set up Cloudflare R2 bucket and CDN
- [ ] Integrate HeyGen or D-ID API for avatar generation
- [ ] Build script generation service (Curriculum Agent + GPT-4)
- [ ] Create VideoLesson model and migrations
- [ ] Build basic VideoPlayer component
- [ ] Generate 10 pilot videos (2 subjects, 5 topics each)
- [ ] Test end-to-end video delivery

#### **Phase 2: Library & Discovery (Weeks 4-6)**
- [ ] Build video library UI (/learn/videos)
- [ ] Implement video search and filtering
- [ ] Add progress tracking (watch history, resume)
- [ ] Build recommendation engine v1 (simple content-based)
- [ ] Generate 100 videos (expand to all subjects)
- [ ] Add captions/transcripts

#### **Phase 3: Personalization (Weeks 7-9)**
- [ ] Dynamic video generation (student name, examples)
- [ ] Adaptive difficulty selection
- [ ] Learning style detection (visual/auditory preference)
- [ ] Enhanced recommendations (collaborative filtering)
- [ ] Interactive quizzes at timestamps
- [ ] Video ↔ Tutor handoff integration

#### **Phase 4: Analytics & Optimization (Weeks 10-12)**
- [ ] Video analytics dashboard (teacher/admin view)
- [ ] Drop-off analysis and insights
- [ ] A/B testing framework
- [ ] Automated quality improvement (low-performing video flagging)
- [ ] Generate full library (900 videos)
- [ ] Performance optimization and caching

---

### 9. Technology Stack Summary

| Component | Technology | Cost |
|-----------|------------|------|
| **Script Generation** | GPT-4 Turbo | $0.01/1K tokens |
| **Avatar Video** | HeyGen or D-ID | $29/mo or $0.10/min |
| **Voice Synthesis** | ElevenLabs (optional) | $22/mo |
| **Visual Generation** | Manim, D3.js | Open source |
| **Video Storage** | Cloudflare R2 | $0.015/GB |
| **CDN Delivery** | Cloudflare CDN | $0 egress |
| **Video Encoding** | FFmpeg | Open source |
| **Video Player** | Video.js or Plyr | Open source |
| **Transcription** | OpenAI Whisper | $0.006/min |
| **Database** | PostgreSQL (existing) | Existing |
| **Analytics** | Custom (Vercel Analytics) | Existing |

---

### 10. Key Decisions to Make Later

1. **Avatar Style**: Realistic human-like vs. Cartoon/animated?
2. **Pre-render vs. On-demand**: Generate all videos upfront or generate on first request?
3. **Localization**: Support multiple languages? (Spanish, Mandarin, etc.)
4. **Offline Support**: Allow video downloads for offline viewing?
5. **Live Video**: Support live-streamed lessons with real teachers?
6. **Interactive Elements**: Clickable diagrams, embedded coding playgrounds?
7. **Social Features**: Student comments, discussions, collaborative viewing?

---

### 11. Integration Points with Current System

```javascript
// Add to /app/learn/page.js - Resource type selection
const resourceTypes = [
  { type: 'TUTOR', icon: '💬', label: 'Practice with Tutor' },
  { type: 'VIDEO', icon: '📹', label: 'Watch Video Lesson' },  // NEW
  { type: 'ASSESSMENT', icon: '📝', label: 'Take Assessment' }
];

// Add to Subject model:
hasVideos: boolean  // Flag to show video icon

// Add to Topic model:
videoLessonId: UUID  // Link to video_lessons table

// Add to Dashboard:
"Continue Watching" section (recent video lessons)
"Recommended Videos" based on learning gaps
```

---

### 12. Success Metrics

#### **Engagement Metrics**
- Video completion rate > 70%
- Average watch time > 8 min per video
- Re-watch rate < 20% (not too confusing)
- Video-to-tutor handoff rate > 30%

#### **Learning Outcomes**
- Post-video quiz pass rate > 75%
- Topic mastery improvement: +20% after video
- Reduced tutor session time (students come prepared)
- Higher student satisfaction scores

#### **Business Metrics**
- Cost per video view < $0.10
- Video library growth: +50 videos/month
- Student video usage: 30+ min/month average
- Teacher time saved: 5+ hours/week (less re-explaining)

---

## Next Steps When We Implement

1. **Research Phase**: Test HeyGen, D-ID, Synthesia with 3-5 pilot videos
2. **Architecture Setup**: Cloudflare R2, video database schema
3. **Script Generation**: Enhance Curriculum Agent for video scripts
4. **MVP Development**: Build VideoPlayer + Library UI
5. **Content Creation**: Generate pilot library (50-100 videos)
6. **Beta Testing**: Select 20 students for feedback
7. **Iterate**: Refine based on engagement data and feedback
8. **Scale**: Generate full library, launch to all students

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
**Next Review**: When ready to implement video infrastructure
