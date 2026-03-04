import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import type { Role } from "@/generated/prisma"

/**
 * Our custom session shape used throughout the app.
 * Bridges Neon Auth's session with our User + UserFamily models.
 */
export interface AppSession {
  user: {
    id: string
    email: string
    name: string
    activeFamilyId: string
    activeRole: Role
  }
}

/**
 * Get the current authenticated user's app session.
 * Looks up Neon Auth session → finds/creates our User → loads UserFamily.
 * Returns null if not authenticated or no family setup yet.
 */
export async function getAppSession(): Promise<AppSession | null> {
  const { data: neonSession } = await auth.getSession()
  if (!neonSession?.user?.email) return null

  const { email, name, id: neonAuthId } = neonSession.user

  // Find or create our internal User record, linked by email
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

  // Keep neonAuthId in sync if missing
  if (!user.neonAuthId) {
    user = await db.user.update({
      where: { id: user.id },
      data: { neonAuthId },
    })
  }

  // Load the user's first (active) family
  const userFamily = await db.userFamily.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  })

  if (!userFamily) return null // No family yet — needs onboarding

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      activeFamilyId: userFamily.familyId,
      activeRole: userFamily.role,
    },
  }
}

/**
 * Check if the current Neon Auth user has completed onboarding (has a family).
 * Used by middleware/redirects to route new users to /onboarding.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const session = await getAppSession()
  return session !== null
}

/**
 * Check if the current user is authenticated via Neon Auth (regardless of onboarding).
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: neonSession } = await auth.getSession()
  return !!neonSession?.user
}
