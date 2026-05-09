import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";

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
    <div className="bg-background bg-mesh relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 dark:bg-[#0a0a0f]">
      {/* Premium Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="bg-primary/20 animate-float absolute top-[10%] left-[15%] h-[400px] w-[400px] rounded-full mix-blend-screen blur-[120px] filter" />
        <div className="animate-float-delayed absolute top-[40%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 mix-blend-screen blur-[150px] filter" />
        <div className="animate-float absolute bottom-[10%] left-[30%] h-[450px] w-[450px] rounded-full bg-purple-500/20 mix-blend-screen blur-[130px] filter" />
      </div>

      <div className="relative z-10 mb-16 flex items-center gap-4">
        <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl ring-1 ring-white/20">
          <Wallet className="text-primary h-8 w-8" />
        </div>
        <h1 className="from-foreground to-foreground/50 bg-gradient-to-br bg-clip-text text-6xl font-extrabold tracking-tight text-transparent drop-shadow-sm">
          SpendBook
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-5xl text-center">
        <h2 className="text-foreground/80 mb-14 text-3xl font-medium tracking-tight sm:text-4xl">
          Who&apos;s tracking today?
        </h2>

        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {users.map((user) => (
            <form key={user.id} action={selectUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className="group flex flex-col items-center gap-6 outline-none">
                <div className="glass-panel group-hover:border-primary/50 relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2.5rem] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] group-focus:-translate-y-2 sm:h-48 sm:w-48">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="from-primary/20 to-primary/5 text-primary flex h-full w-full items-center justify-center bg-gradient-to-br text-6xl font-semibold transition-transform duration-500 group-hover:scale-110">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="bg-foreground/0 group-hover:bg-foreground/5 group-focus:bg-foreground/5 absolute inset-0 transition-colors duration-500" />
                  <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground text-xl font-medium tracking-wide transition-colors duration-500">
                  {user.name}
                </span>
              </button>
            </form>
          ))}

          {/* Guest / New User Option */}
          <div className="group flex cursor-not-allowed flex-col items-center gap-6 opacity-60 transition-all duration-500 outline-none hover:opacity-100">
            <div className="glass-panel relative flex h-36 w-36 items-center justify-center rounded-[2.5rem] border-dashed transition-all duration-500 ease-out group-hover:-translate-y-2 sm:h-48 sm:w-48">
              <span className="text-muted-foreground group-hover:text-foreground text-6xl font-light transition-colors duration-500">
                +
              </span>
              <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10" />
            </div>
            <span className="text-muted-foreground group-hover:text-foreground text-xl font-medium tracking-wide transition-colors duration-500">
              Add Account
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-28">
        <div className="glass inline-flex items-center gap-3 rounded-full px-6 py-2.5 text-sm font-medium text-yellow-600 shadow-lg dark:text-yellow-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
          </span>
          Development Bypass Active
        </div>
      </div>
    </div>
  );
}
