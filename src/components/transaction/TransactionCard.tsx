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
      <div className="glass group relative flex items-center justify-between gap-4 rounded-[1.5rem] p-5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-white/10 transition-colors" />

        <div className="flex min-w-0 flex-1 flex-col gap-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-foreground/90 truncate text-lg font-bold tracking-tight">
              {transaction.name}
            </span>
            {transaction.categoryTag && (
              <span
                className="inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-extrabold tracking-widest uppercase shadow-sm"
                style={{
                  backgroundColor: `${transaction.categoryTag.color}15`,
                  color: transaction.categoryTag.color,
                  border: `1px solid ${transaction.categoryTag.color}40`,
                }}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" 
                  style={{ backgroundColor: transaction.categoryTag.color }}
                />
                {transaction.categoryTag.name}
              </span>
            )}
            <Badge variant={typeBadgeVariant} className="text-[10px] tracking-widest uppercase font-bold shadow-sm">
              {transaction.paidTowards === "FAMILY" ? "Family" : "Personal"}
            </Badge>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm font-medium">
            {transaction.description && <span className="truncate opacity-90">{transaction.description}</span>}
            {transaction.paymentMode && (
              <span className="flex items-center gap-1.5 bg-foreground/5 px-2 py-0.5 rounded-md ring-1 ring-foreground/10 shadow-sm backdrop-blur-sm">
                <span className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
                {transaction.paymentMode.name}
                {transaction.paymentMode.ownerPersonId === null ? " (Family)" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 relative z-10">
          <span
            className={`text-xl md:text-2xl font-black tracking-tighter tabular-nums drop-shadow-sm ${
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
          <div className="flex items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/20 hover:text-primary h-8 w-8 rounded-full shadow-sm ring-1 ring-white/10"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/20 hover:text-destructive text-muted-foreground h-8 w-8 rounded-full shadow-sm ring-1 ring-white/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
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
