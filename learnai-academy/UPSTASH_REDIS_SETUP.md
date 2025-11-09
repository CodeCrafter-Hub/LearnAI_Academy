# Upstash Redis Setup Guide

## Why Upstash for Redis?

✅ **Serverless-friendly** - Works perfectly with Vercel  
✅ **Free tier** - 10,000 commands/day  
✅ **Easy setup** - Just copy the connection string  
✅ **No server management** - Fully managed service  
✅ **Global edge locations** - Fast performance  

## Step 1: Create Upstash Account

1. Go to https://upstash.com/
2. Sign up (free account)
3. Click "Create Database"

## Step 2: Create Redis Database

1. **Name**: `learnai-academy-redis` (or any name)
2. **Type**: Regional (or Global for better performance)
3. **Region**: Choose closest to your Vercel deployment (e.g., `us-east-1`)
4. Click "Create"

## Step 3: Get Connection String

1. Click on your database
2. Go to "Details" tab
3. Copy the **REST URL** or **Redis URL**

**Format:**
```
redis://default:YOUR_PASSWORD@YOUR_ENDPOINT:6379
```

Or for REST API:
```
https://YOUR_ENDPOINT.upstash.io
```

## Step 4: Add to Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `REDIS_URL`
   - **Value**: Your Redis connection string from Upstash
   - **Environment**: Production, Preview, Development (select all)
5. Click "Save"

## Step 5: Redeploy

After adding `REDIS_URL`, Vercel will automatically redeploy, or you can:
1. Go to **Deployments** tab
2. Click "Redeploy" on the latest deployment

## Verification

After deployment, check Vercel logs:
- You should see: `Redis connected successfully` (in development mode)
- No more `ECONNREFUSED` errors

## Free Tier Limits

- **10,000 commands/day** - Perfect for development and small apps
- **256 MB storage** - Enough for caching
- **Unlimited databases** - Create separate DBs for different environments

## Pricing (if you exceed free tier)

- **Pay-as-you-go**: $0.20 per 100K commands
- Very affordable for production use

## Alternative: Keep Redis Optional

If you don't want to set up Redis right now:
- **Just don't set `REDIS_URL`** in Vercel
- The app will work without Redis (no caching, but fully functional)
- You can add Redis later when needed

---

**Note**: Neon is for PostgreSQL (database), Upstash is for Redis (caching). They work together!

