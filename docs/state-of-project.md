# State of Project — SpendBook

> **Last verified**: 2026-05-09 — analysis based on actual source code
> **Project**: `C:\Users\nadam\Coding\Web Projects\spendBook`  
> **Repo**: https://github.com/theAdityaNVS/spendBook  

---

## Overall Status: ⚠️ PARTIALLY FUNCTIONAL (Phase 1 & Phase 2 Complete)

The application has a complete database schema, a working auth system (Neon Auth), a functional daily ledger, person management, configurable category tags, configurable payment modes, and a complete monthly summary with category breakdowns. A premium UI redesign is underway, beginning with shell, navigation, design tokens, and base primitives.

**Build validation note:** `pnpm build` runs `prisma migrate deploy` before `next build`, so it can be blocked by local Prisma file locks or remote Neon advisory-lock timeouts. Stop the local dev server before running the build gate. If Neon advisory lock acquisition times out, validate code with `pnpm exec next build` and retry the full build once the database lock clears.

---

## ✅ What Works (Verified in Code)

| Component              | Status         | Evidence                                                                                                                  |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Prisma Schema**      | ✅ Complete    | 10 models: User, Family, UserFamily, Person, Transaction, CategoryTag, PaymentMode, DailyBalance, LoanBalance + enums     |
| **Database Client**    | ✅ Working     | Singleton pattern in `lib/db.ts`, proper hot-reload guard                                                                 |
| **Neon Auth**          | ✅ Implemented | Server/client/session modules in `lib/auth/`, middleware protection, API route handler                                    |
| **Session Bridging**   | ✅ Working     | `getAppSession()` maps Neon Auth → internal User → UserFamily → active family                                             |
| **Onboarding Flow**    | ✅ Working     | `/onboarding` page creates family + Family Account + default tags + default payment modes in atomic transaction           |
| **Dashboard Layout**   | ✅ Working     | Sidebar (desktop) + Header + BottomNav (mobile), auth/onboarding guards                                                   |
| **Daily Ledger Page**  | ✅ Working     | Server component fetches transactions + balances for selected date, renders groups                                        |
| **Transaction CRUD**   | ✅ Working     | Create/update/delete with Zod validation, session auth, balance recalculation                                             |
| **Balance Engine**     | ✅ Working     | `computeLoanDelta()` implements the Loan Impact Matrix; `recalculateBalancesForDate()` upserts DailyBalance + LoanBalance |
| **Person Management**  | ✅ Working     | Add/edit/delete (soft archive) in Settings, ADMIN-only                                                                    |
| **Category Tags**      | ✅ Working     | `CategoryTagList.tsx` with drag-and-drop reordering, color picker, and full CRUD.                                        |
| **Payment Modes**      | ✅ Working     | `PaymentModeList.tsx` with owner selection and full CRUD.                                                                 |
| **Member Invites**     | ✅ Working     | `InviteMember.tsx` and server actions generating secure one-time invite links.                                            |
| **Monthly Summary**    | ✅ Working     | `SummaryView.tsx` with member-specific ledger summary and Recharts pie chart for category breakdowns.                     |

---

## ❌ Critical Issues & Blockers

### 1. Deployment Blocked — Vercel Env Vars Not Set (CRITICAL)

> [!CAUTION]
> The Neon Auth migration was completed locally, but **Vercel environment variables have not been updated**. The app will crash on production.

Per `docs/memory.md` "In Progress / Blockers":

- `NEON_AUTH_BASE_URL` — needs to be set in Vercel
- `NEON_AUTH_COOKIE_SECRET` — needs a NEW production secret
- Old `AUTH_SECRET` and `AUTH_URL` — need to be removed from Vercel

### 2. `build` Script Runs `prisma migrate deploy` (Risky)

Running `migrate deploy` as part of the build means every Vercel build triggers pending migrations against production. This is risky if a migration is broken — it will block all deploys.

---

## ⚠️ Incomplete / Placeholder Features

