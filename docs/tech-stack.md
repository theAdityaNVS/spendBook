# SpendBook — Tech Stack

> Chosen stack and alternatives evaluated. Decisions finalized on 2026-03-02.

---

## Chosen Stack

| Layer | Choice | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 15+ |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | latest |
| **Backend/API** | Next.js Server Actions + API Routes | — |
| **Database** | PostgreSQL | 16+ |
| **DB Hosting** | Supabase or Neon (managed) | — |
| **ORM** | Prisma | 6.x |
| **Auth** | NextAuth.js (Auth.js v5) | 5.x |
| **Charts** | Recharts | 2.x |
| **PWA** | Serwist (next-pwa successor) | latest |
| **Hosting** | Vercel | — |
| **Package Manager** | pnpm | 9.x |

---

## Why This Stack?

### Next.js (Full-stack JS)

**Pros:**
- Single codebase for frontend + backend — faster development, simpler deploys
- Server-side rendering (SSR) + static generation (SSG) for fast page loads
- App Router with Server Components — reduced client JS bundle
- Server Actions for form mutations — no separate API layer needed
- Excellent Vercel integration — zero-config deployment
- Massive ecosystem, strong community support
- Built-in image optimization, font loading, metadata API

**Cons:**
- Not Java (if Java expertise is preferred)
- Vercel-optimized — some features work best on Vercel
- Server Components paradigm has a learning curve

**Alternatives considered:**

| Option | Why Not |
|---|---|
| Spring Boot + React SPA | Two codebases, two deploys, more infra to manage, slower iteration for a small team |
| Spring Boot + Next.js | Most complex setup — Java backend + Node frontend, two runtimes, overkill for this scope |
| Remix | Smaller ecosystem, fewer UI libraries, less community momentum |

---

### PostgreSQL (Supabase/Neon)

**Pros:**
- Relational model is ideal for financial data (transactions, balances, joins)
- ACID compliance — critical for money calculations
- Supabase/Neon offer generous free tiers (Supabase: 500MB, Neon: 512MB)
- Branching support (Neon) — great for preview deployments
- Connection pooling built-in (Supabase via PgBouncer, Neon serverless driver)
- Rich aggregation functions for analytics queries
- Row-level security (Supabase) for additional tenant isolation

**Cons:**
- External hosting dependency
- Connection limits on free tier
- Cold starts on serverless Neon (minimal, ~100ms)

**Alternatives considered:**

| Option | Why Not |
|---|---|
| PostgreSQL (self-hosted) | Requires managing backups, scaling, uptime, SSL — unnecessary overhead |
| MongoDB | Not ideal for relational financial data; harder aggregations; no ACID by default across documents |
| MySQL | Fewer modern managed options; less feature-rich than Postgres (no JSONB, weaker window functions) |
| SQLite (Turso) | Good for small scale but limited concurrency; harder to scale for multi-family multi-user |

---

### Vercel

**Pros:**
- Zero-config deployment for Next.js — push to git, it deploys
- Automatic preview deployments per PR
- Edge functions for low-latency API routes
- Built-in analytics and speed insights
- Generous free tier (100GB bandwidth, serverless functions)
- Custom domains, automatic SSL

**Cons:**
- Vendor lock-in (some Next.js features are Vercel-optimized)
- Serverless function timeout limits (10s free, 60s pro)
- Cold starts on serverless functions (~200ms)
- Costs can increase with traffic (but fine for family-scale app)

**Alternatives considered:**

| Option | Why Not |
|---|---|
| AWS (EC2/ECS) | Overkill infrastructure complexity for a family app; higher cost floor |
| Railway / Render | Good alternatives, but less Next.js-optimized; smaller ecosystem |
| Self-hosted VPS | Full control but manual SSL, CI/CD, backups — too much ops overhead |

---

### Prisma ORM

**Pros:**
- Type-safe database queries — catches errors at compile time
- Auto-generated TypeScript types from schema
- Declarative schema with easy migrations
- Excellent developer experience with Prisma Studio (GUI)
- Supports PostgreSQL natively
- Relations, filtering, pagination built-in

**Cons:**
- Generated client adds bundle size
- Complex raw queries sometimes needed for advanced analytics
- Migration management requires care in production

---

### Auth.js (NextAuth v5)

**Pros:**
- Built for Next.js — integrates with App Router and middleware
- Email/password + social login (Google, GitHub) out of the box
- Session management with JWT or database sessions
- Role-based access can be layered on top
- Active development, large community

**Cons:**
- Email/password (Credentials provider) is less maintained than OAuth flows
- No built-in role management — needs custom implementation
- Breaking changes between v4 and v5

---

### shadcn/ui + Tailwind CSS

**Pros:**
- Components are copied into your codebase — full ownership, no dependency lock-in
- Built on Radix UI primitives — accessible, keyboard-navigable
- Tailwind utility classes — rapid UI development, consistent design
- Dark mode support built-in
- Highly customizable — each component can be modified freely
- Growing ecosystem of extensions and themes

**Cons:**
- Not a traditional component library — you maintain the component code
- Initial setup of design tokens/theme takes effort
- Tailwind has a learning curve if unfamiliar

---

### Recharts

**Pros:**
- Built for React — declarative API
- Responsive and mobile-friendly charts
- Lightweight compared to D3.js
- Good documentation, active maintenance
- Supports all chart types needed (line, bar, pie/donut, area)

**Cons:**
- Less customizable than raw D3.js for very complex visualizations
- Bundle size (~200KB) — but tree-shakeable

**Alternative:** Chart.js (via react-chartjs-2) — slightly more chart types but less React-native API.

---

## Dev Tooling

| Tool | Purpose |
|---|---|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Git hooks (pre-commit lint/format) |
| **lint-staged** | Run lint/format only on staged files |
| **Vitest** | Unit/integration testing |
| **Playwright** | E2E testing |
| **GitHub Actions** | CI/CD pipeline |

---

## Decision Summary

| Decision | Choice | Key Reason |
|---|---|---|
| Full-stack framework | Next.js | Single codebase, SSR, Server Actions, Vercel-native |
| Database | PostgreSQL (Supabase/Neon) | Relational, ACID, free managed tier, great for financial data |
| Hosting | Vercel | Zero-config, preview deploys, edge functions |
| ORM | Prisma | Type-safe, great DX, auto-generated types |
| Auth | Auth.js v5 | Built for Next.js, extensible, OAuth + credentials |
| UI | shadcn/ui + Tailwind | Owned components, accessible, rapid development |
| Charts | Recharts | React-native, responsive, lightweight |
| PWA | Serwist | Offline support, installable on iPad/mobile |
