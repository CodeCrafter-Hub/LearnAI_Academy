# Fix Database Setup - Step by Step

## ✅ Good News!

Your database connection **WORKS**! The connection string is correct and Prisma successfully connected to Neon.

## ⚠️ Issue Found

The migrations were created for SQLite, but you're now using PostgreSQL. We need to reset and recreate migrations.

---

## Step 1: Update .env File

**The `.env` file has SQLite configuration. You need to update it manually:**

1. **Open `.env` file in `learnai-academy` directory**
2. **Find this line:**
   ```
   DATABASE_URL=file:./dev.db
   ```
3. **Replace it with:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

**Or create/update `.env.local` file with:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 2: Reset Migrations (For PostgreSQL)

**Since migrations were created for SQLite, we need to reset them:**

```bash
cd learnai-academy

# Option A: Delete migrations folder and create new (Recommended)
# Backup first if needed
Remove-Item -Recurse -Force prisma/migrations

# Create new migration for PostgreSQL
npx prisma migrate dev --name init_postgresql
```

**Or Option B: Keep existing migrations but update lock file:**

```bash
# Delete migration lock file
Remove-Item prisma/migrations/migration_lock.toml

# Create new migration
npx prisma migrate dev --name init_postgresql
```

---

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

---

## Step 4: Seed Database

```bash
# Seed with demo data
node prisma/seed.js

# Create test accounts
npm run test:accounts
```

---

## Step 5: Verify Setup

```bash
# Test connection
npx prisma db pull

# Open Prisma Studio to view data
npx prisma studio
```

---

## Step 6: Add to Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Settings → Environment Variables**
   - Add `DATABASE_URL` = `postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - Add `JWT_SECRET` = `phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=`
   - Add `JWT_EXPIRES_IN` = `7d`

3. **Redeploy**

---

## Quick Commands Summary

```bash
# 1. Update .env file (manually edit)
# DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# 2. Reset migrations
Remove-Item -Recurse -Force prisma/migrations
npx prisma migrate dev --name init_postgresql

# 3. Generate client
npx prisma generate

# 4. Seed database
node prisma/seed.js
npm run test:accounts

# 5. Verify
npx prisma studio
```

---

## Your Connection String (Copy This)

```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Remember:**
- ✅ Use `postgresql://` (not `postgres://`)
- ✅ Update `.env` file manually
- ✅ Reset migrations for PostgreSQL

---

## Status

- ✅ Database connection: **WORKING**
- ✅ Connection string: **CORRECT**
- ⚠️ Migrations: **Need to reset for PostgreSQL**
- ⚠️ .env file: **Needs manual update**

**After fixing migrations, everything will work!** 🎉

