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

  return (
    <section className="paper-panel overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
        <span className={`text-xs font-black tracking-widest uppercase ${colorClass}`}>
          {TRANSACTION_TYPE_LABELS[type]}
        </span>
        <span className={`text-sm font-black tabular-nums ${colorClass}`}>
          {formatCurrency(total.toString())}
        </span>
      </div>

      <div className="divide-y">
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
