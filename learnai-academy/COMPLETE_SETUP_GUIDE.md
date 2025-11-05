# Complete Setup Guide - LearnAI Academy

This guide will walk you through setting up the entire application from scratch, step by step.

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ A GitHub account
- ✅ A Vercel account (free tier works)
- ✅ A Neon account (free tier for PostgreSQL)
- ✅ Node.js installed locally (optional, for running migrations)
- ✅ Git installed (optional, for local testing)

---

## Part 1: Database Setup (Neon)

### Step 1.1: Create Neon Account

1. Go to https://neon.tech
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### Step 1.2: Create a New Project

1. After logging in, click **"Create a project"**
2. Fill in:
   - **Project name**: `learnai-academy` (or any name)
   - **Database name**: `neondb` (default is fine)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
3. Click **"Create project"**
4. Wait 1-2 minutes for the project to be created

### Step 1.3: Get Connection String

1. Once the project is created, you'll see the dashboard
2. Look for **"Connection string"** or **"Connection details"**
3. You'll see something like:
   ```
   postgres://neondb_owner:xxxxx@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **IMPORTANT**: Change `postgres://` to `postgresql://` for Prisma compatibility
5. Your final connection string should look like:
   ```
   postgresql://neondb_owner:xxxxx@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
6. **Copy this connection string** - you'll need it in the next section

---

## Part 2: Vercel Deployment

### Step 2.1: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Sign up with GitHub (recommended)
4. Click **"Add New Project"** or **"Import Project"**
5. If your code is on GitHub:
   - Select your repository: `LearnAI_Academy`
   - Vercel will auto-detect it's a Next.js project
6. Click **"Deploy"** (don't worry about environment variables yet)

### Step 2.2: Set Environment Variables

After the first deployment, set up environment variables:

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** (top menu)
3. Click **"Environment Variables"** (left sidebar)
4. Add the following variables one by one:

#### Variable 1: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Paste your Neon connection string (from Step 1.3)
  - Make sure it starts with `postgresql://` (not `postgres://`)
- **Environment**: Select all three:
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Click **"Save"**

#### Variable 2: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: Generate a random string:
  - **Option A**: Use online generator: https://randomkeygen.com/
  - **Option B**: Run in terminal: `openssl rand -base64 32`
  - **Option C**: Use any random string (at least 32 characters)
  - Example: `my-super-secret-jwt-key-change-this-in-production-12345`
- **Environment**: Select all three (Production, Preview, Development)
- Click **"Save"**

#### Variable 3: GROQ_API_KEY (Optional but Recommended)
- **Name**: `GROQ_API_KEY`
- **Value**: Get from https://console.groq.com/
  1. Sign up/login at https://console.groq.com/
  2. Go to API Keys section
  3. Create a new API key
  4. Copy the key
- **Environment**: Select all three
- Click **"Save"**

#### Variable 4: JWT_EXPIRES_IN (Optional)
- **Name**: `JWT_EXPIRES_IN`
- **Value**: `7d` (or `24h`, `30d`, etc.)
- **Environment**: Select all three
- Click **"Save"**

#### Variable 5: REDIS_URL (Optional)
- **Name**: `REDIS_URL`
- **Value**: Leave empty for now (app works without Redis)
- Or set up Upstash Redis: https://upstash.com/
- **Environment**: Select all three
- Click **"Save"** (even if empty)

### Step 2.3: Redeploy

After setting environment variables:

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

---

## Part 3: Database Migrations

### Step 3.1: Install Vercel CLI (if not installed)

**On Windows (PowerShell):**
```powershell
npm install -g vercel
```

**On Mac/Linux:**
```bash
npm install -g vercel
```

**Verify installation:**
```bash
vercel --version
```

### Step 3.2: Link Your Project

1. Open terminal/command prompt
2. Navigate to your project:
   ```bash
   cd learnai-academy
   ```
3. Login to Vercel:
   ```bash
   vercel login
   ```
   - Follow the prompts to authenticate
4. Link to your project:
   ```bash
   vercel link
   ```
   - Select your account
   - Select your project: `learnai-academy`
   - Use default settings (press Enter)

### Step 3.3: Pull Environment Variables

```bash
vercel env pull .env.local
```

This creates a `.env.local` file with your environment variables.

### Step 3.4: Install Dependencies (if not done)

```bash
npm install
```

### Step 3.5: Run Database Migrations

This creates all the database tables:

```bash
npx prisma migrate deploy
```

**Expected output:**
```
Applying migration `20240101000000_init`
✅ Database migrations completed successfully
```

If you see errors:
- **"Can't reach database server"**: Check your `DATABASE_URL` in `.env.local`
- **"No migrations found"**: Run `npx prisma migrate dev --name init` first

### Step 3.6: Generate Prisma Client

