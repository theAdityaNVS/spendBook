# SpendBook — Implementation Plan

> Master plan from MVP to full-scale. Each phase has sub-phases with concrete deliverables.

---

## Overview

| Phase | Name | Duration (est.) | Goal |
|---|---|---|---|
| **Phase 1** | MVP — Core Expense Tracking | 4–5 weeks | Single family, daily ledger, transactions, balance/loan calculation |
| **Phase 2** | Configuration & Reports | 3–4 weeks | Admin panel, custom tags/modes, monthly summary, category breakdown |
| **Phase 3** | Multi-Family & Analytics | 3–4 weeks | Multi-family support, full analytics dashboard, data export |
| **Phase 4** | PWA & Polish | 2–3 weeks | Offline support, installable PWA, performance optimization |
| **Phase 5** | Scale & Enhancements | Ongoing | Multi-currency, notifications, recurring transactions, budgets |

**Total estimated timeline: 12–16 weeks** (for a solo developer, part-time)

---

## Phase 1 — MVP: Core Expense Tracking

> **Goal:** A working app where one family can log daily expenses and see balances.

### 1.1 Project Setup (Week 1)

- [ ] Initialize Next.js 15 project with TypeScript, Tailwind CSS, pnpm
- [ ] Set up project structure (app router, folder conventions)
- [ ] Install and configure shadcn/ui (theme, base components)
- [ ] Set up ESLint, Prettier, Husky, lint-staged
- [ ] Set up PostgreSQL database (Supabase or Neon)
- [ ] Initialize Prisma with database connection
- [ ] Create initial Prisma schema (User, Family, Person, Transaction, CategoryTag, PaymentMode, DailyBalance, LoanBalance)
- [ ] Run first migration
- [ ] Set up environment variables (.env.local, .env.example)
- [ ] Deploy skeleton app to Vercel (CI/CD pipeline working)

### 1.2 Authentication (Week 1–2)

- [ ] Install and configure Auth.js v5
- [ ] Implement email/password registration
- [ ] Implement email/password login
- [ ] Implement session management (JWT)
- [ ] Create login page UI
- [ ] Create registration page UI
- [ ] Add protected route middleware (redirect unauthenticated users)
- [ ] Create user profile model integration (User ↔ Prisma)

### 1.3 Family & Person Setup (Week 2)

- [ ] Auto-create a Family when a new user registers (first-time setup flow)
- [ ] Auto-create the Family Account (built-in "person" with `is_family_account = true`)
- [ ] Build "Add Person" form — admin adds family members (name only, no login yet)
- [ ] Build person list view (shows Family Account + all persons)
- [ ] Implement edit/delete person
- [ ] Seed default category tags (Food Delivery, Groceries, Shopping, Subscriptions, Utilities, Transport, Entertainment, Healthcare, Education, Miscellaneous)
- [ ] Seed default payment modes (Cash — family-owned, UPI — family-owned)

### 1.4 Transaction CRUD (Week 2–3)

- [ ] Build "Add Transaction" form/modal:
  - Person selector (dropdown)
  - Type selector (Debit / Credit / Payment)
  - Name (text input)
  - Description (optional textarea)
  - Category tag (dropdown)
  - Payment mode (dropdown)
  - Amount (number input with ₹ prefix)
  - Paid Towards (Personal / Family toggle)
  - Date (date picker, defaults to today)
- [ ] Implement create transaction (Server Action → Prisma)
- [ ] Implement edit transaction
- [ ] Implement delete transaction (with confirmation)
- [ ] Validate required fields (client + server)
- [ ] Mobile-optimized form layout (touch-friendly inputs)

### 1.5 Daily Ledger View (Week 3–4)

- [ ] Build daily ledger page (home page)
- [ ] Date header with date picker navigation
- [ ] Swipe left/right or arrow buttons for day navigation
- [ ] Group transactions by type (Debits, Credits, Payments sections)
- [ ] Within each section, group by person
- [ ] Display each transaction: name, description, category tag, payment mode, amount, paid towards
- [ ] "Add Transaction" FAB (floating action button) on mobile
- [ ] Tap transaction to edit
- [ ] Empty state for days with no transactions

### 1.6 Balance & Loan Calculation (Week 4–5)

- [ ] Implement balance calculation engine:
  - Family Account: running balance (income − expenses)
  - Person: loan balance based on payment mode ownership × paid towards matrix
- [ ] Build Balance Card component:
  - Previous day balance/loan
  - Today's debits
  - Today's credits
  - Today's payments
  - New balance/loan
- [ ] Display Balance Card at bottom of daily ledger (per person + family)
- [ ] Implement DailyBalance cache table (computed on transaction create/edit/delete)
- [ ] Implement LoanBalance cache table
- [ ] Add recalculation utility (rebuild balances from scratch if needed)
- [ ] Test with sample data: verify loan impact matrix is correct

