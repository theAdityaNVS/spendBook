# SpendBook Technology Report

**Date:** March 4, 2026  
**Branch:** feature/neon-auth  
**Status:** Post-Auth.js Migration & Package Cleanup

---

## Executive Summary

SpendBook is a full-stack family expense tracker built on **Next.js 15** with **PostgreSQL** (Neon), **Prisma ORM**, and **Neon Auth**. This report documents the current tech stack, production & development dependencies, removed packages, and future additions.

**Key Change:** Migrated from Auth.js (NextAuth v5) to Neon Auth, eliminating authentication-only dependencies. Removed 9 unused packages that were added speculatively for future features not yet implemented.

---

## Project Architecture

```
SpendBook (Next.js 15 App Router)
├── Frontend (React 19 + Tailwind CSS 4)
│   ├── Pages: Daily Ledger, Summary, Analytics, Settings
│   ├── Components: shadcn/ui (Radix primitives) + custom
│   └── State: Form state (useActionState), URL params (searchParams)
│
├── Backend (Next.js Server Actions + API Routes)
│   ├── Mutations: Transaction, Person, Family operations
│   ├── Queries: Ledger, Settings, Analytics data fetching
│   └── Auth: Neon Auth middleware + session management
│
├── Database (PostgreSQL via Neon)
│   ├── ORM: Prisma 6.4 (auto-generated client, migrations, studio)
│   ├── Schema: Users, Families, Persons, Transactions, Balances, PaymentModes
│   └── Transactions: Atomic loan balance recalculations
│
└── Hosting: Vercel (serverless, auto-deployments from GitHub)
```

---

## Production Dependencies (14 packages)

### Core Framework & Runtime

#### **`next`** ^15.5.12
- **What:** React meta-framework powered by Vercel
- **Why:** Full-stack framework combining:
  - App Router (file-based routing)
  - Server Components (default, no JS in browser)
  - Server Actions (form mutations without API boilerplate)
  - Middleware (auth redirects, session inspection)
  - Auto-bundling & code splitting
  - Built-in optimization (images, fonts, CSS)
- **Where used:** Every page, layout, component, and API route
- **Alternates:** Remix (more explicit), SvelteKit, Nuxt

#### **`react`** ^19.0.0 / **`react-dom`** ^19.0.0
- **What:** React core library and DOM rendering
- **Why:** Modern React 19 brings:
  - `useActionState` hook (form state management)
  - Automatic client component batching
  - Server Component support
- **Where used:** All components, hooks, root layout provider
- **Alternates:** Preact (smaller), SolidJS, Svelte

---

### Authentication & User Management

#### **`@neondatabase/auth`** 0.2.0-beta.1
- **What:** Managed authentication service tightly integrated with Neon PostgreSQL
- **Why:** 
  - Native PostgreSQL `auth.users` table (no external identity provider)
  - Automatic session management via signed cookies
  - Email/password, OAuth, magic links support
  - Built-in UI components for sign-in/sign-up pages
  - Zero external API calls for auth — all in-database
  - Replaces Auth.js (NextAuth v5) — much lighter
- **Where used:**
  - [src/lib/auth/server.ts](../src/lib/auth/server.ts) — Neon Auth instance creation
  - [src/lib/auth/client.ts](../src/lib/auth/client.ts) — Client-side auth client
  - [src/lib/auth/session.ts](../src/lib/auth/session.ts) — Custom session bridge to Prisma models
  - [src/middleware.ts](../src/middleware.ts) — Auth redirects
  - [src/app/auth/[path]/page.tsx](../src/app/auth/%5Bpath%5D/page.tsx) — Sign-in/sign-up pages
  - [src/app/account/[path]/page.tsx](../src/app/account/%5Bpath%5D/page.tsx) — User account management
  - [src/app/layout.tsx](../src/app/layout.tsx) — Neon Auth provider wrapper
- **Alternates:**
  - Auth.js (NextAuth v5) — removed due to weight and complexity
  - Clerk — proprietary, external API
  - Supabase Auth — for Supabase users, heavier
  - Lucia — self-hosted, lightweight alternative

---

### Database & ORM

#### **`@prisma/client`** ^6.4.1
- **What:** Auto-generated, type-safe database client for PostgreSQL
- **Why:**
  - Prevents SQL injection (parameterized queries)
  - Full TypeScript types from schema → no manual types
  - Relation eager-loading (joins in one call)
  - Automatic migrations tracking
  - Built-in `.create()`, `.update()`, `.findMany()` methods
  - Transaction support for atomic operations (loan recalculation)
  - Decimal type for financial calculations (no float rounding errors)
