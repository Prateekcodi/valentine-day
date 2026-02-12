# Deploy Backend on Railway

This guide explains how to deploy the Valentine Week **backend** on Railway.

## Quick Deploy (Backend Only)

### Step 1: Create Service on Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `valentine-day` repository

### Step 2: Configure Service

**Service Name:** `valentine-week-api`

**Root Directory:** `apps/server`

**Build Command:**
```bash
cd apps/server && npm install && npm run build
```

**Start Command:**
```bash
cd apps/server && npm start
```

### Step 3: Add Environment Variables

Click **"Variables"** tab and add:

```
# AI APIs (required)
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_key
GROQ_API_KEY=your_groq_api_key
MINIMAX_API_KEY=your_minimax_key

# Optional: MongoDB (leave empty for memory storage)
MONGODB_URI=
DB_NAME=valentine_week

# Server Config
PORT=3001
NODE_ENV=production
```

### Step 4: Deploy

Click **"Deploy"** - Railway will build and deploy automatically.

**Your backend URL:** `https://valentine-week-api.up.railway.app`

---

## Frontend on Vercel (Unchanged)

Frontend deployment hasn't changed:

1. Go to https://vercel.com
2. Import your GitHub repo
3. Set **Root Directory:** `apps/web`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://valentine-week-api.up.railway.app
   ```
5. Deploy

---

## Need MongoDB?

Railway offers MongoDB:

1. In Railway dashboard, click **"New"** → **"Database"** → **"MongoDB"**
2. Copy the connection string
3. Add to backend environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   ```

---

## Alternative: Use Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Backend | `https://valentine-week-api.up.railway.app` |
| Frontend | `https://your-project.vercel.app` |
| Health Check | `https://valentine-week-api.up.railway.app/api/health` |
