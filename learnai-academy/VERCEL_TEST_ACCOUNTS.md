# 🧪 Test Accounts on Vercel Environment

## ❓ Do Test Credentials Work on Vercel?

**Short Answer:** **NO, not automatically** - The test accounts need to be created in your production database first.

---

## 🔍 Why They Don't Work Yet

The test accounts are **NOT automatically created** when you deploy to Vercel. They need to be manually created in your **production database** (Neon PostgreSQL).

### Current Situation:
- ✅ Test account script exists: `prisma/createTestAccounts.js`
- ✅ Script creates accounts in the database
- ❌ Script has NOT been run against your production database yet
- ❌ Test accounts don't exist in Vercel's database

---

## ✅ Solution: Create Test Accounts in Production Database

You need to run the test account creation script against your **production database** (the one Vercel uses).

### Option 1: Run Script Locally Against Production DB (Recommended)

**Step 1:** Set your local environment to use production database

Create/update `.env.local`:
```bash
DATABASE_URL=postgresql://neondb_owner:npg_HXG2fsvA7zac@ep-shiny-poetry-a4t1uq5y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-jwt-secret-here
```

**Step 2:** Run the test account script
```bash
cd learnai-academy
npm run test:accounts
```

**Step 3:** Verify accounts were created
```bash
# You should see output like:
✅ Created admin account: admin@test.com
✅ Created parent account: parent@test.com
✅ Created Kindergarten account: grade0@test.com
... (all grades)
✅ All test accounts created successfully!
```

**Step 4:** Test on Vercel
- Go to your Vercel deployment URL
- Try logging in with: `admin@test.com` / `TestAccount123!`
- Should work! ✅

---

### Option 2: Use Vercel CLI (Alternative)

**Step 1:** Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

**Step 2:** Pull environment variables
```bash
cd learnai-academy
vercel env pull .env.local
```

**Step 3:** Run test account script
```bash
npm run test:accounts
```

**Step 4:** Test on Vercel deployment

---

### Option 3: Use Vercel Post-Deploy Hook (Advanced)

You can add a post-deploy script to automatically create test accounts, but this is **NOT recommended for production** as it would create test accounts on every deployment.

---

## 🔑 Test Account Credentials

Once created, use these credentials on your Vercel deployment:

### Admin Account
```
Email: admin@test.com
Password: TestAccount123!
```

### Parent Account
```
Email: parent@test.com
Password: TestAccount123!
```

### Grade-Specific Accounts (K-12)
```
Email: grade0@test.com (Kindergarten)
Email: grade1@test.com (1st Grade)
Email: grade2@test.com (2nd Grade)
... (through grade12@test.com)
Password: TestAccount123! (all accounts)
```

### General Test Account
```
Email: test@learnai.com
Password: TestAccount123!
Grade: 5th Grade
```

---

## ✅ Verification Steps

After running the script, verify it worked:

1. **Check Script Output:**
   - Should see "✅ All test accounts created successfully!"

2. **Test Login on Vercel:**
   - Go to your Vercel URL: `https://your-app.vercel.app/login`
   - Try: `admin@test.com` / `TestAccount123!`
   - Should successfully log in ✅

3. **Test Different Grades:**
   - Login with `grade5@test.com` / `TestAccount123!`
   - Should see grade-appropriate content

---

## ⚠️ Important Security Notes

### For Production:
- ⚠️ **These are TEST accounts with a publicly known password**
- ⚠️ **DO NOT use in production without changing passwords**
- ⚠️ **Consider deleting test accounts after testing**
- ⚠️ **Or change passwords immediately after testing**

### Recommended Approach:
1. Create test accounts for initial testing
2. After testing, either:
   - Delete test accounts, OR
   - Change passwords to secure ones, OR
   - Disable test accounts

---

## 🐛 Troubleshooting

### Problem: "Invalid email or password" on Vercel

**Possible Causes:**
1. ❌ Test accounts not created in production database
   - **Solution:** Run `npm run test:accounts` with production DATABASE_URL

2. ❌ Wrong DATABASE_URL in local .env
   - **Solution:** Verify DATABASE_URL matches Vercel's environment variable

3. ❌ Database connection issue
   - **Solution:** Check DATABASE_URL is correct and database is accessible

### Problem: Script runs but accounts don't work

**Possible Causes:**
1. ❌ Script ran against wrong database
   - **Solution:** Verify DATABASE_URL points to production database

2. ❌ Password hash mismatch
   - **Solution:** Re-run script to recreate accounts

3. ❌ Database schema mismatch
   - **Solution:** Run migrations: `npx prisma migrate deploy`

---

## 📋 Quick Checklist

- [ ] Set DATABASE_URL to production database in `.env.local`
- [ ] Run `npm run test:accounts`
- [ ] Verify script output shows success
- [ ] Test login on Vercel with `admin@test.com` / `TestAccount123!`
- [ ] Test grade-specific accounts
- [ ] (Optional) Delete or secure test accounts after testing

---

## 🚀 Quick Start Command

```bash
# One-time setup to create test accounts in production
cd learnai-academy

# Make sure DATABASE_URL points to production
# (Check Vercel dashboard → Settings → Environment Variables)

# Run test account creation
npm run test:accounts

# Test on Vercel
# Go to: https://your-app.vercel.app/login
# Login: admin@test.com / TestAccount123!
```

---

## 📝 Summary

**Test accounts will work on Vercel ONLY if:**
1. ✅ You run `npm run test:accounts` against your production database
2. ✅ The DATABASE_URL in your local `.env.local` matches Vercel's DATABASE_URL
3. ✅ The script completes successfully

**After running the script once, the test accounts will be available on Vercel permanently** (until you delete them or change the database).

---

**Ready to create test accounts?** Run `npm run test:accounts` with your production DATABASE_URL! 🎉

