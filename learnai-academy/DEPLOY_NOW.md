# 🚀 Deploy Now - Quick Guide

## Step 1: Deploy to Vercel (5 minutes)

### Via Vercel Dashboard:

1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. **Click:** "Add New Project" or "Import Project"
4. **Select:** Your `LearnAI_Academy` repository
5. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `learnai-academy` ⚠️ **IMPORTANT**
   - Build Command: `npm run build` (default)
   - Click **"Deploy"**

6. **Wait** for first deployment (will fail without env vars - that's OK)

---

## Step 2: Set Up Database (10 minutes)

### Option A: Neon (Recommended - Free)

1. Go to: https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy connection string
5. **Change `postgres://` to `postgresql://`** ⚠️ **CRITICAL**

### Option B: Supabase (Free)

1. Go to: https://supabase.com
2. Sign up
3. Create project
4. Go to Settings → Database
5. Copy connection string

---

## Step 3: Add Environment Variables (5 minutes)

**In Vercel Dashboard → Your Project → Settings → Environment Variables:**

### Required Variables:

1. **DATABASE_URL**
   - Value: Your PostgreSQL connection string
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **JWT_SECRET**
   - Generate: `openssl rand -base64 32` (or use online generator)
   - Example: `phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=`
   - Environments: ✅ All three

3. **GROQ_API_KEY** (Optional but recommended)
   - Get from: https://console.groq.com/
   - Environments: ✅ All three

4. **JWT_EXPIRES_IN** (Optional)
   - Value: `7d`
   - Environments: ✅ All three

---

## Step 4: Run Database Migrations (5 minutes)

**In your terminal:**

```bash
# Install Vercel CLI
npm install -g vercel

# Link project
cd learnai-academy
vercel login
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database (creates demo account)
node prisma/seed.js

# Create test accounts (optional - for all grades)
npm run test:accounts
```

---

## Step 5: Redeploy (2 minutes)

1. **Go to Vercel Dashboard**
2. **Deployments** tab
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**
5. Wait for completion

---

## Step 6: Test (5 minutes)

1. **Visit your Vercel URL**
2. **Test Registration:**
   - Go to `/register`
   - Create account
   - Should work with new validation

3. **Test Login:**
   - Go to `/login`
   - Use: `demo@learnai.com` / `demo123`
   - Or: `admin@test.com` / `TestAccount123!`

4. **Test All Grades:**
   - Login with: `grade0@test.com` through `grade12@test.com`
   - Password: `TestAccount123!`

---

## ✅ Success Checklist

- [ ] Vercel deployment successful
- [ ] Database connected
- [ ] Environment variables set
- [ ] Migrations ran successfully
- [ ] Database seeded
- [ ] Can register new account
- [ ] Can login with test accounts
- [ ] Dashboard loads
- [ ] All features work

---

## 🎯 Test Accounts

**All use password:** `TestAccount123!`

- **Admin:** `admin@test.com`
- **Parent:** `parent@test.com`
- **Grade K:** `grade0@test.com`
- **Grade 1-12:** `grade1@test.com` through `grade12@test.com`
- **Demo:** `demo@learnai.com` / `demo123`

---

## 📞 Need Help?

- **Build errors:** Check Vercel build logs
- **Database errors:** Verify DATABASE_URL format
- **Auth errors:** Check JWT_SECRET is set
- **Deployment issues:** See `DEPLOYMENT_STEPS.md` for detailed guide

---

**Total Time: ~30 minutes**

**Ready to deploy!** 🚀

