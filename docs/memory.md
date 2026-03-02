# SpendBook — Progress Memory

> This file tracks what has been done, what's in progress, and what's next.
> **Update this file at the end of every coding session.**

---

## Current Status

| Field | Value |
|---|---|
| **Current Phase** | Phase 1 — MVP: Core Expense Tracking |
| **Current Sub-Phase** | 1.5 — Daily Ledger View |
| **Status** | Phase 1 Complete (pending DB setup) |
| **Last Updated** | 2026-03-03 |

---

## Completed

### Session 1 — 2026-03-02 (Project Scaffolding)

- [x] Created initial project documentation (PRD, Tech Stack, Implementation Plan, Requirements)
- [x] Set up `.gitignore` for Next.js project
- [x] Restructured project folders (docs/, src/, route groups, component dirs)
- [x] Generated `.github/copilot-instructions.md`, `docs/memory.md`, `docs/journal.md`
- [x] Updated `README.md` with new folder structure

### Session 2 — 2026-03-03 (Phase 1 Full Implementation)

- [x] `pnpm install` — all dependencies installed
- [x] `prisma/schema.prisma` — complete domain model (User, Family, Person, Transaction, CategoryTag, PaymentMode, DailyBalance, LoanBalance)
- [x] `prisma/seed.ts` — demo data seeder with demo user, family, persons, tags, modes
- [x] `src/app/globals.css` — Tailwind 4 + CSS vars (light/dark, domain colors)
- [x] `src/lib/utils.ts`, `validators.ts`, `db.ts`, `auth.ts`, `balance.ts`
- [x] `src/config/constants.ts`, `src/types/index.ts`
- [x] `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- [x] Root layout, root redirect page
- [x] Dashboard layout (Sidebar + Header + BottomNav)
- [x] Login page + Register page (full client implementations with useActionState)
- [x] Auth server actions (loginAction, registerAction with atomic DB transaction)
- [x] Person server actions (create, update, delete — ADMIN only)
- [x] Transaction server actions (create, update, delete + balance recalculation)
- [x] Server queries: getDailyLedger, getPersons, getCategoryTags, getPaymentModes
- [x] 9 UI components (button, input, card, label, select, dialog, badge, separator, textarea)
- [x] 3 Layout components (Header, Sidebar, BottomNav)
- [x] Transaction components: TransactionForm, TransactionCard
- [x] Ledger components: TransactionGroup, BalanceCard, DateNav, LedgerAddButton
- [x] Ledger page (`/ledger`) — main home page
- [x] Settings page (`/settings`) — PersonList (add/edit/delete)
- [x] Summary + Analytics placeholder pages

---

## In Progress / Blockers

- [ ] **DATABASE_URL** — User must provision a PostgreSQL database (Supabase or Neon) and add `DATABASE_URL` to `.env.local`
- [ ] Run `pnpm prisma generate` — generates Prisma client types (resolves all TS type errors)
- [ ] Run `pnpm prisma migrate dev --name init` — creates DB tables
- [ ] (Optional) Run `pnpm db:seed` — seeds demo data
- [ ] Deploy to Vercel and set production env vars

---

## Next Up (Phase 2)

1. Monthly summary page with person-level aggregates
2. Category tag management in settings
3. Payment mode management in settings
4. Date range filtering
5. Export to CSV

---

## Architecture Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Folder structure | Next.js App Router with route groups | Separates auth and dashboard concerns cleanly |
| File naming | kebab-case for docs, PascalCase for components | Industry standard for Next.js projects |
| Docs location | `docs/` folder at project root | Keeps root clean; docs are reference material, not source code |
| Copilot instructions | `.github/copilot-instructions.md` | Standard location recognized by GitHub Copilot |
| Git commit style | Conventional Commits, single-line | Industry standard; one commit per logical change block |

---

## Notes for Next Session

- Start with `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` to initialize the project.
- Then install core dependencies: `prisma`, `@prisma/client`, `next-auth@beta`, `zod`, `sonner`.
- Configure the Prisma schema with all entities from PRD §7.
- Choose between Supabase and Neon for PostgreSQL hosting.
