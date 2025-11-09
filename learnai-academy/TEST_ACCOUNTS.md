# Test Accounts for All Grades

**Created:** November 9, 2025  
**Purpose:** Testing access to all grade levels in live environment

---

## 🔑 Login Credentials

**All test accounts use the same password:**
```
Password: TestAccount123!
```

---

## 📧 Available Test Accounts

### 1. **Admin Account** (Full Access)
```
Email: admin@test.com
Password: TestAccount123!
Role: ADMIN
Access: Full system access, all grades
```

### 2. **Parent Account** (Parent Dashboard)
```
Email: parent@test.com
Password: TestAccount123!
Role: PARENT
Access: Parent dashboard, can manage students
```

### 3. **General Test Account** (Default Grade 5)
```
Email: test@learnai.com
Password: TestAccount123!
Role: STUDENT
Grade: 5th Grade
Access: Standard student access
```

### 4. **Grade-Specific Accounts** (K-12)

| Grade | Email | Password |
|-------|-------|----------|
| Kindergarten | `grade0@test.com` | `TestAccount123!` |
| 1st Grade | `grade1@test.com` | `TestAccount123!` |
| 2nd Grade | `grade2@test.com` | `TestAccount123!` |
| 3rd Grade | `grade3@test.com` | `TestAccount123!` |
| 4th Grade | `grade4@test.com` | `TestAccount123!` |
| 5th Grade | `grade5@test.com` | `TestAccount123!` |
| 6th Grade | `grade6@test.com` | `TestAccount123!` |
| 7th Grade | `grade7@test.com` | `TestAccount123!` |
| 8th Grade | `grade8@test.com` | `TestAccount123!` |
| 9th Grade | `grade9@test.com` | `TestAccount123!` |
| 10th Grade | `grade10@test.com` | `TestAccount123!` |
| 11th Grade | `grade11@test.com` | `TestAccount123!` |
| 12th Grade | `grade12@test.com` | `TestAccount123!` |

---

## 🚀 How to Create Test Accounts

### Option 1: Run the Test Account Script

```bash
cd learnai-academy
npm run test:accounts
```

Or directly:
```bash
node prisma/createTestAccounts.js
```

### Option 2: Manual Creation

You can also manually register accounts through the registration page:
1. Go to `/register`
2. Use any of the email addresses above
3. Use password: `TestAccount123!`
4. Select appropriate role and grade level

---

## 📋 Account Details

### Admin Account
- **Email:** `admin@test.com`
- **Role:** ADMIN
- **Subscription:** PREMIUM
- **Access:** Full system access

### Parent Account
- **Email:** `parent@test.com`
- **Role:** PARENT
- **Subscription:** FAMILY
- **Access:** Parent dashboard, can manage linked students
- **Linked Students:** All grade-specific accounts are linked to this parent

### Student Accounts
- **Format:** `grade{level}@test.com` (e.g., `grade0@test.com` for Kindergarten)
- **Role:** STUDENT
- **Subscription:** FREE
- **Parent:** All linked to `parent@test.com`
- **Grade Levels:** 0 (K) through 12

---

## 🧪 Testing Scenarios

### Test All Grades
1. Login with each grade-specific account
2. Verify grade-appropriate content is shown
3. Test grade-specific features (e.g., movement breaks for K-5)
4. Verify classroom design adapts to grade level

### Test Parent Dashboard
1. Login with `parent@test.com`
2. Should see all linked student accounts
3. Can view progress for each student
4. Can manage student accounts

### Test Admin Features
1. Login with `admin@test.com`
2. Should have full system access
3. Can manage all users and content

---

## 🔒 Security Notes

⚠️ **Important:**
- These are **TEST ACCOUNTS ONLY**
- **DO NOT** use these passwords in production
- Change passwords immediately after testing
- These accounts should be **deleted** or **disabled** in production
- The password `TestAccount123!` is publicly documented and not secure

---

## 📝 Quick Reference

**Most Common Test Accounts:**
- **Admin:** `admin@test.com` / `TestAccount123!`
- **Parent:** `parent@test.com` / `TestAccount123!`
- **Grade 5:** `grade5@test.com` / `TestAccount123!`
- **General:** `test@learnai.com` / `TestAccount123!`

**All accounts password:** `TestAccount123!`

---

## ✅ Verification

After running the script, you should see:
```
✅ Created admin account: admin@test.com
✅ Created parent account: parent@test.com
✅ Created Kindergarten account: grade0@test.com
✅ Created 1st Grade account: grade1@test.com
... (and so on for all grades)
✅ Created comprehensive test account: test@learnai.com
✅ All test accounts created successfully!
```

---

**Ready to test!** 🎉

