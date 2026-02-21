# 📝 Notepod

> **Collaborative note-taking, organized into pods.**

**Live Demo → [notepods.vercel.app](https://notepods.vercel.app)**

---

## What is Notepod?

Notepod is a modern, real-time collaborative note-taking app built around the concept of **Pods** — shared workspaces where teams can write, organize, and manage notes together. Think of it as Notion meets a lightweight editor, with fine-grained access control baked in.

Whether you're jotting down personal notes or collaborating with a team on a shared project, Notepod keeps everything organized and instantly synchronized.

---

## ✨ Features

### 📁 Pod-Based Organization
- Create **Pods** — named workspaces that group related notes
- Each pod supports an optional description
- Navigate all your pods from the sidebar or the dashboard

### 🔐 Role-Based Access Control
- **Creator** — full ownership of a pod
- **Admin** — can manage members and notes
- **Editor** — can create and edit notes
- **Read Only** — view-only access

### 👥 Member Management
- Invite collaborators by **username**
- Change member roles on the fly
- Remove members from any pod you manage

### 📝 Rich Note Editor
- Clean, distraction-free writing experience
- Adjustable typography: font size, line height, serif/sans toggle
- **Auto-save** — notes save 1.5 seconds after you stop typing
- **Ctrl+S** manual save with instant feedback
- Real-time word count

### ⚡ Real-Time Collaboration
- Notes update **live** for all pod members — no refresh needed
- Powered by Supabase Postgres realtime subscriptions

### 🔴 Live Activity Feed
- See recent note creation and updates in the right-hand feed
- Updates in real time as collaborators work

### 🔒 Auth & Account
- Email/password sign up and sign in
- **Google** and **GitHub** OAuth (requires Supabase provider config)
- **Forgot password** — reset link sent to your email
- Avatar upload via Supabase Storage
- Username and profile management

### 🌗 Dark Mode
- Full dark/light mode toggle
- Persisted across sessions via `localStorage`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Auth, DB, Storage, Realtime) |
| Routing | React Router v7 |
| Icons | Google Material Symbols |
| Fonts | Inter (sans) · Lora (serif) |
| Deployment | Vercel |

---

## 🚀 Running Locally

### 1. Clone

```bash
git clone https://github.com/your-username/notepod.git
cd notepod
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in your [Supabase project settings](https://supabase.com/dashboard) under **API**.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Setup

Notepod requires the following tables in your Supabase project:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (username, avatar_url) |
| `pods` | Pod workspaces (name, description) |
| `pod_members` | Junction table for pod membership and roles |
| `notes` | Notes (title, content, pod_id) |

**Storage:** Create a public bucket named `avatars` for profile picture uploads.

**OAuth Providers:** Enable Google and/or GitHub under **Authentication → Providers** in your Supabase dashboard.

---

## 📁 Project Structure

```
src/
├── api/           # Supabase client initialization
├── components/    # Reusable UI components (Sidebar, Navbar, Modals…)
├── context/       # React context providers (Auth, Theme, Toast)
├── hooks/         # Custom hooks (useNotes, usePods, useAuth)
├── layouts/       # App shell layout
├── pages/         # Route-level pages (Dashboard, NoteEditor, PodView…)
└── utils/         # Role helpers and utilities
```

---
