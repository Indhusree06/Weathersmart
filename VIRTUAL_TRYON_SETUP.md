# Virtual Try-On Setup Guide

## Step 1: Get a Replicate API Key (Free)

1. Go to https://replicate.com/
2. Sign up for a free account
3. Go to https://replicate.com/account/api-tokens
4. Create a new API token
5. Copy the token (starts with `r8_...`)

## Step 2: Add the API Key

1. Open your `.env.local` file in the project root
2. Add this line:
```
REPLICATE_API_KEY=r8_your_actual_key_here
```
3. Save the file
4. Restart the dev server

## Step 3: How to Use

1. Go to AI Outfit Picker
2. Get an outfit recommendation
3. Click "Try This Outfit On"
4. Drag clothes onto the mannequin
5. Click **"✨ Generate Realistic Preview"**
6. Wait 10-20 seconds
7. See a realistic AI-generated image of someone wearing the outfit!

## Features

- **Realistic AI try-on**: Uses state-of-the-art AI model
- **Multiple person types**: Adult male/female, child boy/girl
- **Quick generation**: ~15-20 seconds per image
- **Free tier**: 50 free predictions/month on Replicate

## Troubleshooting

If it doesn't work:
- Make sure the API key is correct
- Check console for errors (F12)
- Ensure clothing images have valid URLs
- Verify you're within the free tier limit

## Cost

- First 50 generations/month: **FREE**
- After that: ~$0.01-0.03 per generation

---

Generated: December 5, 2024

