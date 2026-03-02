import { TransactionCard } from "@/components/transaction/TransactionCard"
import { formatCurrency } from "@/lib/utils"
import { TRANSACTION_TYPE_LABELS } from "@/config/constants"
import type {
  TransactionWithRelations,
  Person,
  CategoryTag,
  PaymentMode,
} from "@/types"
import type { TransactionType } from "@/types"

interface TransactionGroupProps {
  type: TransactionType
  transactions: TransactionWithRelations[]
  persons: Person[]
  categoryTags: CategoryTag[]
  paymentModes: (PaymentMode & { ownerPerson: Person | null })[]
}

export function TransactionGroup({
  type,
  transactions,
  persons,
  categoryTags,
  paymentModes,
}: TransactionGroupProps) {
  if (transactions.length === 0) return null

  const total = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  )

  const colorClass =
    type === "DEBIT"
      ? "text-debit"
      : type === "CREDIT"
        ? "text-credit"
        : "text-payment"

  const bgClass =
    type === "DEBIT"
      ? "bg-debit/10"
      : type === "CREDIT"
        ? "bg-credit/10"
        : "bg-payment/10"

  return (
    <section>
      {/* Section header */}
      <div className={`flex items-center justify-between rounded-t-lg px-3 py-2 ${bgClass}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
          {TRANSACTION_TYPE_LABELS[type]}
        </span>
        <span className={`text-sm font-semibold tabular-nums ${colorClass}`}>
          {formatCurrency(total.toString())}
        </span>
      </div>

      {/* Transactions */}
      <div className="divide-y divide-border rounded-b-lg border border-t-0 px-3">
        {transactions.map((tx) => (
          <TransactionCard
            key={tx.id}
            transaction={tx}
            persons={persons}
            categoryTags={categoryTags}
            paymentModes={paymentModes}
          />
        ))}
      </div>
    </section>
  )
}
