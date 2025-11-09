# Vercel Deployment Guide - What to Expect

## 🎯 Initial Page Load

When you first visit your deployed site, you should see:

### Homepage (`/`)
- **Welcome screen** with "LearnAI Academy" branding
- **Call-to-action buttons**: "Get Started Free" and "Sign In"
- **Feature cards**: AI-Powered Tutoring, Instant Feedback, Gamified Learning, Parent Dashboard
- **Subject icons**: Math, English, Reading, Science, Writing, Coding
- **Gradient background** (blue → purple → pink)

## ⚙️ Required Environment Variables

**CRITICAL:** You must set these in Vercel's project settings → Environment Variables:

### Required for Basic Functionality
1. **`DATABASE_URL`** (PostgreSQL)
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - Options: Supabase, Neon, Railway, or any PostgreSQL provider
   - ⚠️ **Without this**: Database operations will fail

2. **`GROQ_API_KEY`** (AI Tutoring)
   - Get from: https://console.groq.com/
   - ⚠️ **Without this**: AI features won't work (will return mock responses)

3. **`JWT_SECRET`** (Authentication)
   - Generate a random secure string (e.g., `openssl rand -base64 32`)
   - ⚠️ **Without this**: Login/authentication will fail

4. **`JWT_EXPIRES_IN`** (Optional, defaults to "7d")
   - Example: `7d`, `24h`, `30d`

### Optional (for full functionality)
5. **`REDIS_URL`** (Caching)
   - **Recommended**: Upstash (free tier available)
   - Format: `redis://default:PASSWORD@ENDPOINT:6379`
   - Get from: https://upstash.com/ (see `UPSTASH_REDIS_SETUP.md` for details)
   - ⚠️ **Without this**: App works but caching won't function
   - ✅ **Free tier**: 10,000 commands/day (perfect for development)

6. **`NEXT_PUBLIC_APP_URL`** (Optional)
   - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - Used for email links and redirects

## 📊 Database Setup

### Step 1: Create Database
1. Sign up for a PostgreSQL provider (Supabase, Neon, etc.)
2. Create a new database
3. Copy the connection string → set as `DATABASE_URL` in Vercel

