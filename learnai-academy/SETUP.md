# LearnAI Academy - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed
- Redis 7+ installed
- Groq API key (sign up at groq.com)

## Step 1: Clone and Install
```bash
# Navigate to project directory
cd learnai-academy

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

## Step 2: Database Setup
```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed
```

## Step 3: Environment Variables

Create `.env.local` file:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/learnai?schema=public"
REDIS_URL="redis://localhost:6379"
GROQ_API_KEY="your_groq_api_key_here"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Step 4: Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Test with Demo Account
```
Email: demo@learnai.com
Password: demo123
```

## Production Deployment

### Using Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Database (Supabase or Neon)

1. Create PostgreSQL database
2. Update DATABASE_URL
3. Run migrations: `npx prisma migrate deploy`

### Redis (Upstash)

1. Create Redis database at upstash.com
2. Update REDIS_URL

## Troubleshooting

**Problem:** Prisma client not found
**Solution:** Run `npx prisma generate`

**Problem:** Database connection error
**Solution:** Check PostgreSQL is running and DATABASE_URL is correct

**Problem:** Redis connection error
**Solution:** Check Redis is running and REDIS_URL is correct

**Problem:** Groq API errors
**Solution:** Verify API key is correct and has credits

## Next Steps

1. Customize subjects and topics in seed file
2. Add more achievements
3. Configure email notifications
4. Set up payment system (Stripe)
5. Add more AI agents for additional subjects

## Support

For questions or issues, please open a GitHub issue or contact support.
