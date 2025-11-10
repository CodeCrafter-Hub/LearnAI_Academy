# Video API Quick Setup Guide

## 🚀 Quick Start

### 1. Add Environment Variables

Add these to your `.env.local` file:

```env
# Video Generation (Choose one provider)
VIDEO_GENERATION_PROVIDER=heygen
VIDEO_GENERATION_API_KEY=your_api_key_here
VIDEO_AVATAR_ID=your_avatar_id
VIDEO_VOICE_ID=your_voice_id

# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=learnai-video-lessons
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 2. Get API Keys

**HeyGen (Recommended):**
1. Sign up: https://www.heygen.com
2. Dashboard → API Keys → Create Key
3. Copy API key

**Cloudflare R2:**
1. Sign up: https://www.cloudflare.com
2. R2 → Create Bucket: `learnai-video-lessons`
3. R2 → Manage R2 API Tokens → Create Token
4. Copy Access Key ID and Secret Access Key
5. Get Account ID from dashboard sidebar
6. Enable public access in bucket settings

### 3. Test Configuration

```bash
node scripts/test-video-apis.js
```

### 4. For Production (Vercel)

Add all variables to Vercel → Settings → Environment Variables

---

**Full details:** See `VIDEO_API_CONFIGURATION.md`

