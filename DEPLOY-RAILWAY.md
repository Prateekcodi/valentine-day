# Deploy to Railway (Alternative to Render)

This guide explains how to deploy the Valentine Week project on Railway instead of Render.

## Prerequisites

- GitHub account with the project pushed
- Railway account (sign up at https://railway.app)

---

## Option 1: Deploy Backend on Railway

### Step 1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `valentine-day` repository
5. Select "Backend" as the service (or create a new service)

### Step 2: Configure Backend Service

**Service Name:** `valentine-week-api`

**Build Command:**
```bash
cd apps/server && npm install
```

**Start Command:**
```bash
cd apps/server && npm start
```

**Root Directory:** (leave empty, we specify in start command)

### Step 3: Add Environment Variables

Click "Variables" tab and add:

```
# AI APIs (get from Render or create new)
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_key
GROQ_API_KEY=your_groq_api_key
MINIMAX_API_KEY=your_minimax_key

# Optional: MongoDB (leave empty for in-memory storage)
MONGODB_URI=
DB_NAME=valentine_week

# Server Config
PORT=3001
NODE_ENV=production
```

### Step 4: Deploy

Click "Deploy" - Railway will automatically build and deploy.

**Your backend URL will be:** `https://valentine-week-api.up.railway.app`

---

## Option 2: Deploy Frontend on Vercel (Same as Before)

Frontend deployment hasn't changed:

1. Go to https://vercel.com
2. Import your GitHub repo
3. Set root directory to `apps/web`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://valentine-week-api.up.railway.app
   ```
5. Deploy

---

## Option 3: Deploy Everything on Railway (Full Stack)

Railway can deploy both frontend and backend together.

### Step 1: Create New Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `valentine-day` repository

### Step 2: Add Database (Optional)

1. Click "New" → "Database" → "PostgreSQL" or "MongoDB"
2. Copy the connection string

### Step 3: Configure Backend Service

**Service Name:** `api`

**Build Command:**
```bash
cd apps/server && npm install && npm run build
```

**Start Command:**
```bash
cd apps/server && npm start
```

**Environment Variables:**
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
GROQ_API_KEY=your_key
MINIMAX_API_KEY=your_key
PORT=3001
```

### Step 4: Configure Frontend Service

**Service Name:** `web`

**Build Command:**
```bash
cd apps/web && npm install && npm run build
```

**Start Command:**
```bash
npx serve -s build -l 3000
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=${{ api.SERVICE_URL }}
```

### Step 5: Add Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain or use the default Railway domain

---

## Quick Deploy (Simplest)

### Backend Only on Railway:

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

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Get from https://aistudio.google.com |
| `OPENROUTER_API_KEY` | Yes | Get from https://openrouter.ai |
| `GROQ_API_KEY` | Yes | Get from https://console.groq.com |
| `MINIMAX_API_KEY` | Yes | Get from https://platform.minimaxi.com |
| `MONGODB_URI` | No | MongoDB connection string (optional, uses memory if empty) |
| `PORT` | No | Server port (default: 3001) |

---

## Troubleshooting

### Build Fails
- Make sure Node.js version is 18+
- Check that all dependencies are installed

### Can't Connect to Backend
- Check that CORS is configured for your frontend URL
- Verify environment variables are set

### MongoDB Connection Issues
- If you don't have MongoDB, leave `MONGODB_URI` empty
- The server will use in-memory storage (rooms lost on restart)

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Backend | `https://valentine-week-api.up.railway.app` |
| Frontend | `https://valentine-web.vercel.app` (or Railway domain) |
| Health Check | `https://valentine-week-api.up.railway.app/api/health` |
