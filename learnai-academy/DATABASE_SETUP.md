# Database Setup Guide

## What is DATABASE_URL?

`DATABASE_URL` is a PostgreSQL connection string that tells your app where to find the database. It looks like this:

```
postgresql://username:password@host:port/database?schema=public
```

## You Need a Separate Database Provider

Vercel does NOT provide databases. You need to set up a PostgreSQL database from one of these providers:

### Option 1: Supabase (Recommended - Free Tier Available)
1. Go to https://supabase.com
2. Sign up for free
3. Create a new project
4. Go to Project Settings → Database
5. Copy the "Connection String" (URI format)
6. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### Option 2: Neon (Recommended - Free Tier Available)
1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Go to Dashboard → Connection Details
5. Copy the "Connection String"
6. It looks like: `postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

### Option 3: Railway (Easy Setup)
1. Go to https://railway.app
2. Sign up
3. Create new project → Add PostgreSQL
4. Copy the DATABASE_URL from the service variables

### Option 4: Render (Free Tier Available)
1. Go to https://render.com
2. Sign up
3. Create new PostgreSQL database
4. Copy the Internal Database URL

## Step-by-Step Setup

### Step 1: Create Database
Choose one of the providers above and create a PostgreSQL database.

### Step 2: Get Connection String
Copy the connection string from your database provider. It should look like:
```
postgresql://user:password@host:port/database
```

### Step 3: Set in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your connection string
   - **Environment**: Production, Preview, Development (select all)
5. Click "Save"

### Step 4: Run Database Migrations
After setting DATABASE_URL, you need to run migrations:

**Option A: Using Vercel CLI** (Recommended)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B: Using Database Provider's Console**
- Connect via psql or web SQL editor
- Run SQL from `prisma/migrations/` folder

### Step 5: Seed Database (Optional)
```bash
# Pull environment variables
vercel env pull .env.local

# Run seed script
node prisma/seed.js
```

This creates:
- Demo user: `demo@learnai.com` / `demo123`
- Subjects and topics
- Achievements

## Example DATABASE_URL Formats

### Supabase
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Neon
```
postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Railway
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### Render
```
postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/dbname
```

## Important Notes

1. **Never commit DATABASE_URL to Git**
   - It contains sensitive credentials
   - Always use environment variables

2. **Use SSL for production**
   - Most providers require `?sslmode=require`
   - Check your provider's documentation

3. **Connection Pooling**
   - Supabase uses connection pooling (port 6543)
   - Neon has built-in pooling
   - Check your provider's recommendations

4. **Test Connection**
   ```bash
   # Using psql (if installed)
   psql $DATABASE_URL -c "SELECT 1"
   
   # Or using Prisma
   npx prisma db pull
   ```

## Troubleshooting

### "Connection refused"
- Check database is running
- Verify host and port are correct
- Check firewall/network settings

### "Authentication failed"
- Verify username and password
- Check if password has special characters (may need URL encoding)

### "Database does not exist"
- Create the database first
- Verify database name in connection string

### "SSL required"
- Add `?sslmode=require` to connection string
- Or `?sslmode=prefer` for optional SSL

## Quick Start Commands

```bash
# 1. Set DATABASE_URL in Vercel (via dashboard)

# 2. Pull environment variables
vercel env pull .env.local

# 3. Run migrations
npx prisma migrate deploy

# 4. Seed database
node prisma/seed.js

# 5. Test connection
npx prisma db pull
```

## Summary

- ❌ **DON'T** use Vercel URL for DATABASE_URL
- ✅ **DO** set up a PostgreSQL database (Supabase, Neon, etc.)
- ✅ **DO** use the database connection string for DATABASE_URL
- ✅ **DO** set DATABASE_URL in Vercel environment variables
- ✅ **DO** run migrations after setting DATABASE_URL

---

**Need help?** Check `TROUBLESHOOTING.md` for more debugging tips.

