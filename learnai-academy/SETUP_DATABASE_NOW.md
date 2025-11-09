# 🚀 Set Up Your Database Now - Quick Guide

## Your Database Connection String

**Fixed Connection String (Copy This):**
```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANT:** Notice `postgresql://` (not `postgres://`) - This is required for Prisma!

---

## Step 1: Create Local Environment File (2 minutes)

**Create `.env.local` file in `learnai-academy` directory:**

```bash
# Windows PowerShell
cd learnai-academy
New-Item -Path .env.local -ItemType File

# Or manually create the file
```

**Add this content to `.env.local`:**

```env
DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Generate JWT_SECRET (if you want a new one):**
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Step 2: Test Database Connection (1 minute)

```bash
cd learnai-academy

# Test connection
npx prisma db pull
```

**Expected Output:**
```
✔ Introspected database
✔ Generated Prisma Client
```

**If you see errors:**
- Check connection string format
- Verify Neon database is active
- Ensure `postgresql://` (not `postgres://`)

---

## Step 3: Generate Prisma Client (1 minute)

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client
```

---

## Step 4: Run Database Migrations (2 minutes)

```bash
# Run migrations (creates all database tables)
npx prisma migrate deploy
```

**Or if this is the first time:**
```bash
npx prisma migrate dev --name init
```

**Expected Output:**
```
✔ Applied migration
```

---

## Step 5: Seed Database (Optional - 1 minute)

```bash
# Seed with demo data
node prisma/seed.js

# Create test accounts for all grades
npm run test:accounts
```

**This creates:**
- Demo user: `demo@learnai.com` / `demo123`
- Test accounts: `admin@test.com`, `grade0@test.com` through `grade12@test.com`
- All passwords: `TestAccount123!`

---

## Step 6: Verify Database Setup (1 minute)

**Option A: Using Prisma Studio**
```bash
npx prisma studio
```
- Opens at http://localhost:5555
- Browse your database tables

**Option B: Test API**
```bash
# Start dev server
npm run dev

# In another terminal, test API
curl http://localhost:3000/api/auth/me
```

**Should return JSON (even if error):**
```json
{"error":"Not authenticated"}
```

---

## Step 7: Add to Vercel (For Production - 5 minutes)

### 7.1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project

### 7.2: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Click **"Add New"**

**Add Variable 1: DATABASE_URL**
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

**Add Variable 2: JWT_SECRET**
- **Name**: `JWT_SECRET`
- **Value**: `phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=` (or generate new one)
- **Environments**: ✅ All three
- Click **"Save"**

**Add Variable 3: JWT_EXPIRES_IN** (Optional)
- **Name**: `JWT_EXPIRES_IN`
- **Value**: `7d`
- **Environments**: ✅ All three
- Click **"Save"**

### 7.3: Run Migrations on Vercel

**Using Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd learnai-academy
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 7.4: Redeploy
1. Go to Vercel Dashboard
2. **Deployments** tab
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**
5. Wait for completion

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env.local` file created with correct `DATABASE_URL`
- [ ] `npx prisma db pull` works without errors
- [ ] `npx prisma generate` completes successfully
- [ ] `npx prisma migrate deploy` creates all tables
- [ ] Database seeded (optional)
- [ ] `DATABASE_URL` added to Vercel
- [ ] Vercel deployment successful
- [ ] API endpoints return valid JSON (no parsing errors)

---

## 🚨 Troubleshooting

### Error: "Can't reach database server"
- **Fix**: Check Neon database is active (not suspended)
- **Action**: Go to Neon dashboard, check project status

### Error: "Authentication failed"
- **Fix**: Verify password in connection string
- **Action**: Get fresh connection string from Neon

### Error: "Invalid connection string"
- **Fix**: Ensure using `postgresql://` (not `postgres://`)
- **Action**: Check `.env.local` file format

### Error: "Table does not exist"
- **Fix**: Run migrations
- **Action**: `npx prisma migrate deploy`

### Error: "Prisma Client not generated"
- **Fix**: Generate Prisma Client
- **Action**: `npx prisma generate`

---

## 📋 Quick Command Reference

```bash
# Test connection
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
node prisma/seed.js

# Create test accounts
npm run test:accounts

# Open Prisma Studio
npx prisma studio

# Pull Vercel env vars
vercel env pull .env.local
```

---

## 🎯 Your Connection String (Copy This)

```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Remember:** 
- ✅ Use `postgresql://` (not `postgres://`)
- ✅ Keep this secure (don't commit to Git)
- ✅ Add to Vercel environment variables

---

## ⏱️ Total Setup Time: ~15 minutes

1. Create `.env.local` - 2 min
2. Test connection - 1 min
3. Generate Prisma Client - 1 min
4. Run migrations - 2 min
5. Seed database - 1 min
6. Add to Vercel - 5 min
7. Redeploy - 2 min

**After setup, all JSON parsing errors should be resolved!** 🎉

