import { formatCurrency } from "@/lib/utils";
import type { DailyBalanceSummary } from "@/types";

interface BalanceCardProps {
  summary: DailyBalanceSummary;
}

export function BalanceCard({ summary }: BalanceCardProps) {
  const isFamily = summary.person.isFamilyAccount;
  const closingValue = isFamily ? summary.closingBalance : summary.closingLoan;
  const openingValue = isFamily ? summary.openingBalance : summary.openingLoan;

  // For loan: positive is bad (owes money), zero/negative is good
  const loanColor =
    !isFamily && closingValue !== undefined
      ? Number(closingValue) > 0
        ? "text-debit dark:text-red-400"
        : "text-credit dark:text-emerald-400"
      : "";

  return (
    <div className="glass-panel dark:hover:shadow-primary/5 relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 hover:shadow-xl">
      {/* Subtle background flare */}
      <div className="bg-primary/10 pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
          {summary.person.name}
          {isFamily && <span className="ml-1 text-[10px] opacity-70">(Family)</span>}
        </h3>

        <div className="mt-4 mb-6">
          <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">
            {isFamily ? "Closing Balance" : "Loan Balance"}
          </p>
          <div className={`text-4xl font-light tracking-tight tabular-nums ${loanColor}`}>
            {closingValue !== undefined ? formatCurrency(closingValue.toString()) : "—"}
          </div>
        </div>

        <div className="border-glass-border grid grid-cols-2 gap-4 border-t pt-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Opening</div>
            <div className="text-foreground/80 font-medium tabular-nums">
              {openingValue !== undefined ? formatCurrency(openingValue.toString()) : "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Payments</div>
            <div className="text-payment font-medium tabular-nums">
              {formatCurrency(summary.totalPayments.toString())}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Debits</div>
            <div className="text-debit font-medium tabular-nums">
              − {formatCurrency(summary.totalDebits.toString())}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Credits</div>
            <div className="text-credit font-medium tabular-nums">
              + {formatCurrency(summary.totalCredits.toString())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
