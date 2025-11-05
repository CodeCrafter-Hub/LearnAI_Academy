# Fixing Login 401 Error

## Error: Failed to load resource: the server responded with a status of 401

### What This Means
The login endpoint is working, but authentication failed. This could be due to:

1. **No users in database** (most likely)
2. **Wrong email/password**
3. **Database not set up** (migrations not run)
4. **JWT_SECRET not set**

## Quick Fixes

### Fix 1: Check Environment Variables
Make sure these are set in Vercel:
- ✅ `DATABASE_URL` - Your Neon connection string
- ✅ `JWT_SECRET` - Random secure string (e.g., generate with `openssl rand -base64 32`)
- ⚠️ `JWT_EXPIRES_IN` - Optional (defaults to "7d")

### Fix 2: Run Database Migrations
```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations (creates tables)
npx prisma migrate deploy

# Seed database (creates demo user)
node prisma/seed.js
```

### Fix 3: Test with Demo Account
After seeding, try logging in with:
- **Email**: `demo@learnai.com`
- **Password**: `demo123`

### Fix 4: Register a New Account
If demo account doesn't work, try registering a new account:
1. Click "Get Started Free"
2. Fill out the registration form
3. Submit
4. Then try logging in with your new credentials

## Common Issues

### Issue 1: "Database not initialized"
**Error**: `relation "users" does not exist`
**Fix**: Run `npx prisma migrate deploy`

### Issue 2: "JWT_SECRET is not set"
**Error**: Server configuration error
**Fix**: Set `JWT_SECRET` in Vercel environment variables

### Issue 3: "Invalid email or password"
**Error**: User doesn't exist or wrong password
**Fix**: 
- Register a new account, OR
- Run seed script to create demo account

### Issue 4: Database Connection Error
**Error**: Can't reach database server
**Fix**: Check `DATABASE_URL` is correct in Vercel

## Step-by-Step Solution

### Step 1: Verify Environment Variables
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Verify:
   - `DATABASE_URL` is set
   - `JWT_SECRET` is set
   - Both are added to Production, Preview, and Development

### Step 2: Run Migrations
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database
node prisma/seed.js
```

### Step 3: Test Login
1. Go to your Vercel deployment
2. Click "Sign In"
3. Try:
   - Email: `demo@learnai.com`
   - Password: `demo123`

### Step 4: Check Vercel Logs
If still not working:
1. Vercel Dashboard → Deployments → Latest
2. Functions tab
3. Look for error messages
4. Share the error for further debugging

## About the 404 Error

The 404 error is likely for:
- A missing favicon
- A missing asset/image
- A missing API route that's not critical

This is usually harmless. Focus on fixing the 401 login error first.

## Still Not Working?

1. **Check Vercel logs** for the actual error
2. **Verify DATABASE_URL** is correct
3. **Verify JWT_SECRET** is set
4. **Run migrations** if not done
5. **Try registering** a new account instead

## Quick Test

Open browser console (F12) and run:
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'demo@learnai.com',
    password: 'demo123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact error message from the API.

