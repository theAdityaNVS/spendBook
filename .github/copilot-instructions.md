# SpendBook — Copilot Instructions

> These instructions guide GitHub Copilot (and any AI assistant) when working on this codebase.
> Read this file completely before generating any code.

---

## Project Overview

**SpendBook** is a family expense tracker web app. It replaces a manual iPad-based daily ledger with a responsive, multi-tenant web application. Families track **Debits** (spends), **Credits** (refunds/income), and **Payments** (settlements) per person, with automatic **loan balance** calculations based on payment mode ownership and the "paid towards" field.

### Key Domain Concepts

- **Family** — top-level tenant. All data is scoped to a family. Complete isolation between families.
- **Family Account** — a built-in, non-removable "person" representing the household's joint finances.
- **Person** — an individual family member with a **loan balance** (what they owe the family).
- **Loan Balance** — increases when a person uses family payment modes for personal spends; decreases when a person pays on behalf of family.
- **Daily Ledger** — the home view. One page per day, showing all transactions grouped by type and person, with balance cards at the bottom.
- **Payment Mode Ownership** — each payment mode is owned by either the Family or a specific Person. This, combined with "Paid Towards" (Personal/Family), determines loan impact.

### Loan Impact Matrix (Critical Business Logic)

| Payment Mode Owner | Paid Towards | Loan Effect |
|---|---|---|
| Family mode | Personal | +Loan (person owes more) |
| Family mode | Family | No change (family expense) |
| Person's own mode | Personal | No change (stats only) |
| Person's own mode | Family | −Loan (repayment) |

**This matrix must be implemented exactly. It is the core financial logic of the app.**

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15+ |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui (Radix primitives) | latest |
| Backend | Next.js Server Actions + API Routes | — |
| Database | PostgreSQL (Supabase or Neon) | 16+ |
| ORM | Prisma | 6.x |
| Auth | Auth.js (NextAuth v5) | 5.x |
| Charts | Recharts | 2.x |
| PWA | Serwist | latest |
| Hosting | Vercel | — |
| Package Manager | pnpm | 9.x |

---

## Project Structure

```
spendBook/
├── .github/
│   └── copilot-instructions.md    ← YOU ARE HERE
├── docs/
│   ├── PRD.md                     ← Product Requirements Document
│   ├── requirements.md            ← Original idea notes
│   ├── tech-stack.md              ← Stack evaluation & decisions
│   ├── implementation-plan.md     ← Phased rollout plan
│   ├── memory.md                  ← Progress tracker (update after each session)
│   └── journal.md                 ← Decision log & learning journal
├── src/
│   ├── app/                       ← Next.js App Router pages
│   │   ├── (auth)/                ← Auth route group (login, register)
│   │   ├── (dashboard)/           ← Authenticated route group
│   │   │   ├── ledger/            ← Daily ledger (home)
│   │   │   ├── summary/           ← Monthly summary
│   │   │   ├── analytics/         ← Charts & insights
│   │   │   └── settings/          ← Admin panel
│   │   ├── layout.tsx             ← Root layout
│   │   ├── page.tsx               ← Landing / redirect
│   │   └── globals.css            ← Tailwind directives
│   ├── components/
│   │   ├── ui/                    ← shadcn/ui primitives
│   │   ├── layout/                ← Header, sidebar, nav
│   │   ├── ledger/                ← Daily ledger components
│   │   ├── transaction/           ← Transaction form, cards
│   │   └── analytics/             ← Chart wrappers, summary cards
│   ├── lib/
│   │   ├── db.ts                  ← Prisma client singleton
│   │   ├── auth.ts                ← Auth.js config
│   │   ├── utils.ts               ← Utility functions (cn, formatCurrency)
│   │   └── validators.ts          ← Zod schemas
│   ├── server/
│   │   ├── actions/               ← Server Actions (mutations)
│   │   └── queries/               ← Data fetching functions
│   ├── hooks/                     ← Custom React hooks
│   ├── types/                     ← TypeScript type definitions
│   └── config/                    ← Constants, enums, app config
├── prisma/
│   └── schema.prisma              ← Database schema
├── public/                        ← Static assets
├── tests/
│   ├── unit/                      ← Vitest unit tests
│   ├── integration/               ← Integration tests
│   └── e2e/                       ← Playwright E2E tests
├── .env.example                   ← Environment variable template
├── .gitignore
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Coding Standards

### TypeScript
- **Strict mode** — always. No `any` types unless absolutely unavoidable (document why with `// eslint-disable-next-line`).
- Prefer `interface` for object shapes; use `type` for unions, intersections, and mapped types.
- Use `const` by default; `let` only when reassignment is necessary. Never `var`.
- All functions must have explicit return types on exported functions and server actions.
- Use `Decimal` (via Prisma) or integer cents for money — never floating-point arithmetic for financial calculations.

### React & Next.js
- **Server Components by default** — only add `"use client"` when the component needs browser APIs, event handlers, or React hooks.
- Use Next.js **Server Actions** for mutations (forms, creates, updates, deletes). Defined in `src/server/actions/`.
- Use query functions in `src/server/queries/` for data fetching — called from Server Components.
- Colocate page-specific components near their page; shared components go in `src/components/`.
- All forms must validate with **Zod** schemas (shared between client and server).
- Use `useActionState` (React 19) for form submission state management.
- Prefer `<Link>` from `next/link` for navigation; programmatic navigation via `useRouter` only when necessary.

### Styling
- **Tailwind CSS only** — no inline styles, no CSS modules, no styled-components.
- Use the `cn()` utility (from `src/lib/utils.ts`) for conditional class merging.
- Follow shadcn/ui patterns: use CSS variables for theming (`--primary`, `--background`, etc.).
- Mobile-first responsive design: design for mobile, then scale up with `md:` and `lg:` breakpoints.
- Support dark mode using Tailwind's `dark:` variant.

