import { getAppSession } from "@/lib/auth/session"
import { Wallet } from "lucide-react"
import { UserButton, SignedIn } from "@neondatabase/auth/react"

/** Top header bar — shows on mobile (where sidebar is hidden). */
export async function Header() {
  const session = await getAppSession()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Mobile: show logo */}
      <div className="flex items-center gap-2 md:hidden">
        <Wallet className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold">SpendBook</span>
      </div>

      {/* Desktop: show page context or empty spacer */}
      <div className="hidden md:block" />

      {/* User info + sign out */}
      <div className="flex items-center gap-3">
        {session?.user && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {session.user.name}
          </span>
        )}
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
