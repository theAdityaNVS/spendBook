import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge Tailwind classes safely. Use instead of plain template strings. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a Decimal/number as Indian Rupees (or any currency). */
export function formatCurrency(
  amount: number | string,
  currency = "INR",
  locale = "en-IN",
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/** Format a date as "Mon, 3 Mar 2026" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}

/** Format a date as YYYY-MM-DD (used in URLs and query params) */
export function toDateParam(date: Date): string {
  return date.toISOString().split("T")[0]
}

/** Parse YYYY-MM-DD → Date at midnight UTC */
export function fromDateParam(param: string): Date {
  return new Date(`${param}T00:00:00.000Z`)
}

/** Get today as a Date at midnight UTC */
export function today(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

/** Add/subtract days from a Date */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}
