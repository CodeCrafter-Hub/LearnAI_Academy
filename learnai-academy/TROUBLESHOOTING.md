# Troubleshooting Guide

## Server Components Render Error

### Error Message
```
Error: An error occurred in the Server Components render. 
The specific message is omitted in production builds to avoid leaking sensitive details.
```

### Common Causes

1. **Missing or Invalid DATABASE_URL**
   - **Symptom**: Error occurs when trying to access any page
   - **Solution**: 
     - Set `DATABASE_URL` in Vercel environment variables
     - Verify the connection string is correct
     - Test connection: `psql $DATABASE_URL -c "SELECT 1"`

2. **Prisma Connection Issues**
   - **Symptom**: Database queries fail
   - **Solution**:
     - Run migrations: `npx prisma migrate deploy`
     - Check database is accessible from Vercel
     - Verify network/security settings allow connections

3. **Redis Connection Issues** (if REDIS_URL is set)
   - **Symptom**: Cache operations fail
   - **Solution**: 
     - Redis is optional - remove `REDIS_URL` if not needed
     - Or set `REDIS_URL` to a valid Redis instance
     - The app will work without Redis (just slower)

4. **Missing Environment Variables**
   - **Required**: `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`
   - **Check**: Vercel → Project Settings → Environment Variables

### Debugging Steps

#### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → Select latest deployment
4. Click "Functions" tab
5. Look for error messages in the logs

#### Step 2: Enable Detailed Error Messages
In development, errors show full details. To see errors in production:
1. Temporarily set `NODE_ENV=development` in Vercel
2. Check browser console for detailed errors
3. **Remember**: Don't leave this in production!

#### Step 3: Test Database Connection
```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma db pull
```

#### Step 4: Check Environment Variables
Ensure these are set in Vercel:
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Random secure string
- ✅ `GROQ_API_KEY` - Groq API key
- ⚠️ `REDIS_URL` - Optional (app works without it)

### Quick Fixes

#### Fix 1: Remove REDIS_URL (if causing issues)
If Redis is not set up, remove `REDIS_URL` from environment variables. The app will work without it.

#### Fix 2: Verify Database is Ready
```bash
# Run migrations
npx prisma migrate deploy

# Seed database (if needed)
node prisma/seed.js
```

#### Fix 3: Clear Build Cache
In Vercel:
1. Go to Project Settings
2. Click "Clear Build Cache"
3. Redeploy

### Common Error Patterns

#### Pattern 1: "Cannot connect to database"
- **Cause**: `DATABASE_URL` is missing or invalid
- **Fix**: Set correct `DATABASE_URL` in Vercel

#### Pattern 2: "Prisma Client not initialized"
- **Cause**: Database connection failed during initialization
- **Fix**: Check `DATABASE_URL` and database accessibility

#### Pattern 3: "Redis connection failed"
- **Cause**: `REDIS_URL` is set but invalid
- **Fix**: Remove `REDIS_URL` or set a valid Redis URL

### Getting More Details

To see the actual error message in production:

1. **Temporarily enable development mode**:
   ```bash
   # In Vercel environment variables
   NODE_ENV=development
   ```

2. **Check browser console**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

3. **Check Vercel Function Logs**:
   - Vercel Dashboard → Functions → View logs
   - Look for stack traces and error messages

### Prevention

1. **Always test locally first**:
   ```bash
   npm run build
   npm start
   ```

2. **Verify environment variables before deploying**:
   - Check all required variables are set
   - Test database connection
   - Verify API keys are valid

3. **Use error boundaries**:
   - Error boundaries are now in place
   - They catch and display errors gracefully

### Still Having Issues?

1. Check Vercel deployment logs for specific error
2. Verify all environment variables are set correctly
3. Test database connection separately
4. Check if the error occurs on all pages or specific pages
5. Review recent changes to the codebase

### Error Boundaries

The app now includes error boundaries that will:
- Catch server component errors
- Display user-friendly error messages
- Allow users to retry or navigate home
- Show detailed errors in development mode

---

**Note**: If you see the error boundary page, it means an error was caught and handled. Check the browser console (in development) or Vercel logs for the underlying cause.

