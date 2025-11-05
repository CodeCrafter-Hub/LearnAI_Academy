# Quick Start - Neon Database Setup

## Your DATABASE_URL

Your Neon connection string is:
```
postgres://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Step 1: Update Connection String (Recommended)

For better compatibility with Prisma, use `postgresql://` instead of `postgres://`:

```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Note:** The original `postgres://` might work, but `postgresql://` is more widely supported.

## Step 2: Set in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your LearnAI Academy project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

## Step 3: Run Database Migrations

After setting DATABASE_URL in Vercel, you need to run migrations. You have two options:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your project (if not already linked)
cd learnai-academy
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database (creates demo account and subjects)
node prisma/seed.js
```

### Option B: Using Neon SQL Editor

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **SQL Editor**
4. Run the SQL from your migrations

**Note:** For Option B, you'll need to manually run each migration file from `prisma/migrations/`.

## Step 4: Verify Connection

Test that everything works:

```bash
# Test database connection
npx prisma db pull

# If successful, you should see "Introspection completed"
```

## Step 5: Test the App

1. Visit your Vercel deployment URL
2. You should see the homepage
3. Try registering a new account or login with:
   - Email: `demo@learnai.com`
   - Password: `demo123`
   (if you ran the seed script)

## What Gets Created

After running `node prisma/seed.js`, you'll have:
- ✅ 6 Subjects (Math, English, Reading, Science, Writing, Coding)
- ✅ Multiple topics per subject
- ✅ 15 Achievements
- ✅ Demo user: `demo@learnai.com` / `demo123`
- ✅ Demo student profile

## Troubleshooting

### "Connection refused" or "Timeout"
- Check Neon dashboard to ensure database is active
- Verify connection string is correct
- Make sure `sslmode=require` is included

### "Authentication failed"
- Double-check username and password in connection string
- Verify credentials in Neon dashboard

### "Database does not exist"
- The database `neondb` should exist in Neon
- Check Neon dashboard → Databases

### Prisma Errors
- Make sure you're using `postgresql://` not `postgres://`
- Try running `npx prisma generate` first

## Next Steps

After database is set up:
1. ✅ Set `GROQ_API_KEY` for AI features
2. ✅ Set `JWT_SECRET` for authentication
3. ⚠️ `REDIS_URL` is optional (for caching)

## Security Note

⚠️ **Your connection string contains sensitive credentials!**
- Never commit it to Git
- Only use environment variables
- Don't share it publicly

---

**Need Help?** Check `TROUBLESHOOTING.md` or `DATABASE_SETUP.md` for more details.