- **Where used:**
  - [src/lib/db.ts](../src/lib/db.ts) — Prisma client singleton
  - Every server action in [src/server/actions/](../src/server/actions/)
  - Every query in [src/server/queries/](../src/server/queries/)
  - [prisma/schema.prisma](../prisma/schema.prisma) — 214 lines of schema definition
- **Alternates:**
  - Drizzle ORM — lighter, no build step, raw SQL layer
  - Kysely — fully type-safe, more explicit
  - Raw `pg` library — less ergonomic, more control

---

### Validation & Data Integrity

#### **`zod`** ^3.24.1
- **What:** TypeScript-first schema validation library
- **Why:**
  - Validates all form inputs before server action processing
  - Schemas can be shared between client (input validation) and server (trust boundary)
  - Provides error messages for UI display
  - Prevents type coercion bugs in data mutations
  - Smaller bundle than Yup or ArkType
- **Where used:**
  - [src/lib/validators.ts](../src/lib/validators.ts) — Schema definitions
  - [src/server/actions/transaction.ts](../src/server/actions/transaction.ts) — Form validation
  - [src/server/actions/person.ts](../src/server/actions/person.ts) — Person create/update
  - [src/server/actions/onboarding.ts](../src/server/actions/onboarding.ts) — Family setup validation
- **Alternates:**
  - Valibot — smaller bundle (3KB vs 15KB)
  - Yup — older, heavier
  - ArkType — emerging, experimental

---

### UI Components & Styling

#### **`@radix-ui/react-dialog`** ^1.1.6
- **What:** Unstyled, accessible modal dialog primitive
- **Why:** W3C-compliant ARIA attributes, keyboard navigation, focus management
- **Where used:** [src/components/ui/dialog.tsx](../src/components/ui/dialog.tsx)
  - TransactionForm (add/edit transactions)
  - LedgerAddButton (open transaction modal)
- **Alternates:** Headless UI, Ark UI

#### **`@radix-ui/react-select`** ^2.1.6
- **What:** Unstyled accessible select/dropdown primitive
- **Why:** Custom styling + native accessibility
- **Where used:** [src/components/ui/select.tsx](../src/components/ui/select.tsx)
  - TransactionForm (person, category, payment mode selects)
- **Alternates:** Headless UI `Listbox`, Downshift

#### **`@radix-ui/react-label`** ^2.1.2
- **What:** Associated label primitive
- **Why:** Proper `htmlFor` linking for form accessibility
- **Where used:** [src/components/ui/label.tsx](../src/components/ui/label.tsx) → Form fields
- **Alternates:** Native HTML `<label>` (sufficient, but less composable)

#### **`@radix-ui/react-separator`** ^1.1.2
- **What:** Unstyled separator/divider primitive
- **Why:** Semantic `<hr>` replacement with ARIA role
- **Where used:** [src/components/ui/separator.tsx](../src/components/ui/separator.tsx) → Visual dividers
- **Alternates:** Native `<hr>` (sufficient)

#### **`@radix-ui/react-slot`** ^1.1.2
- **What:** Polymorphic slot primitive (enables `asChild` pattern)
- **Why:** Allows components to delegate to child without wrapper div
- **Where used:** [src/components/ui/button.tsx](../src/components/ui/button.tsx) — `asChild` prop
- **Alternates:** Manual `React.forwardRef` (verbose)

---

#### **`tailwindcss`** ^4.0.9 (in devDependencies)
- **What:** Utility-first CSS framework
- **Why:**
  - No CSS file writing — class-based styling
  - Small bundle (Tailwind purges unused classes)
  - Mobile-first responsive design (`md:`, `lg:` breakpoints)
  - Dark mode support via `dark:` variant
  - Consistent spacing/color scale (theme variables)
  - Built-in accessibility classes (focus states, screen readers)
- **Where used:** Every `.tsx` component (`className="..."`)
- **Alternates:** CSS Modules, styled-components, UnoCSS

#### **`class-variance-authority`** ^0.7.1
- **What:** Library for creating component variants with Tailwind classes
- **Why:**
  - Syntax sugar for conditional class combinations
  - Type-safe variant props (`variant="primary"`, `size="lg"`)
  - No string concatenation bugs
  - Commonly paired with shadcn/ui components
- **Where used:**
  - [src/components/ui/button.tsx](../src/components/ui/button.tsx) — Button size & color variants
  - [src/components/ui/badge.tsx](../src/components/ui/badge.tsx) — Badge variants
- **Alternates:** `tailwind-variants` (lighter), manual ternaries