### Step 2: Run Migrations
**Option A: Using Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations
npx prisma migrate deploy
```

**Option B: Using Database Provider's Console**
- Connect via psql or web console
- Run the SQL from `prisma/migrations/` folder

### Step 3: Seed Database
```bash
# Run seed script
node prisma/seed.js
# Or via Vercel CLI
vercel env pull .env.local
node prisma/seed.js
```

**What gets seeded:**
- ✅ 6 Subjects (Math, English, Reading, Science, Writing, Coding)
- ✅ Multiple topics per subject
- ✅ 15 Achievements (first_session, streaks, points, etc.)
- ✅ Demo user: `demo@learnai.com` / `demo123`
- ✅ Demo student: Alex Student (Grade 5)

## 🚀 What Works After Deployment

### ✅ Should Work Immediately
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Register/Login pages render
- ✅ Static pages (if any)

### ⚠️ Requires Database Setup
- ❌ User registration/login
- ❌ Dashboard access
- ❌ Learning sessions
- ❌ Progress tracking
- ❌ Achievements

### ⚠️ Requires GROQ_API_KEY
- ❌ AI tutoring conversations
- ❌ Curriculum generation
- ❌ Assessment generation
- ⚠️ Will return mock/placeholder responses

### ⚠️ Requires REDIS_URL
- ❌ Session caching
- ❌ Subject list caching
- ✅ App still works, just slower

## 🧪 Testing the Deployment

### Step 1: Test Homepage
1. Visit your Vercel URL
2. Should see welcome page with features
3. Click "Get Started Free" → should go to `/register`
4. Click "Sign In" → should go to `/login`

### Step 2: Test Registration (after DB setup)
1. Go to `/register`
2. Fill in form:
   - Email: `test@example.com`
   - Password: `test123`
   - Name, grade level, etc.
3. Submit → should create account and redirect to dashboard

### Step 3: Test Login (after DB setup)
1. Go to `/login`
2. Use demo account:
   - Email: `demo@learnai.com`
   - Password: `demo123`
3. Should redirect to `/dashboard`

### Step 4: Test Dashboard
After login, you should see:
- Student profile card
- Subject selection (Math, English, Reading, etc.)
- Quick stats (if any sessions exist)
- Navigation to Progress, Achievements, etc.

### Step 5: Test Learning Session
1. Click "Start Learning" or go to `/learn`
2. Select a subject (e.g., Math)
3. Select a topic
4. Choose mode (Practice or Help)
5. Choose difficulty (Easy, Medium, Hard)
6. Start session → should open chat interface

### Step 6: Test AI Features (after GROQ_API_KEY setup)
1. In chat, send a message
2. Should receive AI tutor response
3. Try asking: "What is 2+2?" or "Help me with fractions"

## 🔍 Troubleshooting

### Issue: "Route not available during build"
- **Status**: ✅ Normal during build
- **Action**: This is expected and won't affect runtime

### Issue: "Database connection failed"
- **Check**: `DATABASE_URL` is set correctly in Vercel
- **Check**: Database allows connections from Vercel IPs
- **Check**: Database is running and accessible

### Issue: "AI service not available"
- **Check**: `GROQ_API_KEY` is set in Vercel
- **Check**: API key is valid and has credits
- **Note**: App will work but return mock responses

### Issue: "Unauthorized" errors
- **Check**: `JWT_SECRET` is set in Vercel
- **Check**: User is logged in (check browser localStorage for token)
- **Action**: Try logging in again

### Issue: Pages show errors
- **Check**: Vercel deployment logs
- **Check**: Environment variables are set
- **Check**: Database migrations ran successfully

## 📱 Expected User Flow

### New User Journey
1. **Landing Page** (`/`)
   - See features and benefits
   - Click "Get Started Free"

2. **Registration** (`/register`)
   - Fill in form
   - Create account
   - Auto-login → Dashboard

3. **Dashboard** (`/dashboard`)
   - See student profile
   - View subjects
   - Start learning session

4. **Learning** (`/learn`)
   - Select subject → topic → mode → difficulty
   - Start interactive session
   - Chat with AI tutor

5. **Progress** (`/progress`)
   - View learning analytics
   - See achievements
   - Track mastery levels

### Parent Dashboard
- Access via `/parent` (if logged in as parent)
- View child's progress
- See learning statistics
- Monitor achievements

## 🎯 Success Indicators

Your deployment is successful when:
- ✅ Homepage loads without errors
- ✅ Can register new users
- ✅ Can login with demo account
- ✅ Dashboard shows student data
- ✅ Can start learning sessions
- ✅ AI tutor responds (if GROQ_API_KEY is set)
- ✅ Progress tracking works
- ✅ Achievements unlock

## 📝 Next Steps After Deployment

1. **Set up monitoring**
   - Add Vercel Analytics
   - Set up error tracking (Sentry, etc.)

2. **Configure email** (optional)
   - Set up email service for notifications
   - Configure SMTP settings

3. **Customize content**
   - Update subjects and topics in database
   - Add more achievements
   - Customize UI branding

4. **Add features**
   - Voice communication (planned)
   - AI agent video (planned)
   - More subject-specific agents

## 🆘 Need Help?

- Check Vercel deployment logs: Project → Deployments → Click deployment → View logs
- Check function logs: Project → Functions → View logs
- Database issues: Check connection string and network access
- API issues: Verify environment variables are set correctly

---

**Remember**: The app is designed to gracefully handle missing services (returns mock responses), but for full functionality, you need:
1. ✅ Database (PostgreSQL)
2. ✅ Groq API Key
3. ✅ JWT Secret
4. ⚠️ Redis (optional, for caching)

