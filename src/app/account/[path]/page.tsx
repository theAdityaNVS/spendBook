import { AccountView } from "@neondatabase/auth/react"
import { accountViewPaths } from "@neondatabase/auth/react/ui/server"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <AccountView path={path} />
    </div>
  )
}
