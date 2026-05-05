# SpendBook — Implementation Plan

> Master plan from MVP to full-scale. Each phase has sub-phases with concrete deliverables.

---

## Development Workflow & Branching Strategy

> **CRITICAL INSTRUCTIONS FOR AGENTS:**
> 1. **Branching Strategy:** We merge phase by phase. Create a new branch for each phase (e.g., `git checkout -b phase-2`). Once a phase is complete, it is merged into `main` via a Pull Request.
> 2. **Atomic Commits:** Make descriptive commits for **every** sub-task and task you complete. Do not lump massive changes into single commits.
> 3. **Memory Updates:** Update `docs/memory.md` immediately after completing every task to keep track of progress, blockers, and next steps.

---

## Overview

| Phase | Name | Duration (est.) | Goal | Status |
|---|---|---|---|---|
| **Phase 1** | MVP — Core Expense Tracking | 4–5 weeks | Single family, daily ledger, transactions, balance/loan calculation | **COMPLETED (90%)** |
| **Phase 1.5**| Neon-Auth Integration & Migration| 1 week | Full migration from Auth.js to Neon Auth with onboarding flows | **COMPLETED** |
| **Phase 2** | Configuration & Reports | 3–4 weeks | Admin panel, custom tags/modes, monthly summary, category breakdown | Pending |
| **Phase 3** | Multi-Family & Analytics | 3–4 weeks | Multi-family support, full analytics dashboard, data export | Pending |
| **Phase 4** | PWA & Polish | 2–3 weeks | Offline support, installable PWA, performance optimization | Pending |
| **Phase 5** | Scale & Enhancements | Ongoing | Multi-currency, notifications, recurring transactions, budgets | Pending |

---

## Phase 1 — MVP: Core Expense Tracking (COMPLETED)

### 1.1 Project Setup [x]
- [x] Initialize Next.js 15 project with TypeScript, Tailwind CSS, pnpm
- [x] Set up project structure, shadcn/ui
- [x] Set up PostgreSQL database (Neon) and Prisma schema
- [x] Run first migration & seed data

### 1.2 Initial Authentication (Auth.js) [x]
- [x] Initial setup using Auth.js (Later superseded by Phase 1.5)

### 1.3 Family & Person Setup [x]
- [x] Auto-create Family Account
- [x] Build person list view & Person CRUD
- [x] Seed default category tags & payment modes

### 1.4 Transaction CRUD [x]
- [x] Build "Add/Edit Transaction" form/modal
- [x] Implement create/update/delete actions (Server Action → Prisma)
- [x] Validate required fields (Zod)

### 1.5 Daily Ledger View [x]
- [x] Build daily ledger page with date navigation
- [x] Group transactions by type
- [x] "Add Transaction" FAB

### 1.6 Balance & Loan Calculation [x]
- [x] Implement balance calculation engine (Loan Impact Matrix)
- [x] Build Balance Card component per person
- [x] Implement DailyBalance and LoanBalance cache tables

---

## Phase 1.5 — Neon-Auth Integration & Migration (COMPLETED)

> **Goal:** Migrate from Auth.js to Neon's native authentication solution for seamless DB integration.

- [x] Remove Auth.js and related dependencies
- [x] Install and configure `@neondatabase/auth`
- [x] Set up Auth API route (`/api/auth/[...path]`)
- [x] Create sign-in / sign-up / account views using Neon UI components
- [x] Implement session bridging (`getAppSession`) to map Neon users to app `User` & `Family`
- [x] Protect routes via Neon Auth middleware
- [x] Build dedicated `/onboarding` flow to create Family upon first login
- [x] Update Vercel/local `.env` patterns

---

## Phase 2 — Configuration & Reports (NEXT)

> **Goal:** Complete the remaining MVP setup (Admin configuration) and introduce basic reporting so users can see their monthly spend.

### 2.1 Admin Panel — Category Tags
- [ ] Build category tag management UI in Settings
- [ ] Implement Server Actions for CRUD operations: add, rename, archive
- [ ] Implement drag-and-drop reordering
- [ ] Add Color picker for tags
- [ ] Ensure tags in use cannot be hard-deleted, only archived

