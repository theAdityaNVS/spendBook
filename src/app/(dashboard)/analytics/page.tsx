import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  CircleDollarSign,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const monthlyTrend = [
  { month: "Jan", spend: 48200, income: 68000, saved: 19800 },
  { month: "Feb", spend: 51700, income: 69500, saved: 17800 },
  { month: "Mar", spend: 46800, income: 70400, saved: 23600 },
  { month: "Apr", spend: 54200, income: 72000, saved: 17800 },
  { month: "May", spend: 49500, income: 73500, saved: 24000 },
  { month: "Jun", spend: 43300, income: 73500, saved: 30200 },
];

const categoryMix = [
  { name: "Groceries", value: 18400, color: "hsl(var(--brand-teal))", percent: 37 },
  { name: "Bills", value: 12600, color: "hsl(var(--payment))", percent: 26 },
  { name: "Dining", value: 8200, color: "hsl(var(--brand-coral))", percent: 17 },
  { name: "Travel", value: 5900, color: "hsl(var(--brand-gold))", percent: 12 },
  { name: "Care", value: 4200, color: "hsl(var(--credit))", percent: 8 },
];

const weeklyRhythm = [
  { day: "Mon", debit: 5200, credit: 1800 },
  { day: "Tue", debit: 3600, credit: 2200 },
  { day: "Wed", debit: 6100, credit: 1400 },
  { day: "Thu", debit: 4300, credit: 2600 },
  { day: "Fri", debit: 7900, credit: 1800 },
  { day: "Sat", debit: 6800, credit: 3100 },
  { day: "Sun", debit: 3900, credit: 1200 },
];

const memberSignals = [
  { name: "Anaya", note: "Groceries down 12%", amount: 15340, tone: "credit" },
  { name: "Rohan", note: "Dining peaked Friday", amount: 12680, tone: "debit" },
  { name: "Family", note: "Bills settled early", amount: 21400, tone: "payment" },
];

const insightQueue = [
  {
    title: "Shared spends are stabilizing",
    body: "Recurring family payments are landing 3 days earlier than last month.",
    Icon: ShieldCheck,
  },
  {
    title: "Weekend dining needs a glance",
    body: "Friday and Saturday account for 41% of dining spend in this preview.",
    Icon: WalletCards,
  },
  {
    title: "Savings runway improved",
    body: "Projected month-end surplus is tracking above the six-month average.",
    Icon: PiggyBank,
  },
];

const topMetrics = [
  {
    label: "Monthly spend",
    value: formatCurrency(49500),
    delta: "8.7% lower",
    helper: "vs last month",
    Icon: ArrowDownRight,
    tone: "text-credit",
  },
  {
    label: "Family income",
    value: formatCurrency(73500),
    delta: "2.1% higher",
    helper: "steady deposits",
    Icon: ArrowUpRight,
    tone: "text-credit",
  },
  {
    label: "Savings rate",
    value: "32.7%",
    delta: "+5.4 pts",
    helper: "preview goal 30%",
    Icon: TrendingUp,
    tone: "text-brand-teal",
  },
];

const maxWeeklyValue = Math.max(...weeklyRhythm.flatMap((day) => [day.debit, day.credit]));
const totalCategorySpend = categoryMix.reduce((total, category) => total + category.value, 0);
const categoryDonut = categoryMix.reduce(
  (parts, category, index) => {
    const start = parts.cursor;
    const end =
      index === categoryMix.length - 1 ? 100 : start + (category.value / totalCategorySpend) * 100;

    return {
      cursor: end,
      stops: [...parts.stops, `${category.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`],
    };
  },
  { cursor: 0, stops: [] as string[] }
);