### 1.7 MVP Polish

- [ ] Responsive layout testing (iPad, iPhone, desktop)
- [ ] Loading states and skeleton screens
- [ ] Error handling (toast notifications for failures)
- [ ] Basic app layout: header with app name, sidebar/bottom nav
- [ ] Deploy MVP to Vercel

**Phase 1 Deliverable:** Single-family expense tracker with daily ledger, full transaction CRUD, and working balance/loan calculations.

---

## Phase 2 — Configuration & Reports

> **Goal:** Admin can customize everything. Users can view monthly summaries and category reports.

### 2.1 Admin Panel — Category Tags (Week 6)

- [ ] Build category tag management page
- [ ] CRUD operations: add, rename, reorder (drag-and-drop), archive
- [ ] Color picker for each tag
- [ ] Prevent deletion of tags in use (archive instead)
- [ ] Update transaction form to use admin-configured tags

### 2.2 Admin Panel — Payment Modes (Week 6)

- [ ] Build payment mode management page
- [ ] CRUD operations: add, edit, archive
- [ ] Set owner: Family or specific Person (critical for loan logic)
- [ ] Set type: Credit Card, Debit Card, UPI, Cash, Wallet, Net Banking
- [ ] Update transaction form to use admin-configured payment modes
- [ ] Show owner badge on payment mode dropdown

### 2.3 Admin Panel — Member Management (Week 7)

- [ ] Build member management page
- [ ] Invite member via email (generate invite link)
- [ ] Accept invite flow: invitee registers/logs in → joins family
- [ ] Assign role to invited member (Family / Person)
- [ ] Link user account to a Person entity in the family
- [ ] Remove member from family
- [ ] Edit member role

### 2.4 Role-Based Access Control (Week 7)

- [ ] Implement middleware/guards for role-based page access
- [ ] Admin: sees all data, all settings
- [ ] Family role: sees only family account transactions + own balance
- [ ] Person role: sees only own transactions + own loan balance
- [ ] Restrict settings pages to Admin only
- [ ] Filter transaction queries by role scope

### 2.5 Monthly Summary (Week 8)

- [ ] Build monthly summary page
- [ ] Calendar month selector (dropdown or picker)
- [ ] Per-person breakdown table:
  - Total debits (split: personal vs. family)
  - Total credits
  - Total payments
  - Opening balance → Closing balance
  - Opening loan → Closing loan
- [ ] Family-level aggregate row: total household spend
- [ ] Highlight positive/negative balances with color

### 2.6 Category-wise Breakdown (Week 8–9)

- [ ] Build category breakdown page
- [ ] Pie/donut chart: spend distribution by category tag
- [ ] Table view alongside chart
- [ ] Filters: person, time range (this week, this month, last month, custom)
- [ ] Drill-down: click category → see individual transactions
- [ ] Install and configure Recharts

**Phase 2 Deliverable:** Fully configurable admin panel, role-based access, monthly summaries, and category analytics.

---

## Phase 3 — Multi-Family & Analytics

> **Goal:** Users can manage multiple families. Full analytics dashboard.

### 3.1 Multi-Family Support (Week 10)

- [ ] Implement UserFamily join table (many-to-many: user ↔ family)
- [ ] "Create New Family" flow (from settings or dashboard)
- [ ] Family switcher component (header dropdown)
- [ ] Scope all queries to currently selected family
- [ ] Ensure complete data isolation between families
- [ ] Update all pages to respect active family context
- [ ] "Join Family" flow via invite link (cross-family invites)

### 3.2 Analytics Dashboard — Trends (Week 11)

- [ ] Build analytics dashboard page
- [ ] Time range picker: This month, Last month, Last 3 months, Custom
- [ ] **Spending trends:** Line/bar chart — daily, weekly, monthly totals
- [ ] **Income vs. Expense:** Stacked bar chart over time
- [ ] All charts are scoped to active family

### 3.3 Analytics Dashboard — Deep Insights (Week 11–12)

- [ ] **Category comparison:** Month-over-month category spend changes (grouped bar chart)
- [ ] **Payment mode analysis:** Donut chart of spend distribution by payment mode
- [ ] **Person comparison:** Side-by-side bar chart — each member's spending
- [ ] **Top spends:** Table — highest individual transactions in the selected period
- [ ] **Inflow vs. Outflow:** Personal credits tracked separately — net personal cash flow chart

### 3.4 Data Export (Week 12)

- [ ] Export transactions to CSV (filtered by date range, person, type)
- [ ] Export monthly summary to PDF
- [ ] Export analytics charts to PDF/image
- [ ] Download button on each relevant page

**Phase 3 Deliverable:** Multi-family management with family switcher, full analytics dashboard with charts, and data export.

---

## Phase 4 — PWA & Polish

> **Goal:** Installable on iPad/mobile, works offline, polished UX.

### 4.1 PWA Setup (Week 13)