### 1. Analytics Page — Placeholder

```tsx
// src/app/(dashboard)/analytics/page.tsx
<p>Charts & insights — coming in Phase 3.</p>
```

### 2. Tests

Vitest and Playwright are configured. Unit tests now live under `tests/unit/**/*.test.ts`, while Playwright e2e specs live under `tests/e2e`.

### 3. No Dark Mode Toggle

CSS variables for `.dark` mode are defined but there's no toggle mechanism. The app always uses light mode unless the system preference is dark.

---

## 📊 Documentation vs Reality Cross-Check

| Document Claim                                                                                  | Reality                                                                             |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| README says "Phase 1.1 — Project Setup (scaffolding complete, awaiting Next.js initialization)" | **WRONG** — Phase 1 MVP is ~90% complete. Next.js is fully initialized and running. |
| README lists Auth.js in tech stack                                                              | **WRONG** — Migrated to Neon Auth in Session 4. Auth.js is fully removed.           |
| README lists Recharts in tech stack                                                             | **WRONG** — `recharts` was explicitly removed in package cleanup (Session 3).       |
| PRD says password_hash in User model                                                            | **WRONG** — No password field. Neon Auth handles credentials externally.            |
| PRD references Auth.js                                                                          | **OUTDATED** — Replaced by Neon Auth.                                               |
| `memory.md` tracks progress accurately                                                          | ✅ MOSTLY CORRECT — accurately reflects completed sessions and blockers.            |
| `copilot-instructions.md` is accurate                                                           | ✅ CORRECT — accurately describes current architecture and patterns.                |
| `docs/deployment.md` doesn't exist                                                              | ⚠️ No deployment guide — deployment steps are only in `memory.md` notes.            |
| `docs/implementation-plan.md` references Auth.js                                                | **OUTDATED** — Plan predates Neon Auth migration.                                   |
| `docs/tech-stack.md` references Auth.js                                                         | **OUTDATED** — Predates migration.                                                  |
| `docs/tech-report.md`                                                                           | ✅ MOSTLY CORRECT — Created during package cleanup, documents current deps.         |

---

## 📁 Dead / Orphaned Code

| Item                      | Reason                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.agents/` directory      | Contains AI agent config (skills, instructions). Not used by app runtime.                                                                         |
| `docs/skills/` directory  | Contains AI agent skill files. Not used by app.                                                                                                   |
| `src/hooks/.gitkeep`      | Empty directory — no custom hooks implemented yet.                                                                                                |
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

| Aspect            | Rating     | Notes                                                                    |
| ----------------- | ---------- | ------------------------------------------------------------------------ |
| Code organization | ⭐⭐⭐⭐⭐ | Clean separation: server/actions, server/queries, lib, components, types |
| Type safety       | ⭐⭐⭐⭐⭐ | Full TypeScript, Prisma types re-exported, Zod validation                |
| Database design   | ⭐⭐⭐⭐⭐ | Well-normalized, proper indexes, composite unique constraints            |
| Business logic    | ⭐⭐⭐⭐   | Loan Impact Matrix is well-documented and implemented                    |
| Error handling    | ⭐⭐⭐     | ActionResult pattern is clean, but some catch blocks only log            |
| Testing           | ⭐         | Zero tests despite test infrastructure being set up                      |
| Documentation     | ⭐⭐⭐     | Good PRD and memory.md, but README and tech docs are stale               |

---

## Summary

SpendBook is a **well-architected, partially complete** family expense tracker. The core Phase 1 MVP (auth, ledger, transactions, balances, person management) is implemented and functional locally. The main blockers are:

1. **Deployment**: Vercel env vars need updating for Neon Auth
2. **Stale docs**: README and several docs reference the old Auth.js setup
3. **Missing settings CRUD**: Category tags and payment modes can't be managed by users
4. **Zero tests**: Despite full test tooling being configured

The codebase quality is high — clean TypeScript, proper separation of concerns, good validation, and solid database design.
