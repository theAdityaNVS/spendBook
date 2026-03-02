import { DateNav } from "@/components/ledger/DateNav"
import { TransactionGroup } from "@/components/ledger/TransactionGroup"
import { BalanceCard } from "@/components/ledger/BalanceCard"
import { LedgerAddButton } from "@/components/ledger/LedgerAddButton"
import { getDailyLedger } from "@/server/queries/ledger"
import { getCategoryTags, getPaymentModes, getPersons } from "@/server/queries/settings"
import { fromDateParam, today } from "@/lib/utils"
import type { DailyLedgerData } from "@/types"

export const dynamic = "force-dynamic"

interface LedgerPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function LedgerPage({ searchParams }: LedgerPageProps) {
  const { date: dateParam } = await searchParams
  const date = dateParam ? fromDateParam(dateParam) : today()

  const [{ transactions, balances }, persons, categoryTags, paymentModes] =
    await Promise.all([
      getDailyLedger(date),
      getPersons(),
      getCategoryTags(),
      getPaymentModes(),
    ])

  const ledgerData: DailyLedgerData = { date, transactions, persons, balances }

  const debits = transactions.filter((t) => t.type === "DEBIT")
  const credits = transactions.filter((t) => t.type === "CREDIT")
  const payments = transactions.filter((t) => t.type === "PAYMENT")

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Date navigation + desktop add button */}
      <div className="flex items-center justify-between">
        <DateNav date={date} />
        <LedgerAddButton
          data={ledgerData}
          persons={persons}
          categoryTags={categoryTags}
          paymentModes={paymentModes}
        />
      </div>

      {/* No transactions message */}
      {transactions.length === 0 && (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          <p className="text-sm">No transactions for this day.</p>
          <p className="mt-1 text-xs">Tap + to add one.</p>
        </div>
      )}

      {/* Transaction groups */}
      <div className="space-y-4">
        <TransactionGroup
          type="DEBIT"
          transactions={debits}
          persons={persons}
          categoryTags={categoryTags}
          paymentModes={paymentModes}
        />
        <TransactionGroup
          type="CREDIT"
          transactions={credits}
          persons={persons}
          categoryTags={categoryTags}
          paymentModes={paymentModes}
        />
        <TransactionGroup
          type="PAYMENT"
          transactions={payments}
          persons={persons}
          categoryTags={categoryTags}
          paymentModes={paymentModes}
        />
      </div>

      {/* Balance cards */}
      {balances.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Balances
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {balances.map((b) => (
              <BalanceCard key={b.person.id} summary={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
