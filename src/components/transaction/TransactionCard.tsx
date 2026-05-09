"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Banknote, CreditCard, Pencil, Trash2 } from "lucide-react";
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
  const amountColor =
    transaction.type === "DEBIT"
      ? "text-debit"
      : transaction.type === "CREDIT"
        ? "text-credit"
        : "text-payment";
  const amountPrefix = transaction.type === "DEBIT" ? "-" : "+";

  return (
    <>
      <article className="group grid gap-4 bg-surface px-4 py-4 transition-colors hover:bg-surface-soft/60 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
        <div className="flex min-w-0 gap-4">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary">
            {transaction.type === "PAYMENT" ? (
              <CreditCard className="h-5 w-5" />
            ) : (
              <Banknote className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black tracking-tight">{transaction.name}</h3>
              {transaction.categoryTag && (
                <span
                  className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-black uppercase"
                  style={{
                    backgroundColor: `${transaction.categoryTag.color}18`,
                    color: transaction.categoryTag.color,
                  }}
                >
                  <span
                    className="mr-1.5 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: transaction.categoryTag.color }}
                  />
                  {transaction.categoryTag.name}
                </span>
              )}
              <Badge variant={typeBadgeVariant} className="rounded-md text-[10px] uppercase">
                {transaction.paidTowards === "FAMILY" ? "Family" : "Personal"}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">{transaction.person.name}</span>
              {transaction.description && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="max-w-full truncate">{transaction.description}</span>
                </>
              )}
              {transaction.paymentMode && (
                <>
                  <span aria-hidden="true">/</span>
                  <span>
                    {transaction.paymentMode.name}
                    {transaction.paymentMode.ownerPersonId === null ? " (Family)" : ""}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className={`text-xl font-black tabular-nums ${amountColor}`}>
            {amountPrefix}
            {formatCurrency(transaction.amount.toString())}
          </span>
          <div className="flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${transaction.name}`}
              className="h-9 w-9"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${transaction.name}`}
              className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </article>

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
