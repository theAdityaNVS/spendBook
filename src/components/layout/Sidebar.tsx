"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2, TrendingUp, Settings, Wallet, Sparkles } from "lucide-react";
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
    <aside className="relative z-20 m-4 hidden w-72 shrink-0 overflow-hidden rounded-lg bg-nav text-white shadow-2xl md:flex md:flex-col">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-coral to-brand-teal" />

      <div className="relative flex h-24 items-center gap-4 px-7">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-brand-gold ring-1 ring-white/15">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <span className="block text-2xl font-black tracking-tight">SpendBook</span>
          <span className="text-xs font-semibold uppercase text-nav-muted">Family finance desk</span>
        </div>
      </div>

      <div className="mx-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 text-brand-gold">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">Today focus</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-white/82">
          Track the day, settle balances, and keep every shared spend accountable.
        </p>
      </div>

      <nav className="relative flex flex-col gap-2 px-4 py-6" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                isActive
                  ? "bg-white text-nav shadow-lg shadow-black/10"
                  : "text-nav-muted hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-105",
                  isActive ? "text-primary" : "text-nav-muted group-hover:text-white"
                )}
              />
              <span>{label}</span>
              {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-brand-gold" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-5 text-nav-muted">
          Built for quick daily entries, monthly clarity, and family-level trust.
        </div>
      </div>
    </aside>
  );
}
