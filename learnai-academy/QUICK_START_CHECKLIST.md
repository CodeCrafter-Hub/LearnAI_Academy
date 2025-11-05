# Quick Start Checklist

Follow this checklist in order. Detailed instructions are in `COMPLETE_SETUP_GUIDE.md`.

## ✅ Setup Checklist

### 1. Database Setup (Neon)
- [ ] Create account at https://neon.tech
- [ ] Create new project
- [ ] Copy connection string
- [ ] Change `postgres://` to `postgresql://`
- [ ] Save connection string for later

### 2. Vercel Deployment
- [ ] Deploy project to Vercel (from GitHub)
- [ ] Wait for first deployment to complete

### 3. Environment Variables (Vercel Dashboard)
- [ ] Go to Settings → Environment Variables
- [ ] Add `DATABASE_URL` (your Neon connection string)
- [ ] Add `JWT_SECRET` (random string, 32+ chars)
- [ ] Add `GROQ_API_KEY` (from https://console.groq.com/)
- [ ] Add `JWT_EXPIRES_IN` = `7d` (optional)
- [ ] Redeploy after adding variables

### 4. Local Setup (Terminal)
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
cd learnai-academy
vercel login
vercel link

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
```

### 5. Verification
- [ ] Test database: `npx prisma db pull` (should succeed)
- [ ] Visit your Vercel URL (should see homepage)
- [ ] Click "Get Started Free" (should show registration form)
- [ ] Register a new account (should work)
- [ ] Login with demo: `demo@learnai.com` / `demo123` (should work)
- [ ] Dashboard loads after login (should show subjects)

## 🎯 Critical Steps

**Must Do:**
1. Set `DATABASE_URL` in Vercel
2. Set `JWT_SECRET` in Vercel
3. Run `npx prisma migrate deploy`
4. Run `node prisma/seed.js`

**Without these, the app won't work!**

## 📝 Notes

- Connection string must use `postgresql://` (not `postgres://`)
- JWT_SECRET can be any random string (32+ characters recommended)
- Migrations create database tables
- Seed script creates demo account and initial data

## 🆘 If Something Fails

1. Check Vercel logs: Dashboard → Deployments → Latest → Functions
2. Verify environment variables are set
3. Test database connection: `npx prisma db pull`
4. See `COMPLETE_SETUP_GUIDE.md` for detailed troubleshooting

---

**Ready to start?** Open `COMPLETE_SETUP_GUIDE.md` for detailed step-by-step instructions!

