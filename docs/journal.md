# SpendBook — Engineering Journal

> Decision log, step-by-step thinking, and lessons learned.
> Useful for junior devs to understand *why* things were done a certain way.
> Also great interview prep — explains trade-offs, patterns, and real-world reasoning.

---

## Table of Contents

1. [Session 1: Project Scaffolding & Architecture](#session-1-project-scaffolding--architecture-2026-03-02)

---

## Session 1: Project Scaffolding & Architecture (2026-03-02)

### Goal

Set up the project folder structure, documentation, and AI coding guidelines before writing any application code.

---

### Step 1: Understand the Requirements First

**What we did:** Read through all existing documentation — the original idea notes, PRD, tech stack evaluation, and implementation plan.

**Why this matters:**
- Before writing a single line of code, you need to understand the *domain*. SpendBook isn't just a CRUD app — it has a specific **loan balance calculation** that depends on payment mode ownership and "paid towards" fields.
- Skipping this step leads to wrong abstractions, missed edge cases, and expensive rewrites later.

**Interview insight:** When asked "How do you approach a new project?", the answer is: *read the requirements, understand the domain model, then plan the architecture before coding.*

---

### Step 2: Design the Folder Structure

**Decision: Use Next.js App Router with route groups**

We organized routes into two groups:
- `(auth)/` — login, register (public pages)
- `(dashboard)/` — ledger, summary, analytics, settings (protected pages)

**Why route groups?**
- Route groups (parentheses folders) in Next.js **don't affect the URL**. `/ledger` is the URL, not `/(dashboard)/ledger`.
- They let us apply different **layouts** — the auth pages have a centered card layout, while dashboard pages share a sidebar + header.
- This is a clean separation of concerns: unauthenticated vs. authenticated experiences.

**Alternative considered:** Flat route structure without groups.
- **Rejected because:** We'd have to handle layout switching with conditionals, which is messy and error-prone. Route groups are the idiomatic Next.js way.

**Interview insight:** This demonstrates understanding of Next.js App Router conventions and layout composition.

---

### Step 3: Separate Concerns in the src/ Directory

**Decision: Split into `components/`, `lib/`, `server/`, `hooks/`, `types/`, `config/`**

```
src/
├── components/    → UI (what the user sees)
├── lib/           → Shared utilities (auth, db, helpers)
├── server/        → Backend logic (actions for writes, queries for reads)
├── hooks/         → Client-side React hooks
├── types/         → TypeScript type definitions
└── config/        → Constants, enums, app-wide settings
```

**Why this split?**
- **`server/actions/`** holds Server Actions (mutations). These are `"use server"` files that handle form submissions, creates, updates, deletes. They validate input, check auth, mutate the DB, and return a result.
- **`server/queries/`** holds data-fetching functions. These are called from Server Components to load data. They're *not* Server Actions — they're regular async functions.
- This separation makes it obvious: *actions mutate, queries read*.

**Why not put everything in `lib/`?**
- `lib/` is for generic utilities (Prisma client, auth config, helper functions). Business logic should live in `server/` where it's clearly organized by purpose.

**Interview insight:** "How do you organize a Next.js project?" — explain the actions/queries split, the difference between Server Components and Server Actions, and why separation of concerns matters for maintainability.

---

### Step 4: Move Documentation to docs/

**Decision: All documentation lives in `docs/` with kebab-case naming**

```
docs/
├── PRD.md
├── requirements.md        (was "My Requirement.md")
├── tech-stack.md           (was "Tech Stack.md")
├── implementation-plan.md  (was "Implementation Plan.md")
├── memory.md               (new — progress tracker)
└── journal.md              (new — this file)
```

**Why?**
- Keeps the project root clean — only config files and READMEs should live at root.
- `kebab-case` is the standard for documentation files (no spaces in filenames prevents CLI issues).
- `memory.md` acts as a session-to-session handoff document. When you (or an AI) start a new session, read memory.md first to know what's done and what's next.
- `journal.md` (this file) captures the *thinking* behind decisions. Code tells you *what* was done; the journal tells you *why*.

**Interview insight:** Good engineers document decisions, not just code. Future you (or your team) will thank you when they need to understand why a certain approach was chosen.

---

### Step 5: Create the Copilot Instructions

**Decision: Put AI instructions in `.github/copilot-instructions.md`**

This file tells GitHub Copilot (and any AI assistant) how to write code for this project. It includes:

1. **Domain context** — what the app does, the loan impact matrix
2. **Tech stack** — exact versions and libraries
3. **Folder structure** — where files go
4. **Coding standards** — TypeScript strict mode, Server Components by default, Tailwind only, Zod validation
5. **Git commit convention** — Conventional Commits, one commit per logical change block
6. **Code patterns** — Server Action template, Query template, Component template

**Why is this important?**
- Without instructions, AI generates generic code that doesn't match your project's conventions.
- With good instructions, AI becomes a 10x productivity tool — it generates code that *fits* your architecture.
- The patterns section is especially powerful — AI will follow your Server Action pattern consistently across the entire codebase.

**Interview insight:** AI-assisted development is a real skill. Knowing how to *guide* an AI (prompt engineering, context setting) is increasingly valuable.

---

### Step 6: Git Commit Strategy

**Decision: Conventional Commits, single-line, one commit per change block**

Format: `<type>(<scope>): <short description>`

**What is a "change block"?**
- A change block is a set of related line changes across potentially many files, all for one logical feature or fix.
- Example: Adding the "create transaction" feature touches the Prisma schema, a Server Action, a Zod validator, and a React form component. That's **one commit**: `feat(transaction): implement create transaction with validation`.
- But if you also fix a typo in the README during the same session, that's a **separate commit**: `docs(readme): fix typo in setup instructions`.

**Why Conventional Commits?**
- They're machine-parseable — tools like `semantic-release` can auto-generate changelogs and version bumps.
- They communicate intent at a glance — `feat` vs `fix` vs `refactor` tells you *what kind* of change it is.
- They're an industry standard used by Angular, Vue, Prisma, and many major open-source projects.

**Interview insight:** Understanding commit hygiene shows engineering maturity. Interviewers notice clean git history.

---

### Step 7: Financial Data Decisions

**Decision: Use integer cents (or Prisma Decimal) for money — never `number` (float)**

**Why?**
- JavaScript `number` uses IEEE 754 floating-point. `0.1 + 0.2 !== 0.3` in JavaScript.
- For a financial app, this is unacceptable. A ₹0.01 rounding error compounded over thousands of transactions creates real discrepancies.
- Prisma's `Decimal` type maps to PostgreSQL's `DECIMAL`/`NUMERIC`, which does exact arithmetic.
- Alternative: store amounts as **integer cents** (₹250.50 → `25050`). Simpler math, no floating-point issues. Display conversion happens at the UI layer.

**Interview insight:** This is a classic interview topic: "How do you handle money in software?" The answer: *never use floats. Use Decimal types or integer cents.*

---

### Step 8: Multi-Tenancy Strategy

**Decision: Family-scoped queries with `family_id` on every table**

**How it works:**
- Every table that holds tenant-specific data has a `family_id` column.
- Every query includes `WHERE family_id = ?` scoped to the current user's active family.
- The active family comes from the session (Auth.js JWT contains the user's selected family).

**Why not separate databases per family?**
- Overkill for a family app. Separate DBs add complexity (connection management, migrations across DBs, higher cost).
- Row-level scoping with `family_id` is the standard approach for SaaS multi-tenancy at this scale.
- PostgreSQL Row-Level Security (RLS) can add a DB-level guard as a defense-in-depth layer (Phase 5).

**Why not just use Supabase RLS?**
- We *can* layer it on later, but the application should enforce tenant isolation regardless. RLS is a safety net, not the primary mechanism.
- This way, if we ever switch from Supabase to another Postgres host, our isolation logic still works.

**Interview insight:** Multi-tenancy is a common system design topic. Know the three approaches: (1) separate databases, (2) separate schemas, (3) shared schema with tenant ID. SpendBook uses approach 3.

---

### Lessons Learned

1. **Plan before you code.** We spent an entire session *just* setting up structure and documentation. No app code was written. This investment pays off massively in consistency and speed later.

2. **Folder structure is architecture.** How you organize files determines how easy it is to find things, how well concerns are separated, and how smoothly team collaboration works. Get it right early.

3. **AI instructions are leverage.** A well-written copilot instructions file means every future AI interaction produces code that matches your project's patterns. It's like onboarding a new team member once, permanently.

4. **Document decisions, not just code.** Code changes; the *reasoning* behind decisions is what junior devs (and future you) actually need to understand the system.

---

### Key Terms Glossary (for Junior Devs)

| Term | Meaning |
|---|---|
| **Route Group** | A Next.js folder in parentheses `(name)` that groups routes without affecting the URL path |
| **Server Component** | A React component that runs on the server. Cannot use `useState`, `useEffect`, or browser APIs. Default in Next.js App Router. |
| **Server Action** | A function marked with `"use server"` that runs on the server. Used for form handling and data mutations. |
| **Conventional Commits** | A commit message convention: `type(scope): description`. Enables automated tooling. |
| **Multi-tenancy** | One application serving multiple isolated customers (families, in our case). |
| **Loan balance** | In SpendBook: what a person owes the family. Increases with family-funded personal spends; decreases with personal-funded family spends. |
| **Zod** | A TypeScript-first schema validation library. Used to validate form data on both client and server. |
| **Prisma** | An ORM (Object-Relational Mapping) that provides type-safe database access for TypeScript. |
| **PWA** | Progressive Web App — a web app that can be installed on a device's home screen and work offline. |
| **ACID** | Atomicity, Consistency, Isolation, Durability — properties of reliable database transactions. Critical for financial data. |
