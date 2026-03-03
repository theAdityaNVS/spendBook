import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Person, CategoryTag, PaymentMode } from "@/types"

/** Get all active persons for the active family. Family Account is always first. */
export async function getPersons(): Promise<Person[]> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.person.findMany({
    where: { familyId: session.user.activeFamilyId, isArchived: false },
    orderBy: [{ isFamilyAccount: "desc" }, { createdAt: "asc" }],
  })
}

/** Get all active category tags for the active family. */
export async function getCategoryTags(): Promise<CategoryTag[]> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.categoryTag.findMany({
    where: { familyId: session.user.activeFamilyId, isArchived: false },
    orderBy: { sortOrder: "asc" },
  })
}

/** Get all active payment modes with owner person for the active family. */
export async function getPaymentModes(): Promise<
  (PaymentMode & { ownerPerson: Person | null })[]
> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.paymentMode.findMany({
    where: { familyId: session.user.activeFamilyId, isArchived: false },
    include: { ownerPerson: true },
    orderBy: { createdAt: "asc" },
  })
}
