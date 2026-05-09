"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PersonMonthlySummary } from "@/server/queries/summary";
import { formatCurrency } from "@/lib/utils";

export function SummaryView({
  year,
  month,
  summaries,
  familyAggregate,
  categoryBreakdown,
}: {
  year: number;
  month: number;
  summaries: PersonMonthlySummary[];
  familyAggregate: { totalDebits: number; totalCredits: number; totalPayments: number };
  categoryBreakdown: { id: string; name: string; color: string; amount: number }[];
}) {
  const router = useRouter();

  const date = new Date(year, month - 1, 1);
  const monthName = date.toLocaleString("default", { month: "long" });

  function handlePrevMonth() {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    router.push(`/summary?year=${newYear}&month=${newMonth}`);
  }

  function handleNextMonth() {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    router.push(`/summary?year=${newYear}&month=${newMonth}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-foreground/90 text-3xl font-extrabold tracking-tight">
          Monthly Summary
        </h1>
        <div className="glass-panel flex items-center gap-2 rounded-full px-2 py-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-32 text-center font-semibold tracking-wide">
            {monthName} {year}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="glass-panel dark:hover:shadow-primary/5 overflow-hidden rounded-[2rem] p-6 shadow-md transition-all hover:shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">Member Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">Member</TableHead>
                <TableHead className="text-muted-foreground text-right font-semibold">
                  Opening
                </TableHead>
                <TableHead className="text-debit/80 text-right font-semibold">Debits</TableHead>
                <TableHead className="text-credit/80 text-right font-semibold">Credits</TableHead>
                <TableHead className="text-payment/80 text-right font-semibold">Payments</TableHead>
                <TableHead className="text-foreground text-right font-bold">Closing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((s) => (
                <TableRow
                  key={s.person.id}
                  className="border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="text-foreground/90 font-semibold">
                    {s.person.name}
                    {s.person.isFamilyAccount && (
                      <span className="text-muted-foreground ml-1 text-[10px] tracking-wider uppercase">
                        (Family)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right font-medium">
                    {formatCurrency(s.openingBalance)}
                  </TableCell>
                  <TableCell className="text-debit text-right font-medium">
                    {formatCurrency(s.totalDebits)}
                  </TableCell>
                  <TableCell className="text-credit text-right font-medium">
                    {formatCurrency(s.totalCredits)}
                  </TableCell>
                  <TableCell className="text-payment text-right font-medium">
                    {formatCurrency(s.totalPayments)}
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold tracking-tight tabular-nums">
                    {formatCurrency(s.closingBalance)}
                  </TableCell>
                </TableRow>
              ))}
              {summaries.length > 1 && (
                <TableRow className="bg-primary/5 hover:bg-primary/5 border-0">
                  <TableCell className="font-bold">Family Total</TableCell>
                  <TableCell className="text-muted-foreground text-right font-medium">-</TableCell>
                  <TableCell className="text-debit text-right font-bold">
                    {formatCurrency(familyAggregate.totalDebits)}
                  </TableCell>
                  <TableCell className="text-credit text-right font-bold">
                    {formatCurrency(familyAggregate.totalCredits)}
                  </TableCell>
                  <TableCell className="text-payment text-right font-bold">
                    {formatCurrency(familyAggregate.totalPayments)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right font-medium">-</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {categoryBreakdown.length > 0 && (
        <div className="glass-panel dark:hover:shadow-primary/5 overflow-hidden rounded-[2rem] p-6 shadow-md transition-all hover:shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">Category Breakdown</h2>
          </div>
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="relative h-72 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    // @ts-expect-error Recharts formatter type is complex
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-4 md:w-1/2">
              {categoryBreakdown.map((category) => (
                <div
                  key={category.id}
                  className="group hover:bg-muted/50 flex items-center justify-between rounded-xl p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl shadow-inner"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <span className="text-foreground/90 font-semibold">{category.name}</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight tabular-nums">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
