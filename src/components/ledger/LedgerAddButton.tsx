"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { TransactionForm } from "@/components/transaction/TransactionForm"
import { Button } from "@/components/ui/button"
import type { Person, CategoryTag, PaymentMode, DailyLedgerData } from "@/types"

interface LedgerClientProps {
  data: DailyLedgerData
  persons: Person[]
  categoryTags: CategoryTag[]
  paymentModes: (PaymentMode & { ownerPerson: Person | null })[]
}

export function LedgerAddButton({
  data,
  persons,
  categoryTags,
  paymentModes,
}: LedgerClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating Add Button (mobile) */}
      <Button
        size="icon"
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full shadow-lg md:hidden"
        aria-label="Add transaction"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Desktop Add Button */}
      <Button
        className="hidden md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>

      {open && (
        <TransactionForm
          open={open}
          onClose={() => setOpen(false)}
          persons={persons}
          categoryTags={categoryTags}
          paymentModes={paymentModes}
          defaultDate={data.date}
        />
      )}
    </>
  )
}
