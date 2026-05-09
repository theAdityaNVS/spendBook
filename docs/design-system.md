# SpendBook Design System

> Last updated: 2026-05-09

## Design Direction

SpendBook is being redesigned as a premium family-finance workspace: calm, clear, data-rich, and emotionally lighter than a typical expense tracker. The visual system should feel closer to a modern fintech control room than a decorative landing page.

## Foundations

- **Typography:** Inter is the primary UI typeface. Use strong weight contrast, short headings, tabular numerals for money, and compact labels for dense financial data.
- **Color:** The base palette mixes warm paper surfaces, deep ink navigation, teal primary actions, gold highlights, coral accents, and domain colors for financial movement.
- **Surfaces:** Prefer `surface-panel`, `paper-panel`, and `ink-panel`. Cards stay at `rounded-lg` or smaller, with subtle borders and shadows.
- **Motion:** Use short hover lift only where it improves feedback. Global reduced-motion handling is defined in `src/app/globals.css`.
- **Navigation:** Desktop uses a deep ink sidebar. Mobile uses a compact bottom nav. Active links must include `aria-current="page"`.

## Finance Semantics

- **Debit:** Red, used only for outgoing money or debt-increasing states.
- **Credit:** Green, used for incoming money or healthy repayment states.
- **Payment:** Blue, used for transfers, repayments, and payment-mode movement.
- **Gold:** Used as a premium highlight, not as a generic status color.

## Current Redesign Checkpoints

- 2026-05-09: Shell, navigation, base tokens, base form primitives, test tooling repair, and accessibility baseline started.

## Open Design Work

- Redesign ledger as a wider iPad-first workspace with a clear daily headline, better transaction density, and visible actions.
- Redesign transaction dialogs as accessible segmented/radio controls with clearer payment and category selection.
- Replace the analytics placeholder with a useful insight dashboard.
- Refresh settings cards and empty states to match the new surface system.
