![Banner](https://i.ibb.co/4gRbyK2p/Banner-Readme.png)

<div align="center">

# D-Youth Dropbox

**A social platform for the Democratic Youth (D-Youth) community in Thailand.**  
Post anonymous or named messages to a shared wall, browse member profiles, and exchange direct notes.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel)](https://vercel.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Live Demo](https://d-youth.vercel.app) · [Report Bug](https://github.com/Jesselpetry/D-Youth-Dropbox/issues) · [Request Feature](https://github.com/Jesselpetry/D-Youth-Dropbox/issues)

</div>

---

## ✨ Features

- **Public Wall** — Post coloured sticky-note messages visible to everyone; supports anonymous mode.
- **Direct Messages** — Send private notes to any member; colour-coded paper style.
- **Family Directory** — Browse all D-Youth members grouped by cohort year, with instant search.
- **Profile Management** — Upload an avatar, set your nickname, province, cohort year, and Instagram handle.
- **Google OAuth** — One-click sign-in via Supabase Auth.
- **Responsive UI** — Mobile-first design with a fixed bottom navigation bar.
- **Performance** — Vercel Analytics + Speed Insights built-in.

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Backend / DB | Supabase (PostgreSQL, Auth, Storage) |
| Animations | Framer Motion |
| Icons | React Icons |
| Hosting | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com/) project with the schema described in [`docs/database-schema.md`](docs/database-schema.md)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Jesselpetry/D-Youth-Dropbox.git
cd D-Youth-Dropbox

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in your Supabase credentials (see below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # change to your production URL for deployments
```

> **Never** commit `.env.local` to version control. It is already excluded by `.gitignore`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

The project is designed to be deployed on **Vercel**.

1. Push your code to GitHub.
2. Import the repository in the [Vercel dashboard](https://vercel.com/new).
3. Add the three environment variables listed above under **Settings → Environment Variables**.
4. Click **Deploy**.

For detailed setup instructions see [`SETUP.md`](SETUP.md).

---

## 📁 Documentation

| Document | Description |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Project structure, rendering strategy, auth flow |
| [`docs/database-schema.md`](docs/database-schema.md) | Table definitions and relationships |
| [`docs/api-endpoints.md`](docs/api-endpoints.md) | Supabase query patterns used in the app |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before submitting a pull request.

1. Fork the project.
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by the D-Youth community
</div>
