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
    <div className="app-canvas relative flex h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 fine-grid opacity-70" />
      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-5 md:px-8 md:pb-8 md:pt-6 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
