"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { deleteTransactionAction } from "@/server/actions/transaction"
import { TransactionForm } from "./TransactionForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type {
  TransactionWithRelations,
  Person,
  CategoryTag,
  PaymentMode,
} from "@/types"

interface TransactionCardProps {
  transaction: TransactionWithRelations
  persons: Person[]
  categoryTags: CategoryTag[]
  paymentModes: (PaymentMode & { ownerPerson: Person | null })[]
}

export function TransactionCard({
  transaction,
  persons,
  categoryTags,
  paymentModes,
}: TransactionCardProps) {
  const [editOpen, setEditOpen] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${transaction.name}"?`)) return
    const result = await deleteTransactionAction(transaction.id)
    if (!result.success) {
      toast.error(result.error)
    }
  }

  const typeBadgeVariant =
    transaction.type === "DEBIT"
      ? "debit"
      : transaction.type === "CREDIT"
        ? "credit"
        : "payment"

  return (
    <>
      <div className="flex items-start justify-between gap-3 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-sm">{transaction.name}</span>
            {transaction.categoryTag && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${transaction.categoryTag.color}20`,
                  color: transaction.categoryTag.color,
                }}
              >
                {transaction.categoryTag.name}
              </span>
            )}
            <Badge variant={typeBadgeVariant} className="text-xs">
              {transaction.paidTowards === "FAMILY" ? "Family" : "Personal"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {transaction.description && (
              <span className="truncate">{transaction.description}</span>
            )}
            {transaction.paymentMode && (
              <span>
                {transaction.paymentMode.name}
                {transaction.paymentMode.ownerPersonId === null ? " (Family)" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`text-sm font-semibold tabular-nums ${
              transaction.type === "DEBIT"
                ? "text-debit"
                : transaction.type === "CREDIT"
                  ? "text-credit"
                  : "text-payment"
            }`}
          >
            {transaction.type === "DEBIT" ? "−" : "+"}
            {formatCurrency(transaction.amount.toString())}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {editOpen && (
        <TransactionForm
          open={editOpen}
          onClose={() => setEditOpen(false)}
          persons={persons}
          categoryTags={categoryTags}
          paymentModes={paymentModes}
          defaultDate={new Date(transaction.date)}
          editTransaction={transaction}
        />
      )}
    </>
  )
}
