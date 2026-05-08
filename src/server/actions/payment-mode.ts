"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAppSession } from "@/lib/auth/session"
import type { ActionResult, PaymentMode, PaymentModeType } from "@/types"

export async function createPaymentMode(
  data: { name: string; type: PaymentModeType; ownerPersonId: string | null }
): Promise<ActionResult<PaymentMode>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can create payment modes" }
  }

  try {
    const mode = await db.paymentMode.create({
      data: {
        name: data.name,
        type: data.type,
        ownerPersonId: data.ownerPersonId,
        familyId: session.user.activeFamilyId,
      },
    })

    revalidatePath("/settings")
    return { success: true, data: mode }
  } catch (error) {
    console.error("Error creating payment mode:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create payment mode" }
  }
}

export async function updatePaymentMode(
  id: string,
  data: { name: string; type: PaymentModeType; ownerPersonId: string | null }
): Promise<ActionResult<PaymentMode>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can edit payment modes" }
  }

  try {
    const mode = await db.paymentMode.update({
      where: {
        id,
        familyId: session.user.activeFamilyId,
      },
      data: {
        name: data.name,
        type: data.type,
        ownerPersonId: data.ownerPersonId,
      },
    })

    revalidatePath("/settings")
    return { success: true, data: mode }
  } catch (error) {
    console.error("Error updating payment mode:", error)
    return { success: false, error: "Failed to update payment mode" }
  }
}

export async function archivePaymentMode(
  id: string
): Promise<ActionResult<void>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can archive payment modes" }
  }

  try {
    await db.paymentMode.update({
      where: {
        id,
        familyId: session.user.activeFamilyId,
      },
      data: { isArchived: true },
    })

    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error archiving payment mode:", error)
    return { success: false, error: "Failed to archive payment mode" }
  }
}
