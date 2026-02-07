# Deploy to Render + Vercel

## 1. Deploy Backend to Render

### Step 1: Create Web Service
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your **GitHub** repository: `Prateekcodi/valentine-day`
4. Configure:
   - **Name**: `valentine-week-api`
   - **Root Directory**: `apps/server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### Step 2: Add Environment Variables
In the **Environment Variables** section, add:
```
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
PORT=3001
```
To get Gemini API key: https://aistudio.google.com/

### Step 3: Deploy
- Click **Create Web Service**
- Wait for build to complete (2-3 minutes)
- Note your backend URL (e.g., `https://valentine-week-api.onrender.com`)

---

## 2. Deploy Frontend to Vercel

### Step 1: Create Project
1. Go to https://vercel.com/dashboard
2. Click **Add New +** → **Project**
3. Import: `Prateekcodi/valentine-day`
4. Configure:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: `Next.js` (auto-detected)

### Step 2: Add Environment Variables
In the **Environment Variables** section, add:
```
NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
```
Replace `your-render-backend-url.onrender.com` with your actual Render backend URL.

### Step 3: Deploy
- Click **Deploy**
- Wait for build to complete
- Your frontend URL (e.g., `https://valentine-day.vercel.app`)

---

## 3. Test the Connection

1. Open your Vercel frontend URL
2. Create a room
3. Check browser console for API errors
4. If working, share the URL with your partner!

---

## 4. Troubleshooting

### "Cannot connect to API" error:
- Check Render backend is deployed and running
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render URL
- Add `https://` prefix in the URL

### AI reflections not working:
- Add `GEMINI_API_KEY` in Render environment variables
- Redeploy the backend

### Socket.IO connection issues:
- Make sure Render service has WebSocket support enabled
- Render free tier supports WebSockets (but may have limits)

---

## Quick Reference

| Platform | URL | Purpose |
|----------|-----|---------|
| Render | https://dashboard.render.com | Backend API + WebSockets |
| Vercel | https://vercel.com/dashboard | Frontend (Next.js) |
| Gemini API | https://aistudio.google.com/ | AI Reflections Key |

---

**Happy Rose Day! 🌹**
