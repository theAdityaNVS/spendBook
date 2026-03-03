"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, toDateParam, addDays, today } from "@/lib/utils"

interface DateNavProps {
  date: Date
}

export function DateNav({ date }: DateNavProps) {
  const router = useRouter()
  const isToday =
    toDateParam(date) === toDateParam(today())

  function go(days: number) {
    router.push(`/ledger?date=${toDateParam(addDays(date, days))}`)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous day"
        onClick={() => go(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-col items-center gap-1">
        <span className="text-base font-semibold">
          {formatDate(date)}
        </span>
        {isToday && (
          <Badge variant="secondary" className="text-xs">
            Today
          </Badge>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        aria-label="Next day"
        onClick={() => go(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
