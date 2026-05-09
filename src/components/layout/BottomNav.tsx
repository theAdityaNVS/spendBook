"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/ledger", label: "Ledger", Icon: BookOpen },
  { href: "/summary", label: "Summary", Icon: BarChart2 },
  { href: "/analytics", label: "Analytics", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: Settings },
];

/** Bottom navigation bar — shown on mobile/tablet only. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="surface-panel flex items-center justify-between rounded-lg p-1.5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[10px] font-bold transition-all",
                isActive ? "bg-nav text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="relative z-10 mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
