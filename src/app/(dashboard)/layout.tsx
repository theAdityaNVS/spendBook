import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { getAppSession, isAuthenticated } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();
  if (!authenticated) redirect("/auth/sign-in");

  const session = await getAppSession();
  if (!session) redirect("/onboarding");

  return (
    <div className="bg-background/50 relative flex h-screen overflow-hidden dark:bg-[#0a0a0f]">
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 dark:opacity-20">
        <div className="bg-primary/20 absolute -top-[10%] left-[-10%] h-[500px] w-[500px] rounded-full mix-blend-screen blur-[120px] filter" />
      </div>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24 md:px-8 md:pb-8 lg:px-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
