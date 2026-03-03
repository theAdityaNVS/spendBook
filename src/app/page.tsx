import { redirect } from "next/navigation"

// The root page redirects to the daily ledger.
// Middleware handles unauthenticated redirects to /login.
export default function HomePage() {
  redirect("/ledger")
}