- [ ] Install and configure Serwist (service worker)
- [ ] Create web app manifest (icons, splash screen, theme color)
- [ ] Enable "Add to Home Screen" on iPad/iPhone/Android
- [ ] Cache static assets and app shell for instant loads

### 4.2 Offline Support (Week 13–14)

- [ ] Implement offline transaction queue (IndexedDB)
- [ ] Queue transactions created offline → sync when online
- [ ] Show offline indicator in UI
- [ ] Conflict resolution: last-write-wins or prompt user
- [ ] Cache recent daily ledger data for offline viewing

### 4.3 Performance Optimization (Week 14)

- [ ] Audit with Lighthouse — target 90+ score on all metrics
- [ ] Optimize database queries (indexes on frequently queried columns)
- [ ] Implement pagination for transaction lists (virtual scroll for long days)
- [ ] Lazy load analytics charts
- [ ] Image optimization (Next.js Image component for any images/avatars)
- [ ] Bundle analysis and tree-shaking

### 4.4 UX Polish (Week 14–15)

- [ ] Animations/transitions (page transitions, modal open/close)
- [ ] Dark mode support (toggle in settings)
- [ ] Haptic feedback on mobile (vibrate on transaction save)
- [ ] Keyboard shortcuts for power users (desktop)
- [ ] Accessibility audit (screen reader, color contrast, focus management)
- [ ] Onboarding flow for first-time users (guided setup)
- [ ] Quick-add widget: minimal form for fast mobile entry

**Phase 4 Deliverable:** Installable PWA with offline support, polished animations, dark mode, and performance-optimized.

---

## Phase 5 — Scale & Enhancements

> **Goal:** Advanced features for power users. Ongoing improvements.

### 5.1 Multi-Currency (Week 16+)

- [ ] Currency selector per transaction (default: family's default currency)
- [ ] Add currency conversion display (using exchange rate API)
- [ ] Family setting: default currency, available currencies
- [ ] Show amounts in default currency with original currency in tooltip

### 5.2 Recurring Transactions (Future)

- [ ] Define recurring transactions (daily, weekly, monthly, custom)
- [ ] Auto-create transactions on schedule (cron job / Vercel cron)
- [ ] Edit/pause/delete recurring rules
- [ ] Useful for: subscriptions (Netflix, Spotify), rent, EMIs

### 5.3 Budgets & Limits (Future)

- [ ] Set monthly budget per category (e.g., Food: ₹5,000)
- [ ] Set monthly budget per person
- [ ] Budget progress bar on dashboard
- [ ] Alert when budget is 80% or 100% reached

### 5.4 Notifications & Reminders (Future)

- [ ] Daily reminder to log expenses (push notification via PWA)
- [ ] Budget threshold alerts
- [ ] Weekly summary email/notification

### 5.5 Smart Features (Future)

- [ ] Auto-categorization: suggest category based on transaction name (ML/heuristic)
- [ ] Duplicate detection: warn if similar transaction already logged today
- [ ] Receipt scanning: OCR to auto-fill transaction details (camera/upload)
- [ ] Voice input: "Spent 250 on Swiggy for family" → auto-fill form

### 5.6 API & Integrations (Future)

- [ ] Public API for programmatic access
- [ ] Zapier/IFTTT integration
- [ ] Bank statement import (CSV upload → parse → create transactions)
- [ ] UPI/SMS auto-detect (Android only — read transaction SMS)

---

## Dependency Map

```
Phase 1.1 (Setup)
    ├── 1.2 (Auth) ← needs project + DB
    ├── 1.3 (Family/Person) ← needs Auth
    │       └── 1.4 (Transaction CRUD) ← needs Person + Tags + Modes
    │               ├── 1.5 (Daily Ledger) ← needs Transactions
    │               └── 1.6 (Balance Engine) ← needs Transactions + Payment Mode ownership
    │
Phase 2 (all sub-phases need Phase 1 complete)
    ├── 2.1 (Tags) ─┐
    ├── 2.2 (Modes) ─┤── can be done in parallel
    ├── 2.3 (Members) ← needs Auth
    ├── 2.4 (RBAC) ← needs Members
    ├── 2.5 (Monthly Summary) ← needs Balance Engine
    └── 2.6 (Category Breakdown) ← needs Tags + Recharts
    │
Phase 3
    ├── 3.1 (Multi-Family) ← needs RBAC
    ├── 3.2 (Trends) ─┐
    ├── 3.3 (Insights) ┤── need Recharts + Balance data
    └── 3.4 (Export) ← needs Summary/Analytics pages
    │
Phase 4
    ├── 4.1 (PWA) ─┐
    ├── 4.2 (Offline) ┤── independent of feature work
    ├── 4.3 (Perf) ──┘
    └── 4.4 (UX Polish) ← after all features stable
    │
Phase 5 ← all items independent, can be prioritized as needed
```

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
