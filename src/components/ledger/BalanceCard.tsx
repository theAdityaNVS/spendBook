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
        ? "text-debit text-glow"
        : "text-credit text-glow"
      : "";

  return (
    <div className="glass-panel group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.3)] hover:-translate-y-1">
      {/* Subtle background flares */}
      <div className="bg-primary/20 pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[80px] transition-all duration-500 group-hover:bg-primary/30" />
      <div className="bg-blue-500/10 pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full blur-[60px]" />
      
      {/* Glass border accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />

      <div className="relative z-10">
        <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
          {summary.person.name}
          {isFamily && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] ring-1 ring-primary/20 backdrop-blur-md">FAMILY</span>}
        </h3>

        <div className="mt-6 mb-8 relative">
          <p className="text-muted-foreground/80 mb-2 text-xs font-semibold tracking-widest uppercase">
            {isFamily ? "Closing Balance" : "Loan Balance"}
          </p>
          <div className={`text-5xl md:text-6xl font-extrabold tracking-tighter tabular-nums drop-shadow-md ${loanColor}`}>
            {closingValue !== undefined ? formatCurrency(closingValue.toString()) : "—"}
          </div>
        </div>

        <div className="border-glass-border/50 grid grid-cols-2 gap-6 border-t pt-6 text-sm">
          <div className="relative bg-background/5 p-4 rounded-2xl ring-1 ring-white/10 backdrop-blur-sm">
            <div className="text-muted-foreground mb-1.5 text-[10px] font-bold tracking-widest uppercase">Opening</div>
            <div className="text-foreground/90 font-bold tabular-nums text-lg">
              {openingValue !== undefined ? formatCurrency(openingValue.toString()) : "—"}
            </div>
          </div>
          <div className="relative bg-payment/5 p-4 rounded-2xl ring-1 ring-payment/20 backdrop-blur-sm">
            <div className="text-payment mb-1.5 text-[10px] font-bold tracking-widest uppercase">Payments</div>
            <div className="text-payment font-bold tabular-nums text-lg">
              {formatCurrency(summary.totalPayments.toString())}
            </div>
          </div>
          <div className="relative bg-debit/5 p-4 rounded-2xl ring-1 ring-debit/20 backdrop-blur-sm">
            <div className="text-debit mb-1.5 text-[10px] font-bold tracking-widest uppercase">Debits</div>
            <div className="text-debit font-bold tabular-nums text-lg">
              − {formatCurrency(summary.totalDebits.toString())}
            </div>
          </div>
          <div className="relative bg-credit/5 p-4 rounded-2xl ring-1 ring-credit/20 backdrop-blur-sm">
            <div className="text-credit mb-1.5 text-[10px] font-bold tracking-widest uppercase">Credits</div>
            <div className="text-credit font-bold tabular-nums text-lg">
              + {formatCurrency(summary.totalCredits.toString())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
