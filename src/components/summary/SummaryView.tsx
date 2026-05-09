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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Summary</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-32 text-center font-medium">
            {monthName} {year}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right text-red-500">Debits</TableHead>
                  <TableHead className="text-right text-green-500">Credits</TableHead>
                  <TableHead className="text-right text-blue-500">Payments</TableHead>
                  <TableHead className="text-right font-bold">Closing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((s) => (
                  <TableRow key={s.person.id}>
                    <TableCell className="font-medium">
                      {s.person.name}
                      {s.person.isFamilyAccount && " (Family)"}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(s.openingBalance)}</TableCell>
                    <TableCell className="text-right text-red-500">
                      {formatCurrency(s.totalDebits)}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {formatCurrency(s.totalCredits)}
                    </TableCell>
                    <TableCell className="text-right text-blue-500">
                      {formatCurrency(s.totalPayments)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(s.closingBalance)}
                    </TableCell>
                  </TableRow>
                ))}
                {summaries.length > 1 && (
                  <TableRow className="bg-muted/50 hover:bg-muted/50 font-bold">
                    <TableCell>Family Total</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right text-red-500">
                      {formatCurrency(familyAggregate.totalDebits)}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {formatCurrency(familyAggregate.totalCredits)}
                    </TableCell>
                    <TableCell className="text-right text-blue-500">
                      {formatCurrency(familyAggregate.totalPayments)}
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8 md:flex-row">
            <div className="h-64 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    // @ts-expect-error Recharts formatter type is complex
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-4 md:w-1/2">
              {categoryBreakdown.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(category.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
