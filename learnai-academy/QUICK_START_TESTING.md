# Quick Start: Testing & Monitoring

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (for GitHub Actions)
npm run test:ci

# Run specific test file
npm test -- progressTracker
```

## 📊 Test Coverage

Current test coverage includes:
- ✅ **ProgressTracker** - 27 tests
- ✅ **AchievementChecker** - 11 tests  
- ✅ **RecommendationEngine** - Comprehensive tests
- ✅ **API Routes** - Authentication endpoints

## 🔍 Error Tracking (Sentry)

### Setup:
1. Create account at https://sentry.io
2. Create a Next.js project
3. Copy your DSN
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
   SENTRY_DSN=your-dsn-here
   ```

### Features:
- Automatic error capture
- Source maps for debugging
- Performance monitoring
- Release tracking

## 📈 Performance Monitoring

### Vercel Analytics
Automatically enabled when deployed to Vercel. Tracks:
- Page views
- User sessions
- Geographic data
- Device information

### Speed Insights
Automatically tracks:
- Core Web Vitals (LCP, FID, CLS)
- Real user metrics
- Performance scores

### Custom Performance Tracking
Use `PerformanceMonitor` utility:

```javascript
import PerformanceMonitor from '@/lib/performance.js';

// Track API endpoint
PerformanceMonitor.trackEndpoint('/api/sessions', 150, 200);

// Track database query
PerformanceMonitor.trackDatabaseQuery('findMany', 45, 'users');

// Track AI call
PerformanceMonitor.trackAICall('MathAgent', 1200, 500, 0.001);

// Time an operation
await PerformanceMonitor.timeOperation('complexCalculation', async () => {
  // Your code here
});
```

## 🚀 CI/CD Pipeline

### GitHub Actions
Automatically runs on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### Pipeline Steps:
1. **Test** - Runs all tests with PostgreSQL and Redis
2. **Build** - Verifies application builds successfully
3. **Security** - Scans for npm vulnerabilities

### Required Secrets:
Add these in GitHub Settings → Secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`

## 📝 Example Test

```javascript
import { progressTracker } from '../progressTracker.js';

describe('ProgressTracker', () => {
  it('should track session progress', async () => {
    const result = await progressTracker.trackSessionProgress(
      'session-1',
      {
        problemsAttempted: 10,
        problemsCorrect: 8,
        durationMinutes: 30,
      }
    );
    
    expect(result.masteryLevel).toBeGreaterThan(0);
  });
});
```

## 🎯 Next Steps

1. ✅ Tests are passing
2. ⚙️ Configure Sentry DSN
3. ⚙️ Add GitHub secrets for CI/CD
4. 🚀 Deploy to Vercel for analytics

All high-priority infrastructure is now in place! 🎉

