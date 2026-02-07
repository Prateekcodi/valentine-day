# 🚀 Valentine Week Experience - Deployment Guide

## Overview

You need to deploy **2 services**:
1. **Frontend**: Next.js (Vercel) - https://your-project.vercel.app
2. **Backend**: Express + Socket.IO (Render/Railway) - https://your-backend.onrender.com

---

## Step 1: Get Gemini API Key

1. Go to https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

---

## Step 2: Deploy Backend (Render)

### Option A: Render (Recommended)

1. Create account at https://render.com
2. Connect your GitHub repository
3. Create a **Web Service**:

```
Name: valentine-week-api
Root Directory: apps/server
Build Command: npm install
Start Command: npm start
Environment Variables:
  - GEMINI_API_KEY = your_api_key_here
  - NODE_ENV = production
Instance Type: Free (will work for testing)
```

4. Click "Create Web Service"
5. Wait for deployment to complete
6. Copy your backend URL (e.g., `https://valentine-week-api.onrender.com`)

### Option B: Railway

1. Go to https://railway.app
2. Create account and connect GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory: `apps/server`
6. Add environment variable: `GEMINI_API_KEY`
7. Deploy and copy URL

---

## Step 3: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New Project" → "Import GitHub Repository"
4. Select your repository
5. Set Root Directory: `apps/web`
6. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.onrender.com
   ```
   (Replace with your actual backend URL from Step 2)

7. Click "Deploy"
8. Wait for deployment (~2 minutes)

---

## Step 4: Update Configuration

After backend deploys, update frontend environment:

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Update `NEXT_PUBLIC_API_URL` with your actual backend URL
5. Redeploy (or it will auto-redeploy)

---

## Step 5: Test Deployment

Open your Vercel frontend URL and test:

1. Create a new room
2. Join with same name (rejoin test)
3. Complete Day 1
4. Check that AI reflection generates

---

## Troubleshooting

### Backend Not Starting?
- Check Build Logs in Render
- Make sure `npm install` completed
- Verify `GEMINI_API_KEY` is set

### Frontend 500 Error?
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Make sure backend is running first

### AI Not Generating?
- Check backend logs for quota errors
- Fallback reflections will work (no AI cost)
- Gemini free tier has limits

---

## URLs Format

| Service | Example URL |
|---------|-------------|
| Backend | `https://valentine-week-api.onrender.com` |
| Frontend | `https://valentine-week.vercel.app` |
| API Health | `https://valentine-week-api.onrender.com/api/health` |

---

## Cost

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | ✅ Unlimited | Optional |
| Render | ✅ 750 hours/month | $7/month |
| Railway | $5 credit/month | $5/month |

**Total Cost: $0 (using free tiers)**

---

## Quick Commands

```bash
# Local development
cd apps/server && npm run dev    # Terminal 1
cd apps/web && npm run dev      # Terminal 2

# Deploy backend
cd apps/server
npm install
npm run build
# Deploy to Render

# Deploy frontend
cd apps/web
vercel --prod
```

---

## Ready! 🎉

Once deployed, share the **Vercel frontend URL** with your partner!

Example: `https://valentine-week.vercel.app`
