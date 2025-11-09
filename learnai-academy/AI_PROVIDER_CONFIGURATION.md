# 🤖 AI Provider Configuration Guide

## Overview

LearnAI Academy supports multiple AI providers with automatic fallback. Configure one or more providers, and the system will automatically use the best available option.

## Supported Providers

| Provider | API Key Variable | Priority | Cost (per 1M tokens) | Best For |
|----------|-----------------|----------|---------------------|----------|
| **Groq** | `GROQ_API_KEY` | 1 (Highest) | $0.27 | Fast responses, cost-effective |
| **OpenAI** | `OPENAI_API_KEY` | 2 | ~$10.00 | High quality, GPT-4 |
| **Google Gemini** | `GEMINI_API_KEY` | 3 | ~$0.50 | Balanced quality/price |
| **Kimi (Moonshot)** | `KIMI_API_KEY` | 4 | ~$1.20 | Long context (32k tokens) |

## Quick Setup

### 1. Add API Keys to Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
KIMI_API_KEY=your_kimi_key_here
```

**Note:** You only need **at least one** provider configured. The system will automatically use the highest priority available provider.

### 2. Priority Order

The system tries providers in this order:
1. **Groq** (if configured) - Fastest and cheapest
2. **OpenAI** (if Groq fails)
3. **Gemini** (if OpenAI fails)
4. **Kimi** (if Gemini fails)

### 3. Automatic Fallback

If a provider fails (rate limit, error, etc.), the system automatically tries the next available provider. No code changes needed!

## Configuration Details

### Environment Variables

Add these to your `.env.local` (development) or Vercel Environment Variables (production):

```bash
# At least one required in production
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
GEMINI_API_KEY=xxxxxxxxxxxxx
KIMI_API_KEY=sk-xxxxxxxxxxxxx
```

### Provider Selection

The system automatically selects providers based on:
1. **Priority** (Groq > OpenAI > Gemini > Kimi)
2. **Availability** (API key configured)
3. **Fallback** (if current provider fails)

## Usage in Code

### Basic Usage (Automatic Provider Selection)

```javascript
import { aiProvider } from '@/services/ai/aiProviderConfig';

// Automatically uses best available provider
const response = await aiProvider.chat([
  { role: 'system', content: 'You are a helpful tutor' },
  { role: 'user', content: 'Explain fractions' }
], {
  temperature: 0.7,
  maxTokens: 1500,
});
```

### Preferred Provider

```javascript
// Prefer a specific provider, but fallback if it fails
const response = await aiProvider.chat(messages, {
  preferredProvider: 'groq', // Try Groq first
  temperature: 0.7,
});
```

### Backward Compatibility

The old `groqClient` still works:

```javascript
import { groqClient } from '@/services/ai/groqClient';

// This now uses the unified provider system
const response = await groqClient.chat(messages, options);
```

## Provider-Specific Features

### Groq
- **Models:** `llama-3.1-8b-instant` (fast), `llama-3.1-70b-versatile` (smart)
- **Max Tokens:** 8,192
- **Best For:** Fast responses, cost-effective operations

### OpenAI
- **Models:** `gpt-3.5-turbo` (fast), `gpt-4-turbo-preview` (smart)
- **Max Tokens:** 4,096
- **Best For:** Highest quality responses

### Google Gemini
- **Models:** `gemini-pro`
- **Max Tokens:** 8,192
- **Best For:** Balanced quality and price

### Kimi (Moonshot AI)
- **Models:** `moonshot-v1-8k` (fast), `moonshot-v1-32k` (smart)
- **Max Tokens:** 32,000
- **Best For:** Long context conversations

## Cost Optimization

### Recommended Setup for Production

1. **Primary:** Groq (cheapest, fast)
2. **Fallback:** Gemini (good balance)
3. **Optional:** OpenAI (for high-quality tasks)
4. **Optional:** Kimi (for long context)

### Cost Comparison (1M tokens)

- Groq: **$0.27** ✅ Cheapest
- Gemini: **$0.50** ✅ Good value
- Kimi: **$1.20** ⚠️ Moderate
- OpenAI: **$10.00** ⚠️ Most expensive

## Troubleshooting

### No Providers Configured

**Error:** `No AI providers configured`

**Solution:** Add at least one API key:
```bash
GROQ_API_KEY=your_key_here
```

### Provider Fails

The system automatically tries the next provider. Check logs for details:

```
Groq failed, trying next provider...
OpenAI failed, trying next provider...
```

### Rate Limits

If you hit rate limits, the system will:
1. Retry with exponential backoff
2. Fallback to next provider
3. Log the error for monitoring

## Monitoring

### Check Provider Status

```javascript
import { aiProvider } from '@/services/ai/aiProviderConfig';

const status = aiProvider.getStatus();
console.log(status);
// {
//   available: [
//     { name: 'Groq', key: 'groq', enabled: true, priority: 1 },
//     { name: 'OpenAI', key: 'openai', enabled: true, priority: 2 }
//   ],
//   current: { name: 'Groq', key: 'groq' }
// }
```

## Best Practices

1. **Configure Multiple Providers:** Ensures high availability
2. **Use Groq as Primary:** Most cost-effective
3. **Monitor Costs:** Check usage in provider dashboards
4. **Set Rate Limits:** Configure in provider settings
5. **Test Fallback:** Verify fallback works in production

## API Key Security

✅ **DO:**
- Store keys in Vercel Environment Variables
- Never commit keys to git
- Use different keys for dev/prod
- Rotate keys regularly

❌ **DON'T:**
- Hardcode keys in source code
- Share keys in chat/email
- Use same key for multiple projects
- Commit `.env` files

## Next Steps

1. ✅ Add API keys to Vercel
2. ✅ Redeploy application
3. ✅ Test with one provider
4. ✅ Add fallback providers
5. ✅ Monitor usage and costs

---

**Need Help?** Check the logs or contact support if providers aren't working.

