"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTransactionAction } from "@/server/actions/transaction";
import { TransactionForm } from "./TransactionForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { TransactionWithRelations, Person, CategoryTag, PaymentMode } from "@/types";

interface TransactionCardProps {
  transaction: TransactionWithRelations;
  persons: Person[];
  categoryTags: CategoryTag[];
  paymentModes: (PaymentMode & { ownerPerson: Person | null })[];
}

export function TransactionCard({
  transaction,
  persons,
  categoryTags,
  paymentModes,
}: TransactionCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${transaction.name}"?`)) return;
    const result = await deleteTransactionAction(transaction.id);
    if (!result.success) {
      toast.error(result.error);
    }
  }

  const typeBadgeVariant =
    transaction.type === "DEBIT" ? "debit" : transaction.type === "CREDIT" ? "credit" : "payment";

  return (
    <>
      <div className="glass group dark:hover:bg-foreground/5 relative flex items-center justify-between gap-4 rounded-2xl p-4 transition-all duration-300 hover:shadow-md">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground/90 truncate text-base font-semibold">
              {transaction.name}
            </span>
            {transaction.categoryTag && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                style={{
                  backgroundColor: `${transaction.categoryTag.color}15`,
                  color: transaction.categoryTag.color,
                  border: `1px solid ${transaction.categoryTag.color}30`,
                }}
              >
                {transaction.categoryTag.name}
              </span>
            )}
            <Badge variant={typeBadgeVariant} className="text-[10px] tracking-wide uppercase">
              {transaction.paidTowards === "FAMILY" ? "Family" : "Personal"}
            </Badge>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            {transaction.description && <span className="truncate">{transaction.description}</span>}
            {transaction.paymentMode && (
              <span className="flex items-center gap-1 opacity-70">
                <span className="bg-muted-foreground h-1 w-1 rounded-full" />
                {transaction.paymentMode.name}
                {transaction.paymentMode.ownerPersonId === null ? " (Family)" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`text-lg font-bold tracking-tight tabular-nums ${
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
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary h-7 w-7 rounded-full"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground h-7 w-7 rounded-full"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
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
  );
}
