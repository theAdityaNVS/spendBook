# State of Project — SpendBook

> **Last verified**: 2026-05-05 — analysis based on actual source code at commit `5721da7`  
> **Project**: `C:\Users\nadam\Coding\Web Projects\spendBook`  
> **Repo**: https://github.com/theAdityaNVS/spendBook  
> **Confidence level**: HIGH — every source file was read and cross-referenced.

---

## Overall Status: ⚠️ PARTIALLY FUNCTIONAL (Phase 1 MVP ~90% complete)

The application **builds locally**, has a complete database schema, a working auth system (Neon Auth), a functional daily ledger with CRUD operations, balance/loan calculations, and person management. However, **deployment is blocked** by unset Vercel environment variables, and several planned features are placeholders.

---

## ✅ What Works (Verified in Code)

| Component | Status | Evidence |
|-----------|--------|----------|
| **Prisma Schema** | ✅ Complete | 10 models: User, Family, UserFamily, Person, Transaction, CategoryTag, PaymentMode, DailyBalance, LoanBalance + enums |
| **Database Client** | ✅ Working | Singleton pattern in `lib/db.ts`, proper hot-reload guard |
| **Neon Auth** | ✅ Implemented | Server/client/session modules in `lib/auth/`, middleware protection, API route handler |
| **Session Bridging** | ✅ Working | `getAppSession()` maps Neon Auth → internal User → UserFamily → active family |
| **Onboarding Flow** | ✅ Working | `/onboarding` page creates family + Family Account + default tags + default payment modes in atomic transaction |
| **Middleware** | ✅ Working | Protects all dashboard routes, excludes auth/API/static paths |
| **Dashboard Layout** | ✅ Working | Sidebar (desktop) + Header + BottomNav (mobile), auth/onboarding guards |
| **Daily Ledger Page** | ✅ Working | Server component fetches transactions + balances for selected date, renders groups |
| **Date Navigation** | ✅ Working | Previous/next day, "Today" badge, URL-based date param |
| **Transaction CRUD** | ✅ Working | Create/update/delete with Zod validation, session auth, balance recalculation |
| **Transaction Form** | ✅ Working | Dialog with type/person/name/description/amount/category/paymentMode/paidTowards/date fields |
| **Transaction Card** | ✅ Working | Displays amount, category badge, payment mode, edit/delete actions |
| **Transaction Groups** | ✅ Working | Groups by DEBIT/CREDIT/PAYMENT with color-coded headers and totals |
| **Balance Cards** | ✅ Working | Per-person cards showing opening/closing balance, debits/credits/payments, loan balance |
| **Balance Engine** | ✅ Working | `computeLoanDelta()` implements the Loan Impact Matrix; `recalculateBalancesForDate()` upserts DailyBalance + LoanBalance |
| **Person Management** | ✅ Working | Add/edit/delete (soft archive) in Settings, ADMIN-only |
| **Settings Page** | ✅ Working | PersonList component with add/edit/delete dialogs |
| **Validation** | ✅ Working | Zod schemas for all mutations (person, transaction, category tag, payment mode) |
| **UI Components** | ✅ Working | 9 shadcn/ui components: button, input, card, label, select, dialog, badge, separator, textarea |
| **CSS Design System** | ✅ Working | Tailwind v4 + CSS vars with light/dark mode, domain colors (debit/credit/payment) |
| **Seed Script** | ✅ Working | Creates demo user, family, persons, category tags, payment modes |
| **PWA Manifest** | ✅ Present | `public/manifest.json` with icons and metadata |
| **Utility Functions** | ✅ Working | `cn()`, `formatCurrency()`, `formatDate()`, `toDateParam()`, `fromDateParam()`, `today()`, `addDays()` |
| **Git** | ✅ Clean | Working tree clean, connected to GitHub origin |

---

## ❌ Critical Issues & Blockers

### 1. Deployment Blocked — Vercel Env Vars Not Set (CRITICAL)

> [!CAUTION]
> The Neon Auth migration was completed locally, but **Vercel environment variables have not been updated**. The app will crash on production.

Per `docs/memory.md` "In Progress / Blockers":
- `NEON_AUTH_BASE_URL` — needs to be set in Vercel
- `NEON_AUTH_COOKIE_SECRET` — needs a NEW production secret
- Old `AUTH_SECRET` and `AUTH_URL` — need to be removed from Vercel

The code in `lib/auth/server.ts` explicitly `throw new Error()` if these are missing — so the app will **fail to start** on Vercel.

### 2. `.env` File Contains Real Credentials Committed to Repo

> [!CAUTION]
> The `.env` file contains real database credentials and auth secrets:
> ```
> DATABASE_URL="postgresql://neondb_owner:[REDACTED]@..."
> NEON_AUTH_BASE_URL="https://ep-sweet-waterfall-a14zhs84..."
> NEON_AUTH_COOKIE_SECRET="[REDACTED]"
> ```
> 
> While `.env` is in `.gitignore`, the `.env.local` file (377 bytes) is also present. **Verify neither is committed to git.** The git status shows clean working tree, so they likely aren't tracked — but this should be double-checked.

### 3. `seed.ts` Imports From Wrong Path

```typescript
// prisma/seed.ts
import { PrismaClient, PaymentModeType, Role } from "@prisma/client"
```

