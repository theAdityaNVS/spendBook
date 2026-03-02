# SpendBook — Progress Memory

> This file tracks what has been done, what's in progress, and what's next.
> **Update this file at the end of every coding session.**

---

## Current Status

| Field | Value |
|---|---|
| **Current Phase** | Phase 1 — MVP: Core Expense Tracking |
| **Current Sub-Phase** | 1.1 — Project Setup |
| **Status** | In Progress |
| **Last Updated** | 2026-03-02 |

---

## Completed

### Session 1 — 2026-03-02 (Project Scaffolding)

- [x] Created initial project documentation (PRD, Tech Stack, Implementation Plan, Requirements)
- [x] Set up `.gitignore` for Next.js project
- [x] Restructured project folders:
  - Moved documentation into `docs/` with kebab-case naming
  - Created `src/` directory with App Router structure (`app/`, `components/`, `lib/`, `server/`, `hooks/`, `types/`, `config/`)
  - Created route groups: `(auth)/login`, `(auth)/register`, `(dashboard)/ledger`, `(dashboard)/summary`, `(dashboard)/analytics`, `(dashboard)/settings`
  - Created component directories: `ui/`, `layout/`, `ledger/`, `transaction/`, `analytics/`
  - Created `prisma/` directory with placeholder schema
  - Created `tests/` directory with `unit/`, `integration/`, `e2e/` sub-folders
  - Created `public/icons/` for PWA assets
  - Created `.env.example` with required environment variables
- [x] Generated `.github/copilot-instructions.md` — comprehensive AI coding guidelines
- [x] Generated `docs/memory.md` — this file (progress tracker)
- [x] Generated `docs/journal.md` — decision log and learning journal
- [x] Updated `README.md` with new folder structure and quick-start guide

---

## In Progress

- [ ] Phase 1.1: Initialize Next.js 15 project with TypeScript, Tailwind, pnpm (`pnpm create next-app`)
- [ ] Phase 1.1: Install and configure shadcn/ui
- [ ] Phase 1.1: Set up ESLint, Prettier, Husky, lint-staged
- [ ] Phase 1.1: Set up PostgreSQL database (Supabase or Neon)
- [ ] Phase 1.1: Initialize Prisma with full schema
- [ ] Phase 1.1: Run first migration
- [ ] Phase 1.1: Deploy skeleton app to Vercel

---

## Blockers

_None currently._

---

## Next Up (Queue)

1. Complete Phase 1.1 — Project Setup (initialize Next.js, install deps, configure tooling)
2. Phase 1.2 — Authentication (Auth.js v5 setup, login/register pages)
3. Phase 1.3 — Family & Person Setup (auto-create family, add person form, seed data)
4. Phase 1.4 — Transaction CRUD (add/edit/delete transaction form + server actions)
5. Phase 1.5 — Daily Ledger View (home page with grouped transactions)
6. Phase 1.6 — Balance & Loan Calculation (the core business logic engine)

---

## Architecture Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Folder structure | Next.js App Router with route groups | Separates auth and dashboard concerns cleanly |
| File naming | kebab-case for docs, PascalCase for components | Industry standard for Next.js projects |
| Docs location | `docs/` folder at project root | Keeps root clean; docs are reference material, not source code |
| Copilot instructions | `.github/copilot-instructions.md` | Standard location recognized by GitHub Copilot |
| Git commit style | Conventional Commits, single-line | Industry standard; one commit per logical change block |

---

## Notes for Next Session

- Start with `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` to initialize the project.
- Then install core dependencies: `prisma`, `@prisma/client`, `next-auth@beta`, `zod`, `sonner`.
- Configure the Prisma schema with all entities from PRD §7.
- Choose between Supabase and Neon for PostgreSQL hosting.
