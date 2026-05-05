import { getAppSession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import type { Person, TransactionType } from "@/types"

export type PersonMonthlySummary = {
  person: Person
  openingBalance: number
  totalDebits: number
  totalCredits: number
  totalPayments: number
  closingBalance: number
}

export async function getMonthlySummary(year: number, month: number): Promise<{
  summaries: PersonMonthlySummary[]
  familyAggregate: {
    totalDebits: number
    totalCredits: number
    totalPayments: number
  }
}> {
  const session = await getAppSession()
  if (!session?.user) throw new Error("Unauthorized")

  const { activeFamilyId, activeRole, activePersonId } = session.user

  // Start and end of the month
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  const persons = await db.person.findMany({
    where: {
      familyId: activeFamilyId,
      isArchived: false,
      ...(activeRole === "PERSON" && activePersonId ? { id: activePersonId } : {}),
    },
    orderBy: [{ isFamilyAccount: "asc" }, { createdAt: "asc" }],
  })

  // Get transactions for the month
  const transactions = await db.transaction.findMany({
    where: {
      familyId: activeFamilyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(activeRole === "PERSON" && activePersonId ? { personId: activePersonId } : {}),
    },
    select: {
      personId: true,
      type: true,
      amount: true,
    },
  })

  // We also need opening balances. This is the closing balance of the previous month.
  // We can get the latest DailyBalance before the start of this month.
  const summaries = await Promise.all(
    persons.map(async (person) => {
      const prevBalance = await db.dailyBalance.findFirst({
        where: {
          personId: person.id,
          familyId: activeFamilyId,
          date: { lt: startDate },
        },
        orderBy: { date: "desc" },
      })

      const openingBalance = prevBalance ? Number(prevBalance.closingBalance) : 0

      let totalDebits = 0
      let totalCredits = 0
      let totalPayments = 0

      // Sum transactions
      for (const tx of transactions) {
        if (tx.personId !== person.id) continue
        const amt = Number(tx.amount)
        if (tx.type === "DEBIT") totalDebits += amt
        if (tx.type === "CREDIT") totalCredits += amt
        if (tx.type === "PAYMENT") totalPayments += amt
      }

      // closing = opening - debits + credits - payments
      // Wait, debit increases balance you owe to family? 
      // It depends on the calculation logic. Let's refer to DailyBalance logic.
      // Wait, the easiest way to get closing balance is the latest DailyBalance IN this month.
      const lastBalance = await db.dailyBalance.findFirst({
        where: {
          personId: person.id,
          familyId: activeFamilyId,
          date: { lte: endDate },
        },
        orderBy: { date: "desc" },
      })

      const closingBalance = lastBalance ? Number(lastBalance.closingBalance) : openingBalance

      return {
        person,
        openingBalance,
        totalDebits,
        totalCredits,
        totalPayments,
        closingBalance,
      }
    })
  )

  const familyAggregate = {
    totalDebits: summaries.reduce((acc, s) => acc + s.totalDebits, 0),
    totalCredits: summaries.reduce((acc, s) => acc + s.totalCredits, 0),
    totalPayments: summaries.reduce((acc, s) => acc + s.totalPayments, 0),
  }

  return { summaries, familyAggregate }
}
