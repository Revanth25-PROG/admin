# STUDYVERSE — Production Backend Server

A lightweight, high-performance REST API backend for the **STUDYVERSE** Exam Preparation & Academic Management platform.

## Features
- **Zero-Setup Persistence**: Stores state automatically in `data/studyverse-db.json` out-of-the-box (no external database required).
- **PostgreSQL / Supabase Compatible**: Supports SQL schemas if connected to PostgreSQL.
- **Full State Synchronization**: `/api/state/sync` allows two-way backup and synchronization with the frontend.
- **Granular Collection APIs**: CRUD endpoints for syllabus topics, question bank, mock tests, attempts, tasks, and mistake book.
- **Live Healthcheck**: `/api/health` and `/health` for deployment monitoring.

---

## 🚀 Quick Deployment Options

### Option 1: Deploy to Render (Recommended - Free)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** → **Web Service** → Connect your GitHub repo.
4. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Create Web Service**.
6. Render will generate a URL like: `https://studyverse-backend-xxxx.onrender.com`.
7. **Copy this URL** and paste it into STUDYVERSE's **Settings → Connect Backend** card!

---

### Option 2: Deploy to Railway (Free)
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repo and set Root Directory to `server`.
4. Railway will automatically deploy and generate your public domain.

---

### Option 3: Run Locally
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:5000`. You can paste `http://localhost:5000` into the app settings to test locally!
