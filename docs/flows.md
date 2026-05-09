# Flows — SpendBook

> **Last verified**: 2026-05-05 — based on commit `5721da7`

---

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant MW as Middleware
    participant NA as Neon Auth
    participant DL as Dashboard Layout
    participant S as Session Bridge

    B->>MW: GET /ledger
    MW->>NA: Check auth cookie
    alt Not authenticated
        NA-->>MW: No session
        MW-->>B: 302 → /auth/sign-in
        B->>NA: User signs in
        NA-->>B: Set auth cookie, redirect
    end

    MW-->>DL: Proceed (authenticated)
    DL->>S: isAuthenticated()
    S->>NA: auth.getSession()
    NA-->>S: Neon session (email, name, id)

    DL->>S: getAppSession()
    S->>S: Find/create User by email
    S->>S: Find UserFamily
    alt No family found
        S-->>DL: null
        DL-->>B: 302 → /onboarding
    else Family exists
        S-->>DL: AppSession { userId, familyId, role }
        DL-->>B: Render dashboard
    end
```

### Key Details:

- **Middleware** ([middleware.ts](file:///C:/Users/nadam/Coding/Web%20Projects/spendBook/src/middleware.ts)) runs on every non-excluded route
- **Neon Auth** handles all credential storage, OAuth, and session tokens externally
- **Session bridging** ([session.ts](file:///C:/Users/nadam/Coding/Web%20Projects/spendBook/src/lib/auth/session.ts)) maps external identity to internal User/Family model
- **User auto-creation**: If a Neon Auth user has no internal User record, one is created on first session check

---

## 2. Onboarding Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant OP as /onboarding Page
    participant SA as setupFamilyAction
    participant DB as PostgreSQL

    B->>OP: GET /onboarding
    OP-->>B: Render family name form

    B->>SA: POST (familyName)
    SA->>SA: Validate with Zod
    SA->>DB: Find/create User
    SA->>DB: Check existing family

    alt Already has family
        SA-->>B: Error "You already have a family"
    else No family
        SA->>DB: $transaction begin
        DB-->>SA: Create Family
        DB-->>SA: Create Family Account (Person, isFamilyAccount=true)
        DB-->>SA: Create UserFamily (ADMIN role, linked to Family Account)
        DB-->>SA: Create 10 default CategoryTags
        DB-->>SA: Create 2 default PaymentModes (Family Cash, Family UPI)
        SA->>DB: $transaction commit
        SA-->>B: { success: true }
        B->>B: router.push("/ledger") + router.refresh()
    end
```

### Default Data Seeded:

- **Family Account** — built-in Person that represents the household
- **10 Category Tags** — Food Delivery, Groceries, Shopping, Subscriptions, Utilities, Transport, Entertainment, Healthcare, Education, Miscellaneous
- **2 Payment Modes** — Family Cash, Family UPI (both family-owned)

---

## 3. Daily Ledger Load Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant LP as /ledger Page (Server)
    participant Q as Server Queries
    participant DB as PostgreSQL

    B->>LP: GET /ledger?date=2026-03-15
    LP->>LP: Parse date param (or default to today)

    par Parallel queries
        LP->>Q: getDailyLedger(date)
        Q->>DB: transactions + person + categoryTag + paymentMode
        Q->>DB: persons (non-archived)
        Q->>DB: dailyBalance + loanBalance per person
        Q-->>LP: { transactions, balances }
    and
        LP->>Q: getPersons()
        Q-->>LP: Person[]
    and
        LP->>Q: getCategoryTags()
        Q-->>LP: CategoryTag[]
    and
        LP->>Q: getPaymentModes()
        Q-->>LP: PaymentMode[]
    end

    LP->>LP: Split transactions by type
    LP-->>B: Render DateNav + TransactionGroups + BalanceCards + AddButton
