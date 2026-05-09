"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createTransactionAction, updateTransactionAction } from "@/server/actions/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toDateParam } from "@/lib/utils";
import {
  TRANSACTION_TYPE_LABELS,
  PAID_TOWARDS_LABELS,
} from "@/config/constants";
import type {
  Person,
  CategoryTag,
  PaymentMode,
  ActionResult,
  TransactionWithRelations,
} from "@/types";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  persons: Person[];
  categoryTags: CategoryTag[];
  paymentModes: (PaymentMode & { ownerPerson: Person | null })[];
  defaultDate: Date;
  defaultPersonId?: string;
  editTransaction?: TransactionWithRelations;
}

const initial: ActionResult<unknown> = { success: false, error: "" };

export function TransactionForm({
  open,
  onClose,
  persons,
  categoryTags,
  paymentModes,
  defaultDate,
  defaultPersonId,
  editTransaction,
}: TransactionFormProps) {
  const isEdit = !!editTransaction;
  const action = isEdit ? updateTransactionAction : createTransactionAction;

  const [state, formAction, isPending] = useActionState(action, initial);

  // Stable ref for onClose to avoid useEffect re-triggers
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  // Reset and close on success
  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      handleClose();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, handleClose]);

  // Local state for controlled selects
  const [type, setType] = useState(editTransaction?.type ?? "DEBIT");
  const [paidTowards, setPaidTowards] = useState(editTransaction?.paidTowards ?? "PERSONAL");
  const [personId, setPersonId] = useState(
    editTransaction?.personId ?? defaultPersonId ?? persons[0]?.id ?? ""
  );
  const [categoryTagId, setCategoryTagId] = useState(editTransaction?.categoryTagId ?? "__none__");
  const [paymentModeId, setPaymentModeId] = useState(editTransaction?.paymentModeId ?? "__none__");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md glass-panel border-white/20 shadow-2xl rounded-[2rem]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-glow">
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-5 mt-2">
          {isEdit && <input type="hidden" name="id" value={editTransaction.id} />}

          {/* Type */}
          <input type="hidden" name="type" value={type} />
          <div className="space-y-3">
            <Label className="text-xs tracking-widest uppercase font-semibold opacity-80">Transaction Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {(["DEBIT", "CREDIT", "PAYMENT"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold transition-all duration-300 ${
                    type === t
                      ? t === "DEBIT"
                        ? "border-debit bg-debit/10 text-debit shadow-[0_0_15px_rgba(var(--debit),0.3)] scale-[1.02]"
                        : t === "CREDIT"
                          ? "border-credit bg-credit/10 text-credit shadow-[0_0_15px_rgba(var(--credit),0.3)] scale-[1.02]"
                          : "border-payment bg-payment/10 text-payment shadow-[0_0_15px_rgba(var(--payment),0.3)] scale-[1.02]"
                      : "border-white/10 bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                  }`}
                >
                  {TRANSACTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Person */}
          <input type="hidden" name="personId" value={personId} />
          <div className="space-y-2 relative z-50">
            <Label className="text-xs tracking-widest uppercase font-semibold opacity-80">Person</Label>
            <Select value={personId} onValueChange={setPersonId}>
              <SelectTrigger className="rounded-xl h-12 bg-foreground/5 border-white/10 focus:ring-primary/50">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/20">
                {persons.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="rounded-lg">
                    {p.name}
                    {p.isFamilyAccount ? " (Family)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs tracking-widest uppercase font-semibold opacity-80">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Swiggy, HDFC CC Payment"
              defaultValue={editTransaction?.name}
              required
              className="rounded-xl h-12 bg-foreground/5 border-white/10 focus-visible:ring-primary/50 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs tracking-widest uppercase font-semibold opacity-80">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g. KFC burger"
              rows={2}
              defaultValue={editTransaction?.description ?? ""}
              className="rounded-xl bg-foreground/5 border-white/10 focus-visible:ring-primary/50 transition-all resize-none"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs tracking-widest uppercase font-semibold opacity-80">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              defaultValue={editTransaction?.amount?.toString()}
              required
              className="rounded-xl h-14 bg-foreground/5 border-white/10 focus-visible:ring-primary/50 transition-all text-xl font-bold tabular-nums"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Tag */}
            <input
              type="hidden"
              name="categoryTagId"
              value={categoryTagId === "__none__" ? "" : categoryTagId}
            />
            <div className="space-y-2 relative z-40">
              <Label className="text-xs tracking-widest uppercase font-semibold opacity-80">Category</Label>
              <Select value={categoryTagId} onValueChange={setCategoryTagId}>
                <SelectTrigger className="rounded-xl h-12 bg-foreground/5 border-white/10 focus:ring-primary/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/20">
                  <SelectItem value="__none__" className="rounded-lg">No category</SelectItem>
                  {categoryTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id} className="rounded-lg">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tag.color, boxShadow: `0 0 5px ${tag.color}` }}
                        />
                        {tag.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode */}
            <input
              type="hidden"
              name="paymentModeId"
              value={paymentModeId === "__none__" ? "" : paymentModeId}
            />
            <div className="space-y-2 relative z-30">
              <Label className="text-xs tracking-widest uppercase font-semibold opacity-80">Payment Mode</Label>
              <Select value={paymentModeId} onValueChange={setPaymentModeId}>
                <SelectTrigger className="rounded-xl h-12 bg-foreground/5 border-white/10 focus:ring-primary/50">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/20">
                  <SelectItem value="__none__" className="rounded-lg">No payment mode</SelectItem>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id} className="rounded-lg">
                      {mode.name}
                      {mode.ownerPersonId === null
                        ? " (Family)"
                        : mode.ownerPerson
                          ? ` (${mode.ownerPerson.name})`
                          : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Paid Towards */}
            <input type="hidden" name="paidTowards" value={paidTowards} />
            <div className="space-y-3">
              <Label className="text-xs tracking-widest uppercase font-semibold opacity-80">
                Paid Towards
              </Label>
              <div className="bg-foreground/5 flex gap-2 rounded-xl ring-1 ring-white/10 p-1 backdrop-blur-sm">
                {(["PERSONAL", "FAMILY"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPaidTowards(t)}
                    className={`flex-1 rounded-lg py-2.5 text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                      paidTowards === t
                        ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-[1.02]"
                        : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                    }`}
                  >
                    {PAID_TOWARDS_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs tracking-widest uppercase font-semibold opacity-80">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={
                  editTransaction
                    ? toDateParam(new Date(editTransaction.date))
                    : toDateParam(defaultDate)
                }
                required
                className="rounded-xl h-12 bg-foreground/5 border-white/10 focus-visible:ring-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <input type="hidden" name="currency" value="INR" />

          <div className="border-white/10 mt-6 flex gap-4 border-t pt-6">
            <Button
              type="button"
              variant="ghost"
              className="h-14 flex-1 rounded-xl font-bold hover:bg-foreground/5 border border-white/10"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-14 flex-1 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:scale-[1.02]"
              disabled={isPending}
            >
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Adding…"
                : isEdit
                  ? "Save Changes"
                  : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}