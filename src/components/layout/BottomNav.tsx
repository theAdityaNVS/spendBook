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
    <nav className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:hidden">
      <div className="glass flex items-center justify-between rounded-full px-2 py-2 shadow-2xl">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-[10px] font-medium transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="bg-primary/10 absolute inset-0 rounded-full transition-opacity" />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-transform duration-300",
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
