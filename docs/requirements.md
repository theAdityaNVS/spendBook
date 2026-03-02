# SpendBook — Original Idea Notes

> Raw notes that inspired the SpendBook PRD. Kept for reference.

---

## The Problem

I want an expense tracker web app to track my and my family's expenses. Currently I use the Notes app on my iPad, writing with Apple Pencil — each page is one day of the month.

**Current iPad layout (per page/day):**
- **Top:** Date
- **Left columns:** Three categories — Debits, Credits, Payments
- **Within each category:** Grouped by person (Person 1, Person 2, Family)
- **Bottom:** Balance calculation for selected person/family

**Balance formula:**
```
Previous day balance = ...
My debits today      = ...
My credits today     = ...
New balance          = Previous + Debits − Credits − Payments
```

The balance represents **what the person owes**. Personal spends increase it; payments on behalf of family and card payments decrease it.

---

## Transaction Example

**Person 1's day:**

| # | Transaction | Type | Amount |
|---|---|---|---|
| A | Spent using card — personal use | Debit | ₹200 |
| B | Spent using cash — for family | Credit (repayment) | ₹150 |
| C | Spent using wallet — personal use | Debit | ₹10 |
| D | Credit card payment | Payment | ₹300 |

**Balance calculation:**
```
Previous balance = ₹500 (owed)
Debits today     = A + C = ₹210
Credits today    = B + D = ₹450
New balance      = 500 + 210 − 450 = ₹260
```

---

## Debits

- All spends: shopping, subscriptions, food delivery, bills, etc.
- Each entry: **Name** — optional description — **Category Tag** — **Payment Mode** (bank credit card, UPI, cash, wallet) — **Amount** — **Paid Towards** (personal or family)
- Example: `Person 1 → Swiggy (KFC burger) → Food Delivery → HDFC UPI → ₹250 → Personal`

## Credits

- Cashback from credit cards, refunds, money received from friends
- If a credit is purely personal (not related to family), it's tracked separately for inflow/outflow stats only — doesn't affect the family balance

## Payments

- Credit card bill payments, bill settlements
- These reduce the owed balance directly

