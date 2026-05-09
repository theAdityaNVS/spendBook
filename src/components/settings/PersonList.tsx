"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, User } from "lucide-react";
import {
  createPersonAction,
  updatePersonAction,
  deletePersonAction,
} from "@/server/actions/person";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Person, ActionResult } from "@/types";

const initialCreate: ActionResult<Person> = { success: false, error: "" };
const initialUpdate: ActionResult<Person> = { success: false, error: "" };

function AddPersonDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createPersonAction, initialCreate);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (state.success) {
      toast.success("Person added");
      handleClose();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, handleClose]);

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
  );
}

function EditPersonDialog({
  person,
  open,
  onClose,
}: {
  person: Person;
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updatePersonAction, initialUpdate);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (state.success) {
      toast.success("Person updated");
      handleClose();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, handleClose]);

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
            <Input id="edit-name" name="name" defaultValue={person.name} required />
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
  );
}

interface PersonListProps {
  persons: Person[];
}

export function PersonList({ persons }: PersonListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);

  async function handleDelete(person: Person) {
    if (!confirm(`Remove ${person.name} from the family? This can't be undone.`)) return;
    const result = await deletePersonAction(person.id);
    if (!result.success) toast.error(result.error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-foreground/90 text-2xl font-semibold tracking-tight">Family Members</h2>
        <Button size="sm" className="rounded-xl px-4" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Person
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {persons.map((person) => (
          <div
            key={person.id}
            className="glass-panel group dark:hover:bg-foreground/5 relative flex items-center justify-between rounded-3xl p-5 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner">
                <User className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold">{person.name}</p>
                {person.isFamilyAccount && (
                  <Badge
                    variant="secondary"
                    className="bg-muted/50 mt-1 text-[10px] tracking-wider uppercase"
                  >
                    Family Account
                  </Badge>
                )}
              </div>
            </div>

            {!person.isFamilyAccount && (
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary h-8 w-8 rounded-full"
                  onClick={() => setEditPerson(person)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-full"
                  onClick={() => handleDelete(person)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
  );
}
