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
import { PAID_TOWARDS_LABELS, TRANSACTION_TYPE_LABELS } from "@/config/constants";
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

const typeTone = {
  DEBIT: "border-debit bg-debit-muted text-debit",
  CREDIT: "border-credit bg-credit-muted text-credit",
  PAYMENT: "border-payment bg-payment-muted text-payment",
} as const;

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

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      handleClose();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, handleClose]);

  const [type, setType] = useState(editTransaction?.type ?? "DEBIT");
  const [paidTowards, setPaidTowards] = useState(editTransaction?.paidTowards ?? "PERSONAL");
  const [personId, setPersonId] = useState(
    editTransaction?.personId ?? defaultPersonId ?? persons[0]?.id ?? ""
  );
  const [categoryTagId, setCategoryTagId] = useState(editTransaction?.categoryTagId ?? "__none__");
  const [paymentModeId, setPaymentModeId] = useState(editTransaction?.paymentModeId ?? "__none__");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <p className="text-xs font-black uppercase text-muted-foreground">
            {isEdit ? "Update ledger entry" : "New ledger entry"}
          </p>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="mt-2 space-y-5">
          {isEdit && <input type="hidden" name="id" value={editTransaction.id} />}

          <input type="hidden" name="type" value={type} />
          <fieldset className="space-y-3">
            <legend className="text-xs font-black uppercase text-muted-foreground">
              Transaction Type
            </legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Transaction type">
              {(["DEBIT", "CREDIT", "PAYMENT"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={type === t}
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-3 py-3 text-sm font-black transition ${
                    type === t
                      ? typeTone[t]
                      : "border-input bg-surface text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {TRANSACTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <input type="hidden" name="personId" value={personId} />
              <Label className="text-xs font-black uppercase text-muted-foreground">Person</Label>
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.isFamilyAccount ? " (Family)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-black uppercase text-muted-foreground">
                Date
              </Label>
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
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase text-muted-foreground">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Groceries, rent, card payment"
                defaultValue={editTransaction?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-xs font-black uppercase text-muted-foreground"
              >
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                defaultValue={editTransaction?.amount?.toString()}
                required
                className="text-lg font-black tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs font-black uppercase text-muted-foreground"
            >
              Notes
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional context for the family ledger"
              rows={2}
              defaultValue={editTransaction?.description ?? ""}
              className="resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <input
                type="hidden"
                name="categoryTagId"
                value={categoryTagId === "__none__" ? "" : categoryTagId}
              />
              <Label className="text-xs font-black uppercase text-muted-foreground">Category</Label>
              <Select value={categoryTagId} onValueChange={setCategoryTagId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No category</SelectItem>
                  {categoryTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <input
                type="hidden"
                name="paymentModeId"
                value={paymentModeId === "__none__" ? "" : paymentModeId}
              />
              <Label className="text-xs font-black uppercase text-muted-foreground">
                Payment Mode
              </Label>
              <Select value={paymentModeId} onValueChange={setPaymentModeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No payment mode</SelectItem>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
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

          <input type="hidden" name="paidTowards" value={paidTowards} />
          <fieldset className="space-y-3">
            <legend className="text-xs font-black uppercase text-muted-foreground">
              Paid Towards
            </legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Paid towards">
              {(["PERSONAL", "FAMILY"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={paidTowards === t}
                  onClick={() => setPaidTowards(t)}
                  className={`rounded-lg border px-3 py-3 text-sm font-black transition ${
                    paidTowards === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-surface text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {PAID_TOWARDS_LABELS[t]}
                </button>
              ))}
            </div>
          </fieldset>

          <input type="hidden" name="currency" value="INR" />

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Adding..."
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
