import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma";

import { cookies } from "next/headers";

/**
 * Our custom session shape used throughout the app.
 * Bridges Neon Auth's session with our User + UserFamily models.
 */
export interface AppSession {
  user: {
    id: string;
    email: string;
    name: string;
    activeFamilyId: string;
    activeRole: Role;
    activePersonId: string | null;
  };
  isDevelopmentBypass?: boolean;
}

/**
 * Get the current authenticated user's app session.
 * Looks up Neon Auth session → finds/creates our User → loads UserFamily.
 * Returns null if not authenticated or no family setup yet.
 *
 * NOTE: For development, if no real session exists, returns the user specified by 'dev_user_id' cookie,
 * or the first user found in DB.
 */
export async function getAppSession(): Promise<AppSession | null> {
  const { data: neonSession } = await auth.getSession();

  if (!neonSession?.user?.email) {
    // DEVELOPMENT BYPASS
    const cookieStore = await cookies();
    const devUserId = cookieStore.get("dev_user_id")?.value;

    if (!devUserId) return null; // Force redirect via middleware

    const devUser = await db.user.findFirst({
      where: { id: devUserId },
      include: { userFamilies: { orderBy: { createdAt: "asc" }, take: 1 } },
    });

    if (devUser && devUser.userFamilies[0]) {
      const uf = devUser.userFamilies[0];
      return {
        user: {
          id: devUser.id,
          email: devUser.email,
          name: devUser.name + " (Dev)",
          activeFamilyId: uf.familyId,
          activeRole: uf.role,
          activePersonId: uf.personId,
        },
        isDevelopmentBypass: true,
      };
    }
    return null;
  }

  const { email, name, id: neonAuthId } = neonSession.user;

  // Find or create our internal User record, linked by email
  let user = await db.user.findUnique({ where: { email } });
  // ... rest of the original logic

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: name ?? email.split("@")[0],
        neonAuthId,
      },
    });
  }

  // Keep neonAuthId in sync if missing
  if (!user.neonAuthId) {
    user = await db.user.update({
      where: { id: user.id },
      data: { neonAuthId },
    });
  }

  // Load all of the user's families
  const userFamilies = await db.userFamily.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (userFamilies.length === 0) return null; // No family yet — needs onboarding

  // Check for the active_family_id cookie
  const cookieStore = await cookies();
  const activeFamilyCookie = cookieStore.get("active_family_id")?.value;

  // Determine the active family
  let activeUserFamily = userFamilies[0];
  if (activeFamilyCookie) {
    const matchedFamily = userFamilies.find((f) => f.familyId === activeFamilyCookie);
    if (matchedFamily) {
      activeUserFamily = matchedFamily;
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      activeFamilyId: activeUserFamily.familyId,
      activeRole: activeUserFamily.role,
      activePersonId: activeUserFamily.personId,
    },
  };
}

/**
 * Check if the current Neon Auth user has completed onboarding (has a family).
 * Used by middleware/redirects to route new users to /onboarding.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const session = await getAppSession();
  return session !== null;
}

/**
 * Check if the current user is authenticated via Neon Auth (regardless of onboarding).
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: neonSession } = await auth.getSession();
  if (!!neonSession?.user) return true;

  // DEVELOPMENT BYPASS
  const devUser = await db.user.findFirst();
  return !!devUser;
}