#### **`clsx`** ^2.1.1 + **`tailwind-merge`** ^2.6.0
- **What:** Conditional class merging utilities
- **Why:** Prevents Tailwind class conflicts (e.g., `bg-red-500` + `bg-blue-500`)
  - `clsx` — conditional class list builder
  - `tailwind-merge` — deduplicates Tailwind classes
  - Together they create the `cn()` utility used everywhere
- **Where used:** [src/lib/utils.ts](../src/lib/utils.ts) → `cn()` function
  - Used in every styled component for conditional styles
- **Alternates:** `twMerge` alone (sufficient if no complex logic)

---

### Icons & Visuals

#### **`lucide-react`** ^0.469.0
- **What:** Tree-shakable SVG icon library
- **Why:**
  - ~400+ icons with consistent design
  - Bundler removes unused icons (tree-shaking)
  - Lightweight (~0.5KB per icon)
  - High-quality, customizable via size/stroke props
- **Where used:** UI throughout:
  - [src/components/layout/Sidebar.tsx](../src/components/layout/Sidebar.tsx) — Navigation icons
  - [src/components/layout/BottomNav.tsx](../src/components/layout/BottomNav.tsx) — Mobile nav icons
  - Forms, buttons, cards (Pencil, Trash2, Plus, ChevronLeft, etc.)
- **Alternates:** Heroicons, Phosphor, Tabler Icons

---

### User Feedback

#### **`sonner`** ^1.7.4
- **What:** Rich toast notification library (built on Radix)
- **Why:**
  - Minimal, fast notifications for form success/error
  - Position customization (top-right by default)
  - Auto-dismiss with customizable duration
  - Promise-based API for async toast chains
  - Light bundle (~3KB)
- **Where used:**
  - [src/app/layout.tsx](../src/app/layout.tsx) — Global Toaster provider
  - [src/components/transaction/TransactionForm.tsx](../src/components/transaction/TransactionForm.tsx) — Success/error toasts
  - [src/components/transaction/TransactionCard.tsx](../src/components/transaction/TransactionCard.tsx) — Delete action feedback
  - [src/components/settings/PersonList.tsx](../src/components/settings/PersonList.tsx) — Person CRUD feedback
- **Alternates:** react-hot-toast, `@radix-ui/react-toast` (not in use)

---

## Development Dependencies (15 packages)

### Build & Database Tools

#### **`prisma`** ^6.4.1
- **What:** Prisma CLI for migrations, codegen, and IDE
- **How used:**
  - `pnpm db:migrate` — Run pending migrations
  - `pnpm db:generate` — Regenerate Prisma client types
  - `pnpm db:studio` — GUI for database inspection
- **Scripts:** `build` step runs `prisma generate && prisma migrate deploy`

#### **`typescript`** ^5.7.3
- **What:** TypeScript compiler
- **Why:** Type safety throughout (strict mode)
- **Used by:** IDE, `pnpm type-check`, `pnpm build`

#### **`@tailwindcss/postcss`** ^4.0.9
- **What:** Tailwind's PostCSS plugin (CSS preprocessor)
- **Why:** Compiles `@apply`, `@layer` directives in `globals.css`

---

### Linting & Formatting

#### **`eslint`** ^9.0.0 + **`eslint-config-next`** ^15.2.0
- **What:** JavaScript/TypeScript linter with Next.js rules
- **Enforces:**
  - No `<img>` without `<Image>` (Next.js optimization)
  - No async Client Component patterns
  - No `eval()` or dangerous globals
  - React hooks rules of hooks
- **Used:** `pnpm lint`

#### **`@eslint/eslintrc`** ^3.3.4
- **What:** ESLint flat config compatibility layer
- **Why:** Enables modern flat config format in `eslint.config.mjs`

#### **`prettier`** ^3.4.2 + **`prettier-plugin-tailwindcss`** ^0.6.11
- **What:** Code formatter + Tailwind class sorter
- **Why:**
  - Consistent code style (brackets, quotes, semicolons)
  - Tailwind plugin automatically sorts classes (`bg-blue-500 text-white` → alphabetical)
- **Used:** `pnpm format`, git pre-commit hook

#### **`husky`** ^9.1.7 + **`lint-staged`** ^15.4.3
- **What:** Git hooks + staged file runner
- **What it does:** Before every commit:
  - Run eslint --fix on `*.ts, *.tsx` files
  - Run prettier --write on all staged files
  - Prevents committing linting/formatting errors
- **Config:** `.husky/pre-commit`, `.lint-staged` in package.json

---

### Testing

