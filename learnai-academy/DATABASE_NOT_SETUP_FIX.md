# Database Not Set Up - Fix Guide

## 🔍 Problem

The JSON parsing error (`Failed to execute 'json' on 'Response': Unexpected end of JSON input`) is **likely caused by the database not being set up**.

### Why This Happens

When API routes try to query the database:
1. **Without DATABASE_URL**: Prisma can't connect → throws error
2. **Error in API route**: Route fails before returning JSON
3. **Empty/invalid response**: Frontend tries to parse empty response → JSON error

### Symptoms

- ❌ JSON parsing errors in browser console
- ❌ API routes return 500 errors
- ❌ Registration/login fails
- ❌ Dashboard doesn't load
- ❌ Database queries fail

---

## ✅ Solution: Set Up Database

### Quick Fix (5 minutes)

1. **Create Neon Database**
   - Go to: https://neon.tech
   - Sign up (free)
   - Create project
   - Copy connection string

2. **Add to Vercel**
   - Go to Vercel Dashboard
   - Settings → Environment Variables
   - Add `DATABASE_URL` with your Neon connection string

3. **Run Migrations**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Redeploy**
   - Vercel Dashboard → Redeploy

---

## 🔧 Detailed Fix Steps

### Step 1: Create Neon Database

1. **Sign Up**
   - Visit: https://neon.tech
   - Click "Sign Up"
   - Sign up with GitHub (recommended)

2. **Create Project**
   - Click "Create a project"
   - Name: `learnai-academy`
   - Region: Choose closest (e.g., `us-east-1`)
   - Click "Create project"

3. **Get Connection String**
   - After creation, you'll see the dashboard
   - Find "Connection string" section
   - Copy the connection string
   - **IMPORTANT**: Change `postgres://` to `postgresql://`
   
   Example:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Add DATABASE_URL to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variable**
   - Go to **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

---

### Step 3: Run Database Migrations

**In your terminal:**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Navigate to project
cd learnai-academy

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Verify DATABASE_URL is set
cat .env.local | grep DATABASE_URL

# Run migrations (creates all tables)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database (creates demo account)
node prisma/seed.js
```

**Expected Output:**
```
✅ Migration applied successfully
✅ Prisma Client generated
✅ Database seeded
```

---

### Step 4: Verify Database Connection

**Test connection:**

```bash
# Test with Prisma
npx prisma db pull

# Or test with psql (if installed)
psql $DATABASE_URL -c "SELECT 1"
```

**If successful:**
- ✅ You'll see database schema
- ✅ No connection errors

**If failed:**
- ❌ Check `DATABASE_URL` format
- ❌ Verify Neon database is running
- ❌ Check network/firewall settings

---

### Step 5: Redeploy Application

1. **Go to Vercel Dashboard**
2. **Deployments** tab
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete

---

## 🧪 Testing After Fix

### Test 1: Homepage
- Visit: `https://your-app.vercel.app`
- Should load without errors

### Test 2: Registration
- Go to: `/register`
- Fill form and submit
- Should create account successfully

### Test 3: Login
- Go to: `/login`
- Use: `demo@learnai.com` / `demo123`
- Should redirect to dashboard

### Test 4: Dashboard
- After login, should see dashboard
- No JSON parsing errors in console
- Database queries should work

---

## 🔍 Verify Database is Working

### Check 1: API Endpoints

**Test `/api/auth/me`:**
```bash
curl https://your-app.vercel.app/api/auth/me
```

**Should return:**
```json
{
  "error": "Not authenticated"
}
```

**If you get empty response or error:**
- Database connection issue
- Check `DATABASE_URL` in Vercel

---

### Check 2: Vercel Logs

1. **Go to Vercel Dashboard**
2. **Functions** tab
3. **View logs** for recent requests
4. **Look for errors:**
   - `Can't reach database server`
   - `Connection refused`
   - `Authentication failed`

---

### Check 3: Database Tables

**Connect to Neon:**
1. Go to Neon Dashboard
2. Click "SQL Editor"
3. Run:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

**Should see tables:**
- `users`
- `students`
- `subjects`
- `topics`
- etc.

---

## 🚨 Common Issues

### Issue 1: "Connection refused"

**Cause:** Database URL incorrect or database not running

**Fix:**
- Verify `DATABASE_URL` format
- Check Neon database is active (not suspended)
- Ensure connection string uses `postgresql://`

---

### Issue 2: "Authentication failed"

**Cause:** Wrong password in connection string

**Fix:**
- Get fresh connection string from Neon
- Update `DATABASE_URL` in Vercel
- Redeploy

---

### Issue 3: "Prisma Client not generated"

**Cause:** Prisma Client not generated after schema changes

**Fix:
```bash
npx prisma generate
```

---

### Issue 4: "Table does not exist"

**Cause:** Migrations not run

**Fix:**
```bash
npx prisma migrate deploy
```

---

## ✅ Success Indicators

After setup, you should see:

- ✅ No JSON parsing errors
- ✅ API routes return valid JSON
- ✅ Registration/login works
- ✅ Dashboard loads with data
- ✅ Database queries succeed
- ✅ No errors in Vercel logs

---

## 📝 Summary

**The JSON parsing error is caused by:**
1. Database not connected → API routes fail → Empty/invalid responses

**The fix:**
1. Set up Neon database (5 min)
2. Add `DATABASE_URL` to Vercel (2 min)
3. Run migrations (3 min)
4. Redeploy (2 min)

**Total time: ~12 minutes** ⏱️

---

## 🎯 Next Steps

1. ✅ Follow steps above to set up database
2. ✅ Verify all API endpoints work
3. ✅ Test registration and login
4. ✅ Check Vercel logs for any errors

**Once database is set up, all JSON parsing errors should be resolved!** 🎉

