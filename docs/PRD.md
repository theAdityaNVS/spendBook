# SpendBook — Product Requirements Document

## 1. Overview

A responsive web application to track personal and family expenses on a daily basis, replacing a manual iPad notes workflow. The app organizes transactions into **Debits**, **Credits**, and **Payments** per person/family account, and computes a running "owed balance" per entity. Each day functions like a page in a ledger, showing all transactions and the end-of-day balance.

**Primary users:** Families — each family is managed independently by its own admin.
**Primary devices:** iPad (main input), Mobile (quick add/view), Desktop (analytics/admin).
**Currency:** Multi-currency with INR (₹) as default.

---

## 2. Families (Multi-Tenant Model)

The application supports **multiple independent families**. Each family is a fully isolated tenant.

### 2.1 What is a Family?

A Family is the top-level organizational unit. It contains:

- **1 Family Account** — a joint/shared account treated as a "person" in the system. It has its own balance, transactions, and payment modes. Represents the household's shared finances.
- **N Persons** — any number of individual members (e.g., children, spouse). Each person has their own loan balance representing what they owe to the family.
- **1 Admin** — the user who created the family. Has full access to everything within the family.

### 2.2 Multi-Family Support

- Any user can **create a new family** to manage a separate set of expenses (e.g., a user managing their own household AND helping manage a parent's household).
- Each family is **completely isolated** — separate persons, transactions, payment modes, category tags, balances.
- A user can belong to **multiple families** with different roles in each (admin in one, member in another).
- On login, if a user belongs to multiple families, they see a **family switcher** to select which family to view/manage.

### 2.3 Family Structure Example

```
Family: "Kumar Household"
├── Family Account (joint) — Balance: ₹12,500
├── Person 1 (Rahul)       — Loan: ₹3,200 owed to family
├── Person 2 (Priya)       — Loan: ₹1,800 owed to family
└── Person 3 (Arjun)       — Loan: ₹500 owed to family

Family: "Parents Household" (managed by same admin)
├── Family Account (joint) — Balance: ₹45,000
├── Person 1 (Dad)         — Loan: ₹0
└── Person 2 (Mom)         — Loan: ₹0
```

---

## 3. User Roles & Authentication

Roles are **per-family** — a user can have different roles in different families.

| Role | Access | Balance View |
|---|---|---|
| **Admin** | Full access: manage all persons/family accounts, configure payment modes, category tags, view all data, manage members, full analytics, all settings | Sees everything — all balances, all loans, all transactions across all persons and family |
| **Family** | Add/edit/delete family transactions, view family daily ledger, view family balance and reports. Cannot see other persons' personal transactions. | Family balance (+ or −): total household income vs. expenses |
| **Person (Child)** | Add/edit/delete own transactions, view own daily ledger, view own loan balance and reports. Cannot see other persons' personal transactions or family-only data unless granted. | Loan balance (+ or −): amount owed to family |

- Admin is typically a parent who manages the entire tracker.
- Family and Person roles each get a **scoped view** — they see their own transactions and balance only.
- Login via email/password (optionally social login in future).
- Admin invites members to the family group and assigns roles.
- A user creating a new family automatically becomes its admin.

---

## 4. Core Concepts

### 4.1 Entities (Accounts)

- **Family Account** — the primary account within each family. Most expenses are family expenses. Family is treated as a "person" in the system — it has its own balance, transactions, and payment modes. Think of it as the household's joint account.
- **Person (Child)** — an individual family member (e.g., Person 1, Person 2). Each person has a **loan balance** representing what they owe to the family. Personal expenses that the family didn't fund are tracked but don't affect this loan.
- Admin can add/edit/remove persons. The "Family Account" is a built-in, non-removable account created automatically with every new family.
- A person can also be the admin (e.g., a parent managing the tracker).

### 4.2 Balance Model (Loan Model)

Each person maintains a **loan balance** — the amount they owe to the family.

```
New Loan Balance = Previous Loan Balance
                   + Debits paid by family for person's personal use
                   − Payments made by person on behalf of family
```

#### What increases the loan (person owes more):
- Person makes a **personal spend** using a **family payment mode** (e.g., family credit card). The family paid for the person's personal expense → loan increases.

#### What decreases the loan (person owes less):
- Person makes a **payment on behalf of family** (e.g., pays a family bill using their own money, buys groceries with own cash). This is a repayment → loan decreases.
- Person makes a direct **settlement payment** to family (e.g., transfers money back).

#### What does NOT affect the loan (tracked for stats only):
- Person makes a **personal spend** using **their own funds** (own cash, own UPI, own wallet). They paid from their own pocket — no family money involved. Tracked for the person's inflow/outflow stats but loan is unaffected.
- **Family expenses** paid by family payment modes — these are normal household spending, tracked under the Family account.

#### Family's own balance:
- Family has its own running balance tracking total household income vs. expenses (independent of any person's loan).

#### Key rule:
> The "Payment Towards" field on each transaction determines whether the spend is **Personal** or **Family**. Combined with **who owns the payment mode**, this determines the loan impact.

### 4.3 Transaction Categories

Three top-level types, each containing line-item transactions:

| Type | What It Includes | Loan Effect | Examples |
|---|---|---|---|
| **Debit** | **All spends** of any type + money sent to someone | Depends on payment mode owner + "paid towards" (see matrix below) | Shopping, subscriptions, food delivery, bills, rent, money sent to a friend, EMIs, recharges |
| **Credit** | **Refunds** + money received from someone | Reduces loan if refund was for a family-funded personal spend; stats-only otherwise | Cashback, order refunds, money received from friend, salary (if tracked), reimbursements |
| **Payment** | **Credit card payments** + bill settlements only | Reduces loan (person paying back family or settling on family's behalf) | Credit card bill payment, loan EMI settlement, utility bill settlement |

#### Debit Loan Impact Matrix

| Who Paid (Payment Mode Owner) | Paid Towards | Loan Impact | Example |
|---|---|---|---|
| Family mode (family CC, family UPI) | Personal | **+** Loan increases | Child buys clothes on family credit card |
| Family mode | Family | No loan change (family expense) | Groceries on family card |
| Person's own mode (own cash, own UPI) | Personal | No loan change (stats only) | Child buys coffee with own cash |
| Person's own mode | Family | **−** Loan decreases (repayment) | Child pays electric bill with own UPI |

---

## 5. Features

### 5.1 Family Management

- **Create Family:** Any user can create a new family. They become admin automatically.
- **Family Switcher:** Users in multiple families see a switcher in the header/sidebar.
- **Invite Members:** Admin sends invite link or email. Invitee joins and is assigned a role + linked to a person account.
- **Family Settings:** Name, default currency, time zone.

### 5.2 Daily Ledger (Home / Main View)

- **Page-per-day** layout, matching the current iPad workflow.
- Top of page: current date with date picker to navigate.
- Sections for Debits, Credits, Payments — grouped by person.
- Bottom of page: **Balance Card** per person/family:
  - Previous day balance
  - Today's debits
  - Today's credits
  - Today's payments
  - **New balance**
- Swipe left/right or arrow buttons to navigate between days.
- Filter/view by person or show all.

### 5.3 Add Transaction

Each transaction captures:

| Field | Details |
|---|---|
| **Person** | Dropdown: Family Account, Person 1, Person 2, etc. — who is making/associated with this transaction |
| **Type** | Debit / Credit / Payment |
| **Name** | Short title (e.g., "Swiggy", "HDFC CC Payment") |
| **Description** | Optional — longer note (e.g., "KFC burger") |
| **Category Tag** | User-configurable tags (e.g., Food Delivery, Shopping, Subscriptions, Groceries, Utilities, Entertainment) |
| **Payment Mode** | User-configurable (e.g., HDFC Credit Card, SBI UPI, Cash, Paytm Wallet). Each mode is **owned by** either Family or a specific Person — this ownership determines loan impact. |
| **Amount** | Numeric with currency selector (default ₹) |
| **Paid Towards** | **Personal / Family** — available on every transaction. Combined with payment mode ownership, determines whether the loan balance is affected (see §4.3 matrix). |
| **Date** | Defaults to today, editable |

- Quick-add mode on mobile: minimal fields (Person, Name, Amount, Type) with defaults.
- Edit and delete existing transactions.

### 5.4 Category Tags (Admin-configurable)

- Predefined defaults: Food Delivery, Groceries, Shopping, Subscriptions, Utilities, Transport, Entertainment, Healthcare, Education, Miscellaneous.
- Admin can add, rename, reorder, archive tags.
- Color-coded for visual identification.
- Tags are **per-family** — each family has its own set.

### 5.5 Payment Modes (Admin-configurable)

- Admin can CRUD payment modes: name + type (Credit Card, Debit Card, UPI, Cash, Wallet, Net Banking).
- **Each payment mode has an owner**: Family or a specific Person. This is critical for loan calculation.
  - Family-owned modes: "Family HDFC Credit Card", "Family Cash"
  - Person-owned modes: "Person 1 Cash", "Person 1 Paytm UPI"
- Payment modes are **per-family**.
- Used for filtering, per-mode spending analytics, and automatic loan impact determination.

### 5.6 Monthly Summary

- View: calendar month selector.
- Per-person breakdown:
  - Total debits (personal + family split)
  - Total credits
  - Total payments
  - Opening balance → Closing balance
- Family-level aggregate: total household spend.

### 5.7 Category-wise Breakdown

- Pie/donut chart + table showing spend distribution by category tag.
- Filter by person, time range (week/month/custom).
- Drill down into individual transactions per category.

### 5.8 Full Analytics Dashboard

- **Trends:** Line/bar charts of spending over time (daily, weekly, monthly).
- **Category comparison:** Month-over-month category spend changes.
- **Payment mode analysis:** Spend distribution across payment modes.
- **Person comparison:** Side-by-side comparison of family members' spending.
- **Top spends:** Highest transactions in a period.
- **Inflow vs. Outflow:** Personal credits tracked separately — shows net personal cash flow.
- Time range picker: This month, Last month, Last 3 months, Custom range.
- All analytics are **scoped to the currently selected family**.

### 5.9 Settings / Admin Panel

- Manage family members (invite, remove, edit roles).
- Manage persons/accounts within the family.
- Manage category tags.
- Manage payment modes.
- Currency settings (default currency, available currencies).
- Data export (CSV/PDF) — per family.

---

## 6. Tech Stack

> See [Tech Stack.md](Tech%20Stack.md) for the full tech stack evaluation with pros, cons, and alternatives.

**Summary:** Next.js 15 (full-stack TypeScript) + PostgreSQL (Supabase/Neon) + Prisma + Auth.js + shadcn/ui + Tailwind CSS + Recharts, hosted on Vercel.

---

## 7. Data Model (Key Entities)

```
User
├── id, email, password_hash, name, avatar
└── (can belong to multiple families via UserFamily join)

UserFamily (join table — many-to-many)
├── user_id, family_id, role (admin/family/person)
└── person_id (links user to their Person account in this family)

Family
├── id, name, default_currency, timezone, created_at
└── Has one built-in Family Account (Person with is_family_account = true)

Person
├── id, name, family_id
├── is_family_account (boolean) — true for the family's joint account
└── type (family/individual)

Transaction
├── id, family_id, person_id, type (debit/credit/payment)
├── name, description, category_tag_id, payment_mode_id
├── amount, currency, paid_towards (personal/family)
├── date, created_by (user_id), created_at, updated_at

CategoryTag
├── id, name, color, family_id, sort_order, is_archived

PaymentMode
├── id, name, type (credit_card/debit_card/upi/cash/wallet/net_banking)
├── owner_person_id (nullable — null = family-owned, otherwise person-owned)
├── family_id, is_archived

DailyBalance
├── id, person_id, date
├── opening_balance, total_debits, total_credits, total_payments
└── closing_balance (computed/cached)

LoanBalance
├── id, person_id, date
├── opening_loan, loan_increases, loan_decreases
└── closing_loan (computed/cached — derived from transactions + payment mode ownership + paid_towards)
```

---

## 8. Screens

1. **Login / Register**
2. **Family Switcher** — select active family (shown if user is in multiple families)
3. **Create / Join Family** — create a new family or accept an invite
4. **Daily Ledger** (home) — date header, transaction sections, balance cards
5. **Add/Edit Transaction** — form/modal
6. **Monthly Summary** — per-person table + totals
7. **Analytics Dashboard** — charts + filters
8. **Settings** — members, persons, tags, payment modes, currency
9. **Profile** — personal settings, password change

---

## 9. Non-Functional Requirements

- **Responsive:** Touch-optimized for iPad, thumb-friendly on mobile, full layout on desktop.
- **PWA:** Installable on iPad/mobile home screen. Offline: queue transactions and sync when online.
- **Performance:** Daily ledger loads in < 1s. Analytics queries < 2s.
- **Security:** Role-based access scoped per family, encrypted passwords, HTTPS only, CSRF protection.
- **Multi-tenancy:** Complete data isolation between families. No cross-family data leakage.
- **Data integrity:** Balance calculations derived from transaction data (single source of truth). DailyBalance and LoanBalance are caches, recalculable.
- **Multi-currency:** Stored per-transaction. Display conversions optional (future phase).

---

## 10. Phased Rollout

| Phase | Scope |
|---|---|
| **Phase 1 — MVP** | Auth, single family creation, daily ledger, add/edit/delete transactions, balance + loan calculation, person management, basic category tags & payment modes (predefined) |
| **Phase 2 — Config & Reports** | Admin panel (custom tags, payment modes, member invites, role management), monthly summary, category breakdown |
| **Phase 3 — Multi-Family & Analytics** | Multi-family support, family switcher, full analytics dashboard, PWA/offline support, data export, multi-currency |

---

## 11. Decisions Captured

- **Roles:** Admin + Family + Person (Child) — three-tier, scoped per family
- **Family model:** Family Account is a "person" (joint account); persons are individuals with a loan balance owed to the family
- **Multi-family:** Any user can create/join multiple families; complete data isolation between families
- **Loan logic:** Determined by payment mode ownership × paid-towards field (see §4.3 matrix)
- **Transaction types:** Debits = all spends + money sent; Credits = refunds + money received; Payments = CC payments + bill settlements
- **Multi-currency:** Supported (INR default)
- **Payment modes:** User-configurable, each owned by family or a specific person
- **Category tags:** User-configurable, per-family
- **Notifications:** None for now (may add later)
- **Analytics:** Full dashboard in Phase 3
