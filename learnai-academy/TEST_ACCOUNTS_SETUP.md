# 🧪 Test Accounts Setup Guide

## Issue
404 errors might be caused by:
1. Test accounts not being created in the database
2. Dashboard page not loading correctly
3. Authentication redirects failing

## Quick Fix: Create Test Accounts

### Step 1: Run Test Account Creation Script

**On Local Machine:**
```bash
cd learnai-academy
npm run test:accounts
```

**Or directly:**
```bash
node prisma/createTestAccounts.js
```

**Important:** Make sure your `.env` file has the correct `DATABASE_URL` pointing to your Neon database.

### Step 2: Verify Accounts Were Created

After running the script, you should see:
```
✅ Created admin account: admin@test.com
✅ Created parent account: parent@test.com
✅ Created Kindergarten account: grade0@test.com
... (all grades)
✅ All test accounts created successfully!
```

### Step 3: Test Login

1. Go to your Vercel URL: `https://your-app.vercel.app/login`
2. Try logging in with:
   - **Email:** `admin@test.com`
   - **Password:** `TestAccount123!`

## Test Account Credentials

**All accounts use the same password:**
```
Password: TestAccount123!
```

### Available Accounts:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | `admin@test.com` | `TestAccount123!` | Full access, no student profile needed |
| Parent | `parent@test.com` | `TestAccount123!` | Parent dashboard |
| Student (Grade 5) | `test@learnai.com` | `TestAccount123!` | Default test account |
| Student (K) | `grade0@test.com` | `TestAccount123!` | Kindergarten |
| Student (1) | `grade1@test.com` | `TestAccount123!` | 1st Grade |
| ... | ... | ... | All grades 0-12 |

## Dashboard Verification

### Check if Dashboard Exists

The dashboard should be at: `src/app/dashboard/page.js`

**Verify it exists:**
```bash
ls -la src/app/dashboard/page.js
```

### Dashboard Requirements

The dashboard:
- ✅ Requires authentication
- ✅ Redirects to `/login` if not authenticated
- ✅ Shows admin dashboard for ADMIN users
- ✅ Shows student dashboard for STUDENT users
- ✅ Shows parent dashboard for PARENT users

## Troubleshooting

### Issue 1: "Cannot find module" when running script

**Fix:**
```bash
npm install
npx prisma generate
```

### Issue 2: "Database connection failed"

**Fix:**
1. Check `DATABASE_URL` in `.env` file
2. Verify Neon database is accessible
3. Test connection: `npx prisma db pull`

### Issue 3: "Student model not found"

**Fix:**
This is OK - the script will still create User accounts. Student profiles are optional.

### Issue 4: Dashboard shows 404

**Possible Causes:**
1. **Build Error:** Check Vercel build logs
2. **Missing JWT_SECRET:** Add `JWT_SECRET` to Vercel environment variables
3. **Page Component Error:** Check browser console for errors

**Fix:**
1. Check Vercel build logs for errors
2. Verify `JWT_SECRET` is set in Vercel
3. Check browser console (F12) for JavaScript errors

### Issue 5: Login works but dashboard shows 404

**Possible Causes:**
1. Dashboard page has a runtime error
2. Authentication check is failing
3. Redirect loop

**Fix:**
1. Check browser console (F12) for errors
2. Check Vercel function logs
3. Try accessing `/dashboard` directly after login

## Creating Accounts in Production (Vercel)

### Option 1: Run Script Locally

1. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

2. Run script:
   ```bash
   npm run test:accounts
   ```

### Option 2: Use Vercel CLI

```bash
vercel env pull .env.local
node prisma/createTestAccounts.js
```

### Option 3: Manual Registration

1. Go to `/register` on your Vercel site
2. Create accounts manually using the test credentials format

## Verification Checklist

- [ ] Test accounts script runs without errors
- [ ] Can login with `admin@test.com`
- [ ] Dashboard loads after login
- [ ] No 404 errors in browser console
- [ ] No errors in Vercel logs

## Next Steps

After creating test accounts:
1. ✅ Test login with `admin@test.com`
2. ✅ Verify dashboard loads
3. ✅ Test different grade accounts
4. ✅ Verify parent dashboard works

---

**If issues persist, check:**
1. Vercel build logs
2. Browser console errors
3. Vercel function logs
4. Database connection

