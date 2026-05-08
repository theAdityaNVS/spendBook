import { AuthView } from "@neondatabase/auth/react"
import { authViewPaths } from "@neondatabase/auth/react/ui/server"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <AuthView path={path} />
    </div>
  )
}
