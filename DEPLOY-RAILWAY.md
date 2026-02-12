# Deploy Backend on Railway

## Quick Deploy

### Step 1: Create Service

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `valentine-day` repository

### Step 2: Configure Service

**Service Name:** `valentine-week-api`

**Root Directory:** `apps/server`

Railway will automatically use the `Dockerfile` in `apps/server/`

### Step 3: Add Environment Variables

Click **"Variables"** tab and add:

```
# AI APIs (required)
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
GROQ_API_KEY=your_key
MINIMAX_API_KEY=your_key

# Optional
MONGODB_URI=
PORT=3001
```

### Step 4: Deploy

Click **"Deploy"** - Railway will build using Docker and deploy.

**Backend URL:** `https://valentine-week-api.up.railway.app`

---

## Frontend on Vercel

1. Go to https://vercel.com
2. Import repo, set Root Directory: `apps/web`
3. Add: `NEXT_PUBLIC_API_URL=https://valentine-week-api.up.railway.app`
4. Deploy
