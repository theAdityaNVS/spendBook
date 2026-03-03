import { TransactionType, PaidTowards, PaymentModeType, Role } from "@/generated/prisma"

export { TransactionType, PaidTowards, PaymentModeType, Role }

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEBIT: "Debit",
  CREDIT: "Credit",
  PAYMENT: "Payment",
}

export const PAID_TOWARDS_LABELS: Record<PaidTowards, string> = {
  PERSONAL: "Personal",
  FAMILY: "Family",
}

export const PAYMENT_MODE_TYPE_LABELS: Record<PaymentModeType, string> = {
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  UPI: "UPI",
  CASH: "Cash",
  WALLET: "Wallet",
  NET_BANKING: "Net Banking",
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  FAMILY: "Family",
  PERSON: "Person",
}

export const DEFAULT_CURRENCY = "INR"
export const DEFAULT_TIMEZONE = "Asia/Kolkata"

export const DEFAULT_CATEGORY_TAGS = [
  { name: "Food Delivery", color: "#f97316" },
  { name: "Groceries", color: "#22c55e" },
  { name: "Shopping", color: "#8b5cf6" },
  { name: "Subscriptions", color: "#3b82f6" },
  { name: "Utilities", color: "#6366f1" },
  { name: "Transport", color: "#f59e0b" },
  { name: "Entertainment", color: "#ec4899" },
  { name: "Healthcare", color: "#14b8a6" },
  { name: "Education", color: "#0ea5e9" },
  { name: "Miscellaneous", color: "#94a3b8" },
] as const

export const NAV_ITEMS = [
  { href: "/ledger", label: "Ledger", icon: "BookOpen" },
  { href: "/summary", label: "Summary", icon: "BarChart2" },
  { href: "/analytics", label: "Analytics", icon: "TrendingUp" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const
