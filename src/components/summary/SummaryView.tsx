"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PersonMonthlySummary } from "@/server/queries/summary"
import { formatCurrency } from "@/lib/utils"

export function SummaryView({
  year,
  month,
  summaries,
  familyAggregate,
}: {
  year: number
  month: number
  summaries: PersonMonthlySummary[]
  familyAggregate: { totalDebits: number; totalCredits: number; totalPayments: number }
}) {
  const router = useRouter()

  const date = new Date(year, month - 1, 1)
  const monthName = date.toLocaleString("default", { month: "long" })

  function handlePrevMonth() {
    let newMonth = month - 1
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }
    router.push(`/summary?year=${newYear}&month=${newMonth}`)
  }

  function handleNextMonth() {
    let newMonth = month + 1
    let newYear = year
    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }
    router.push(`/summary?year=${newYear}&month=${newMonth}`)
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
                    <TableCell className="text-right text-red-500">{formatCurrency(s.totalDebits)}</TableCell>
                    <TableCell className="text-right text-green-500">{formatCurrency(s.totalCredits)}</TableCell>
                    <TableCell className="text-right text-blue-500">{formatCurrency(s.totalPayments)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(s.closingBalance)}</TableCell>
                  </TableRow>
                ))}
                {summaries.length > 1 && (
                  <TableRow className="bg-muted/50 font-bold hover:bg-muted/50">
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
    </div>
  )
}
