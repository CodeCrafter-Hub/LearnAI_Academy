# Debugging Server-Side Error

## Error Message
```
Application error: a server-side exception has occurred (see the server logs for more information).
Digest: 1855683347
```

## Most Likely Causes

### 1. Database Migrations Not Run (MOST COMMON)
**Problem**: Tables don't exist in the database yet.

**Solution**:
```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### 2. Database Connection Issues
**Problem**: Prisma can't connect to Neon database.

**Check**:
- Verify `DATABASE_URL` is set in Vercel
- Ensure connection string uses `postgresql://` (not `postgres://`)
- Test connection: `npx prisma db pull`

### 3. Missing Environment Variables
**Problem**: Required env vars not set.

**Required**:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ⚠️ `GROQ_API_KEY` (optional, but some features need it)

## Step-by-Step Debugging

### Step 1: Check Vercel Logs (IMPORTANT!)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Click **"Functions"** tab
6. Look for error messages - this will show the ACTUAL error

**Look for**:
- `P1001: Can't reach database server`
- `P2002: Unique constraint failed`
- `relation "users" does not exist` ← This means migrations not run!
- `Invalid `prisma.user.findMany()` invocation`

### Step 2: Test Database Connection Locally

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Test connection
npx prisma db pull
```

**Expected**: Should connect and show database schema

**If it fails**: Check your `DATABASE_URL` in `.env.local`

### Step 3: Run Migrations

```bash
# Run migrations to create tables
npx prisma migrate deploy

# If no migrations exist, create them first
npx prisma migrate dev --name init
```

**Important**: After running migrations, redeploy on Vercel!

### Step 4: Verify Tables Exist

Using Neon SQL Editor:
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **SQL Editor**
4. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

**Should see**: `users`, `students`, `subjects`, `topics`, etc.

### Step 5: Seed Database (Optional)

```bash
node prisma/seed.js
```

This creates demo data.

## Quick Fix Checklist

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] Connection string uses `postgresql://` (not `postgres://`)
- [ ] Migrations have been run: `npx prisma migrate deploy`
- [ ] Database is accessible (test with `npx prisma db pull`)
- [ ] Tables exist in database (check Neon SQL Editor)
- [ ] Redeployed after setting environment variables

## Common Error Messages

### "relation 'users' does not exist"
**Cause**: Migrations not run
**Fix**: `npx prisma migrate deploy`

### "Can't reach database server"
**Cause**: Connection string wrong or database not accessible
**Fix**: Verify `DATABASE_URL` and test connection

### "Unique constraint failed"
**Cause**: Trying to create duplicate data
**Fix**: Usually fine, just means data already exists

### "Invalid `prisma.user.findMany()` invocation"
**Cause**: Prisma client not generated or schema out of sync
**Fix**: `npx prisma generate`

## How to See Actual Error

The digest number (1855683347) doesn't tell us much. To see the real error:

### Option 1: Check Vercel Function Logs
1. Vercel Dashboard → Your Project
2. Deployments → Latest → Functions
3. View logs for the function that's failing

### Option 2: Temporarily Enable Dev Mode
1. In Vercel, add environment variable:
   - Name: `NODE_ENV`
   - Value: `development`
2. Redeploy
3. Check browser console for detailed errors
4. **Remember to remove this after debugging!**

### Option 3: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests
5. Click on failed request → Response tab

## Most Likely Issue

**99% chance**: You set `DATABASE_URL` but haven't run migrations yet.

**Quick fix**:
```bash
# 1. Pull env vars
vercel env pull .env.local

# 2. Run migrations
npx prisma migrate deploy

# 3. Seed (optional)
node prisma/seed.js

# 4. Redeploy on Vercel (or wait for auto-deploy)
```

## Still Not Working?

1. **Check Vercel logs** - This is the most important step!
2. **Verify DATABASE_URL format** - Should be `postgresql://...`
3. **Test connection locally** - `npx prisma db pull`
4. **Check Neon dashboard** - Is database active?
5. **Try running migrations** - Even if you think you did

## Need Help?

Share the error message from Vercel logs (not just the digest), and I can help debug further!

