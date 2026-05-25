# Copilot Instructions

## ⚠️ Critical: This is NOT the Next.js you know

Next.js **16.2.6** and React **19.2.4** are installed — these versions contain breaking changes from your training data. **Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`.**

Notable example from the docs:
> If fixing slow client-side navigations, Suspense alone is not enough. You must also export `unstable_instant` from the route. Read `docs/01-app/02-guides/instant-navigation.mdx` before making changes.

Always heed deprecation notices you encounter in those docs.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (no test suite configured)
```

No test runner is configured in this project.

## Architecture

Single Next.js App Router application — no Pages Router:

- `app/layout.tsx` — root layout with Geist font variables and global CSS
- `app/page.tsx` — home route (`/`)
- `app/globals.css` — global styles (Tailwind entry point)

## Key Conventions

- **Tailwind CSS v4** via `@tailwindcss/postcss` — the PostCSS integration and config syntax differ from v3.
- **ESLint v9 flat config** — configuration is in `eslint.config.mjs` using `defineConfig`/`globalIgnores` (not `.eslintrc`).
- **App Router only** — use Server Components by default; add `"use client"` only when necessary.
- **TypeScript strict** — `tsconfig.json` governs strictness; match existing type patterns.
