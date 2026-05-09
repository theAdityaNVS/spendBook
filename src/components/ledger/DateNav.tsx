"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, toDateParam, addDays, today } from "@/lib/utils";

interface DateNavProps {
  date: Date;
}

export function DateNav({ date }: DateNavProps) {
  const router = useRouter();
  const isToday = toDateParam(date) === toDateParam(today());

  function go(days: number) {
    router.push(`/ledger?date=${toDateParam(addDays(date, days))}`);
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/10 p-1 text-white">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-white hover:bg-white/12 hover:text-white"
        aria-label="Previous day"
        onClick={() => go(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-40 px-2 text-center">
        <span className="block text-sm font-black">{formatDate(date)}</span>
        {isToday && (
          <Badge variant="secondary" className="mt-1 border-0 bg-brand-gold text-[10px] text-nav">
            Today
          </Badge>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-white hover:bg-white/12 hover:text-white"
        aria-label="Next day"
        onClick={() => go(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