#### **`vitest`** ^3.0.5 + **`@vitejs/plugin-react`** ^4.3.4
- **What:** Fast unit test runner built on Vite
- **Why:**
  - ~10x faster than Jest (no JSDOM overhead by default)
  - Imports same as source (no module resolver issues)
  - TypeScript native support
  - Snapshot testing, mocking, and coverage
- **Used:** `pnpm test`
- **Alternates:** Jest (heavier), Vitest (chosen for speed)

#### **`@playwright/test`** ^1.50.1
- **What:** End-to-end browser testing framework
- **Why:**
  - Tests real browser behavior (clicks, navigation, forms)
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Screenshot & video recording on failure
  - Mobile device simulation
- **Used:** `pnpm test:e2e`
- **Alternates:** Cypress, Puppeteer

---

### Utilities

#### **`tsx`** ^4.19.2
- **What:** TypeScript executor for Node.js
- **Why:** Run `prisma/seed.ts` as TypeScript directly (no ts-node)
- **Used:** `pnpm db:seed`, `postinstall` hook for Prisma generation

#### **Type Definitions**
- **`@types/node`** ^20.17.17 — Node.js API types
- **`@types/react`** ^19.0.0 — React API types
- **`@types/react-dom`** ^19.0.0 — React DOM API types

---

## Removed Packages (Post-Migration Cleanup)

**Date removed:** March 4, 2026  
**Reason:** Speculatively added for future features not yet implemented

| Package | Size | Reason for Removal |
|---|---|---|
| `@radix-ui/react-avatar` | 2.1 KB | Avatar component UI not planned |
| `@radix-ui/react-dropdown-menu` | 4.2 KB | No context menus implemented yet |
| `@radix-ui/react-popover` | 3.8 KB | No popovers/date-pickers used |
| `@radix-ui/react-tabs` | 3.5 KB | No tabbed interfaces in current design |
| `@radix-ui/react-toast` | 2.3 KB | `sonner` provides all toast functionality |
| `@radix-ui/react-toggle` | 1.9 KB | Toggle buttons not in design |
| `@radix-ui/react-tooltip` | 2.8 KB | Tooltips not implemented |
| `date-fns` | 13.4 KB | Custom utils in [src/lib/utils.ts](../src/lib/utils.ts) sufficient |
| `recharts` | 18.2 KB | Analytics charts phase not built yet |
| **Total saved** | **~52 KB (gzip ~13 KB)** | |

### Removed Auth Packages (Earlier Migration)

| Package | Why Removed |
|---|---|
| `next-auth` | Replaced with Neon Auth |
| `@auth/prisma-adapter` | Neon Auth uses native PostgreSQL |
| `bcryptjs` | Neon Auth handles password hashing |

---

## Packages to Re-add (Future Phases)

| Package | When | Phase | Reason |
|---|---|---|---|
| `recharts` | Analytics page implementation | Phase 3 | Charts for spending trends, category breakdown |
| `@radix-ui/react-tooltip` | Hover help text | Phase 2 | Icon explanations, balance help |
| `@radix-ui/react-dropdown-menu` | User menu | Phase 2 | Account settings, sign out menu |
| `@radix-ui/react-tabs` | Settings tab panels | Phase 2 | If multi-tab settings layout |
| `@radix-ui/react-avatar` | User avatars | Phase 2 | If avatar support added |
| `@radix-ui/react-popover` | Advanced filters | Phase 3 | Date range, category filter popovers |

**Recommendation:** Add these only when actively implementing the feature. No speculative dependencies.

---

## Custom Utilities & Helpers

### [src/lib/utils.ts](../src/lib/utils.ts)
```typescript
// Class merging (clsx + tailwind-merge)
cn(...inputs: ClassValue[]): string

// Currency formatting (Indian Rupees by default)
formatCurrency(amount: number | string): string

// Date formatting
formatDate(date: Date | string): string        // "Mon, 3 Mar 2026"
toDateParam(date: Date): string                // "2026-03-04"
fromDateParam(param: string): Date             // Parses URL param to UTC Date
today(): Date                                   // Midnight UTC
addDays(date: Date, days: number): Date        // Date arithmetic
```

**Why no `date-fns`?** These helpers cover all current needs. `date-fns` would only be needed for complex date logic (recurring events, timezone math, etc.).

---

## Database Schema Overview

[prisma/schema.prisma](../prisma/schema.prisma) — 214 lines

**Core models:**
- **User** — Linked to Neon Auth via `neonAuthId`
- **Family** — Multi-tenant isolation root
- **UserFamily** — Bridge; `role` (Admin/Family/Person)
- **Person** — Family member or "Family Account"
- **PaymentMode** — Credit card, cash, UPI, etc. (owned by Family or Person)
- **Transaction** — Debit/Credit/Payment with loan impact
- **CategoryTag** — Expense classification
- **LoanBalance** — Cached person → family balance
- **DailyBalance** — Cached daily totals per person

