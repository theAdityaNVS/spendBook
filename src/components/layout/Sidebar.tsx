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
    <aside className="glass-panel z-20 m-4 hidden w-64 shrink-0 flex-col rounded-[2.5rem] md:flex relative overflow-hidden">
      {/* Subtle top glare */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />

      {/* Logo */}
      <div className="relative flex h-24 items-center gap-4 px-8 pt-4">
        <div className="bg-primary/20 text-primary relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ring-1 ring-white/20 backdrop-blur-md">
          <Wallet className="h-6 w-6" />
          <div className="absolute inset-0 rounded-2xl shadow-[0_0_15px_rgba(var(--primary),0.3)] pointer-events-none" />
        </div>
        <span className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
          SpendBook
        </span>
      </div>

      {/* Nav */}
      <nav className="relative flex flex-col gap-3 px-4 py-8">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-500 overflow-hidden",
                isActive
                  ? "text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-primary opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                  <div className="absolute left-0 w-1 h-1/2 top-1/4 bg-white rounded-r-full shadow-[0_0_10px_white]" />
                </>
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              )}
              
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-transform duration-500 group-hover:scale-110",
                  isActive
                    ? "text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="relative z-10 tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
