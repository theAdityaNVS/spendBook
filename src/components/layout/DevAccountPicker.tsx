"use client"

import { Users } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { switchDevUserAction } from "@/server/actions/dev-auth"
import type { User } from "@/generated/prisma"

interface DevAccountPickerProps {
  users: User[]
  currentUserId: string
}

export function DevAccountPicker({ users, currentUserId }: DevAccountPickerProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-yellow-50 px-2 py-1 text-yellow-800">
      <Users className="h-4 w-4" />
      <span className="hidden text-xs font-bold uppercase sm:inline">Dev Mode:</span>
      <Select
        value={currentUserId}
        onValueChange={(id) => switchDevUserAction(id)}
      >
        <SelectTrigger className="h-8 border-none bg-transparent p-0 text-xs font-medium focus:ring-0">
          <SelectValue placeholder="Select Account" />
        </SelectTrigger>
        <SelectContent>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id} className="text-xs">
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
