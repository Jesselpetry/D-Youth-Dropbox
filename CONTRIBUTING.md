# Contributing to D-Youth Dropbox

Thank you for your interest in contributing! 🎉  
This document explains how to set up the project, submit changes, and follow the project's conventions.

---

## Code of Conduct

By participating in this project you agree to be respectful and constructive in all interactions.  
Harassment or discriminatory behaviour of any kind will not be tolerated.

---

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/Jesselpetry/D-Youth-Dropbox/issues) to avoid duplicates.
2. Open a new issue with:
   - A clear title and description
   - Steps to reproduce
   - Expected vs actual behaviour
   - Screenshots or error logs if applicable

### Suggesting Features

Open an issue with the `enhancement` label and describe:
- The problem your feature solves
- A proposed solution or design
- Any relevant examples or prior art

### Submitting a Pull Request

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Set up** the project locally following [`SETUP.md`](SETUP.md).
3. **Make your changes** — keep commits small and focused.
4. **Test** your changes (`npm run build` must pass with no type errors).
5. **Lint** your code: `npm run lint`.
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add anonymous toggle to message form
   fix: prevent crash when profile image is missing
   docs: update database schema table
   refactor: extract getTimeElapsed to shared utility
   ```
7. **Push** and open a Pull Request against `main`.
8. Fill in the PR template and link any related issues.

---

## Development Guidelines

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `ProfileModal.tsx` |
| Variables & functions | camelCase | `fetchCurrentUser` |
| TypeScript interfaces | PascalCase | `interface FamilyMember` |
| CSS / Tailwind classes | Tailwind utilities | — |

### TypeScript

- All new code must be in TypeScript.
- Avoid `any`; prefer specific types or generics.
- Shared interfaces go in `src/types/index.ts`.
- Shared utilities go in `src/utils/`.

### Supabase Queries

- Use the browser client (`src/lib/supabaseClient.ts`) only in Client Components (`"use client"`).
- Use the server client (`src/lib/supabaseServer.ts`) in Server Components and Route Handlers.
- Never expose secrets — only `NEXT_PUBLIC_*` environment variables are safe for client code.

### Styling

- Use **Tailwind CSS** utility classes.
- Avoid inline styles except where dynamic values (e.g. `backgroundColor`) are necessary.

---

## Project Structure (quick reference)

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown.

---

## Getting Help

Open a [GitHub Discussion](https://github.com/Jesselpetry/D-Youth-Dropbox/discussions) or comment on an existing issue.
