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
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/valentine_week
DB_NAME=valentine_week
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
```
- To get Gemini API key: https://aistudio.google.com/
- To get MongoDB: Create free MongoDB Atlas cluster and get connection string

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
NEXT_PUBLIC_SOCKET_URL=https://your-render-backend-url.onrender.com
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

## 4. Required Environment Variables Summary

### Backend (Render)
| Variable | Required | Example |
|----------|----------|--------|
| GEMINI_API_KEY | Yes (for AI) | `AI...` |
| MONGODB_URI | Yes (for persistence) | `mongodb+srv://...` |
| DB_NAME | Yes | `valentine_week` |
| PORT | No (default 3001) | `3001` |
| CORS_ORIGIN | Yes | `https://your-vercel.vercel.app` |

### Frontend (Vercel)
| Variable | Required | Example |
|----------|----------|--------|
| NEXT_PUBLIC_API_URL | Yes | `https://api.yourdomain.com` |
| NEXT_PUBLIC_SOCKET_URL | Yes | `https://api.yourdomain.com` |

---

## 5. Troubleshooting

### "Cannot connect to API" error:
- Check Render backend is deployed and running
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render URL
- Add `https://` prefix in the URL

### WebSocket connection failed:
- Add `NEXT_PUBLIC_SOCKET_URL` in Vercel environment variables
- Make sure it matches your backend URL exactly
- Check Render has WebSocket support enabled

### Data not saving to MongoDB:
- Verify `MONGODB_URI` is set in Render
- Check MongoDB Atlas cluster is running
- Test MongoDB connection string works

### AI reflections not working:
- Add `GEMINI_API_KEY` in Render environment variables
- Redeploy the backend

---

## Quick Reference

| Platform | URL | Purpose |
|----------|-----|---------|
| Render | https://dashboard.render.com | Backend API + WebSockets |
| Vercel | https://vercel.com/dashboard | Frontend (Next.js) |
| MongoDB Atlas | https://mongodb.com/cloud/atlas | Database (free tier) |
| Gemini API | https://aistudio.google.com/ | AI Reflections Key |

---

**Happy Valentine's Day! 💕**
