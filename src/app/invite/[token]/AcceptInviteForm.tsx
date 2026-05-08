"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { acceptInvite } from "@/server/actions/invite"

export function AcceptInviteForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [name, setName] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }

    startTransition(async () => {
      const result = await acceptInvite(token, name)
      if (result.success) {
        toast.success("Successfully joined the family!")
        router.push("/ledger")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
        />
        <p className="text-xs text-muted-foreground">
          This is how you will appear in the family account.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Joining..." : "Join Family"}
      </Button>
    </form>
  )
}
