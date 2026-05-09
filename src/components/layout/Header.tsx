import { getAppSession } from "@/lib/auth/session";
import { CalendarDays, Wallet } from "lucide-react";
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
    <header className="surface-panel relative z-20 mx-4 mt-4 flex min-h-16 items-center justify-between rounded-lg px-4 md:mx-8 md:mt-6 md:px-6">
      <div className="relative z-10 flex items-center gap-3 md:hidden">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="text-xl font-black tracking-tight">SpendBook</span>
      </div>

      <div className="relative z-10 hidden items-center gap-3 md:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <CalendarDays className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Workspace</p>
          <p className="text-sm font-semibold">Household money, clearly arranged</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        {session?.isDevelopmentBypass && (
          <DevAccountPicker users={allUsers} currentUserId={session.user.id} />
        )}

        {session?.user && !session.isDevelopmentBypass && (
          <span className="hidden rounded-lg border bg-surface-soft px-3 py-2 text-sm font-semibold text-muted-foreground sm:inline">
            {session.user.name}
          </span>
        )}

        {!session?.isDevelopmentBypass && (
          <SignedIn>
            <div className="overflow-hidden rounded-full ring-1 ring-border">
              <UserButton />
            </div>
          </SignedIn>
        )}
      </div>
    </header>
  );
}