But the Prisma client output is configured to `../src/generated/prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

All app code imports from `@/generated/prisma`. The seed script imports from `@prisma/client` which **may or may not resolve** depending on whether Prisma also generates to the default location. This could cause seed failures.

### 4. `build` Script Runs `prisma migrate deploy` (Risky)

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

Running `migrate deploy` as part of the build means **every Vercel build triggers pending migrations against production**. This is standard for simple deployments but risky if a migration is broken — it will block all deploys.

---

## ⚠️ Incomplete / Placeholder Features

### 5. Summary Page — Placeholder
```tsx
// src/app/(dashboard)/summary/page.tsx
<p>Monthly summary — coming in Phase 2.</p>
```

### 6. Analytics Page — Placeholder
```tsx
// src/app/(dashboard)/analytics/page.tsx
<p>Charts & insights — coming in Phase 3.</p>
```

### 7. Category Tag Management — Not Implemented
`createCategoryTagSchema` exists in `validators.ts`, but there is **no server action** to create/update/delete category tags, and no UI in Settings for managing them. Only the default seeded tags are available.

### 8. Payment Mode Management — Not Implemented
`createPaymentModeSchema` exists in `validators.ts`, but there is **no server action** or UI for managing payment modes. Only the onboarding-seeded modes (Family Cash, Family UPI) are available.

### 9. Tests — All Empty
```
tests/setup.ts      → only imports '@testing-library/jest-dom'
tests/unit/.gitkeep → empty
tests/integration/.gitkeep → empty
tests/e2e/.gitkeep → empty
```
Vitest and Playwright are configured but **zero tests exist**.

### 10. No Dark Mode Toggle
CSS variables for `.dark` mode are defined but there's no toggle mechanism. The app always uses light mode unless the system preference is dark.

---

## 📊 Documentation vs Reality Cross-Check

| Document Claim | Reality |
|---------------|---------|
| README says "Phase 1.1 — Project Setup (scaffolding complete, awaiting Next.js initialization)" | **WRONG** — Phase 1 MVP is ~90% complete. Next.js is fully initialized and running. |
| README lists Auth.js in tech stack | **WRONG** — Migrated to Neon Auth in Session 4. Auth.js is fully removed. |
| README lists Recharts in tech stack | **WRONG** — `recharts` was explicitly removed in package cleanup (Session 3). |
| PRD says password_hash in User model | **WRONG** — No password field. Neon Auth handles credentials externally. |
| PRD references Auth.js | **OUTDATED** — Replaced by Neon Auth. |
| `memory.md` tracks progress accurately | ✅ MOSTLY CORRECT — accurately reflects completed sessions and blockers. |
| `copilot-instructions.md` is accurate | ✅ CORRECT — accurately describes current architecture and patterns. |
| `docs/deployment.md` doesn't exist | ⚠️ No deployment guide — deployment steps are only in `memory.md` notes. |
| `docs/implementation-plan.md` references Auth.js | **OUTDATED** — Plan predates Neon Auth migration. |
| `docs/tech-stack.md` references Auth.js | **OUTDATED** — Predates migration. |
| `docs/tech-report.md` | ✅ MOSTLY CORRECT — Created during package cleanup, documents current deps. |

---

## 📁 Dead / Orphaned Code

| Item | Reason |
|------|--------|
| `.agents/` directory | Contains AI agent config (skills, instructions). Not used by app runtime. |
| `docs/skills/` directory | Contains AI agent skill files. Not used by app. |
| `src/hooks/.gitkeep` | Empty directory — no custom hooks implemented yet. |
| Multiple `.gitkeep` files | Placeholder files in empty directories (ledger, transaction, ui, actions, queries, e2e, integration, unit). Some directories now have real files. |

---

## 🔒 Security Observations

1. **Auth is properly enforced** ✅ — Middleware protects all dashboard routes; server actions check `getAppSession()`
2. **ADMIN role checks** ✅ — Person CRUD requires ADMIN role
3. **Family scoping** ✅ — All queries filter by `activeFamilyId`; no cross-family data leakage
4. **Input validation** ✅ — Zod schemas on all server actions
5. **SQL injection protection** ✅ — Prisma parameterized queries
6. **CSRF protection** ✅ — Next.js server actions have built-in CSRF
7. **`.env` in `.gitignore`** ✅ — Secrets not tracked
8. **No rate limiting** ⚠️ — No protection against transaction spam

---

## 🏗️ Architecture Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Code organization | ⭐⭐⭐⭐⭐ | Clean separation: server/actions, server/queries, lib, components, types |
| Type safety | ⭐⭐⭐⭐⭐ | Full TypeScript, Prisma types re-exported, Zod validation |
| Database design | ⭐⭐⭐⭐⭐ | Well-normalized, proper indexes, composite unique constraints |
| Business logic | ⭐⭐⭐⭐ | Loan Impact Matrix is well-documented and implemented |
| Error handling | ⭐⭐⭐ | ActionResult pattern is clean, but some catch blocks only log |
| Testing | ⭐ | Zero tests despite test infrastructure being set up |
| Documentation | ⭐⭐⭐ | Good PRD and memory.md, but README and tech docs are stale |

---

## Summary

SpendBook is a **well-architected, partially complete** family expense tracker. The core Phase 1 MVP (auth, ledger, transactions, balances, person management) is implemented and functional locally. The main blockers are:

1. **Deployment**: Vercel env vars need updating for Neon Auth
2. **Stale docs**: README and several docs reference the old Auth.js setup
3. **Missing settings CRUD**: Category tags and payment modes can't be managed by users
4. **Zero tests**: Despite full test tooling being configured

The codebase quality is high — clean TypeScript, proper separation of concerns, good validation, and solid database design.