function MiniAreaChart() {
  const maxValue = Math.max(...monthlyTrend.flatMap((month) => [month.income, month.spend]));
  const minValue = Math.min(...monthlyTrend.flatMap((month) => [month.income, month.spend]));

  const pointsFor = (key: "income" | "spend") =>
    monthlyTrend
      .map((item, index) => {
        const x = 10 + index * 76;
        const y = 190 - ((item[key] - minValue) / (maxValue - minValue)) * 145;
        return `${x},${y}`;
      })
      .join(" ");

  const incomePoints = pointsFor("income");
  const spendPoints = pointsFor("spend");

  return (
    <div className="h-64 min-w-0">
      <svg className="h-full w-full" viewBox="0 0 410 220" role="img" aria-label="Six-month flow">
        <defs>
          <linearGradient id="analyticsIncomeFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--credit))" stopOpacity="0.34" />
            <stop offset="100%" stopColor="hsl(var(--credit))" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="analyticsSpendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand-coral))" stopOpacity="0.32" />
            <stop offset="100%" stopColor="hsl(var(--brand-coral))" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[55, 100, 145, 190].map((y) => (
          <line key={y} x1="8" x2="402" y1={y} y2={y} stroke="rgba(255,255,255,0.12)" />
        ))}
        <polygon points={`10,205 ${incomePoints} 390,205`} fill="url(#analyticsIncomeFill)" />
        <polygon points={`10,205 ${spendPoints} 390,205`} fill="url(#analyticsSpendFill)" />
        <polyline
          points={incomePoints}
          fill="none"
          stroke="hsl(var(--credit))"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <polyline
          points={spendPoints}
          fill="none"
          stroke="hsl(var(--brand-coral))"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {monthlyTrend.map((item, index) => (
          <text
            key={item.month}
            x={10 + index * 76}
            y="218"
            fill="rgba(255,255,255,0.62)"
            fontSize="12"
          >
            {item.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

function CategoryDonut() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div
        className="relative grid aspect-square w-56 place-items-center rounded-full shadow-inner"
        style={{ background: `conic-gradient(${categoryDonut.stops.join(", ")})` }}
        aria-label="Category spend mix"
        role="img"
      >
        <div className="bg-surface border-border grid aspect-square w-32 place-items-center rounded-full border text-center">
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase">Total</p>
            <p className="mt-1 text-xl font-black tracking-tight">
              {formatCurrency(totalCategorySpend)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyBars() {
  return (
    <div className="border-border/70 flex h-72 items-end gap-3 border-b pb-6">
      {weeklyRhythm.map((day) => (
        <div key={day.day} className="flex h-full flex-1 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end justify-center gap-1.5">
            <span
              className="bg-debit w-full max-w-5 rounded-t-md"
              style={{ height: `${Math.max(12, (day.debit / maxWeeklyValue) * 100)}%` }}
              aria-label={`${day.day} debits ${formatCurrency(day.debit)}`}
            />
            <span
              className="bg-credit w-full max-w-5 rounded-t-md"
              style={{ height: `${Math.max(12, (day.credit / maxWeeklyValue) * 100)}%` }}
              aria-label={`${day.day} credits ${formatCurrency(day.credit)}`}
            />
          </div>
          <span className="text-muted-foreground text-center text-xs font-bold">{day.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-1 py-1 sm:px-0">
      <section className="ink-panel overflow-hidden rounded-lg">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                  Analytics preview
                </Badge>
                <Badge className="border-brand-gold/35 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/15">
                  No live data required
                </Badge>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Household money, ready for sharper decisions.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/76 sm:text-base">
                  A polished preview of where SpendBook analytics is headed: spending rhythm,
                  category pressure, member signals, and month-end momentum in one calm view.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {topMetrics.map(({ label, value, delta, helper, Icon, tone }) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-white/58 uppercase">{label}</p>
                    <Icon className={`h-4 w-4 ${tone}`} />
                  </div>
                  <p className="mt-3 text-2xl font-black tracking-tight text-white">{value}</p>
                  <p className="mt-1 text-xs text-white/62">
                    <span className={tone}>{delta}</span> {helper}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white/55 uppercase">Six-month flow</p>
                <p className="text-sm font-semibold text-white">Income, spend, and surplus</p>
              </div>
              <CalendarRange className="text-brand-gold h-5 w-5" />
            </div>
            <div className="h-64">
              <MiniAreaChart />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.88fr]">
        <section className="surface-panel rounded-lg p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase">Category pressure</p>
              <h2 className="mt-1 text-xl font-black tracking-tight">Where the month is going</h2>
            </div>
            <Badge variant="secondary" className="w-fit">
              Preview mix
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-[0.8fr_1fr]">
            <CategoryDonut />

            <div className="space-y-3">
              {categoryMix.map((category) => {
                return (
                  <div
                    key={category.name}
                    className="border-border/70 bg-surface/80 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-semibold">{category.name}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                    <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${category.percent}%`, backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="paper-panel rounded-lg p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase">Weekly rhythm</p>
              <h2 className="mt-1 text-xl font-black tracking-tight">Spend vs inflow</h2>
            </div>
            <CircleDollarSign className="text-primary h-5 w-5" />
          </div>
          <WeeklyBars />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.88fr_1fr]">
        <section className="paper-panel rounded-lg p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase">Member signals</p>
              <h2 className="mt-1 text-xl font-black tracking-tight">Who needs attention</h2>
            </div>
            <Sparkles className="text-brand-gold h-5 w-5" />
          </div>

          <div className="space-y-3">
            {memberSignals.map((member) => (
              <div
                key={member.name}
                className="border-border/70 bg-surface/80 flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="min-w-0">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-muted-foreground mt-1 truncate text-sm">{member.note}</p>
                </div>
                <Badge variant={member.tone as "credit" | "debit" | "payment"} className="shrink-0">
                  {formatCurrency(member.amount)}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel rounded-lg p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-muted-foreground text-xs font-bold uppercase">Insight queue</p>
            <h2 className="mt-1 text-xl font-black tracking-tight">Preview recommendations</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {insightQueue.map(({ title, body, Icon }) => (
              <article key={title} className="border-border/70 bg-surface/80 rounded-lg border p-4">
                <div className="bg-accent text-accent-foreground mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="leading-5 font-bold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
