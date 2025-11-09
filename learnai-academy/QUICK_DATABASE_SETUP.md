# Quick Database Setup Guide

## Your Database Connection String

**Fixed Connection String:**
```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANT:** Use `postgresql://` (not `postgres://`) for Prisma!

---

## Step 1: Create .env.local File

**Create `.env.local` in the `learnai-academy` directory with this content:**

```env
DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Windows PowerShell (to create file):**
```powershell
cd learnai-academy
@"
DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath .env.local -Encoding utf8
```

---

## Step 2: Test Database Connection

```bash
cd learnai-academy
npx prisma db pull
```

**Expected Output:**
```
✔ Introspected database
✔ Generated Prisma Client
```

**If you get an error about DATABASE_URL:**
- Make sure `.env.local` file exists
- Verify the connection string uses `postgresql://` (not `postgres://`)
- Check Neon database is active (not suspended)

---

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

---

## Step 4: Run Migrations

```bash
# First time setup
npx prisma migrate dev --name init

# Or if migrations already exist
npx prisma migrate deploy
```

---

## Step 5: Seed Database (Optional)

```bash
# Seed with demo data
node prisma/seed.js

# Create test accounts
npm run test:accounts
```

---

## Step 6: Add to Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Settings → Environment Variables**
   - Add `DATABASE_URL` with your connection string
   - Add `JWT_SECRET` (generate one if needed)
   - Add `JWT_EXPIRES_IN` = `7d`

3. **Redeploy**
   - Deployments → Redeploy

---

## Troubleshooting

### Error: "URL must start with postgresql://"
- **Fix**: Check `.env.local` file format
- **Action**: Ensure no extra spaces or quotes

### Error: "Can't reach database server"
- **Fix**: Check Neon database is active
- **Action**: Go to Neon dashboard, verify project is running

### Error: "Authentication failed"
- **Fix**: Verify password in connection string
- **Action**: Get fresh connection string from Neon

---

## Your Connection String (Copy This)

```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Remember:** 
- ✅ `postgresql://` (not `postgres://`)
- ✅ No quotes around the value
- ✅ No extra spaces

