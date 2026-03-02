import type {
  User,
  Family,
  Person,
  Transaction,
  CategoryTag,
  PaymentMode,
  DailyBalance,
  LoanBalance,
  UserFamily,
  TransactionType,
  PaidTowards,
  PaymentModeType,
  Role,
} from "@prisma/client"
import type { Decimal } from "@prisma/client/runtime/library"

export type {
  User,
  Family,
  Person,
  Transaction,
  CategoryTag,
  PaymentMode,
  DailyBalance,
  LoanBalance,
  UserFamily,
  TransactionType,
  PaidTowards,
  PaymentModeType,
  Role,
  Decimal,
}

// ─── Enriched / joined types used in UI ──────────────────────────────────────

export type TransactionWithRelations = Transaction & {
  person: Person
  categoryTag: CategoryTag | null
  paymentMode: (PaymentMode & { ownerPerson: Person | null }) | null
}

export type PersonWithBalances = Person & {
  loanBalances: LoanBalance[]
  dailyBalances: DailyBalance[]
}

export type DailyLedgerData = {
  date: Date
  transactions: TransactionWithRelations[]
  persons: Person[]
  balances: DailyBalanceSummary[]
}

export type DailyBalanceSummary = {
  person: Person
  openingBalance: string
  totalDebits: string
  totalCredits: string
  totalPayments: string
  closingBalance: string
  // loan fields (non-family persons only)
  openingLoan?: string
  loanIncreases?: string
  loanDecreases?: string
  closingLoan?: string
}

// ─── Server Action result type ────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Session extension ────────────────────────────────────────────────────────

export type SessionUser = {
  id: string
  email: string
  name: string
  activeFamilyId: string
  activeRole: Role
}
