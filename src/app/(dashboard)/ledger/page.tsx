import { DateNav } from "@/components/ledger/DateNav";
import { TransactionGroup } from "@/components/ledger/TransactionGroup";
import { BalanceCard } from "@/components/ledger/BalanceCard";
import { LedgerAddButton } from "@/components/ledger/LedgerAddButton";
import { getDailyLedger } from "@/server/queries/ledger";
import { getCategoryTags, getPaymentModes, getPersons } from "@/server/queries/settings";
import { formatCurrency, fromDateParam, today } from "@/lib/utils";
import type { DailyLedgerData } from "@/types";

export const dynamic = "force-dynamic";

interface LedgerPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function LedgerPage({ searchParams }: LedgerPageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? fromDateParam(dateParam) : today();

  const [{ transactions, balances }, persons, categoryTags, paymentModes] = await Promise.all([
    getDailyLedger(date),
    getPersons(),
    getCategoryTags(),
    getPaymentModes(),
  ]);

  const ledgerData: DailyLedgerData = { date, transactions, persons, balances };

  const debits = transactions.filter((t) => t.type === "DEBIT");
  const credits = transactions.filter((t) => t.type === "CREDIT");
  const payments = transactions.filter((t) => t.type === "PAYMENT");
  const totalDebits = debits.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalCredits = credits.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPayments = payments.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <section className="ink-panel relative overflow-hidden rounded-lg p-5 sm:p-7">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-brand-gold">Daily Ledger</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Today&apos;s money story
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
              Review household movement, add transactions fast, and keep balances honest.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <DateNav date={date} />
            <LedgerAddButton
              data={ledgerData}
              persons={persons}
              categoryTags={categoryTags}
              paymentModes={paymentModes}
            />
          </div>
        </div>
        <div className="relative z-10 mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/8 p-4">
            <p className="text-xs font-black uppercase text-white/60">Debits</p>
            <p className="mt-2 text-2xl font-black text-debit tabular-nums">
              {formatCurrency(totalDebits)}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/8 p-4">
            <p className="text-xs font-black uppercase text-white/60">Credits</p>
            <p className="mt-2 text-2xl font-black text-credit tabular-nums">
              {formatCurrency(totalCredits)}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/8 p-4">
            <p className="text-xs font-black uppercase text-white/60">Payments</p>
            <p className="mt-2 text-2xl font-black text-payment tabular-nums">
              {formatCurrency(totalPayments)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Activity</h2>
              <p className="text-sm text-muted-foreground">{transactions.length} entries for the selected day</p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="surface-panel rounded-lg border-dashed px-6 py-16 text-center">
              <p className="text-lg font-black">No transactions for this day.</p>
              <p className="mt-2 text-sm text-muted-foreground">Add the first entry to start the ledger.</p>
            </div>
          ) : (
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
          )}
        </section>

        {balances.length > 0 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Balances</h2>
              <p className="text-sm text-muted-foreground">Closing position by member</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {balances.map((b) => (
                <BalanceCard key={b.person.id} summary={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
