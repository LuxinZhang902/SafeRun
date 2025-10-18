# 🔌 Port Configuration Guide

## Default Port Setup

SafeRun uses **3 different ports** by default:

| Service | Port | Purpose | URL |
|---------|------|---------|-----|
| **API Server** | 3000 | Backend (Fastify) | http://localhost:3000 |
| **Web Server** | 3001 | Frontend (Next.js) | http://localhost:3001 |
| **Daytona Mock** | 3986 | Mock Daytona API | http://localhost:3986 |

**Important:** Open `http://localhost:3001` in your browser (NOT 3000)!

---

## Why Two Ports?

SafeRun is a **monorepo** with separate frontend and backend:

```
apps/
├── api/          → Backend API (port 3000)
│   └── Fastify server
└── web/          → Frontend UI (port 3001)
    └── Next.js app
```

The Web app (3001) makes API calls to the API server (3000).

---

## Quick Start (Standard Setup)

```bash
# Start everything with default ports
pnpm dev:full

# This starts:
# - Mock Daytona: http://localhost:3986
# - API: http://localhost:3000
# - Web: http://localhost:3001

# Open in browser:
open http://localhost:3001
```

---

## Custom Port Configuration

### Option 1: Change Web Port Only

If you want the UI on a different port (e.g., 3002):

**1. Edit `apps/web/package.json`:**
```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "start": "next start -p 3002"
  }
}
```

**2. Restart:**
```bash
pnpm dev
# Web now on: http://localhost:3002
```

---

### Option 2: Change API Port

If you want the API on a different port (e.g., 8080):

**1. Edit `.env`:**
```env
PORT=8080
```

**2. Edit `apps/web/.env.local` (create if doesn't exist):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**3. Restart:**
```bash
pnpm dev
# API now on: http://localhost:8080
# Web still on: http://localhost:3001
```

---

### Option 3: UI on Port 3000 (API on 8080)

If you really want the UI on port 3000:

**1. Edit `.env`:**
```env
PORT=8080
DAYTONA_BASE_URL=http://localhost:3986
```

**2. Edit `apps/web/package.json`:**
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "start": "next start -p 3000"
  }
}
```

**3. Create `apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**4. Restart:**
```bash
pnpm dev
# API: http://localhost:8080
# Web: http://localhost:3000 ← Open this!
```

---

## Troubleshooting

### Error: "Port 3000 already in use"

**Check what's running:**
```bash
lsof -i :3000
```

**Kill the process:**
```bash
kill -9 <PID>
```

### Error: "Failed to fetch" or "Network error"

**Check if API is running:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

**Check Web app API URL:**
```bash
# In apps/web/src/app/page.tsx, line 40:
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

**Create `apps/web/.env.local` if API is on different port:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Web app loads but API calls fail

**Common causes:**
1. API server not running
2. Wrong API URL in Web app
3. CORS issues (should be auto-configured)

**Solution:**
```bash
# Terminal 1: Start API
cd apps/api
pnpm dev

# Terminal 2: Start Web
cd apps/web
pnpm dev

# Terminal 3: Check API health
curl http://localhost:3000/health
```

---

## Team Collaboration

### For Consistent Team Setup

**1. Everyone uses default ports:**
```bash
pnpm dev:full
# Open: http://localhost:3001
```

**2. Document any custom ports in `.env`:**
```env
# .env (committed to git)
PORT=3000
DAYTONA_BASE_URL=http://localhost:3986

# apps/web/.env.local (NOT committed)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**3. Add to `.gitignore`:**
```
.env.local
apps/*/.env.local
```

---

## Environment Variables Reference

### Root `.env`
```env
# Backend API configuration
PORT=3000                    # API server port
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-... # Required!
DAYTONA_BASE_URL=http://localhost:3986

# Security settings
WORKSPACE_TIMEOUT_MS=1800000
MAX_MEMORY_MB=2048
ALLOWED_EGRESS_DOMAINS=github.com,npmjs.com,registry.npmjs.org
```

### `apps/web/.env.local` (Optional)
```env
# Frontend configuration
NEXT_PUBLIC_API_URL=http://localhost:3000  # API endpoint
```

---

## Summary

**Default Setup (Recommended):**
- API: `http://localhost:3000`
- Web: `http://localhost:3001` ← **Open this in browser!**
- Daytona: `http://localhost:3986`

**Command:**
```bash
pnpm dev:full
```

**Browser:**
```
http://localhost:3001
```

That's it! 🚀
