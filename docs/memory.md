# SpendBook — Progress Memory

> This file tracks what has been done, what's in progress, and what's next.
> **Update this file at the end of every coding session.**

---

## Current Status

| Field | Value |
|---|---|
| **Current Phase** | Phase 1 — MVP: Core Expense Tracking |
| **Current Sub-Phase** | 1.5 — Daily Ledger View |
| **Status** | Deployment Issue: Registration 500 Error |
| **Last Updated** | 2026-03-04 |

---

## Current Issue: Registration 500 Error on Vercel

**Problem:** POST /register returns 500 error. Prisma client cannot connect to Neon database on Vercel.

**Root Cause:** `DATABASE_URL` environment variable not set in Vercel project.

### Required Fix Steps

1. **Set DATABASE_URL in Vercel:**
   - Go to Vercel Project Settings → Environment Variables
   - Add `DATABASE_URL` with your Neon connection string (from Neon dashboard)
   - Connection string format: `postgresql://user:password@ep-xxx.us-east-1.neon.tech/spendbook?sslmode=require`
   - Ensure you use the **Pooling** connection string from Neon (for serverless functions)
   
2. **Rebuild & Redeploy:**
   - Push code changes to trigger new build: `git push`
   - OR manually trigger deployment from Vercel dashboard
   - Vercel will auto-run: `pnpm install`, `prisma generate`, `next build`

3. **Test Registration:**
   - Try creating account again at https://spendbook.adityanvs.in/register

### Code Changes Made (2026-03-04)

- [x] Updated `src/lib/db.ts` — refactored Prisma client singleton for better serverless function handling
- [x] Enhanced error logging in `src/server/actions/auth.ts` — now logs specific connection errors
- [x] Updated `next.config.ts` — expose `DATABASE_URL` env var to build
- [x] Added missing indexes to `prisma/schema.prisma` — userId on Account/Session, familyId/userId on UserFamily for query performance

### Neon Pooling Configuration

When connecting Neon to Vercel with PgBouncer pooling:
- Neon provides separate "Pooling" and "Direct" connection strings
- **Use the Pooling string** for serverless functions (Vercel)
- Format: `postgresql://user:password@ep-xxx.us-east-1.neon.tech/spendbook?sslmode=require`

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

### Session 3 — 2026-03-04 (Deployment Fixes)

- [x] Diagnosed registration 500 error on Vercel
- [x] Improved Prisma client singleton pattern for serverless
- [x] Enhanced error logging in auth server action
- [x] Added missing database indexes for performance (Account.userId, Session.userId, UserFamily.userId/familyId)
- [x] Updated next.config.ts to expose DATABASE_URL

---

## In Progress / Blockers

- [ ] **DATABASE_URL in Vercel**  ← **CRITICAL: Must set this in Vercel Project Settings → Environment Variables**
  - Use Neon Pooling connection string
  - Format: `postgresql://user:password@ep-xxx.us-east-1.neon.tech/neondb?sslmode=require`
- [ ] Rebuild and deploy after setting DATABASE_URL
- [ ] Run migrations: `pnpm prisma migrate deploy` (Vercel auto-runs this)
- [ ] Test registration flow after deployment

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
| Database pooling | Neon Pooling connection string | Required for serverless/Vercel environments |

---

## Notes for Next Session

- **ACTION REQUIRED:** Set `DATABASE_URL` in Vercel project settings with Neon Pooling connection string
- After DATABASE_URL is set, trigger redeploy from Vercel
- Test account creation: https://spendbook.adityanvs.in/register
- If still failing, check Vercel Function Logs for specific Prisma errors
