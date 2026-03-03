"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  createPersonSchema,
  updatePersonSchema,
} from "@/lib/validators"
import type { ActionResult, Person } from "@/types"

export async function createPersonAction(
  _prev: ActionResult<Person>,
  formData: FormData,
): Promise<ActionResult<Person>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }
  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can add persons" }
  }

  const parsed = createPersonSchema.safeParse({ name: formData.get("name") })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  try {
    const person = await db.person.create({
      data: {
        name: parsed.data.name,
        familyId: session.user.activeFamilyId,
      },
    })
    revalidatePath("/settings")
    revalidatePath("/ledger")
    return { success: true, data: person }
  } catch (error) {
    console.error("createPersonAction failed:", error)
    return { success: false, error: "Failed to add person" }
  }
}

export async function updatePersonAction(
  _prev: ActionResult<Person>,
  formData: FormData,
): Promise<ActionResult<Person>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }
  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can edit persons" }
  }

  const parsed = updatePersonSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  try {
    // Verify the person belongs to the active family
    const existing = await db.person.findFirst({
      where: { id: parsed.data.id, familyId: session.user.activeFamilyId },
    })
    if (!existing) return { success: false, error: "Person not found" }
    if (existing.isFamilyAccount) {
      return { success: false, error: "Cannot rename the Family Account" }
    }

    const person = await db.person.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
    })
    revalidatePath("/settings")
    revalidatePath("/ledger")
    return { success: true, data: person }
  } catch (error) {
    console.error("updatePersonAction failed:", error)
    return { success: false, error: "Failed to update person" }
  }
}

export async function deletePersonAction(
  id: string,
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }
  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can remove persons" }
  }

  try {
    const person = await db.person.findFirst({
      where: { id, familyId: session.user.activeFamilyId },
    })
    if (!person) return { success: false, error: "Person not found" }
    if (person.isFamilyAccount) {
      return { success: false, error: "Cannot delete the Family Account" }
    }

    await db.person.update({ where: { id }, data: { isArchived: true } })
    revalidatePath("/settings")
    revalidatePath("/ledger")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("deletePersonAction failed:", error)
    return { success: false, error: "Failed to delete person" }
  }
}
