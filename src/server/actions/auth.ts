"use server"

import bcrypt from "bcryptjs"
import { signIn } from "@/lib/auth"
import { db } from "@/lib/db"
import { registerSchema, loginSchema } from "@/lib/validators"
import { DEFAULT_CATEGORY_TAGS } from "@/config/constants"
import type { ActionResult } from "@/types"

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Invalid email or password" }
  }
}

export async function registerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    familyName: formData.get("familyName"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const { name, email, password, familyName } = parsed.data

  // Check for existing user
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: "An account with this email already exists" }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword },
      })

      // 2. Create family
      const family = await tx.family.create({
        data: { name: familyName },
      })

      // 3. Create the built-in Family Account person
      const familyAccount = await tx.person.create({
        data: { name: "Family Account", familyId: family.id, isFamilyAccount: true },
      })

      // 4. Link user to family as ADMIN
      await tx.userFamily.create({
        data: {
          userId: user.id,
          familyId: family.id,
          role: "ADMIN",
          personId: familyAccount.id,
        },
      })

      // 5. Seed default category tags
      await tx.categoryTag.createMany({
        data: DEFAULT_CATEGORY_TAGS.map((tag, i) => ({
          ...tag,
          sortOrder: i,
          familyId: family.id,
        })),
      })

      // 6. Seed default family-owned payment modes
      await tx.paymentMode.createMany({
        data: [
          { name: "Family Cash", type: "CASH", familyId: family.id },
          { name: "Family UPI", type: "UPI", familyId: family.id },
        ],
      })
    })

    // Sign in the newly registered user
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true, data: undefined }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("registerAction failed:", { errorMessage, name: error instanceof Error ? error.name : "Unknown" })
    // If database URL is not set, provide specific error message
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not configured")
    }
    return { success: false, error: "Failed to create account. Please try again." }
  }
}
