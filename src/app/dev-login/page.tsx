import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Wallet } from "lucide-react"

export default async function DevLoginPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
  })

  async function selectUser(formData: FormData) {
    "use server"
    const userId = formData.get("userId") as string
    const cookieStore = await cookies()
    cookieStore.set("dev_user_id", userId, { path: "/" })
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-12 flex items-center gap-3">
        <Wallet className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">SpendBook</h1>
      </div>

      <div className="w-full max-w-4xl text-center">
        <h2 className="mb-10 text-2xl font-medium text-muted-foreground">
          Who's tracking today?
        </h2>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
          {users.map((user) => (
            <form key={user.id} action={selectUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="group flex flex-col items-center gap-4 outline-none"
              >
                <div className="relative h-32 w-32 overflow-hidden rounded-md border-2 border-transparent bg-muted transition-all group-hover:border-white group-focus:border-white sm:h-40 sm:w-40">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                </div>
                <span className="text-lg text-muted-foreground transition-colors group-hover:text-white">
                  {user.name}
                </span>
              </button>
            </form>
          ))}

          {/* Guest / New User Option */}
          <div className="flex flex-col items-center gap-4 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            <div className="flex h-32 w-32 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground bg-muted sm:h-40 sm:w-40">
              <span className="text-4xl">+</span>
            </div>
            <span className="text-lg">Add Family</span>
          </div>
        </div>
      </div>
      
      <div className="mt-20">
        <p className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-sm text-yellow-500">
          Development Bypass Active
        </p>
      </div>
    </div>
  )
}
