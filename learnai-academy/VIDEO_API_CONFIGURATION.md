# Video API Configuration Guide

This guide will help you configure the video generation and storage APIs for the AI Video Lesson Infrastructure.

---

## 📋 Required APIs

You need to configure **at least one** of the following:

1. **Video Generation API** (HeyGen, D-ID, or Synthesia) - For creating AI avatar videos
2. **Cloudflare R2** - For storing and delivering videos via CDN

---

## 🎬 Step 1: Choose Video Generation Provider

### Option A: HeyGen (Recommended for MVP)

**Pros:**
- Easy to use
- Good quality avatars
- $29/month unlimited generations (or pay-per-use)

**Setup:**
1. Sign up at [heygen.com](https://www.heygen.com)
2. Go to Dashboard → API Keys
3. Create a new API key
4. Copy your API key

**Environment Variables:**
```env
VIDEO_GENERATION_PROVIDER=heygen
VIDEO_GENERATION_API_KEY=your_heygen_api_key_here
VIDEO_AVATAR_ID=your_avatar_id  # Optional, uses default if not set
VIDEO_VOICE_ID=your_voice_id    # Optional, uses default if not set
```

**Getting Avatar and Voice IDs:**
- Go to HeyGen Dashboard → Avatars
- Select an avatar and copy its ID
- Go to Voices section and select a voice, copy its ID

---

### Option B: D-ID

**Pros:**
- Pay-per-use ($0.10 per video minute)
- Good for testing (no monthly subscription)
- API-first approach

**Setup:**
1. Sign up at [d-id.com](https://www.d-id.com)
2. Go to API Keys section
3. Create API key
4. Copy your API key

**Environment Variables:**
```env
VIDEO_GENERATION_PROVIDER=d-id
VIDEO_GENERATION_API_KEY=your_did_api_key_here
VIDEO_AVATAR_ID=your_avatar_url_or_id  # Avatar source URL or ID
VIDEO_VOICE_ID=en-US-JennyNeural        # Microsoft voice ID
```

**Getting Avatar:**
- D-ID uses avatar source URLs or pre-created avatars
- Check D-ID documentation for available avatars

---

### Option C: Synthesia

**Pros:**
- Enterprise-grade quality
- 160+ avatars
- $30/month

**Setup:**
1. Sign up at [synthesia.io](https://www.synthesia.io)
2. Get API key from dashboard
3. Copy your API key

**Environment Variables:**
```env
VIDEO_GENERATION_PROVIDER=synthesia
VIDEO_GENERATION_API_KEY=your_synthesia_api_key_here
VIDEO_AVATAR_ID=your_avatar_id
VIDEO_VOICE_ID=your_voice_id
```

---

## ☁️ Step 2: Set Up Cloudflare R2 Storage

Cloudflare R2 provides S3-compatible storage with **zero egress fees** (free data transfer).

### Setup Steps:

1. **Create Cloudflare Account**
   - Go to [cloudflare.com](https://www.cloudflare.com)
   - Sign up for free account

2. **Create R2 Bucket**
   - Go to Dashboard → R2 → Create bucket
   - Bucket name: `learnai-video-lessons`
   - Location: Choose closest to your users
   - Click "Create bucket"

3. **Get API Credentials**
   - Go to R2 → Manage R2 API Tokens
   - Click "Create API Token"
   - Permissions: Object Read & Write
   - Bucket: Select your bucket
   - Click "Create API Token"
   - **Save these credentials** (shown only once):
     - Access Key ID
     - Secret Access Key

4. **Set Up Public Access (CDN)**
   - Go to your bucket → Settings
   - Enable "Public Access"
   - Note the public URL (or set up custom domain)

5. **Get Account ID**
   - Go to Cloudflare Dashboard
   - Your Account ID is in the right sidebar

**Environment Variables:**
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=learnai-video-lessons
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # Your R2 public URL
```

**Public URL Format:**
- Default: `https://pub-<random-id>.r2.dev`
- Or use custom domain: `https://videos.yourdomain.com`

---

## 🔧 Step 3: Add to Environment Variables

### For Local Development (.env.local)

Create or update `learnai-academy/.env.local`:

```env
# Video Generation API
VIDEO_GENERATION_PROVIDER=heygen
VIDEO_GENERATION_API_KEY=your_api_key_here
VIDEO_AVATAR_ID=default_avatar_id
VIDEO_VOICE_ID=default_voice_id

# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=learnai-video-lessons
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### For Production (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **VIDEO_GENERATION_PROVIDER**
   - **VIDEO_GENERATION_API_KEY**
   - **VIDEO_AVATAR_ID** (optional)
   - **VIDEO_VOICE_ID** (optional)
   - **CLOUDFLARE_ACCOUNT_ID**
   - **CLOUDFLARE_R2_ACCESS_KEY_ID**
   - **CLOUDFLARE_R2_SECRET_ACCESS_KEY**
   - **CLOUDFLARE_R2_BUCKET_NAME**
   - **CLOUDFLARE_R2_PUBLIC_URL**
5. Select environments (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your application

---

## ✅ Step 4: Test Configuration

### Test Video Generation API

Create a test script to verify your API connection:

```bash
# Test HeyGen API
curl -X POST https://api.heygen.com/v1/video/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar_id": "your_avatar_id",
    "voice_id": "your_voice_id",
    "text": "Hello, this is a test video."
  }'
```

### Test Cloudflare R2

You can test R2 connection by trying to create a video lesson through the API:

```bash
POST /api/videos
{
  "subjectId": "your-subject-id",
  "title": "Test Video",
  "gradeLevelMin": 3,
  "gradeLevelMax": 5,
  "generateScript": true,
  "generateVideo": false  # Set to true after API is configured
}
```

---

## 🚀 Step 5: Update Environment Validator

The environment validator needs to be updated to include video-related variables. See `VIDEO_API_VALIDATOR_UPDATE.md` for instructions.

---

## 📊 Cost Estimates

### Video Generation Costs

**HeyGen:**
- Monthly subscription: $29/month (unlimited)
- Or pay-per-use: varies

**D-ID:**
- $0.10 per video minute
- Example: 10-minute video = $1.00

**Synthesia:**
- $30/month subscription

### Cloudflare R2 Costs

**Storage:**
- $0.015 per GB/month
- Example: 100GB = $1.50/month

**Egress (Data Transfer):**
- **FREE** (zero egress fees!)
- This is the main advantage over AWS S3

**Example Monthly Cost (1,000 students, 30 min video/month):**
- Storage: ~$15/month (1TB)
- Egress: $0 (free!)
- **Total: ~$15/month**

---

## 🔒 Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Use different keys** for development and production
5. **Restrict R2 bucket permissions** (read-only for public, write for API only)

---

## 🐛 Troubleshooting

### Video Generation Fails

**Error: "Video generation API key not configured"**
- Check that `VIDEO_GENERATION_API_KEY` is set
- Verify the key is correct
- Check API provider dashboard for key status

**Error: "HeyGen API error: 401 Unauthorized"**
- API key is invalid or expired
- Regenerate API key in provider dashboard

**Error: "Failed to generate video"**
- Check API provider status page
- Verify avatar and voice IDs are correct
- Check API rate limits

### R2 Storage Fails

**Error: "Cloudflare R2 credentials not configured"**
- Check all R2 environment variables are set
- Verify credentials are correct

**Error: "Failed to upload video"**
- Check bucket name is correct
- Verify bucket exists
- Check bucket permissions
- Verify public URL is correct

---

## 📚 Next Steps

After configuring APIs:

1. **Test video creation** via API
2. **Generate a test video** to verify end-to-end flow
3. **Check video playback** in the VideoPlayer component
4. **Monitor costs** in provider dashboards
5. **Set up alerts** for API usage limits

---

## 🆘 Need Help?

- **HeyGen Docs**: https://docs.heygen.com
- **D-ID Docs**: https://docs.d-id.com
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Synthesia Docs**: https://docs.synthesia.io

---

**Ready to generate videos!** 🎬✨

