"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2, TrendingUp, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/ledger", label: "Daily Ledger", Icon: BookOpen },
  { href: "/summary", label: "Monthly Summary", Icon: BarChart2 },
  { href: "/analytics", label: "Analytics", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: Settings },
];

/** Sidebar navigation — shown on desktop only (md+). */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass z-20 m-4 hidden w-64 shrink-0 flex-col rounded-[2rem] md:flex">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-8 pt-2">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">SpendBook</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 px-4 py-6">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-primary/20 shadow-md"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
