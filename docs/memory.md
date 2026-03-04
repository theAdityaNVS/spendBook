# SpendBook — Progress Memory

> This file tracks what has been done, what's in progress, and what's next.
> **Update this file at the end of every coding session.**

---

## Current Status

| Field | Value |
|---|---|
| **Current Phase** | Phase 1 — MVP: Core Expense Tracking |
| **Current Sub-Phase** | 1.5 — Daily Ledger View |
| **Status** | Migrated to Neon Auth — Ready for Deployment |
| **Last Updated** | 2026-03-04 |

---

## Auth Migration: NextAuth → Neon Auth (Completed 2026-03-04)

**Status:** Migration complete. Build passes locally. Ready to deploy.

### What Changed
- Replaced NextAuth v5 (Auth.js) with **Neon Auth** (`@neondatabase/auth`)
- Removed: `next-auth`, `@auth/prisma-adapter`, `bcryptjs`
- Added: `@neondatabase/auth@latest`
- Neon Auth uses pre-built UI components (AuthView, AccountView, UserButton)
- All login/register/password-reset handled by Neon Auth

### New Auth Flow
1. User visits app → middleware redirects to `/auth/sign-in` (Neon Auth UI)
2. Neon Auth handles sign-up/sign-in/forgot-password
3. After auth, dashboard layout checks if user has a family via `getAppSession()`
4. If no family → redirected to `/onboarding` to create one
5. Once onboarded → full app access

### Environment Variables Checklist (Vercel)

| Variable | Required | Value |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Pooling connection string |
| `NEON_AUTH_BASE_URL` | Yes | `https://ep-sweet-waterfall-a14zhs84.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth` |
| `NEON_AUTH_COOKIE_SECRET` | Yes | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

### Files Changed
- **Added:** `src/lib/auth/server.ts`, `src/lib/auth/client.ts`, `src/lib/auth/session.ts`
- **Added:** `src/app/auth/[path]/page.tsx`, `src/app/account/[path]/page.tsx`
- **Added:** `src/app/onboarding/page.tsx`, `src/server/actions/onboarding.ts`
- **Added:** `src/app/api/auth/[...path]/route.ts`
- **Removed:** `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/server/actions/auth.ts`
- **Removed:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- **Removed:** `src/app/api/auth/[...nextauth]/route.ts`
- **Updated:** middleware, root layout, dashboard layout, Header, all server actions/queries
- **Schema:** Removed Account, Session, VerificationToken models; added `neonAuthId` to User

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

### Session 3 — 2026-03-04 (Deployment & Debug Improvements)

- [x] Diagnosed registration 500 error on Vercel with NextAuth
- [x] Added missing database indexes: Account.userId, Session.userId, UserFamily.userId/familyId
- [x] Created migration: `20260303191930_add_missing_indexes`
- [x] Improved error logging and Prisma singleton for serverless

### Session 4 — 2026-03-04 (Neon Auth Migration)

- [x] Full migration from NextAuth v5 → Neon Auth (`@neondatabase/auth`)
- [x] Removed: `next-auth`, `@auth/prisma-adapter`, `bcryptjs`
- [x] Created auth server/client/session modules in `src/lib/auth/`
- [x] Created API route `src/app/api/auth/[...path]/route.ts`
- [x] Created auth UI pages (`/auth/sign-in`, `/account/settings`)
- [x] Created onboarding flow (`/onboarding` + `setupFamilyAction`)
- [x] Updated middleware for Neon Auth
- [x] Updated root layout with `NeonAuthUIProvider`
- [x] Updated all server actions/queries to use `getAppSession()`
- [x] Updated Header with Neon Auth's `UserButton`
- [x] Updated dashboard layout with auth/onboarding checks
- [x] Migrated Prisma schema: removed Account/Session/VerificationToken models, added `neonAuthId`
- [x] Applied database migration via Neon MCP: `20260304120000_neon_auth_migration`
- [x] Removed old auth files (auth.ts, auth.config.ts, login/register pages, auth actions)
- [x] Updated seed.ts, validators.ts, .env.example
- [x] Build passes locally ✅, TypeScript clean ✅

---

## In Progress / Blockers

- [ ] **Deploy to Vercel** — commit + push to trigger new deployment
- [ ] **Set Vercel env vars:**
  - `NEON_AUTH_BASE_URL` = `https://ep-sweet-waterfall-a14zhs84.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth`
  - `NEON_AUTH_COOKIE_SECRET` = generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- [ ] **Remove old env vars from Vercel:** `AUTH_SECRET`, `AUTH_URL` (no longer needed)
- [ ] **Test auth flow end-to-end on production**

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
| Auth system | **Neon Auth** (`@neondatabase/auth`) | Integrated with Neon DB, pre-built UI, no JWT/session debugging |
| Session bridging | `getAppSession()` in `src/lib/auth/session.ts` | Maps Neon Auth user to internal User/Family model |
| Onboarding | Separate `/onboarding` page | New users need to create a family before accessing the app |
| Database pooling | Neon Pooling connection string | Required for serverless/Vercel environments |
| Git commit style | Conventional Commits, single-line | Industry standard; one commit per logical change block |

---

## Notes for Next Session

**DEPLOYMENT STEPS:**
1. Commit all Neon Auth migration changes
2. Push to trigger Vercel deployment
3. In Vercel Project Settings → Environment Variables:
   - Add `NEON_AUTH_BASE_URL` (see value above)
   - Add `NEON_AUTH_COOKIE_SECRET` (generate a NEW one for production)
   - Remove `AUTH_SECRET` and `AUTH_URL` (obsolete)
4. Trigger redeploy if env var changes don't auto-deploy
5. Test: visit https://spendbook.adityanvs.in → should redirect to sign-in page

**Database Information:**
- Database: Neon (PostgreSQL 17)
- Project: divine-smoke-58320411 (ep-sweet-waterfall-a14zhs84)
- Region: ap-southeast-1
- Neon Auth URL: `https://ep-sweet-waterfall-a14zhs84.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth`
