import { getAppSession } from "@/lib/auth/session";
import { Wallet } from "lucide-react";
import { UserButton, SignedIn } from "@neondatabase/auth/react";
import { db } from "@/lib/db";
import { DevAccountPicker } from "./DevAccountPicker";

/** Top header bar — shows on mobile (where sidebar is hidden). */
export async function Header() {
  const session = await getAppSession();

  // Load all users for the account picker if in bypass mode
  const allUsers = session?.isDevelopmentBypass
    ? await db.user.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  return (
    <header className="glass z-20 mx-4 mt-4 flex h-16 items-center justify-between rounded-[1.5rem] px-6 md:mx-8 md:mt-6 md:rounded-[2rem] md:px-8">
      {/* Mobile: show logo */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold tracking-tight">SpendBook</span>
      </div>

      {/* Desktop: show page context or empty spacer */}
      <div className="hidden md:block" />

      {/* User info + sign out */}
      <div className="flex items-center gap-4">
        {session?.isDevelopmentBypass && (
          <DevAccountPicker users={allUsers} currentUserId={session.user.id} />
        )}

        {session?.user && !session.isDevelopmentBypass && (
          <span className="text-muted-foreground hidden text-sm font-medium sm:inline">
            {session.user.name}
          </span>
        )}

        {!session?.isDevelopmentBypass && (
          <SignedIn>
            <UserButton />
          </SignedIn>
        )}
      </div>
    </header>
  );
}
