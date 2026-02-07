# Valentine Week Experience 🌹

A time-locked, AI-powered Valentine Week experience (Feb 7-14, 2026) that creates a shared emotional journey between two people.

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

Or manually:
```bash
# Root
npm install

# Frontend
cd apps/web
npm install

# Backend
cd ../server
npm install
```

### 2. Configure Environment Variables

Copy the example files:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
```

### 3. Run Development Servers

Terminal 1 (Frontend):
```bash
cd apps/web
npm run dev
```

Terminal 2 (Backend):
```bash
cd apps/server
npm run dev
```

### 4. Open in Browser

Visit: http://localhost:3000

## Project Structure

```
valentine-week/
├── apps/
│   ├── web/                      # Next.js 14 frontend
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── room/            # Room pages
│   │   │   │   └── [roomId]/page.tsx
│   │   │   └── day/             # Day pages
│   │   │       └── 1/page.tsx   # Rose Day (today!)
│   │   ├── components/
│   │   │   └── ui/              # Glassmorphism components
│   │   └── lib/                 # Utilities & types
│   └── server/                  # Express + Socket.IO backend
│       ├── src/
│       │   ├── socket/          # Socket handlers
│       │   └── services/        # Gemini AI service
│       └── index.ts             # Server entry
├── package.json                 # Root scripts
└── README.md
```

## Features

✅ **Glassmorphism UI** - Beautiful, modern interface  
✅ **Real-time Sync** - Socket.IO for live updates  
✅ **AI Reflections** - Gemini-powered insights  
✅ **Date Locking** - Each day unlocks at midnight  
✅ **Mobile Ready** - Responsive design  
✅ **Offline Fallback** - Works without AI API  

## Deployment

### Frontend (Vercel)

1. Connect repository to Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_SOCKET_URL`: Your backend URL

### Backend (Render)

1. Create new Web Service on Render
2. Connect repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables from `.env`

## Today is Rose Day! 🌹

The experience is now live! Players can:
1. Create a room and share the 6-character code
2. Partner joins using the code
3. Both accept the symbolic rose
4. Receive an AI reflection
5. Wait for tomorrow's unlock...

## License

Made with ❤️ by Prateek
