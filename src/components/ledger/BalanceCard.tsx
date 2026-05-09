import { Landmark, UserRound } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DailyBalanceSummary } from "@/types";

interface BalanceCardProps {
  summary: DailyBalanceSummary;
}

export function BalanceCard({ summary }: BalanceCardProps) {
  const isFamily = summary.person.isFamilyAccount;
  const closingValue = isFamily ? summary.closingBalance : summary.closingLoan;
  const openingValue = isFamily ? summary.openingBalance : summary.openingLoan;
  const closingNumber = closingValue === undefined ? 0 : Number(closingValue);
  const closingTone = !isFamily && closingNumber > 0 ? "text-debit" : "text-credit";
  const Icon = isFamily ? Landmark : UserRound;

  return (
    <article className="paper-panel lift overflow-hidden rounded-lg">
      <div className="border-b bg-surface-soft/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-black">{summary.person.name}</h3>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              {isFamily ? "Family balance" : "Personal loan balance"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-black uppercase text-muted-foreground">
          {isFamily ? "Closing Balance" : "Loan Balance"}
        </p>
        <div className={`mt-2 text-4xl font-black tracking-tight tabular-nums ${closingTone}`}>
          {closingValue !== undefined ? formatCurrency(closingValue.toString()) : "—"}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface-soft p-3">
            <dt className="text-[10px] font-black uppercase text-muted-foreground">Opening</dt>
            <dd className="mt-1 font-black tabular-nums">
              {openingValue !== undefined ? formatCurrency(openingValue.toString()) : "—"}
            </dd>
          </div>
          <div className="rounded-lg bg-payment-muted p-3">
            <dt className="text-[10px] font-black uppercase text-payment">Payments</dt>
            <dd className="mt-1 font-black text-payment tabular-nums">
              {formatCurrency(summary.totalPayments.toString())}
            </dd>
          </div>
          <div className="rounded-lg bg-debit-muted p-3">
            <dt className="text-[10px] font-black uppercase text-debit">Debits</dt>
            <dd className="mt-1 font-black text-debit tabular-nums">
              - {formatCurrency(summary.totalDebits.toString())}
            </dd>
          </div>
          <div className="rounded-lg bg-credit-muted p-3">
            <dt className="text-[10px] font-black uppercase text-credit">Credits</dt>
            <dd className="mt-1 font-black text-credit tabular-nums">
              + {formatCurrency(summary.totalCredits.toString())}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
