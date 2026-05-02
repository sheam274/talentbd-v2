# TalentBD — Bangladesh's Smart Career Platform
### CSE Final Year Project

A full-stack React web application for the Bangladeshi job market featuring live jobs, AI-powered CV tools, a learning hub, and a complete admin panel.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🏠 Home Page | Landing page with hero, stats, feature cards |
| 💼 Live Jobs | Real-time jobs from Adzuna API + curated BD jobs + admin-added jobs |
| 📄 CV Builder | Form-based CV builder with live preview + PDF export |
| 🤖 CV Analyzer | Gemini AI powered — score, ATS check, improvements |
| 📚 Learning Hub | YouTube video courses, search, filter, pagination |
| 💬 Chatbot | Gemini AI career assistant (floating, always available) |
| 🔐 Auth | Firebase email/password login & signup with roles |
| 🛡️ Admin Dashboard | Stats, charts, recent users, activity feed |
| 🛠️ Admin Jobs | Add / Edit / Delete job listings |
| 👥 Admin Users | View users, promote to admin, delete |
| 🎬 Admin Videos | Add videos one by one OR bulk import CSV |

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Fill in your keys in `.env` (see section below).

### 3. Run locally
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 🔑 Environment Variables

Create a `.env` file with these values:

```env
# Firebase — https://console.firebase.google.com
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Gemini AI — https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=

# Adzuna Jobs (optional) — https://developer.adzuna.com
VITE_ADZUNA_APP_ID=
VITE_ADZUNA_API_KEY=
```

---

## 🔥 Firebase Setup

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → name it **talentbd**
3. **Authentication** → Sign-in method → Enable **Email/Password**
4. **Firestore Database** → Create database → Start in **test mode**
5. **Project Settings** → Your apps → Add web app → Copy the config values into `.env`

### Firestore Collections (auto-created on first use):
| Collection | Purpose |
|---|---|
| `users` | User profiles + role (user/admin) |
| `jobs` | Admin-managed job listings |
| `videos` | Learning hub video courses |

---

## 👤 Creating the First Admin

**Option A — Signup page:**
1. Go to `/signup`
2. Select "Admin" role
3. Enter admin code: **`TALENTBD2025`**

**Option B — Firebase Console:**
1. Let a user sign up normally
2. Open Firestore → `users` collection → find their document
3. Change `role` field from `"user"` to `"admin"`

---

## 📹 Bulk Import Videos (Admin Panel)

Go to `/admin/videos` → **Bulk Import**

Paste videos in CSV format (one per line):
```
title, instructor, youtubeId, category, level, duration, tags(space separated)
```

Example:
```
React Complete Course,Traversy Media,w7ejDZ8SWv8,Web Dev,Beginner,12h 30m,React JavaScript Frontend
Python for Data Science,freeCodeCamp,LHBE6Q9oYDo,Data Science,Intermediate,6h 00m,Python Pandas ML
Docker Crash Course,TechWorld with Nana,3c-iBn73dDE,DevOps,Intermediate,5h 00m,Docker Kubernetes DevOps
```

---

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Important:** Add all your `.env` variables in Vercel → Project Settings → Environment Variables.

---

## 📁 Project Structure

```
talentbd/
├── src/
│   ├── App.jsx                    # Router + layout
│   ├── main.jsx                   # Entry point
│   ├── styles/
│   │   └── global.css             # Design system
│   ├── lib/
│   │   └── firebase.js            # Firebase config
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state
│   ├── hooks/
│   │   └── useJobs.js             # Jobs fetching logic
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── Chatbot/
│   │   │   └── Chatbot.jsx        # Gemini chatbot
│   │   └── ProtectedRoute.jsx
│   └── pages/
│       ├── HomePage.jsx
│       ├── JobsPage.jsx
│       ├── CVBuilderPage.jsx
│       ├── CVAnalyzerPage.jsx
│       ├── LearningHubPage.jsx
│       ├── LoginPage.jsx
│       ├── SignupPage.jsx
│       └── admin/
│           ├── AdminLayout.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminJobs.jsx
│           ├── AdminUsers.jsx
│           └── AdminVideos.jsx
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Firebase Auth | Authentication |
| Firestore | Database |
| Gemini 1.5 Flash | AI chatbot + CV analyzer |
| Adzuna API | Live job listings |
| react-to-print | PDF export |
| Lucide React | Icons |
| Vite | Build tool |

---

## ⚠️ Notes

- The app works **without any API keys** — it shows curated BD jobs and smart fallback chatbot replies
- Gemini API key is required for the CV Analyzer and AI chatbot to work with real AI
- Firebase is required for authentication and admin features
- The Adzuna API is optional — BD jobs are always shown from the static list

---

*Built for CSE Final Year Defence — TalentBD 2025*
