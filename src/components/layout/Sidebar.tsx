"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, BarChart2, TrendingUp, Settings, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/ledger", label: "Daily Ledger", Icon: BookOpen },
  { href: "/summary", label: "Monthly Summary", Icon: BarChart2 },
  { href: "/analytics", label: "Analytics", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: Settings },
]

/** Sidebar navigation — shown on desktop only (md+). */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Wallet className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold tracking-tight">SpendBook</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
