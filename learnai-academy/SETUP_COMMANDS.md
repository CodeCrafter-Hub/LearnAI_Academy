# Setup Commands - Windows PowerShell

## Important: Run These Commands in Order

Make sure you're in the `learnai-academy` directory first!

```powershell
# Navigate to project directory
cd C:\Users\akawa\LearnAI_Academy\learnai-academy

# Verify you're in the right place
Test-Path prisma\schema.prisma  # Should return True
```

## Step-by-Step Commands

### 1. Pull Environment Variables from Vercel

```powershell
# Make sure you're logged in and linked
vercel login
vercel link

# Pull environment variables
vercel env pull .env.local
```

### 2. Install Dependencies (if needed)

```powershell
npm install
```

### 3. Run Database Migrations

```powershell
npx prisma migrate deploy
```

**Expected output:**
```
✅ Database migrations completed successfully
```

### 4. Generate Prisma Client

```powershell
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

### 5. Seed Database

```powershell
node prisma/seed.js
```

**Expected output:**
```
🌱 Seeding database...
✅ Database seeded successfully!
```

### 6. Test Database Connection

```powershell
npx prisma db pull
```

**Expected output:**
```
Introspection completed successfully
```

## Troubleshooting

### If you get "Could not find Prisma Schema"

**Solution:**
```powershell
# Make sure you're in the correct directory
cd C:\Users\akawa\LearnAI_Academy\learnai-academy

# Verify schema exists
Test-Path prisma\schema.prisma  # Should return True
```

### If you get "Can't reach database server"

**Solution:**
1. Check `.env.local` file exists
2. Verify `DATABASE_URL` is set correctly
3. Check connection string uses `postgresql://` (not `postgres://`)

### If you get "No migrations found"

**Solution:**
```powershell
# Create initial migration
npx prisma migrate dev --name init

# Then deploy
npx prisma migrate deploy
```

## Quick Copy-Paste (All Commands)

```powershell
# Navigate to project
cd C:\Users\akawa\LearnAI_Academy\learnai-academy

# Pull environment variables
vercel env pull .env.local

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
node prisma/seed.js

# Test connection
npx prisma db pull
```

## Verify Everything Works

After running all commands:

1. **Check `.env.local` exists** - Should have `DATABASE_URL` and other variables
2. **Check migrations ran** - No errors in terminal
3. **Check seed ran** - Should see "✅ Database seeded successfully!"
4. **Test login** - Go to your Vercel URL and try logging in with:
   - Email: `demo@learnai.com`
   - Password: `demo123`

---

**Note:** Always run these commands from the `learnai-academy` directory!



