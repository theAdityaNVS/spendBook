"use client"

import { useActionState, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/server/actions/transaction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toDateParam } from "@/lib/utils"
import { TRANSACTION_TYPE_LABELS, PAID_TOWARDS_LABELS, PAYMENT_MODE_TYPE_LABELS } from "@/config/constants"
import type { Person, CategoryTag, PaymentMode, Transaction, ActionResult } from "@/types"

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  persons: Person[]
  categoryTags: CategoryTag[]
  paymentModes: (PaymentMode & { ownerPerson: Person | null })[]
  defaultDate: Date
  defaultPersonId?: string
  editTransaction?: Transaction
}

const initial: ActionResult<Transaction> = { success: false, error: "" }

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
  const isEdit = !!editTransaction
  const action = isEdit ? updateTransactionAction : createTransactionAction

  const [state, formAction, isPending] = useActionState(action, initial)

  // Stable ref for onClose to avoid useEffect re-triggers
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const handleClose = useCallback(() => {
    onCloseRef.current()
  }, [])

  // Reset and close on success
  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? "Transaction updated" : "Transaction added")
      handleClose()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, isEdit, handleClose])

  // Local state for controlled selects
  const [type, setType] = useState(editTransaction?.type ?? "DEBIT")
  const [paidTowards, setPaidTowards] = useState(
    editTransaction?.paidTowards ?? "PERSONAL",
  )
  const [personId, setPersonId] = useState(
    editTransaction?.personId ?? defaultPersonId ?? persons[0]?.id ?? "",
  )
  const [categoryTagId, setCategoryTagId] = useState(
    editTransaction?.categoryTagId ?? "__none__",
  )
  const [paymentModeId, setPaymentModeId] = useState(
    editTransaction?.paymentModeId ?? "__none__",
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={editTransaction.id} />}

          {/* Type */}
          <input type="hidden" name="type" value={type} />
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["DEBIT", "CREDIT", "PAYMENT"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
                    type === t
                      ? t === "DEBIT"
                        ? "border-debit bg-debit-muted text-debit"
                        : t === "CREDIT"
                          ? "border-credit bg-credit-muted text-credit"
                          : "border-payment bg-payment-muted text-payment"
                      : "border-input bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {TRANSACTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Person */}
          <input type="hidden" name="personId" value={personId} />
          <div className="space-y-2">
            <Label>Person</Label>
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Swiggy, HDFC CC Payment"
              defaultValue={editTransaction?.name}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g. KFC burger"
              rows={2}
              defaultValue={editTransaction?.description ?? ""}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              defaultValue={editTransaction?.amount?.toString()}
              required
            />
          </div>

          {/* Category Tag */}
          <input
            type="hidden"
            name="categoryTagId"
            value={categoryTagId === "__none__" ? "" : categoryTagId}
          />
          <div className="space-y-2">
            <Label>Category</Label>
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

          {/* Payment Mode */}
          <input
            type="hidden"
            name="paymentModeId"
            value={paymentModeId === "__none__" ? "" : paymentModeId}
          />
          <div className="space-y-2">
            <Label>Payment Mode</Label>
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
                    {" · "}
                    {PAYMENT_MODE_TYPE_LABELS[mode.type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paid Towards */}
          <input type="hidden" name="paidTowards" value={paidTowards} />
          <div className="space-y-2">
            <Label>Paid Towards</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["PERSONAL", "FAMILY"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPaidTowards(t)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    paidTowards === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {PAID_TOWARDS_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
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

          <input type="hidden" name="currency" value="INR" />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Adding…"
                : isEdit
                  ? "Save changes"
                  : "Add transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
