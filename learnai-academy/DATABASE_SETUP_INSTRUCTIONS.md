# Database Setup Instructions

## Your Database Connection String

**Original (from Neon):**
```
postgres://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Fixed (for Prisma):**
```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANT:** Change `postgres://` to `postgresql://` for Prisma compatibility!

---

## Step-by-Step Setup

### Step 1: Create Local .env File (For Local Development)

Create or update `.env.local` in the `learnai-academy` directory:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
```

**Generate JWT_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or use: https://randomkeygen.com/

---

### Step 2: Test Database Connection

```bash
cd learnai-academy

# Test connection
npx prisma db pull

# If successful, you'll see the database schema
```

---

### Step 3: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate deploy

# Or if this is first time:
npx prisma migrate dev --name init
```

---

### Step 4: Seed Database (Optional)

```bash
# Seed with demo data
node prisma/seed.js

# Create test accounts
npm run test:accounts
```

---

### Step 5: Add to Vercel (For Production)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Click **"Add New"**
   
   **Variable 1: DATABASE_URL**
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 2: JWT_SECRET**
   - **Name**: `JWT_SECRET`
   - **Value**: (Generate one - see Step 1)
   - **Environments**: ✅ All three
   - Click **"Save"**

   **Variable 3: JWT_EXPIRES_IN** (Optional)
   - **Name**: `JWT_EXPIRES_IN`
   - **Value**: `7d`
   - **Environments**: ✅ All three
   - Click **"Save"**

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

---

### Step 6: Run Migrations on Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd learnai-academy
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

**Option B: Using Neon SQL Editor**

1. Go to Neon Dashboard
2. Click "SQL Editor"
3. Run migrations manually (from `prisma/migrations/` folder)

---

## Verification

### Test 1: Local Connection
```bash
npx prisma db pull
# Should show database schema
```

### Test 2: Check Tables
```bash
npx prisma studio
# Opens Prisma Studio at http://localhost:5555
```

### Test 3: API Endpoint
```bash
# Start dev server
npm run dev

# Test API
curl http://localhost:3000/api/auth/me
# Should return JSON (even if error)
```

---

## Troubleshooting

### Issue: "Connection refused"
- Check Neon database is active (not suspended)
- Verify connection string format
- Ensure `postgresql://` (not `postgres://`)

### Issue: "Authentication failed"
- Verify password in connection string
- Get fresh connection string from Neon dashboard

### Issue: "Table does not exist"
- Run migrations: `npx prisma migrate deploy`
- Check migrations folder exists

### Issue: "Prisma Client not generated"
```bash
npx prisma generate
```

---

## Next Steps

1. ✅ Set up local `.env.local` file
2. ✅ Test database connection
3. ✅ Run migrations
4. ✅ Add to Vercel
5. ✅ Redeploy application
6. ✅ Test production deployment

---

## Your Connection String (Copy This)

```
postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Remember:** Use `postgresql://` not `postgres://`!