### 2.2 Admin Panel — Payment Modes
- [ ] Build payment mode management UI in Settings
- [ ] Implement Server Actions for CRUD operations: add, edit, archive
- [ ] Set owner configuration (Family vs. Specific Person)
- [ ] Set type (Credit Card, Debit Card, UPI, Cash, Wallet, Net Banking)

### 2.3 Member Management & Role-Based Access
- [ ] Build member management UI to invite users (via email/link) to the family
- [ ] Accept invite flow (links user account to Person entity)
- [ ] Implement RBAC middleware/guards (Admin vs. Family vs. Person roles)
- [ ] Ensure Family role sees only family transactions; Person role sees only their own

### 2.4 Monthly Summary Page
- [ ] Replace stub in `/summary` with actual UI
- [ ] Add Calendar month selector
- [ ] Build per-person breakdown table (Opening → Debits/Credits/Payments → Closing)
- [ ] Add Family-level aggregate row

### 2.5 Category-wise Breakdown
- [ ] Add Category breakdown section to Summary page or dedicated view
- [ ] Add Pie/donut chart of spend distribution by category
- [ ] Add drill-down (click category → see transactions)

### 2.6 Deployment & MVP Polish
- [ ] **BLOCKER FIX:** Update Vercel environment variables (`NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`)
- [ ] Verify production build and test end-to-end auth and ledger flows
- [ ] Fix empty tests directory (add basic e2e / integration tests)

---

## Phase 3 — Multi-Family & Analytics (PENDING)

### 3.1 Multi-Family Support
- [ ] Implement UserFamily join table logic to allow users to belong to multiple families
- [ ] Add Family switcher component (header dropdown)
- [ ] Scope all queries to the currently active family context

### 3.2 Analytics Dashboard
- [ ] Replace stub in `/analytics` with actual UI (Recharts)
- [ ] Implement Time range picker (This month, Last month, Custom)
- [ ] Add Spending trends chart (Line/Bar)
- [ ] Add Income vs. Expense chart
- [ ] Add Person comparison and Top spends tables

### 3.3 Data Export
- [ ] Export transactions to CSV
- [ ] Export monthly summary / charts to PDF
- [ ] Add download buttons on relevant pages

---

## Phase 4 — PWA & Polish (PENDING)

### 4.1 PWA Setup & Offline Support
- [ ] Configure service worker (e.g. Serwist)
- [ ] Enable "Add to Home Screen"
- [ ] Implement offline transaction queue (IndexedDB) with online sync

### 4.2 Performance & UX
- [ ] Lighthouse audit and DB query optimization
- [ ] Implement virtual scrolling / pagination for ledger
- [ ] Add Dark mode toggle
- [ ] Add animations and haptic feedback

---

## Phase 5 — Scale & Enhancements (FUTURE)
- [ ] Multi-Currency support
- [ ] Recurring transactions (cron)
- [ ] Budgets & Limits (alerts)
- [ ] Smart Features (Auto-categorization, Receipt scanning)

---

## Testing Strategy

| Phase | Test Focus |
|---|---|
| **Phase 1** | Unit tests for balance/loan calculation engine. E2E test for create transaction → verify ledger. |
| **Phase 2** | Integration tests for RBAC (role sees correct data). E2E for admin CRUD flows. |
| **Phase 3** | Multi-family isolation tests (no data leakage). Analytics query accuracy tests. |
| **Phase 4** | Offline sync tests (create offline → come online → verify). Lighthouse audits. |
| **Phase 5** | Per-feature unit tests as built. |

---

## Milestones & Checkpoints

| Milestone | When | Success Criteria |
|---|---|---|
| **M1: Skeleton deployed** | End of Week 1 | Next.js app on Vercel, DB connected, Auth working |
| **M2: MVP usable** | End of Week 5 | Can log transactions, see daily ledger, balances calculate correctly |
| **M3: Configurable & team-ready** | End of Week 9 | Admin panel works, members can join, monthly reports available |
| **M4: Multi-family & analytics** | End of Week 12 | Family switcher works, analytics dashboard live, export working |
| **M5: Production-ready** | End of Week 15 | PWA installable, offline works, Lighthouse 90+, dark mode |
