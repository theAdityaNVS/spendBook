/**
 * Balance Engine — Phase 1.6
 *
 * Implements the Loan Impact Matrix:
 *
 * | Payment Mode Owner | Paid Towards | Loan Effect              |
 * |--------------------|--------------|--------------------------|
 * | Family mode        | Personal     | +Loan (person owes more) |
 * | Family mode        | Family       | No change (family spend) |
 * | Person's own mode  | Personal     | No change (stats only)   |
 * | Person's own mode  | Family       | −Loan (repayment)        |
 */

import { Decimal } from "@prisma/client/runtime/library"
import type {
  Transaction,
  PaymentMode,
} from "@prisma/client"
import { db } from "@/lib/db"

type TransactionForBalance = Transaction & {
  paymentMode: (PaymentMode & { ownerPersonId: string | null }) | null
}

/** Determine the loan delta for a single transaction.
 *  Returns a positive number (loan increases) or negative (loan decreases).
 *  Zero means no loan impact.
 */
export function computeLoanDelta(
  tx: TransactionForBalance,
  personId: string,
): Decimal {
  const amount = tx.amount
  const ownerPersonId = tx.paymentMode?.ownerPersonId ?? null
  const isFamilyMode = ownerPersonId === null
  const isOwnMode = ownerPersonId === personId

  if (tx.type === "PAYMENT") {
    // Payments always reduce the loan (person paying back family)
    return amount.neg()
  }

  if (tx.type === "CREDIT") {
    // Credits reduce the loan if they're a refund for a family-funded personal expense.
    // For MVP simplicity: personal credits reduce loan, family credits don't.
    if (tx.paidTowards === "PERSONAL") {
      return amount.neg()
    }
    return new Decimal(0)
  }

  // DEBIT — apply the loan impact matrix
  if (isFamilyMode && tx.paidTowards === "PERSONAL") {
    // Family paid for person's personal spend → person owes more
    return amount
  }

  if (isOwnMode && tx.paidTowards === "FAMILY") {
    // Person paid for family's expense from own money → repayment, loan decreases
    return amount.neg()
  }

  // All other cases: no loan impact
  return new Decimal(0)
}

/** Recompute and upsert the DailyBalance and LoanBalance for a person on a given date.
 *  Always run inside a Prisma transaction when mutating transactions.
 */
export async function recalculateBalancesForDate(
  familyId: string,
  personId: string,
  date: Date,
): Promise<void> {
  const person = await db.person.findUniqueOrThrow({
    where: { id: personId },
  })

  const transactions = await db.transaction.findMany({
    where: { familyId, personId, date },
    include: { paymentMode: true },
  })

  // ── DailyBalance (tracks gross debits/credits/payments) ──
  const totalDebits = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((acc, t) => acc.plus(t.amount), new Decimal(0))

  const totalCredits = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((acc, t) => acc.plus(t.amount), new Decimal(0))

  const totalPayments = transactions
    .filter((t) => t.type === "PAYMENT")
    .reduce((acc, t) => acc.plus(t.amount), new Decimal(0))

  // Opening balance = closing balance of the previous day
  const prevBalance = await db.dailyBalance.findFirst({
    where: { personId, familyId, date: { lt: date } },
    orderBy: { date: "desc" },
  })
  const openingBalance = prevBalance?.closingBalance ?? new Decimal(0)
  const closingBalance = openingBalance
    .plus(totalDebits)
    .minus(totalCredits)
    .minus(totalPayments)

  await db.dailyBalance.upsert({
    where: { personId_date: { personId, date } },
    create: {
      personId,
      familyId,
      date,
      openingBalance,
      totalDebits,
      totalCredits,
      totalPayments,
      closingBalance,
    },
    update: {
      openingBalance,
      totalDebits,
      totalCredits,
      totalPayments,
      closingBalance,
    },
  })

  // ── LoanBalance (only relevant for non-family-account persons) ──
  if (person.isFamilyAccount) return

  const prevLoan = await db.loanBalance.findFirst({
    where: { personId, familyId, date: { lt: date } },
    orderBy: { date: "desc" },
  })
  const openingLoan = prevLoan?.closingLoan ?? new Decimal(0)

  let loanIncreases = new Decimal(0)
  let loanDecreases = new Decimal(0)

  for (const tx of transactions) {
    const delta = computeLoanDelta(tx, personId)
    if (delta.gt(0)) loanIncreases = loanIncreases.plus(delta)
    if (delta.lt(0)) loanDecreases = loanDecreases.plus(delta.abs())
  }

  const closingLoan = openingLoan.plus(loanIncreases).minus(loanDecreases)

  await db.loanBalance.upsert({
    where: { personId_date: { personId, date } },
    create: {
      personId,
      familyId,
      date,
      openingLoan,
      loanIncreases,
      loanDecreases,
      closingLoan,
    },
    update: {
      openingLoan,
      loanIncreases,
      loanDecreases,
      closingLoan,
    },
  })
}

/** Recalculate balances for ALL persons in a family for a given date. */
export async function recalculateAllBalancesForDate(
  familyId: string,
  date: Date,
): Promise<void> {
  const persons = await db.person.findMany({
    where: { familyId, isArchived: false },
  })

  await Promise.all(
    persons.map((p) => recalculateBalancesForDate(familyId, p.id, date)),
  )
}
