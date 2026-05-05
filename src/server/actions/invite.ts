"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAppSession } from "@/lib/auth/session"
import type { ActionResult, Role } from "@/types"

export async function createInvite(
  role: Role
): Promise<ActionResult<string>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can create invites" }
  }

  try {
    // Expire in 7 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await db.familyInvite.create({
      data: {
        familyId: session.user.activeFamilyId,
        role,
        expiresAt,
      },
    })

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invite.token}`

    revalidatePath("/settings")
    return { success: true, data: inviteUrl }
  } catch (error: any) {
    console.error("Error creating invite:", error)
    return { success: false, error: "Failed to create invite link" }
  }
}

export async function revokeInvite(
  id: string
): Promise<ActionResult<void>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can revoke invites" }
  }

  try {
    await db.familyInvite.delete({
      where: {
        id,
        familyId: session.user.activeFamilyId,
      },
    })

    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("Error revoking invite:", error)
    return { success: false, error: "Failed to revoke invite" }
  }
}

export async function acceptInvite(
  token: string,
  personName: string
): Promise<ActionResult<void>> {
  const session = await getAppSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  try {
    const invite = await db.familyInvite.findUnique({
      where: { token },
      include: { family: true },
    })

    if (!invite) {
      return { success: false, error: "Invalid invite link" }
    }

    if (invite.expiresAt < new Date()) {
      return { success: false, error: "Invite link has expired" }
    }

    // Check if user is already in this family
    const existing = await db.userFamily.findUnique({
      where: {
        userId_familyId: {
          userId: session.user.id,
          familyId: invite.familyId,
        },
      },
    })

    if (existing) {
      return { success: false, error: "You are already a member of this family" }
    }

    // Use transaction to create person, add userFamily, and delete invite
    await db.$transaction(async (tx) => {
      // Create person
      const person = await tx.person.create({
        data: {
          name: personName,
          familyId: invite.familyId,
        },
      })

      // Create user family association
      await tx.userFamily.create({
        data: {
          userId: session.user.id,
          familyId: invite.familyId,
          role: invite.role,
          personId: person.id,
        },
      })

      // Optionally, delete the invite if it's meant for single use
      // For MVP, we delete it to ensure it's a one-time link.
      await tx.familyInvite.delete({
        where: { id: invite.id },
      })
    })

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("Error accepting invite:", error)
    return { success: false, error: "Failed to join family" }
  }
}
