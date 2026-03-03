"use client"

import { useState } from "react"
import { useActionState } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, User } from "lucide-react"
import { createPersonAction, updatePersonAction, deletePersonAction } from "@/server/actions/person"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Person, ActionResult } from "@/types"
import { useEffect } from "react"

const initialCreate: ActionResult<Person> = { success: false, error: "" }
const initialUpdate: ActionResult<Person> = { success: false, error: "" }

function AddPersonDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    createPersonAction,
    initialCreate,
  )

  useEffect(() => {
    if (state.success) {
      toast.success("Person added")
      onClose()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, onClose])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Person</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="e.g. Priya" required />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Adding…" : "Add person"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditPersonDialog({
  person,
  open,
  onClose,
}: {
  person: Person
  open: boolean
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    updatePersonAction,
    initialUpdate,
  )

  useEffect(() => {
    if (state.success) {
      toast.success("Person updated")
      onClose()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, onClose])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={person.id} />
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={person.name}
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface PersonListProps {
  persons: Person[]
}

export function PersonList({ persons }: PersonListProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editPerson, setEditPerson] = useState<Person | null>(null)

  async function handleDelete(person: Person) {
    if (!confirm(`Remove ${person.name} from the family? This can't be undone.`)) return
    const result = await deletePersonAction(person.id)
    if (!result.success) toast.error(result.error)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Family Members</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Person
        </Button>
      </div>

      <div className="space-y-2">
        {persons.map((person) => (
          <Card key={person.id}>
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{person.name}</p>
                  {person.isFamilyAccount && (
                    <Badge variant="secondary" className="mt-0.5 text-xs">
                      Family Account
                    </Badge>
                  )}
                </div>
              </div>

              {!person.isFamilyAccount && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditPerson(person)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(person)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AddPersonDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editPerson && (
        <EditPersonDialog
          person={editPerson}
          open={!!editPerson}
          onClose={() => setEditPerson(null)}
        />
      )}
    </div>
  )
}
