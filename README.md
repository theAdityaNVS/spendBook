# SpendBook

A family expense tracker web app — track debits, credits, and payments across family members with a daily ledger, loan balances, and analytics.

## Tech Stack

Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · PostgreSQL · Prisma · Auth.js · Recharts · Vercel

## Documentation

| Document | Description |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Full Product Requirements Document |
| [docs/requirements.md](docs/requirements.md) | Original idea notes |
| [docs/tech-stack.md](docs/tech-stack.md) | Tech stack evaluation with pros/cons |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Phased rollout plan — MVP to full scale |
| [docs/memory.md](docs/memory.md) | Progress tracker (updated each session) |
| [docs/journal.md](docs/journal.md) | Decision log & learning journal |

## Project Structure

```
spendBook/
├── .github/copilot-instructions.md   ← AI coding guidelines
├── docs/                              ← All project documentation
├── src/
│   ├── app/                           ← Next.js App Router pages
│   │   ├── (auth)/                    ← Login, Register
│   │   └── (dashboard)/              ← Ledger, Summary, Analytics, Settings
│   ├── components/                    ← React components (ui, layout, feature-specific)
│   ├── lib/                           ← Shared utilities (db, auth, utils, validators)
│   ├── server/                        ← Server Actions (mutations) & Queries (reads)
│   ├── hooks/                         ← Custom React hooks
│   ├── types/                         ← TypeScript type definitions
│   └── config/                        ← Constants, enums, app config
├── prisma/                            ← Database schema & migrations
├── public/                            ← Static assets & PWA icons
└── tests/                             ← Unit, integration, E2E tests
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and auth secret

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## Status

**Phase:** 1.1 — Project Setup (scaffolding complete, awaiting Next.js initialization)

See [docs/memory.md](docs/memory.md) for detailed progress.
