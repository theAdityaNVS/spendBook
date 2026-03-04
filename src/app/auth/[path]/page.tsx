import { AuthView } from "@neondatabase/auth/react"

export const dynamicParams = false

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
