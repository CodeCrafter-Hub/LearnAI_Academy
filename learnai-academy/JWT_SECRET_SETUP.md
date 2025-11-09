# 🔐 JWT_SECRET Setup Guide

## What is JWT_SECRET?

`JWT_SECRET` is a critical security key used to sign and verify authentication tokens. **Without it, users cannot log in or register.**

## Quick Fix: Set JWT_SECRET in Vercel

### Step 1: Generate a Secure Secret

Run this command to generate a secure 32+ character secret:

```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Or use this pre-generated secure secret:**
```
phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=
```

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your **LearnAI Academy** project

2. **Navigate to Environment Variables**
   - Click **Settings** (gear icon)
   - Click **Environment Variables** in the left sidebar

3. **Add JWT_SECRET**
   - Click **Add New**
   - **Name**: `JWT_SECRET`
   - **Value**: Paste your generated secret (e.g., `phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=`)
   - **Environment**: Select **ALL THREE**:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Verify DATABASE_URL is Set**
   - Check if `DATABASE_URL` exists
   - If missing, add it with your Neon connection string:
     ```
     postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (2-3 minutes)

### Step 4: Test

After redeployment:
1. Visit your Vercel URL
2. Try to **register** a new account
3. Or **login** with existing credentials

## Requirements

- **Minimum Length**: 32 characters
- **Security**: Must be random and unpredictable
- **Storage**: Never commit to Git (already in `.gitignore`)

## Troubleshooting

### Error: "JWT_SECRET is not configured"

**Cause**: Environment variable not set in Vercel

**Fix**:
1. Verify `JWT_SECRET` is in Vercel Environment Variables
2. Check it's set for the correct environment (Production/Preview/Development)
3. Redeploy after adding

### Error: "JWT_SECRET must be at least 32 characters"

**Cause**: Secret is too short

**Fix**: Generate a new secret with at least 32 characters using the commands above

### Still Not Working?

1. **Check Vercel Logs**:
   - Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Look for error messages

2. **Verify Variable Name**:
   - Must be exactly: `JWT_SECRET` (case-sensitive)
   - No spaces or extra characters

3. **Check Environment**:
   - Make sure it's set for **Production** environment
   - Preview and Development are optional but recommended

## Security Notes

⚠️ **Never share your JWT_SECRET publicly**
⚠️ **Never commit it to Git** (already in `.gitignore`)
⚠️ **Use different secrets for different environments** (optional but recommended)
⚠️ **Rotate secrets if compromised**

## Quick Reference

| Variable | Required | Min Length | Example |
|---------|----------|-----------|---------|
| `JWT_SECRET` | ✅ Yes | 32 chars | `phdxOwbI/gkO/4YnR2EVLJ/30kTYXcsVI0369ICkH1k=` |
| `DATABASE_URL` | ✅ Yes | - | `postgresql://...` |
| `GROQ_API_KEY` | ⚠️ Optional | - | `gsk_...` |
| `REDIS_URL` | ⚠️ Optional | - | `redis://...` |

---

**After setting JWT_SECRET, your authentication will work!** 🎉

