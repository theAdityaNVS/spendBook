"use client";

import { useState, useTransition } from "react";
import { Plus, GripVertical, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryTag } from "@/types";
import {
  createCategoryTag,
  updateCategoryTag,
  archiveCategoryTag,
  reorderCategoryTags,
} from "@/server/actions/category-tag";

const PREDEFINED_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#f43f5e", // rose
];

interface SortableTagItemProps {
  tag: CategoryTag;
  onEdit: (tag: CategoryTag) => void;
  onArchive: (tag: CategoryTag) => void;
  isPending: boolean;
}

function SortableTagItem({ tag, onEdit, onArchive, isPending }: SortableTagItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tag.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card flex items-center justify-between gap-4 rounded-lg border p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: tag.color }}
        >
          <Tag className="h-3 w-3 text-white" />
        </div>
        <span className="font-medium">{tag.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(tag)} disabled={isPending}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            if (confirm("Are you sure you want to archive this tag?")) {
              onArchive(tag);
            }
          }}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function CategoryTagList({ initialTags }: { initialTags: CategoryTag[] }) {
  const [tags, setTags] = useState<CategoryTag[]>(initialTags);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTag, setEditingTag] = useState<CategoryTag | null>(null);
  const [formData, setFormData] = useState({ name: "", color: PREDEFINED_COLORS[8] });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTags((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Save reordered items
        startTransition(async () => {
          const result = await reorderCategoryTags(newItems.map((item) => item.id));
          if (!result.success) {
            toast.error(result.error);
            setTags(initialTags); // revert
          }
        });

        return newItems;
      });
    }
  }

  function openModal(tag?: CategoryTag) {
    if (tag) {
      setEditingTag(tag);
      setFormData({ name: tag.name, color: tag.color });
    } else {
      setEditingTag(null);
      setFormData({ name: "", color: PREDEFINED_COLORS[8] });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTag(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    startTransition(async () => {
      let result;
      if (editingTag) {
        result = await updateCategoryTag(editingTag.id, formData);
      } else {
        result = await createCategoryTag(formData);
      }

      if (result.success) {
        toast.success(`Tag ${editingTag ? "updated" : "created"} successfully`);

        // Optimistic UI update
        if (editingTag) {
          setTags((prev) => prev.map((t) => (t.id === editingTag.id ? { ...t, ...formData } : t)));
        } else if (result.data) {
          setTags((prev) => [...prev, result.data as CategoryTag]);
        }

        closeModal();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleArchive(tag: CategoryTag) {
    startTransition(async () => {
      const result = await archiveCategoryTag(tag.id);
      if (result.success) {
        toast.success("Tag archived successfully");
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-foreground/90 text-2xl font-semibold tracking-tight">
            Category Tags
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your custom spending categories. Drag to reorder.
          </p>
        </div>
        <Button className="rounded-xl px-4" onClick={() => openModal()} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      <div>
        {tags.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border-dashed p-10 text-center">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner">
              <Tag className="text-primary h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">No category tags</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Add your first category tag to organize your expenses.
            </p>
            <Button className="mt-5 rounded-xl" onClick={() => openModal()} disabled={isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tags} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {tags.map((tag) => (
                  <SortableTagItem
                    key={tag.id}
                    tag={tag}
                    onEdit={openModal}
                    onArchive={handleArchive}
                    isPending={isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create Tag"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tag Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Groceries"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {PREDEFINED_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`ring-offset-background focus-visible:ring-ring h-10 rounded-md transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                      formData.color === c ? "ring-ring ring-2 ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setFormData({ ...formData, color: c })}
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editingTag ? "Update Tag" : "Create Tag"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
