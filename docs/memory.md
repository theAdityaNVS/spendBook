# SpendBook — Progress Memory

> This file tracks what has been done, what's in progress, and what's next.
> **Update this file at the end of every coding session.**

---

## Current Status

| Field | Value |
|---|---|
| **Current Phase** | Phase 1 — MVP: Core Expense Tracking |
| **Current Sub-Phase** | 1.2 — Authentication |
| **Status** | In Progress |
| **Last Updated** | 2026-03-03 |
| **Production URL** | https://spendbook-eight.vercel.app |

---

## Completed

### Session 1 — 2026-03-02 (Project Scaffolding)

- [x] Created initial project documentation (PRD, Tech Stack, Implementation Plan, Requirements)
- [x] Set up `.gitignore` for Next.js project
- [x] Restructured project folders:
  - Moved documentation into `docs/` with kebab-case naming
  - Created `src/` directory with App Router structure (`app/`, `components/`, `lib/`, `server/`, `hooks/`, `types/`, `config/`)
  - Created route groups: `(auth)/login`, `(auth)/register`, `(dashboard)/ledger`, `(dashboard)/summary`, `(dashboard)/analytics`, `(dashboard)/settings`
  - Created component directories: `ui/`, `layout/`, `ledger/`, `transaction/`, `analytics/`
  - Created `prisma/` directory with placeholder schema
  - Created `tests/` directory with `unit/`, `integration/`, `e2e/` sub-folders
  - Created `public/icons/` for PWA assets
  - Created `.env.example` with required environment variables
- [x] Generated `.github/copilot-instructions.md` — comprehensive AI coding guidelines
- [x] Generated `docs/memory.md` — this file (progress tracker)
- [x] Generated `docs/journal.md` — decision log and learning journal
- [x] Updated `README.md` with new folder structure and quick-start guide

### Session 2 — 2026-03-03 (Project Initialization & Vercel Deployment)

- [x] Created `package.json` with all dependencies (Next.js 15, Tailwind v4, Prisma v6, Auth.js v5, Zod, Sonner, clsx, tailwind-merge)
- [x] Created `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vercel.json`
- [x] Updated `prisma/schema.prisma` with valid generator + datasource blocks
- [x] Updated all `src/` placeholder files to valid Next.js components
- [x] Updated `src/app/globals.css` with Tailwind v4 `@import "tailwindcss"` directive
- [x] Updated `src/lib/db.ts` with Prisma singleton pattern, `src/lib/utils.ts` with `cn()` and `formatCurrency()`
- [x] Ran `pnpm install` — all dependencies installed; `pnpm build` — 10 static pages generated
- [x] Installed Vercel CLI, linked GitHub repo to `theadityanvs-projects/spendbook`
- [x] Upgraded Next.js 15.1.7 → 15.5.12 (security vulnerability fix)
- [x] Deployed to Vercel production: **https://spendbook-eight.vercel.app**

---

## In Progress

- [ ] Phase 1.2: Provision PostgreSQL database (Neon) and set `DATABASE_URL` in Vercel env vars
- [ ] Phase 1.2: Auth.js v5 setup (Prisma adapter, credentials provider, `src/lib/auth.ts`)
- [ ] Phase 1.2: Login / Register pages with forms and Zod validation

---

## Blockers

- **Database not yet provisioned** — Need to create a Neon/Supabase PostgreSQL database and set `DATABASE_URL` in Vercel environment variables before auth/data features can work.

---

## Next Up (Queue)

1. Provision PostgreSQL database (Neon — `neonctl` already installed)
2. Run `pnpm db:migrate` to apply initial migration
3. Set `DATABASE_URL` and `AUTH_SECRET` in Vercel environment variables
4. Phase 1.2 — Authentication (Auth.js v5 setup, login/register pages)
5. Phase 1.3 — Family & Person Setup
6. Phase 1.4 — Transaction CRUD
7. Phase 1.5 — Daily Ledger View
8. Phase 1.6 — Balance & Loan Calculation

---

## Key URLs

| Resource | URL |
|---|---|
| Production app | https://spendbook-eight.vercel.app |
| GitHub repo | https://github.com/theAdityaNVS/spendBook |
| Vercel dashboard | https://vercel.com/theadityanvs-projects/spendbook |

---

## Architecture Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Folder structure | Next.js App Router with route groups | Separates auth and dashboard concerns cleanly |
| File naming | kebab-case for docs, PascalCase for components | Industry standard for Next.js projects |
| Docs location | `docs/` folder at project root | Keeps root clean; docs are reference material, not source code |
| Copilot instructions | `.github/copilot-instructions.md` | Standard location recognized by GitHub Copilot |
| Git commit style | Conventional Commits, single-line | Industry standard; one commit per logical change block |
| CSS approach | Tailwind v4 with `@import "tailwindcss"` | v4 uses CSS-first config, no tailwind.config.ts needed |
| Vercel deployment | GitHub integration + Vercel CLI | Auto-deploys on every push to main |

---

## Notes for Next Session

- Database needs to be provisioned. Use `neonctl` (already installed) to create a Neon PostgreSQL database.
- After creating DB: run `pnpm db:migrate` to create tables, then add env vars in Vercel dashboard under Settings > Environment Variables.
- Auth.js v5 needs `AUTH_SECRET` (run `openssl rand -base64 32`) and `AUTH_URL` set in `.env.local` and Vercel.
- Start implementing `src/lib/auth.ts` with Prisma adapter and credentials provider.
