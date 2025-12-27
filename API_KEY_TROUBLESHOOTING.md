# API Key Troubleshooting Guide

## Issue Found: Quota Exceeded (Not Broken API Key)

Your API key is **valid**, but you've exceeded the **free tier quota** for Gemini API.

### Error Details
- **Status**: API key is working correctly
- **Problem**: Free tier quota limit reached
- **Error Code**: 429 Too Many Requests
- **Quota Metrics Exceeded**:
  - Free tier requests per day
  - Free tier requests per minute
  - Free tier input tokens per minute

## Solutions

### Option 1: Wait and Retry (Recommended for Testing)
- Wait 20-60 minutes for quota to reset
- Free tier quotas typically reset on a rolling basis
- Check your usage: https://ai.dev/usage?tab=rate-limit

### Option 2: Upgrade Your Plan
- Visit: https://ai.google.dev/pricing
- Upgrade to a paid plan for higher quotas
- Free tier has very limited requests per day

### Option 3: Use a Different API Key
- Get a new API key from: https://makersuite.google.com/app/apikey
- Update `VITE_GEMINI_API_KEY` in your `.env` file
- Restart the dev server

## How to Check Your Quota Status

1. Visit: https://ai.dev/usage?tab=rate-limit
2. Check your current usage vs limits
3. See when quotas reset

## Testing Your API Key

Run the test script:
```bash
node test-api-key.js
```

This will tell you:
- ✅ If your API key is valid
- ❌ If there are quota issues
- ❌ If the key is invalid

## Current Status

- ✅ API Key Format: Valid (starts with "AIza")
- ✅ API Key Length: 39 characters (correct)
- ❌ Quota Status: Exceeded (free tier limit reached)
- ⏰ Retry After: ~20 seconds (but daily quota may need longer)

## App Behavior

The app will now show a more helpful error message:
- "API quota exceeded. You've reached the free tier limit. Please wait a few minutes or check your billing plan at https://ai.dev/usage"

Trending books will fall back to the hardcoded list when the API quota is exceeded.

