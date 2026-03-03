import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { TransactionWithRelations, DailyBalanceSummary } from "@/types"

/** Fetch all transactions for the active family on a given date. */
export async function getDailyLedger(date: Date): Promise<{
  transactions: TransactionWithRelations[]
  balances: DailyBalanceSummary[]
}> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { activeFamilyId } = session.user

  const [transactions, persons] = await Promise.all([
    db.transaction.findMany({
      where: { familyId: activeFamilyId, date },
      include: {
        person: true,
        categoryTag: true,
        paymentMode: { include: { ownerPerson: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.person.findMany({
      where: { familyId: activeFamilyId, isArchived: false },
      orderBy: [{ isFamilyAccount: "asc" }, { createdAt: "asc" }],
    }),
  ])

  // Build balance summaries for each person
  const balances = await Promise.all(
    persons.map(async (person): Promise<DailyBalanceSummary> => {
      const [daily, loan, prevDaily, prevLoan] = await Promise.all([
        db.dailyBalance.findUnique({
          where: { personId_date: { personId: person.id, date } },
        }),
        db.loanBalance.findUnique({
          where: { personId_date: { personId: person.id, date } },
        }),
        db.dailyBalance.findFirst({
          where: { personId: person.id, familyId: activeFamilyId, date: { lt: date } },
          orderBy: { date: "desc" },
        }),
        person.isFamilyAccount
          ? Promise.resolve(null)
          : db.loanBalance.findFirst({
              where: { personId: person.id, familyId: activeFamilyId, date: { lt: date } },
              orderBy: { date: "desc" },
            }),
      ])

      const summary: DailyBalanceSummary = {
        person,
        openingBalance: (prevDaily?.closingBalance ?? 0).toString(),
        totalDebits: (daily?.totalDebits ?? 0).toString(),
        totalCredits: (daily?.totalCredits ?? 0).toString(),
        totalPayments: (daily?.totalPayments ?? 0).toString(),
        closingBalance: (daily?.closingBalance ?? prevDaily?.closingBalance ?? 0).toString(),
      }

      if (!person.isFamilyAccount) {
        summary.openingLoan = (prevLoan?.closingLoan ?? 0).toString()
        summary.loanIncreases = (loan?.loanIncreases ?? 0).toString()
        summary.loanDecreases = (loan?.loanDecreases ?? 0).toString()
        summary.closingLoan = (loan?.closingLoan ?? prevLoan?.closingLoan ?? 0).toString()
      }

      return summary
    }),
  )

  return { transactions, balances }
}