**Financial Calculations:**
- Loan impact driven by: payment mode owner + "paid towards" field
- Atomic `prisma.$transaction()` for multi-step updates
- Uses `Decimal` type (Prisma) for money math (no floating-point errors)

---

## Architecture Decisions

### Why Neon Auth over Auth.js?

| Factor | Neon Auth | Auth.js |
|---|---|---|
| **Bundle size** | ~50 KB | ~150 KB+ |
| **External API calls** | None (DB-native) | OAuth flows (external) |
| **Database** | Tight PostgreSQL integration | Adapter system (loose coupling) |
| **Hosting** | Neon-native, Vercel-ready | Universal (more flexible) |
| **Vendor lock-in** | Yes (Neon-specific) | No |
| **Learning curve** | Lower (simple API) | Higher (many options) |

**Result:** Auth.js removed entirely. Neon Auth is baked into [src/lib/auth/server.ts](../src/lib/auth/server.ts) and [src/lib/auth/session.ts](../src/lib/auth/session.ts).

### Why Prisma ORM?

- **Type safety:** Generated types from schema (no manual interfaces)
- **Migration tracking:** Automatic `_migrations` table
- **Relations:** Eager-loading with `.include()` (no N+1 queries)
- **Financial data:** `Decimal` type prevents rounding errors
- **Transactions:** Atomic multi-step operations for loan recalculation
- **Hosting:** Works on Vercel (serverless)

### Why Tailwind CSS?

- **Bundle:** Purges unused classes (final CSS ~30KB)
- **Consistency:** Built-in design tokens (colors, spacing, breakpoints)
- **Responsive:** Mobile-first with `md:`, `lg:` breakpoints
- **Dark mode:** Toggle via `dark:` variant
- **No build overhead:** PostCSS plugin, zero runtime JS

### Why shadcn/ui + Radix?

- **Unstyled primitives:** Full control over look & feel
- **Accessibility:** W3C ARIA compliance built-in
- **Composability:** Reuse Radix logic; style with Tailwind
- **No vendor bloat:** Copy components into repo (no lock-in)

---

## Performance Characteristics

### Bundle Sizes (Production)

| Category | Size (gzip) | Notes |
|---|---|---|
| Next.js runtime | ~45 KB | Framework core |
| React + Hooks | ~40 KB | Library core |
| Tailwind CSS | ~30 KB | Utility classes (purged) |
| Radix primitives | ~25 KB | Dialog, Select, Label, Separator, Slot |
| Lucide icons | ~8 KB | Used icons only (tree-shakable) |
| Sonner toasts | ~3 KB | Toast library |
| **Total JS (with deps)** | **~180 KB** | (gzip, one-time download) |

### Runtime Performance

- **Server Components by default** — Zero JS for static content
- **Server Actions** — Form submissions without API boilerplate
- **Image optimization** — Next.js Image component (lazy, responsive)
- **Code splitting** — Per-route JS bundles
- **Caching:** HTTP & revalidation strategies per page

---

## Environment Variables

Required in `.env.local` (not in repo):

```bash
# Database
DATABASE_URL="postgresql://user:password@db.neon.tech/spendbook"

# Neon Auth
NEON_AUTH_BASE_URL="https://spendbook.vercel.app"  # Deployed URL for auth callbacks
NEON_AUTH_COOKIE_SECRET="..."                      # 32-byte base64 secret for session signing
```

---

## Deployment

**Host:** Vercel (serverless)

**Build command:** `pnpm build`
```
1. Generate Prisma client types (`prisma generate`)
2. Run pending migrations (`prisma migrate deploy`)
3. Build Next.js (`next build`)
```

**Start command:** `pnpm start`

**Environment:** Set Neon connection string & auth secrets in Vercel dashboard

---

## Conclusion

SpendBook's tech stack is **modern, lean, and production-ready**:

✅ **Type-safe end-to-end** (TypeScript, Prisma, Zod)  
✅ **Minimal dependencies** — 14 prod packages (removed 9 unused)  
✅ **Zero vendor lock-in on auth** — Neon Auth is PostgreSQL-native  
✅ **Accessibility-first UI** — Radix primitives + Tailwind  
✅ **Optimized performance** — Server-first, code splitting, image optimization  
✅ **Developer experience** — Hot reloading, easy migrations, Prisma Studio  

**Next steps:** Continue building Phase 2 (settings, analytics) without speculatively adding packages.
