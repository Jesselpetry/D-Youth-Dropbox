# Setup & Deployment Guide

This guide covers everything you need to run D-Youth Dropbox locally and deploy it to production.

---

## Prerequisites

| Requirement | Minimum version |
|---|---|
| Node.js | 18 |
| npm | 9 |
| Supabase account | — |

---

## 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com/).
2. Navigate to **SQL Editor** and run the schema from [`docs/database-schema.md`](docs/database-schema.md) to create the `profiles`, `walls`, and `messages` tables.
3. Enable **Google OAuth** under **Authentication → Providers → Google**.  
   Set the redirect URL to `https://<your-domain>/auth/callback`.
4. Create a **Storage bucket** named `avatars` and set it to **Public**.
5. Copy your **Project URL** and **anon public key** from **Settings → API**.

---

## 2. Local Installation

```bash
# Clone the repository
git clone https://github.com/Jesselpetry/D-Youth-Dropbox.git
cd D-Youth-Dropbox

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Optional: override the default OAuth redirect origin
# Defaults to window.location.origin at runtime
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `.env.local` is already listed in `.gitignore` and will never be committed.

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
The dev server uses **Turbopack** for fast rebuilds.

---

## 3. Production Build

```bash
# Create an optimised production build
npm run build

# Start the production server locally (optional test)
npm run start
```

---

## 4. Deploying to Vercel (recommended)

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Under **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your production domain, e.g. `https://d-youth.vercel.app`)
4. Click **Deploy**.

Vercel will automatically run `npm run build` and deploy the result.

### Updating the Deployment

Every push to the `main` branch will trigger a new production deployment automatically.  
Pull-request branches get preview deployments with unique URLs.

---

## 5. Supabase Row-Level Security (RLS)

Ensure RLS policies are configured as follows:

**`profiles`**
- `SELECT`: all authenticated users
- `INSERT` / `UPDATE`: only the row owner (`id = auth.uid()`)

**`walls`**
- `SELECT`: everyone (including anonymous)
- `INSERT`: authenticated users

**`messages`**
- `SELECT`: only where `receiver_id = auth.uid()`
- `INSERT`: authenticated users

---

## 6. Linting

```bash
npm run lint
```

ESLint is configured via `.eslintrc.json` and `eslint.config.mjs`.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Invalid API key" on sign-in | Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct |
| OAuth redirect loop | Ensure `NEXT_PUBLIC_SITE_URL` matches the Supabase redirect allowlist |
| Avatar not uploading | Confirm the `avatars` storage bucket exists and is set to **Public** |
| Profile not found after sign-up | User needs to visit `/setup-profile` to create a profile row |
