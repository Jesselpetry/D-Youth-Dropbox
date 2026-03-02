# Architecture Overview

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Backend / Database | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage) |
| Hosting | [Vercel](https://vercel.com/) |
| Analytics | Vercel Analytics & Speed Insights |

---

## Project Structure

```
src/
├── app/                     # Next.js App Router pages & layouts
│   ├── auth/                # OAuth callback handler
│   ├── components/          # Shared UI components
│   │   ├── Menu.tsx         # Bottom navigation bar
│   │   ├── MessageWall.tsx  # Inbox message grid
│   │   ├── PaperWall.tsx    # Public wall post grid
│   │   ├── Post.tsx         # Individual post card
│   │   ├── PostForm.tsx     # Post creation form
│   │   └── ProfileModal.tsx # Member profile overlay
│   ├── family/              # Family directory page
│   ├── login/               # Google OAuth login page
│   ├── message/             # Inbox & direct-message pages
│   │   └── [userId]/        # Message thread with a specific user
│   ├── profile/             # Edit-profile page
│   ├── setup-profile/       # First-time profile setup
│   ├── walls/               # Public wall feed
│   │   └── send/            # Post-to-wall form
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout (fonts, metadata, analytics)
├── lib/                     # Supabase client factories
│   ├── middleware.ts         # Session-refresh & route-guard logic
│   ├── supabaseClient.ts    # Browser-side Supabase client (singleton)
│   └── supabaseServer.ts    # Server-side Supabase client (per-request)
├── middleware.ts             # Next.js Edge Middleware entry point
├── types/
│   └── index.ts             # Shared TypeScript interfaces (Profile, Wall)
└── utils/
    ├── dateHelpers.ts        # Date formatting & relative-time utilities
    └── storage.ts            # LocalStorage helper (Post type)
```

---

## Authentication Flow

```
User visits protected route
        │
        ▼
  Edge Middleware (middleware.ts)
        │
        ├─ No session → redirect to /login
        │
        └─ Session valid → continue
                │
                ▼
        /login page
        Google OAuth via Supabase
                │
                ▼
        /auth/callback
        Session cookie set
                │
                ▼
        /setup-profile (first visit)
        or home page (returning user)
```

### Public Routes (no auth required)
- `/login`
- `/auth` & `/auth/callback`
- `/setup-profile`
- `/family`
- `/` (root — redirects to `/walls`)
- `/walls`
- `/message`

---

## Data Flow

### Wall Posts
1. Client calls `supabase.from("walls").select(...)` with a JOIN to `profiles`.
2. `PaperWall` component transforms the response and renders `WallPaper` cards.
3. New posts are inserted via `/walls/send` using the browser Supabase client.

### Direct Messages
1. `MessageWall` fetches `messages` where `receiver_id = currentUser.id`.
2. Users navigate to a member via the Family directory and send a message.

### Profile Images
- Uploaded to Supabase Storage bucket `avatars` (`avatars/{userId}.{ext}`).
- Public URL retrieved via `supabase.storage.from("avatars").getPublicUrl(...)`.

---

## Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| `/walls` | Client-side (CSR) | Real-time Supabase queries |
| `/family` | Client-side (CSR) | Dynamic search/filter |
| `/message` | Client-side (CSR) | User-specific inbox |
| `/profile` | Client-side (CSR) | Auth-dependent form |
| `/login` | Client-side (CSR) | OAuth redirect flow |
| `layout.tsx` | Server Component | Metadata, static shell |
