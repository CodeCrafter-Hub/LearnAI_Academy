# Deployment Guide - Step by Step

**Date:** November 9, 2025  
**Platform:** Vercel (Recommended)

---

## 🚀 Quick Deployment Steps

### Step 1: Prepare Repository
✅ Code is already committed and pushed to GitHub

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up/Login with GitHub

2. **Import Project**
   - Click "Add New Project" or "Import Project"
   - Select your GitHub repository: `LearnAI_Academy`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `learnai-academy` (if your repo has this folder)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - Click "Deploy"

4. **Wait for First Deployment**
   - This will fail initially (no env vars), but that's OK
   - We'll add environment variables next

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from learnai-academy directory)
cd learnai-academy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time)
# - Project name? learnai-academy
# - Directory? ./
# - Override settings? No
```

---

### Step 3: Set Up Database

**Choose a PostgreSQL provider:**

#### Option 1: Neon (Recommended - Free Tier)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy connection string
5. **IMPORTANT:** Change `postgres://` to `postgresql://`

#### Option 2: Supabase (Free Tier)
1. Go to https://supabase.com
2. Sign up
3. Create new project
4. Go to Settings → Database
5. Copy connection string

#### Option 3: Railway
1. Go to https://railway.app
2. Sign up
3. Create project → Add PostgreSQL
4. Copy DATABASE_URL

---

### Step 4: Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Add Required Variables:**

   **Variable 1: DATABASE_URL**
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string (from Step 3)
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 2: JWT_SECRET**
   - Name: `JWT_SECRET`
   - Value: Generate a random string:
     ```bash
     # On Mac/Linux:
     openssl rand -base64 32
     
     # Or use online generator:
     # https://randomkeygen.com/
     ```
   - Example: `phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=`
   - Environment: ✅ All three
   - Click "Save"

   **Variable 3: GROQ_API_KEY** (Optional but recommended)
   - Name: `GROQ_API_KEY`
   - Value: Get from https://console.groq.com/
   - Environment: ✅ All three
   - Click "Save"

   **Variable 4: JWT_EXPIRES_IN** (Optional)
   - Name: `JWT_EXPIRES_IN`
   - Value: `7d`
   - Environment: ✅ All three
   - Click "Save"

   **Variable 5: NEXT_PUBLIC_APP_URL** (Optional)
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: Your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Environment: ✅ All three
   - Click "Save"

   **Variable 6: REDIS_URL** (Optional - for caching)
   - Name: `REDIS_URL`
   - Value: Get from Upstash or Redis Cloud
   - Environment: ✅ All three
   - Click "Save"

---

### Step 5: Run Database Migrations

**After adding DATABASE_URL, run migrations:**

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Link project
cd learnai-academy
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database (creates demo account and test data)
node prisma/seed.js

# Create test accounts (optional - for testing all grades)
npm run test:accounts
```

---

### Step 6: Redeploy

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Wait for deployment to complete

---

### Step 7: Verify Deployment

1. **Visit your Vercel URL**
   - Should see homepage

2. **Test Registration**
   - Go to `/register`
   - Create a test account
   - Should redirect to dashboard

3. **Test Login**
   - Go to `/login`
   - Use demo account: `demo@learnai.com` / `demo123`
   - Should redirect to dashboard

4. **Test Test Accounts** (if you ran test:accounts)
   - Login with: `admin@test.com` / `TestAccount123!`
   - Or any grade account: `grade5@test.com` / `TestAccount123!`

---

## 📋 Environment Variables Checklist

Before deployment, ensure you have:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Random secure string (32+ chars)
- [ ] `GROQ_API_KEY` - From Groq console (optional)
- [ ] `JWT_EXPIRES_IN` - Token expiration (default: "7d")
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel URL (optional)
- [ ] `REDIS_URL` - Redis connection (optional)

---

## 🔧 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Ensure database allows connections from Vercel IPs
- Check database is running

### Authentication Fails
- Verify `JWT_SECRET` is set
- Check token expiration settings
- Clear browser cookies and try again

### Pages Show Errors
- Check Vercel function logs
- Verify environment variables are set
- Ensure migrations ran successfully

---

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Homepage loads without errors
- ✅ Can register new users
- ✅ Can login with demo/test accounts
- ✅ Dashboard shows after login
- ✅ Can start learning sessions
- ✅ All features work as expected

---

## 🎯 Next Steps After Deployment

1. **Test all features**
   - Registration
   - Login
   - Learning sessions
   - Progress tracking
   - All grade levels

2. **Set up monitoring**
   - Vercel Analytics (already included)
   - Error tracking (Sentry - already included)

3. **Configure custom domain** (optional)
   - Go to Vercel → Settings → Domains
   - Add your custom domain

4. **Set up email** (optional)
   - Configure SMTP for notifications
   - Add email service credentials

---

## 📝 Quick Reference

**Test Accounts:**
- Admin: `admin@test.com` / `TestAccount123!`
- Parent: `parent@test.com` / `TestAccount123!`
- Grade 5: `grade5@test.com` / `TestAccount123!`
- Demo: `demo@learnai.com` / `demo123`

**Important URLs:**
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Database: https://neon.tech
- Groq Console: https://console.groq.com/

---

**Ready to deploy!** 🚀

