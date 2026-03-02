"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, BarChart2, TrendingUp, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/ledger", label: "Ledger", Icon: BookOpen },
  { href: "/summary", label: "Summary", Icon: BarChart2 },
  { href: "/analytics", label: "Analytics", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: Settings },
]

/** Bottom navigation bar — shown on mobile/tablet only. */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
