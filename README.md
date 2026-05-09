# SpendBook

A family expense tracker web app — track debits, credits, and payments across family members with a daily ledger, loan balances, and analytics.

## Tech Stack

Next.js 15 · TypeScript · Tailwind CSS 4 · Radix UI · PostgreSQL (Neon) · Prisma · Neon Auth · Recharts · Vercel

## Documentation

| Document                                                   | Description                             |
| ---------------------------------------------------------- | --------------------------------------- |
| [docs/PRD.md](docs/PRD.md)                                 | Full Product Requirements Document      |
| [docs/state-of-project.md](docs/state-of-project.md)       | Current status & feature checklist      |
| [docs/tech-report.md](docs/tech-report.md)                 | Deep dive into architecture & dependencies |
| [docs/memory.md](docs/memory.md)                           | Progress tracker (updated each session) |
| [docs/journal.md](docs/journal.md)                         | Decision log & learning journal         |

## Project Structure

```
spendBook/
├── docs/                              ← All project documentation
├── src/
│   ├── app/                           ← Next.js App Router pages
│   │   ├── auth/                      ← Sign-in, Sign-up (Neon Auth)
│   │   ├── account/                   ← User settings (Neon Auth)
│   │   └── (dashboard)/              ← Ledger, Summary, Analytics, Settings
│   ├── components/                    ← React components (ui, layout, feature-specific)
│   ├── lib/                           ← Shared utilities (db, auth, utils, validators)
│   ├── server/                        ← Server Actions (mutations) & Queries (reads)
│   ├── types/                         ← TypeScript type definitions
│   └── config/                        ← Constants, enums, app config
├── prisma/                            ← Database schema & migrations
└── tests/                             ← Unit, integration, E2E tests
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and Neon Auth secrets

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## Status

**Phase:** 3 — Cross-Family Analytics & Export (In Progress)

The core MVP is fully functional with a premium UI redesign completed for the ledger, transactions, summaries, and settings. A functional analytics preview is also available.

See [docs/memory.md](docs/memory.md) for detailed progress.
