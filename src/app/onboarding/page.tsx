"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { setupFamilyAction } from "@/server/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import type { ActionResult } from "@/types"

const initialState: ActionResult = { success: false, error: "" }

export default function OnboardingPage() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(setupFamilyAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.push("/ledger")
      router.refresh()
    }
  }, [state.success, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SpendBook</h1>
          <p className="text-sm text-muted-foreground">One last step!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set up your family</CardTitle>
            <CardDescription>
              Create a family household to start tracking expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">Family name</Label>
                <Input
                  id="familyName"
                  name="familyName"
                  placeholder="Kumar Household"
                  required
                />
              </div>

              {!state.success && state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Setting up..." : "Create family & start"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
