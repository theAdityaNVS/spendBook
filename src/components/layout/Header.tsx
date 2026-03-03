import { auth, signOut } from "@/lib/auth"
import { Wallet, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Top header bar — shows on mobile (where sidebar is hidden). */
export async function Header() {
  const session = await auth()

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{session?.user?.name}</span>
        </div>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <Button variant="ghost" size="icon" type="submit" title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
