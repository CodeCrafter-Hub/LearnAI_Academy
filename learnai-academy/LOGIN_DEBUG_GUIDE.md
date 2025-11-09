# 🔍 Login Debugging Guide

## Common "Login failed" Issues and Solutions

### Issue 1: Database Connection
**Symptoms:** Generic "Login failed" error  
**Check:**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check database is accessible
- Look for database connection errors in logs

**Solution:**
```bash
# Test database connection
npx prisma db pull
```

### Issue 2: Missing Password Hash
**Symptoms:** "Account configuration error"  
**Check:**
- User exists but `password_hash` field is null
- Account was created incorrectly

**Solution:**
- Re-run test account creation script
- Or manually update password hash

### Issue 3: Password Mismatch
**Symptoms:** "Invalid email or password"  
**Check:**
- Password is correct: `TestAccount123!`
- Email is correct (case-sensitive in some cases)
- Password was hashed correctly when account was created

**Solution:**
- Verify password meets requirements (12+ chars, uppercase, lowercase, number, special)
- Try resetting password or recreating account

### Issue 4: Account Lockout
**Symptoms:** "Account locked" message  
**Check:**
- Too many failed login attempts
- Account is temporarily locked

**Solution:**
- Wait for lockout period to expire
- Or clear lockout in database

### Issue 5: JWT_SECRET Missing
**Symptoms:** "Server configuration error"  
**Check:**
- `JWT_SECRET` environment variable is set in Vercel
- Variable is at least 32 characters

**Solution:**
- Add `JWT_SECRET` to Vercel environment variables
- Redeploy application

### Issue 6: Student Model Missing
**Symptoms:** Database query errors  
**Check:**
- Student model doesn't exist in database
- Login tries to include students

**Solution:**
- Already fixed in latest code
- Login should work without Student model

---

## 🔧 Quick Debugging Steps

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** → Latest deployment → **Functions** tab
4. Look for `/api/auth/login` errors
5. Check error messages in logs

### Step 2: Test Database Connection
```bash
# In your local environment
cd learnai-academy
npx prisma db pull
npx prisma studio
```

### Step 3: Verify Test Account Exists
```bash
# Check if account exists
npx prisma studio
# Or query directly:
# SELECT email, password_hash FROM users WHERE email = 'admin@test.com';
```

### Step 4: Test Login API Directly
```bash
# Using curl
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"TestAccount123!"}'
```

### Step 5: Check Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- ✅ `DATABASE_URL` is set
- ✅ `JWT_SECRET` is set (32+ characters)
- ✅ `JWT_EXPIRES_IN` is set (optional, defaults to "7d")

---

## 🐛 Common Error Messages

### "Invalid email or password"
- User doesn't exist OR password is wrong
- Check email spelling
- Verify password: `TestAccount123!`
- Check if account exists in database

### "Account configuration error"
- User exists but no password hash
- Recreate account or set password hash

### "Database error"
- Database connection issue
- Check DATABASE_URL
- Check database is running

### "Server configuration error"
- Missing JWT_SECRET
- Add to Vercel environment variables

### "Invalid response format"
- API returned non-JSON response
- Check API route errors
- Check network tab in browser

---

## ✅ Verification Checklist

- [ ] DATABASE_URL is set in Vercel
- [ ] JWT_SECRET is set in Vercel (32+ chars)
- [ ] Test accounts exist in database
- [ ] Database is accessible
- [ ] No errors in Vercel function logs
- [ ] Using correct email: `admin@test.com`
- [ ] Using correct password: `TestAccount123!`
- [ ] Account is not locked

---

## 📞 Next Steps

If login still fails after checking all above:

1. **Check Vercel Function Logs:**
   - Look for specific error messages
   - Check stack traces
   - Note exact error text

2. **Test with curl:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"TestAccount123!"}' \
     -v
   ```

3. **Check Browser Console:**
   - Open browser DevTools
   - Go to Network tab
   - Try login
   - Check response from `/api/auth/login`
   - Look at response body and status code

4. **Verify Account in Database:**
   - Use Prisma Studio or database client
   - Check if `admin@test.com` exists
   - Verify `password_hash` field has a value
   - Check `role` field is set correctly

---

**Need more help?** Share the exact error message from Vercel logs or browser console!

