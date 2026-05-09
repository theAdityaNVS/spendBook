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
    <header className="glass-panel z-20 mx-4 mt-4 relative flex h-20 items-center justify-between rounded-[2rem] px-6 shadow-xl md:mx-8 md:mt-6 md:px-8">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10 pointer-events-none" />

      {/* Mobile: show logo */}
      <div className="flex items-center gap-3 md:hidden relative z-10">
        <div className="bg-primary/20 text-primary relative flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ring-1 ring-white/20 backdrop-blur-md">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
          SpendBook
        </span>
      </div>

      {/* Desktop: show page context or empty spacer */}
      <div className="hidden md:block relative z-10" />

      {/* User info + sign out */}
      <div className="flex items-center gap-4 relative z-10">
        {session?.isDevelopmentBypass && (
          <DevAccountPicker users={allUsers} currentUserId={session.user.id} />
        )}

        {session?.user && !session.isDevelopmentBypass && (
          <span className="text-muted-foreground hidden text-sm font-semibold tracking-wide sm:inline bg-foreground/5 px-3 py-1.5 rounded-full ring-1 ring-white/10 shadow-sm backdrop-blur-sm">
            {session.user.name}
          </span>
        )}

        {!session?.isDevelopmentBypass && (
          <SignedIn>
            <div className="ring-1 ring-white/20 rounded-full shadow-lg overflow-hidden">
              <UserButton />
            </div>
          </SignedIn>
        )}
      </div>
    </header>
  );
}
