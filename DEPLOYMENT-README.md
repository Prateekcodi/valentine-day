# Valentine Week Experience - Deployment Ready

## ✅ Project Status: COMPLETE & TESTED

All 8 days implemented, all APIs tested, glassmorphism UI complete.

## Quick Deploy (No GitHub Required)

### Option 1: Manual Upload to Vercel + Render

**Backend (Render):**
1. Create a zip of `apps/server/` folder
2. Go to https://render.com
3. Create new Web Service
4. Upload zip or connect repo
5. Environment variables:
   - `GEMINI_API_KEY` = your Google Gemini API key
   - `NODE_ENV` = production
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Note your backend URL (e.g., `https://valentine-week-api.onrender.com`)

**Frontend (Vercel):**
1. Create a zip of the root project folder
2. Go to https://vercel.com
3. Create new project
4. Upload zip or connect repo
5. Configure root directory: `apps/web`
6. Environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL
7. Deploy
8. Share Vercel URL with your partner

### Option 2: GitHub Push (Requires Authentication)

If you have GitHub CLI or can add credentials:

```bash
cd /home/prateek/Documents/public/making

# Option A: Use gh CLI (if installed)
gh auth login
git push origin main

# Option B: Create repo on GitHub.com first, then push
# 1. Go to https://github.com/new
# 2. Create repo "valentine-day" (don't initialize with README)
# 3. Then run:
git push -u origin main
```

## Local Testing

**Start Backend:**
```bash
cd /home/prateek/Documents/public/making/apps/server
npx tsx src/index.ts
# Runs on http://localhost:3001
```

**Start Frontend:**
```bash
cd /home/prateek/Documents/public/making/apps/web
npx next dev -p 3000
# Runs on http://localhost:3000
```

## Testing the Complete Flow

1. Open http://localhost:3000 in Browser 1
2. Enter your name, click "Create Room"
3. Note the Room Code (e.g., "XT7XWJ")
4. Open http://localhost:3000 in Browser 2 (incognito)
5. Enter partner's name, enter Room Code, click "Join Room"
6. Both see the Room page with partner info
7. Click Day 1 (Rose Day) - current day!
8. Both click "Accept This Rose"
9. See AI reflection generated
10. Continue through all 8 days

## Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

- `POST /api/room/create` - Create room
- `POST /api/room/join` - Join room
- `GET /api/room/:roomId` - Get room status
- `POST /api/day/:day/accept` - Day 1 accept
- `POST /api/day/:day/submit` - Days 2-8 submit
- `GET /api/day/:day/status/:roomId` - Get day status

## Features Implemented

✅ Glassmorphism UI with backdrop blur
✅ 8 days with unique interactions
✅ AI reflections with love percentages
✅ Partner real-time sync via Socket.IO
✅ Rejoin functionality (same name = same playerId)
✅ Date locking (each day only unlocks on its date)
✅ Fallback reflections (when AI quota exceeded)
✅ Mobile responsive design
✅ Valentine's Day finale with celebration

## Important Dates

- **Feb 7, 2026** - Day 1 (Rose Day) - UNLOCKS TODAY
- **Feb 8, 2026** - Day 2 (Propose Day)
- **Feb 9, 2026** - Day 3 (Chocolate Day)
- **Feb 10, 2026** - Day 4 (Teddy Day)
- **Feb 11, 2026** - Day 5 (Promise Day)
- **Feb 12, 2026** - Day 6 (Kiss Day)
- **Feb 13, 2026** - Day 7 (Hug Day)
- **Feb 14, 2026** - Day 8 (Valentine's Day Finale)

## Support

If you need help with deployment, run the comprehensive test:
```bash
cd /home/prateek/Documents/public/making
node comprehensive-test.js
```

All tests should pass before deployment.

---

**Built with ❤️ for Prateek & Nidhi**
