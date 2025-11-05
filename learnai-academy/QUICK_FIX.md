# Quick Fix - "Does Not Work"

## What's Not Working?

Please tell me:
1. Which button did you click? (Get Started Free / Sign In)
2. What error do you see? (Error message, blank page, etc.)
3. Check browser console (F12 → Console tab) - any errors there?

## Most Likely Issue: Database Migrations Not Run

If you see errors when clicking buttons, it's probably because the database tables don't exist yet.

## Quick Fix Steps

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" → Latest deployment
3. Click "Functions" tab
4. Look for error messages
5. **Copy the error message** - this will tell us exactly what's wrong

### Step 2: Run Database Migrations

```bash
# Navigate to project
cd learnai-academy

# Pull environment variables from Vercel
vercel env pull .env.local

# Run migrations (creates all tables)
npx prisma migrate deploy

# If that fails, try creating migrations first
npx prisma migrate dev --name init

# Then deploy
npx prisma migrate deploy
```

### Step 3: Seed Database (Optional - creates demo account)

```bash
node prisma/seed.js
```

### Step 4: Verify Environment Variables in Vercel

Make sure these are set:
- ✅ `DATABASE_URL` - Your Neon connection string
- ✅ `JWT_SECRET` - Random string (e.g., `openssl rand -base64 32`)
- ⚠️ `GROQ_API_KEY` - Optional for now

### Step 5: Test Connection

```bash
# Test if Prisma can connect
npx prisma db pull
```

Should see: "Introspection completed"

## Common Errors

### "relation 'users' does not exist"
**Fix**: Run `npx prisma migrate deploy`

### "Can't reach database server"
**Fix**: Check `DATABASE_URL` is correct in Vercel

### "JWT_SECRET is required"
**Fix**: Set `JWT_SECRET` in Vercel environment variables

### "Application error: a server-side exception"
**Fix**: Check Vercel logs for actual error message

## If You Don't Have Vercel CLI

### Option 1: Install Vercel CLI
```bash
npm i -g vercel
vercel login
cd learnai-academy
vercel link
vercel env pull .env.local
```

### Option 2: Run Migrations in Neon SQL Editor

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to SQL Editor
4. Check if you have migrations in `prisma/migrations/` folder
5. If yes, run each migration SQL file manually

### Option 3: Set Up Database Manually

If migrations don't exist, you can create tables manually using Prisma:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

**Note**: `db push` is for development. Use `migrate deploy` for production.

## Still Not Working?

1. **Check Vercel logs** - This is the most important step!
2. **Share the error message** - Not just "doesn't work"
3. **Check browser console** - F12 → Console tab
4. **Verify DATABASE_URL** - Is it set correctly?
5. **Test database connection** - Can Prisma connect?

## Need More Help?

Share:
- The exact error message from Vercel logs
- What happens when you click the button
- Any console errors (F12 → Console)
- Whether you've run migrations

