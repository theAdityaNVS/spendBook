"use server"

import { revalidatePath } from "next/cache"
import { getAppSession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
} from "@/lib/validators"
import { recalculateBalancesForDate } from "@/lib/balance"
import type { ActionResult, Transaction } from "@/types"

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

export async function createTransactionAction(
  _prev: ActionResult<Transaction>,
  formData: FormData,
): Promise<ActionResult<Transaction>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const raw = {
    personId: formData.get("personId"),
    type: formData.get("type"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    categoryTagId: formData.get("categoryTagId") || null,
    paymentModeId: formData.get("paymentModeId") || null,
    amount: formData.get("amount"),
    currency: formData.get("currency") || "INR",
    paidTowards: formData.get("paidTowards") || "PERSONAL",
    date: formData.get("date"),
  }

  const parsed = createTransactionSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  try {
    // Verify person belongs to family
    const person = await db.person.findFirst({
      where: {
        id: parsed.data.personId,
        familyId: session.user.activeFamilyId,
        isArchived: false,
      },
    })
    if (!person) return { success: false, error: "Invalid person" }

    const date = parseDate(parsed.data.date)

    const transaction = await db.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          familyId: session.user.activeFamilyId,
          personId: parsed.data.personId,
          type: parsed.data.type,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          categoryTagId: parsed.data.categoryTagId ?? null,
          paymentModeId: parsed.data.paymentModeId ?? null,
          amount: parsed.data.amount,
          currency: parsed.data.currency,
          paidTowards: parsed.data.paidTowards,
          date,
          createdById: session.user.id,
        },
      })
      return created
    })

    // Recalculate balances outside the transaction to avoid deadlocks
    await recalculateBalancesForDate(
      session.user.activeFamilyId,
      parsed.data.personId,
      date,
    )

    revalidatePath("/ledger")
    return { success: true, data: transaction }
  } catch (error) {
    console.error("createTransactionAction failed:", error)
    return { success: false, error: "Failed to create transaction" }
  }
}

export async function updateTransactionAction(
  _prev: ActionResult<Transaction>,
  formData: FormData,
): Promise<ActionResult<Transaction>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const raw = {
    id: formData.get("id"),
    personId: formData.get("personId"),
    type: formData.get("type"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    categoryTagId: formData.get("categoryTagId") || null,
    paymentModeId: formData.get("paymentModeId") || null,
    amount: formData.get("amount"),
    currency: formData.get("currency") || "INR",
    paidTowards: formData.get("paidTowards") || "PERSONAL",
    date: formData.get("date"),
  }

  const parsed = updateTransactionSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  try {
    const existing = await db.transaction.findFirst({
      where: { id: parsed.data.id, familyId: session.user.activeFamilyId },
    })
    if (!existing) return { success: false, error: "Transaction not found" }

    const oldDate = existing.date
    const newDate = parseDate(parsed.data.date)

    const transaction = await db.transaction.update({
      where: { id: parsed.data.id },
      data: {
        personId: parsed.data.personId,
        type: parsed.data.type,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        categoryTagId: parsed.data.categoryTagId ?? null,
        paymentModeId: parsed.data.paymentModeId ?? null,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        paidTowards: parsed.data.paidTowards,
        date: newDate,
      },
    })

    // Recalculate for both old and new dates
    await recalculateBalancesForDate(
      session.user.activeFamilyId,
      parsed.data.personId,
      newDate,
    )
    if (oldDate.toISOString() !== newDate.toISOString()) {
      await recalculateBalancesForDate(
        session.user.activeFamilyId,
        existing.personId,
        oldDate,
      )
    }

    revalidatePath("/ledger")
    return { success: true, data: transaction }
  } catch (error) {
    console.error("updateTransactionAction failed:", error)
    return { success: false, error: "Failed to update transaction" }
  }
}

export async function deleteTransactionAction(
  id: string,
): Promise<ActionResult<void>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const parsed = deleteTransactionSchema.safeParse({ id })
  if (!parsed.success) return { success: false, error: "Invalid transaction ID" }

  try {
    const existing = await db.transaction.findFirst({
      where: { id: parsed.data.id, familyId: session.user.activeFamilyId },
    })
    if (!existing) return { success: false, error: "Transaction not found" }

    await db.transaction.delete({ where: { id: parsed.data.id } })

    await recalculateBalancesForDate(
      session.user.activeFamilyId,
      existing.personId,
      existing.date,
    )

    revalidatePath("/ledger")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("deleteTransactionAction failed:", error)
    return { success: false, error: "Failed to delete transaction" }
  }
}