```bash
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

### Step 3.7: Seed Database (Create Demo Account)

This creates:
- Demo user: `demo@learnai.com` / `demo123`
- Subjects and topics
- Achievements

```bash
node prisma/seed.js
```

**Expected output:**
```
🌱 Seeding database...
✅ Database seeded successfully!
```

---

## Part 4: Verification & Testing

### Step 4.1: Test Database Connection

```bash
npx prisma db pull
```

**Expected output:**
```
Introspection completed successfully
```

If this works, your database is connected correctly!

### Step 4.2: Test Your Deployment

1. Go to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. You should see the homepage with:
   - Welcome message
   - Feature cards
   - Subject icons
   - "Get Started Free" and "Sign In" buttons

### Step 4.3: Test Registration

1. Click **"Get Started Free"**
2. Fill out the form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `test123456`
   - Role: `Parent` or `Student`
3. Click **"Create Account"**
4. **Expected**: Should redirect to dashboard

### Step 4.4: Test Login

1. Click **"Sign In"** (or go to `/login`)
2. Try demo account:
   - Email: `demo@learnai.com`
   - Password: `demo123`
3. Click **"Sign In"**
4. **Expected**: Should redirect to dashboard

### Step 4.5: Test Dashboard

After logging in, you should see:
- Welcome message with your name
- Subject cards (Math, English, Reading, etc.)
- Progress stats (if you have sessions)
- Navigation menu

---

## Part 5: Troubleshooting

### Problem: "Application error: a server-side exception"

**Solution:**
1. Check Vercel logs: Dashboard → Deployments → Latest → Functions
2. Most likely: Migrations not run → Run `npx prisma migrate deploy`
3. Or: JWT_SECRET not set → Add in Vercel environment variables

### Problem: "401 Unauthorized" on login

**Solution:**
1. Verify `JWT_SECRET` is set in Vercel
2. Run migrations: `npx prisma migrate deploy`
3. Seed database: `node prisma/seed.js`
4. Try demo account: `demo@learnai.com` / `demo123`

### Problem: "Database connection error"

**Solution:**
1. Check `DATABASE_URL` in Vercel:
   - Must start with `postgresql://` (not `postgres://`)
   - Must include `?sslmode=require`
2. Test connection: `npx prisma db pull`
3. Check Neon dashboard - is database active?

### Problem: "Prisma Client not generated"

**Solution:**
1. This is now fixed in `package.json` with `postinstall` script
2. If still happens, run manually: `npx prisma generate`
3. Redeploy on Vercel

### Problem: "404" errors

**Solution:**
- Usually harmless (missing favicon/assets)
- Check if API routes are working
- Focus on fixing 401/500 errors first

---

## Part 6: Environment Variables Checklist

Make sure these are set in Vercel:

### Required ✅
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `JWT_SECRET` - Random secure string

### Optional but Recommended
- [ ] `GROQ_API_KEY` - For AI features
- [ ] `JWT_EXPIRES_IN` - Default: `7d`
- [ ] `REDIS_URL` - For caching (optional)

---

## Part 7: Quick Command Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login and link project
vercel login
vercel link

# Pull environment variables
vercel env pull .env.local

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
node prisma/seed.js

# Test database connection
npx prisma db pull

# View database (optional)
npx prisma studio
```

---

## Part 8: Success Indicators

Your setup is complete when:

✅ Homepage loads without errors
✅ Can register new accounts
✅ Can login with demo account (`demo@learnai.com` / `demo123`)
✅ Dashboard shows after login
✅ Subjects are visible on dashboard
✅ No errors in browser console (F12)
✅ No errors in Vercel function logs

---

## Part 9: Next Steps

After setup is complete:

1. **Customize Content**
   - Update subjects/topics in database
   - Add more achievements
   - Customize UI

2. **Set Up Monitoring**
   - Add Vercel Analytics
   - Set up error tracking (Sentry)

3. **Configure Email** (Optional)
   - Set up email service for notifications
   - Configure SMTP settings

4. **Add Features**
   - Voice communication (planned)
   - AI agent video (planned)
   - More subject-specific agents

---

## Getting Help

If you encounter issues:

1. **Check Vercel Logs**
   - Dashboard → Deployments → Latest → Functions
   - Look for error messages

2. **Check Browser Console**
   - Press F12 → Console tab
   - Look for red errors

3. **Verify Environment Variables**
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure all required variables are set

4. **Test Database Connection**
   ```bash
   npx prisma db pull
   ```

5. **Review Documentation**
   - `TROUBLESHOOTING.md` - Common issues
   - `LOGIN_FIX.md` - Login-specific issues
   - `DEBUG_SERVER_ERROR.md` - Server error debugging

---

## Summary Checklist

- [ ] Neon database created
- [ ] Connection string copied (with `postgresql://`)
- [ ] Vercel project deployed
- [ ] `DATABASE_URL` set in Vercel
- [ ] `JWT_SECRET` set in Vercel
- [ ] `GROQ_API_KEY` set in Vercel (optional)
- [ ] Vercel CLI installed and linked
- [ ] Environment variables pulled locally
- [ ] Migrations run (`npx prisma migrate deploy`)
- [ ] Prisma Client generated
- [ ] Database seeded (`node prisma/seed.js`)
- [ ] Homepage loads correctly
- [ ] Registration works
- [ ] Login works (with demo account)
- [ ] Dashboard displays after login

---

**Congratulations!** 🎉 If all checkboxes are complete, your LearnAI Academy is fully set up and ready to use!

