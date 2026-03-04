"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { DEFAULT_CATEGORY_TAGS } from "@/config/constants"
import type { ActionResult } from "@/types"
import { z } from "zod"

const onboardingSchema = z.object({
  familyName: z.string().min(2, "Family name must be at least 2 characters"),
})

export async function setupFamilyAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { data: neonSession } = await auth.getSession()
  if (!neonSession?.user?.email) {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = onboardingSchema.safeParse({
    familyName: formData.get("familyName"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const { familyName } = parsed.data
  const { email, name, id: neonAuthId } = neonSession.user

  try {
    // Find or create our internal user
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name ?? email.split("@")[0],
          neonAuthId,
        },
      })
    }

    // Check if user already has a family
    const existingFamily = await db.userFamily.findFirst({
      where: { userId: user.id },
    })
    if (existingFamily) {
      return { success: false, error: "You already have a family set up" }
    }

    // Create family + default data in a transaction
    await db.$transaction(async (tx) => {
      // 1. Create family
      const family = await tx.family.create({
        data: { name: familyName },
      })

      // 2. Create built-in Family Account person
      const familyAccount = await tx.person.create({
        data: { name: "Family Account", familyId: family.id, isFamilyAccount: true },
      })

      // 3. Link user to family as ADMIN
      await tx.userFamily.create({
        data: {
          userId: user.id,
          familyId: family.id,
          role: "ADMIN",
          personId: familyAccount.id,
        },
      })

      // 4. Seed default category tags
      await tx.categoryTag.createMany({
        data: DEFAULT_CATEGORY_TAGS.map((tag, i) => ({
          ...tag,
          sortOrder: i,
          familyId: family.id,
        })),
      })

      // 5. Seed default family-owned payment modes
      await tx.paymentMode.createMany({
        data: [
          { name: "Family Cash", type: "CASH", familyId: family.id },
          { name: "Family UPI", type: "UPI", familyId: family.id },
        ],
      })
    })

    revalidatePath("/ledger")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("setupFamilyAction failed:", error)
    return { success: false, error: "Failed to set up family. Please try again." }
  }
}
