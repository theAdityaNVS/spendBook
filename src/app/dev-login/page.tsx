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
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 dark:bg-[#0a0a0f]">
      {/* Premium Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="bg-primary/20 absolute top-[20%] left-[20%] h-[300px] w-[300px] rounded-full mix-blend-screen blur-[100px] filter" />
        <div className="absolute top-[30%] right-[20%] h-[400px] w-[400px] rounded-full bg-blue-500/20 mix-blend-screen blur-[120px] filter" />
        <div className="absolute bottom-[20%] left-[40%] h-[350px] w-[350px] rounded-full bg-purple-500/20 mix-blend-screen blur-[100px] filter" />
      </div>

      <div className="relative z-10 mb-16 flex items-center gap-3">
        <div className="glass flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl">
          <Wallet className="text-primary h-7 w-7" />
        </div>
        <h1 className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
          SpendBook
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-5xl text-center">
        <h2 className="text-foreground/80 mb-12 text-3xl font-medium tracking-tight sm:text-4xl">
          Who&apos;s tracking today?
        </h2>

        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {users.map((user) => (
            <form key={user.id} action={selectUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className="group flex flex-col items-center gap-5 outline-none">
                <div className="glass-panel group-hover:border-primary/50 relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2rem] transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] group-focus:scale-105 sm:h-44 sm:w-44">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="from-primary/20 to-primary/5 text-primary flex h-full w-full items-center justify-center bg-gradient-to-br text-5xl font-semibold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="bg-foreground/0 group-hover:bg-foreground/5 group-focus:bg-foreground/5 absolute inset-0 transition-colors duration-300" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground text-xl font-medium transition-colors duration-300">
                  {user.name}
                </span>
              </button>
            </form>
          ))}

          {/* Guest / New User Option */}
          <div className="group flex cursor-not-allowed flex-col items-center gap-5 opacity-60 transition-all duration-300 outline-none hover:opacity-100">
            <div className="glass-panel flex h-36 w-36 items-center justify-center rounded-[2rem] border-dashed transition-all duration-300 ease-out group-hover:scale-105 sm:h-44 sm:w-44">
              <span className="text-muted-foreground group-hover:text-foreground text-5xl font-light transition-colors duration-300">
                +
              </span>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground text-xl font-medium transition-colors duration-300">
              Add Account
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-24">
        <div className="glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
          </span>
          Development Bypass Active
        </div>
      </div>
    </div>
  );
}
