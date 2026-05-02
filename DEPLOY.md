# 🚀 TalentBD — Vercel Deployment Guide

## Architecture

```
Browser  →  Vercel CDN (React frontend)
             ↓
          Vercel Serverless Functions (Node.js backend)
             ↓
          Gemini AI API  /  Adzuna API  /  Firebase
```

All secret API keys live **only on the server**. The browser never sees them.

---

## Step 1 — Push to GitHub

```bash
# In your talentbd folder:
git init
git add .
git commit -m "TalentBD v2 with backend"

# Create a repo on github.com then:
git remote add origin https://github.com/sheam274/talent-bd.git
git push -u origin main
```

---

## Step 2 — Import to Vercel

1. Go to **https://vercel.com/sheams-projects-bf3ed0ec**
2. Click **"Add New Project"**
3. Select your **talent-bd** GitHub repository
4. Framework preset will auto-detect as **Vite** ✅
5. **DO NOT deploy yet** — add environment variables first

---

## Step 3 — Add Environment Variables in Vercel

In Vercel → Your Project → **Settings → Environment Variables**

Add each variable below. Select **Production + Preview + Development** for all.

### Firebase Variables (prefix: VITE_)
| Variable | Where to get |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your Apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same |
| `VITE_FIREBASE_PROJECT_ID` | Same |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same |
| `VITE_FIREBASE_APP_ID` | Same |

### Backend-only Variables (NO VITE_ prefix — secret, server only)
| Variable | Where to get |
|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |
| `ADZUNA_APP_ID` | https://developer.adzuna.com (free) |
| `ADZUNA_API_KEY` | https://developer.adzuna.com (free) |

> ⚠️ **Important:** `GEMINI_API_KEY` has NO `VITE_` prefix.
> This keeps it server-only. Never add it with VITE_ prefix.

---

## Step 4 — Deploy

Click **"Deploy"** in Vercel. It will:
1. Run `npm run build` → builds React app into `/dist`
2. Deploy `/dist` as static frontend
3. Deploy `/api/*.js` as serverless functions

Your site will be live at: `https://talent-bd-s.vercel.app`

---

## Step 5 — Firebase Setup (if not done)

1. Go to https://console.firebase.google.com
2. Create project → name: **talentbd**
3. **Authentication** → Sign-in method → Enable **Email/Password**
4. **Firestore Database** → Create → **Start in test mode**
5. **Project Settings** → Your apps → Web → Copy config → paste into Vercel env vars

### Add your Vercel domain to Firebase Auth:
Firebase Console → Authentication → **Settings** → **Authorized domains** → Add:
```
talent-bd-s.vercel.app
```

---

## Step 6 — Create First Admin User

**Option A — Through the app:**
1. Go to your deployed site → `/signup`
2. Select "Admin" role
3. Enter admin code: **`TALENTBD2025`**

**Option B — Firebase Console:**
1. Sign up normally on the site
2. Firebase Console → Firestore → `users` collection → find your doc
3. Change `role` field to `"admin"`

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Fill in your values in .env

# Start Vercel dev (runs frontend + backend locally)
npx vercel dev

# OR just frontend (backend API calls will use fallback)
npm run dev
```

---

## API Endpoints (Backend)

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | POST | Gemini AI chatbot |
| `/api/analyze-cv` | POST | Gemini CV analysis |
| `/api/jobs` | GET | Adzuna live jobs |

---

## Folder Structure

```
talentbd/
├── api/                    ← Vercel serverless backend
│   ├── chat.js             ← POST /api/chat
│   ├── analyze-cv.js       ← POST /api/analyze-cv
│   └── jobs.js             ← GET  /api/jobs
├── src/                    ← React frontend
│   ├── components/
│   ├── pages/
│   │   └── admin/
│   ├── context/
│   ├── hooks/
│   └── lib/
├── vercel.json             ← Routing config
├── vite.config.js          ← Build config
└── .env.example            ← Environment variable template
```

---

## Troubleshooting

**"Gemini API error"** → Check `GEMINI_API_KEY` is set in Vercel env vars (no VITE_ prefix)

**"Firebase permission denied"** → Firestore is in test mode? Check rules in Firebase Console

**"Login not working"** → Add your Vercel domain to Firebase Auth authorized domains

**"Jobs not loading"** → Normal if Adzuna keys not set — static BD jobs always show

**Build fails** → Check Vercel build logs. Usually a missing import or env variable.
