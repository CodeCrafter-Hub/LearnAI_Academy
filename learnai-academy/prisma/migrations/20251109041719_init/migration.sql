-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "gradeLevel" INTEGER NOT NULL,
    "birthDate" DATETIME,
    "avatarUrl" TEXT,
    "preferences" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "students_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "minGrade" INTEGER NOT NULL,
    "maxGrade" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "parentTopicId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "gradeLevel" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "learningStandards" JSONB,
    "prerequisites" JSONB,
    "estimatedHours" REAL,
    "orderIndex" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "topics_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "topics" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedTime" INTEGER,
    "mediaUrls" JSONB,
    "metadata" JSONB,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "qualityScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_items_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "masteryLevel" REAL NOT NULL DEFAULT 0,
    "totalTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" DATETIME,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "nextRecommendedTopics" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_progress_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "learning_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT,
    "topicId" TEXT,
    "sessionMode" TEXT NOT NULL,
    "difficultyLevel" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    "durationMinutes" INTEGER,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "problemsAttempted" INTEGER NOT NULL DEFAULT 0,
    "problemsCorrect" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "sessionData" JSONB,
    "aiAgentUsed" TEXT,
    "qualityRating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "learning_sessions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "learning_sessions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "sequenceNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "learning_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "student_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progressData" JSONB,
    CONSTRAINT "student_achievements_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "activityDate" DATETIME NOT NULL,
    "minutesLearned" INTEGER NOT NULL DEFAULT 0,
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "topicsStudied" JSONB,
    "streakDay" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_activity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "subjectId" TEXT,
    "topics" JSONB,
    "gradeLevel" INTEGER,
    "totalQuestions" INTEGER NOT NULL,
    "timeLimitMinutes" INTEGER,
    "passingScore" REAL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "assessment_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "score" REAL NOT NULL,
    "totalCorrect" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "timeTakenMinutes" INTEGER,
    "questionResults" JSONB,
    "recommendedTopics" JSONB,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_results_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assessment_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assessment_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "learning_sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalCost" REAL,
    "responseTimeMs" INTEGER,
    "modelUsed" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "learning_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "students_userId_idx" ON "students"("userId");

-- CreateIndex
CREATE INDEX "students_parentId_idx" ON "students"("parentId");

-- CreateIndex
CREATE INDEX "students_gradeLevel_idx" ON "students"("gradeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");

-- CreateIndex
CREATE INDEX "subjects_isActive_orderIndex_idx" ON "subjects"("isActive", "orderIndex");

-- CreateIndex
CREATE INDEX "subjects_minGrade_maxGrade_idx" ON "subjects"("minGrade", "maxGrade");

-- CreateIndex
CREATE INDEX "topics_subjectId_gradeLevel_idx" ON "topics"("subjectId", "gradeLevel");

-- CreateIndex
CREATE INDEX "topics_gradeLevel_difficulty_idx" ON "topics"("gradeLevel", "difficulty");

-- CreateIndex
CREATE INDEX "topics_isActive_orderIndex_idx" ON "topics"("isActive", "orderIndex");

-- CreateIndex
CREATE INDEX "topics_parentTopicId_idx" ON "topics"("parentTopicId");

-- CreateIndex
CREATE INDEX "topics_difficulty_idx" ON "topics"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "topics_subjectId_slug_key" ON "topics"("subjectId", "slug");

-- CreateIndex
CREATE INDEX "student_progress_studentId_masteryLevel_idx" ON "student_progress"("studentId", "masteryLevel");

-- CreateIndex
CREATE INDEX "student_progress_topicId_lastPracticedAt_idx" ON "student_progress"("topicId", "lastPracticedAt");

-- CreateIndex
CREATE INDEX "student_progress_subjectId_idx" ON "student_progress"("subjectId");

-- CreateIndex
CREATE INDEX "student_progress_masteryLevel_idx" ON "student_progress"("masteryLevel");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_studentId_topicId_key" ON "student_progress"("studentId", "topicId");

-- CreateIndex
CREATE INDEX "learning_sessions_studentId_startedAt_idx" ON "learning_sessions"("studentId", "startedAt");

-- CreateIndex
CREATE INDEX "learning_sessions_subjectId_sessionMode_idx" ON "learning_sessions"("subjectId", "sessionMode");

-- CreateIndex
CREATE INDEX "learning_sessions_subjectId_idx" ON "learning_sessions"("subjectId");

-- CreateIndex
CREATE INDEX "learning_sessions_topicId_idx" ON "learning_sessions"("topicId");

-- CreateIndex
CREATE INDEX "learning_sessions_sessionMode_idx" ON "learning_sessions"("sessionMode");

-- CreateIndex
CREATE INDEX "learning_sessions_createdAt_idx" ON "learning_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "session_messages_sessionId_sequenceNumber_idx" ON "session_messages"("sessionId", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "student_achievements_studentId_achievementId_key" ON "student_achievements"("studentId", "achievementId");

-- CreateIndex
CREATE INDEX "daily_activity_studentId_activityDate_idx" ON "daily_activity"("studentId", "activityDate");

-- CreateIndex
CREATE INDEX "daily_activity_activityDate_idx" ON "daily_activity"("activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activity_studentId_activityDate_key" ON "daily_activity"("studentId", "activityDate");

-- CreateIndex
CREATE INDEX "assessment_results_studentId_takenAt_idx" ON "assessment_results"("studentId", "takenAt");

-- CreateIndex
CREATE INDEX "assessment_results_assessmentId_idx" ON "assessment_results"("assessmentId");

-- CreateIndex
CREATE INDEX "agent_logs_sessionId_createdAt_idx" ON "agent_logs"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "agent_logs_agentType_idx" ON "agent_logs"("agentType");