### Database & Prisma
- All database access goes through Prisma — no raw SQL unless for complex analytics queries (document why).
- Every query must be scoped to the current family (`WHERE family_id = ?`). **Never leak data across families.**
- Use Prisma transactions (`prisma.$transaction`) for operations that modify multiple tables.
- Balance/loan recalculation must be atomic — wrap in a transaction.
- Index frequently queried columns: `family_id`, `person_id`, `date`, `type`.

### Auth & Security
- All dashboard routes require authentication — enforced in middleware.
- Role-based access (Admin/Family/Person) checked in Server Actions and queries.
- Never trust client-side role checks alone — always validate on the server.
- Sanitize all user inputs. Use Zod for validation.
- Never expose sensitive data (passwords, tokens) in client components or API responses.

### Error Handling
- Server Actions return `{ success: boolean; data?: T; error?: string }` — never throw from Server Actions.
- Use try/catch in all database operations.
- Show user-friendly error messages via toast (sonner) — not raw error strings.
- Log errors server-side with enough context for debugging.

---

## Git Commit Convention

Use **Conventional Commits** — single-line, imperative mood. Each commit message describes one logical change.

### Format

```
<type>(<scope>): <short description>
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `style` | Formatting, whitespace, missing semicolons (no logic change) |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `chore` | Build config, dependencies, tooling, CI |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

### Scope (Optional but Preferred)

Use the feature area: `auth`, `ledger`, `transaction`, `balance`, `settings`, `analytics`, `schema`, `ui`, `config`

### Examples

```
feat(ledger): add daily ledger page with date navigation
feat(transaction): implement create transaction server action
fix(balance): correct loan calculation for family-owned payment modes
refactor(schema): normalize payment mode ownership to separate column
style(ui): align transaction card spacing on mobile
docs(prd): update loan impact matrix with edge cases
test(balance): add unit tests for loan calculation engine
chore(deps): upgrade prisma to 6.1.0
chore(config): add eslint rule for no-explicit-any
ci(vercel): add preview deployment for PRs
```

### Rules

1. **One commit = one logical change.** If you change the schema and update queries for a feature, that's one commit. If you also fix a typo in docs, that's a separate commit.
2. **Imperative mood:** "add feature" not "added feature" or "adding feature".
3. **Lowercase** — no capital letters in the description.
4. **No period** at the end.
5. **Max 72 characters** for the subject line.
6. For a **change block** (set of line changes across many files for one feature), use a single commit that describes the feature/fix holistically.

---

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `BalanceCard.tsx`, `TransactionForm.tsx` |
| Pages (App Router) | `page.tsx` in route folder | `src/app/(dashboard)/ledger/page.tsx` |
| Layouts | `layout.tsx` in route folder | `src/app/(dashboard)/layout.tsx` |
| Server Actions | camelCase | `src/server/actions/createTransaction.ts` |
| Queries | camelCase | `src/server/queries/getDailyLedger.ts` |
| Hooks | camelCase with `use` prefix | `src/hooks/useTransaction.ts` |
| Types | PascalCase | `src/types/transaction.ts` |
| Utils/lib | camelCase | `src/lib/utils.ts` |
| Tests | `*.test.ts` / `*.test.tsx` | `tests/unit/balance.test.ts` |
| Docs | kebab-case | `docs/implementation-plan.md` |

---

## Development Workflow

1. **Before coding:** Check `docs/memory.md` for current progress and what's next.
2. **Pick a task** from `docs/implementation-plan.md` — work in phase order.
3. **Implement** following the coding standards above.
4. **Test** — write tests for business logic (especially balance/loan calculations).
5. **Commit** using the git convention above. One commit per logical change.
6. **Update `docs/memory.md`** — record what was completed, any blockers, next steps.
7. **Update `docs/journal.md`** — record any decisions made, alternatives considered, lessons learned.

---

## Key References

- [PRD](../docs/PRD.md) — full product requirements, data model, screens
- [Tech Stack](../docs/tech-stack.md) — technology choices and rationale
- [Implementation Plan](../docs/implementation-plan.md) — phased roadmap with tasks
- [Memory](../docs/memory.md) — current progress tracker
- [Journal](../docs/journal.md) — decision log and learning notes

---

## Common Patterns

### Server Action Pattern
```typescript
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createTransactionSchema } from "@/lib/validators"

export async function createTransaction(formData: FormData): Promise<ActionResult<Transaction>> {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const parsed = createTransactionSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { success: false, error: parsed.error.message }

    const transaction = await db.transaction.create({ data: { ...parsed.data, familyId: session.activeFamilyId } })
    // Recalculate balances...
    revalidatePath("/ledger")
    return { success: true, data: transaction }
  } catch (error) {
    console.error("createTransaction failed:", error)
    return { success: false, error: "Failed to create transaction" }
  }
}
```

### Query Pattern
```typescript
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getDailyLedger(date: Date) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.transaction.findMany({
    where: { familyId: session.activeFamilyId, date },
    include: { person: true, categoryTag: true, paymentMode: true },
    orderBy: { createdAt: "asc" },
  })
}
```

### Component Pattern
```typescript
// Server Component (default)
import { getDailyLedger } from "@/server/queries/getDailyLedger"
import { TransactionCard } from "@/components/transaction/TransactionCard"

export default async function LedgerPage() {
  const transactions = await getDailyLedger(new Date())
  return (
    <div>
      {transactions.map((t) => (
        <TransactionCard key={t.id} transaction={t} />
      ))}
    </div>
  )
}
```
