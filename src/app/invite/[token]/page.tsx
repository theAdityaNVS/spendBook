import { redirect } from "next/navigation"
import { getAppSession, isAuthenticated } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { AcceptInviteForm } from "./AcceptInviteForm"

export const dynamic = "force-dynamic"

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    // Ideally we would pass a callback URL, but simple redirect is okay for MVP
    // Neon Auth usually handles this, but just to be sure
    redirect("/auth/sign-in")
  }

  const session = await getAppSession()

  // Find the invite
  const invite = await db.familyInvite.findUnique({
    where: { token },
    include: { family: true },
  })

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Invite</h1>
          <p className="text-muted-foreground">This invite link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invite Expired</h1>
          <p className="text-muted-foreground">This invite link has expired.</p>
        </div>
      </div>
    )
  }

  // If already part of this family
  if (session?.user?.activeFamilyId === invite.familyId) {
    redirect("/ledger")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Join Family</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve been invited to join the <strong>{invite.family.name}</strong> family account.
          </p>
        </div>

        <AcceptInviteForm token={token} />
      </div>
    </div>
  )
}
