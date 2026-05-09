import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DevLoginPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  async function selectUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const cookieStore = await cookies();
    cookieStore.set("dev_user_id", userId, { path: "/" });
    redirect("/");
  }

  return (
    <div className="app-canvas relative min-h-screen overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 fine-grid opacity-70" />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nav text-brand-gold shadow-lg">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-sm font-black uppercase text-muted-foreground">
                Development access
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
              SpendBook
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Pick a seeded account and step into the redesigned finance workspace.
            </p>
          </div>

          <div className="surface-panel rounded-lg px-4 py-3">
            <div className="flex items-center gap-3 text-sm font-bold text-brand-gold">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-gold" />
              Development Bypass Active
            </div>
          </div>
        </div>

        <section className="surface-panel rounded-lg p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Who&apos;s tracking today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Switch users instantly for local QA and role testing.
              </p>
            </div>
            <span className="rounded-lg bg-accent px-3 py-2 text-xs font-black uppercase text-accent-foreground">
              {users.length} accounts
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {users.map((user) => (
            <form key={user.id} action={selectUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="lift group flex w-full items-center gap-4 rounded-lg border bg-surface p-4 text-left outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-nav text-2xl font-black text-brand-gold">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-base font-black">{user.name}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase text-muted-foreground">
                    Continue as account
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            </form>
          ))}

          <div className="flex cursor-not-allowed items-center gap-4 rounded-lg border border-dashed bg-surface-soft p-4 opacity-70">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed text-2xl text-muted-foreground">
              +
            </div>
            <div>
              <span className="block text-base font-black text-muted-foreground">Add Account</span>
              <span className="mt-1 block text-xs font-semibold uppercase text-muted-foreground">
                Coming later
              </span>
            </div>
          </div>
        </div>
        </section>
      </main>
    </div>
  );
}