```

---

## 4. Transaction Creation Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant TF as TransactionForm
    participant SA as createTransactionAction
    participant DB as PostgreSQL
    participant BE as Balance Engine

    B->>TF: User fills form, clicks "Add transaction"
    TF->>SA: formAction(formData)

    SA->>SA: getAppSession() → verify auth
    SA->>SA: Zod validate formData

    alt Validation fails
        SA-->>TF: { success: false, error: "..." }
        TF-->>B: Show error toast
    end

    SA->>DB: Verify person belongs to family
    SA->>DB: $transaction { create Transaction }

    SA->>BE: recalculateBalancesForDate(familyId, personId, date)

    Note over BE,DB: DailyBalance Calculation
    BE->>DB: Fetch all transactions for person+date
    BE->>BE: Sum debits, credits, payments
    BE->>DB: Find previous day's closing balance
    BE->>BE: closingBalance = opening + debits - credits - payments
    BE->>DB: Upsert DailyBalance

    Note over BE,DB: LoanBalance Calculation (non-family persons only)
    BE->>DB: Find previous day's closing loan
    loop Each transaction
        BE->>BE: computeLoanDelta(tx, personId)
        Note right of BE: Apply Loan Impact Matrix
    end
    BE->>BE: closingLoan = opening + increases - decreases
    BE->>DB: Upsert LoanBalance

    SA->>SA: revalidatePath("/ledger")
    SA-->>TF: { success: true, data: transaction }
    TF->>TF: Close dialog
    B->>B: Page reloads with new data
```

---

## 5. Transaction Update Flow

Same as creation, with these differences:

1. Finds existing transaction, verifies it belongs to the family
2. Updates the transaction record
3. Recalculates balances for the **new date**
4. If the date changed, also recalculates for the **old date** (to correct the previous day's balance)

---

## 6. Transaction Deletion Flow

```
deleteTransactionAction(id)
  → getAppSession()
  → Find transaction in family
  → db.transaction.delete()
  → recalculateBalancesForDate(familyId, personId, date)
  → revalidatePath("/ledger")
```

---

## 7. Person Management Flow

```mermaid
flowchart TD
    A[Settings Page] --> B{Action}
    B -->|Add| C[AddPersonDialog]
    B -->|Edit| D[EditPersonDialog]
    B -->|Delete| E[Confirm Dialog]

    C -->|createPersonAction| F[Create Person in family]
    D -->|updatePersonAction| G[Update Person name]
    E -->|deletePersonAction| H[Set isArchived=true]

    F & G & H --> I[revalidatePath /settings + /ledger]

    G -.->|Guard| J{isFamilyAccount?}
    J -->|Yes| K[Reject: Cannot rename]
    H -.->|Guard| J
    J -->|Yes| L[Reject: Cannot delete]
```

### Role enforcement:

- All person mutations require `ADMIN` role
- Family Account cannot be renamed or deleted
- "Delete" is a soft archive — transactions are preserved

---

## 8. Balance Engine Logic

### Loan Impact Matrix Decision Tree

```mermaid
flowchart TD
    A[Transaction] --> B{Type?}
    B -->|PAYMENT| C[Loan decreases ← amount]
    B -->|CREDIT| D{paidTowards?}
    D -->|PERSONAL| E[Loan decreases ← amount]
    D -->|FAMILY| F[No loan change]
    B -->|DEBIT| G{Payment Mode Owner?}
    G -->|Family mode| H{paidTowards?}
    H -->|PERSONAL| I[Loan increases ↑ amount]
    H -->|FAMILY| J[No loan change]
    G -->|Person's own mode| K{paidTowards?}
    K -->|PERSONAL| L[No loan change]
    K -->|FAMILY| M[Loan decreases ← amount]
    G -->|Other person's mode| N[No loan change]
```

### DailyBalance formula:

```
closingBalance = openingBalance + totalDebits - totalCredits - totalPayments
```

where `openingBalance` = previous day's `closingBalance` (or 0 if first day).

### LoanBalance formula:

```
closingLoan = openingLoan + loanIncreases - loanDecreases
```

> [!IMPORTANT]
> Balances are **cached computations**. They are recalculated from transactions on every mutation. This means balance records for dates **after** a modified date may become stale. Currently, only the **exact date** of the mutation is recalculated — cascading future recalculation is not implemented.

---

## 9. Request Lifecycle

```
Browser Request
  │
  ├─ Static assets (.css, .js, images)
  │   └→ Served directly by Next.js / Vercel CDN
  │
  ├─ /api/auth/*
  │   └→ Neon Auth handler (GET, POST)
  │
  └─ All other routes
      └→ Middleware (auth.middleware)
          ├─ No cookie → 302 /auth/sign-in
          └─ Valid cookie → Continue
              └→ Route handler
                  ├─ (dashboard) layout
                  │   ├─ isAuthenticated() → false → 302 /auth/sign-in
                  │   ├─ getAppSession() → null → 302 /onboarding
                  │   └─ Session valid → Render page
                  └─ Other pages (onboarding, auth) → Render directly
```
