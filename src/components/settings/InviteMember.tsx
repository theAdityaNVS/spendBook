"use client"

import { useState, useTransition } from "react"
import { Copy, Link as LinkIcon, UserPlus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createInvite } from "@/server/actions/invite"
import type { Role } from "@/types"

export function InviteMember() {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<Role>("PERSON")
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  function handleCreateInvite() {
    startTransition(async () => {
      const result = await createInvite(role)
      if (result.success) {
        setInviteUrl(result.data as string)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleCopy() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    toast.success("Invite link copied to clipboard")
    setIsOpen(false)
    setTimeout(() => setInviteUrl(null), 500)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Invite Members</CardTitle>
          <CardDescription>
            Invite family members to join your SpendBook account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Generate Invite Link
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(o) => !o && setIsOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Family Member</DialogTitle>
            <DialogDescription>
              Create an invite link for a new member. The link will expire in 7 days.
            </DialogDescription>
          </DialogHeader>

          {!inviteUrl ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSON">Person (Own transactions only)</SelectItem>
                    <SelectItem value="FAMILY">Family (All family transactions)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Full access & settings)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateInvite} disabled={isPending} className="w-full">
                {isPending ? "Generating..." : "Generate Link"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    Link
                  </Label>
                  <Input
                    id="link"
                    defaultValue={inviteUrl}
                    readOnly
                    className="pr-10"
                  />
                </div>
                <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                  <span className="sr-only">Copy</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button type="button" variant="secondary" className="w-full" onClick={() => { setIsOpen(false); setInviteUrl(null); }}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
