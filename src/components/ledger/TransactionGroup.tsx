import { TransactionCard } from "@/components/transaction/TransactionCard";
import { formatCurrency } from "@/lib/utils";
import { TRANSACTION_TYPE_LABELS } from "@/config/constants";
import type { TransactionWithRelations, Person, CategoryTag, PaymentMode } from "@/types";
import type { TransactionType } from "@/types";

interface TransactionGroupProps {
  type: TransactionType;
  transactions: TransactionWithRelations[];
  persons: Person[];
  categoryTags: CategoryTag[];
  paymentModes: (PaymentMode & { ownerPerson: Person | null })[];
}

export function TransactionGroup({
  type,
  transactions,
  persons,
  categoryTags,
  paymentModes,
}: TransactionGroupProps) {
  if (transactions.length === 0) return null;

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const colorClass =
    type === "DEBIT" ? "text-debit" : type === "CREDIT" ? "text-credit" : "text-payment";

  const bgClass =
    type === "DEBIT" ? "bg-debit/10" : type === "CREDIT" ? "bg-credit/10" : "bg-payment/10";

  return (
    <section className="mb-8">
      {/* Section header */}
      <div className={`mb-3 flex items-center justify-between rounded-2xl px-5 py-3 ${bgClass}`}>
        <span className={`text-xs font-bold tracking-widest uppercase ${colorClass}`}>
          {TRANSACTION_TYPE_LABELS[type]}
        </span>
        <span className={`text-sm font-bold tabular-nums ${colorClass}`}>
          {formatCurrency(total.toString())}
        </span>
      </div>

      {/* Transactions */}
      <div className="flex flex-col gap-2">
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
  );
}
