import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        ? "text-debit"
        : "text-credit"
      : "";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">
          {summary.person.name}
          {isFamily && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">(Family)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {/* Opening */}
          <div className="text-muted-foreground">
            {isFamily ? "Opening Balance" : "Opening Loan"}
          </div>
          <div className="text-right tabular-nums">
            {openingValue !== undefined ? formatCurrency(openingValue.toString()) : "—"}
          </div>

          {/* Debits */}
          <div className="text-muted-foreground">Debits</div>
          <div className="text-debit text-right tabular-nums">
            − {formatCurrency(summary.totalDebits.toString())}
          </div>

          {/* Credits */}
          <div className="text-muted-foreground">Credits</div>
          <div className="text-credit text-right tabular-nums">
            + {formatCurrency(summary.totalCredits.toString())}
          </div>

          {/* Payments */}
          <div className="text-muted-foreground">Payments</div>
          <div className="text-payment text-right tabular-nums">
            {formatCurrency(summary.totalPayments.toString())}
          </div>

          {/* Closing */}
          <div className="border-t pt-2 font-semibold">
            {isFamily ? "Closing Balance" : "Loan Balance"}
          </div>
          <div className={`border-t pt-2 text-right font-semibold tabular-nums ${loanColor}`}>
            {closingValue !== undefined ? formatCurrency(closingValue.toString()) : "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
