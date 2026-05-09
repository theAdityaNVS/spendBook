"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Wallet,
  Smartphone,
  Landmark,
  Coins,
} from "lucide-react";
import { toast } from "sonner";

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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import type { PaymentMode, PaymentModeType, Person } from "@/types";
import {
  createPaymentMode,
  updatePaymentMode,
  archivePaymentMode,
} from "@/server/actions/payment-mode";

type PaymentModeWithRelations = PaymentMode & { ownerPerson: Person | null };

const PAYMENT_MODE_TYPES: { value: PaymentModeType; label: string; icon: React.ElementType }[] = [
  { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { value: "DEBIT_CARD", label: "Debit Card", icon: CreditCard },
  { value: "UPI", label: "UPI", icon: Smartphone },
  { value: "CASH", label: "Cash", icon: Coins },
  { value: "WALLET", label: "Wallet", icon: Wallet },
  { value: "NET_BANKING", label: "Net Banking", icon: Landmark },
];

export function PaymentModeList({
  initialModes,
  persons,
}: {
  initialModes: PaymentModeWithRelations[];
  persons: Person[];
}) {
  const [modes, setModes] = useState<PaymentModeWithRelations[]>(initialModes);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingMode, setEditingMode] = useState<PaymentModeWithRelations | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: PaymentModeType;
    ownerPersonId: string | "FAMILY";
  }>({ name: "", type: "CREDIT_CARD", ownerPersonId: "FAMILY" });

  function openModal(mode?: PaymentModeWithRelations) {
    if (mode) {
      setEditingMode(mode);
      setFormData({
        name: mode.name,
        type: mode.type,
        ownerPersonId: mode.ownerPersonId || "FAMILY",
      });
    } else {
      setEditingMode(null);
      setFormData({ name: "", type: "CREDIT_CARD", ownerPersonId: "FAMILY" });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingMode(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      ownerPersonId: formData.ownerPersonId === "FAMILY" ? null : formData.ownerPersonId,
    };

    startTransition(async () => {
      let result;
      if (editingMode) {
        result = await updatePaymentMode(editingMode.id, payload);
      } else {
        result = await createPaymentMode(payload);
      }

      if (result.success) {
        toast.success(`Payment mode ${editingMode ? "updated" : "created"} successfully`);

        // Optimistic UI update
        const updatedMode = {
          ...(result.data as PaymentMode),
          ownerPerson: payload.ownerPersonId
            ? persons.find((p) => p.id === payload.ownerPersonId) || null
            : null,
        };

        if (editingMode) {
          setModes((prev) => prev.map((m) => (m.id === editingMode.id ? updatedMode : m)));
        } else {
          setModes((prev) => [...prev, updatedMode]);
        }

        closeModal();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleArchive(mode: PaymentModeWithRelations) {
    startTransition(async () => {
      const result = await archivePaymentMode(mode.id);
      if (result.success) {
        toast.success("Payment mode archived successfully");
        setModes((prev) => prev.filter((m) => m.id !== mode.id));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h2 className="text-xl font-semibold">Payment Modes</h2>
          <p className="text-muted-foreground text-sm">Manage your payment accounts and cards.</p>
        </div>
        <Button onClick={() => openModal()} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Mode
        </Button>
      </div>

      <CardContent>
        {modes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="bg-primary/10 rounded-full p-3">
              <CreditCard className="text-primary h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">No payment modes</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Add a payment mode to track where your money comes from and goes.
            </p>
            <Button className="mt-4" onClick={() => openModal()} disabled={isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Mode
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {modes.map((mode) => {
              const TypeIcon =
                PAYMENT_MODE_TYPES.find((t) => t.value === mode.type)?.icon || CreditCard;
              const typeLabel =
                PAYMENT_MODE_TYPES.find((t) => t.value === mode.type)?.label || mode.type;

              return (
                <div
                  key={mode.id}
                  className="bg-card flex items-center justify-between gap-4 rounded-lg border p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <TypeIcon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{mode.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">
                          {typeLabel}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          • {mode.ownerPerson ? mode.ownerPerson.name : "Family"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(mode)}
                      disabled={isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to archive this payment mode?")) {
                          handleArchive(mode);
                        }
                      }}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMode ? "Edit Payment Mode" : "Add Payment Mode"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. HDFC Credit Card"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val as PaymentModeType })}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Select
                value={formData.ownerPersonId}
                onValueChange={(val) => setFormData({ ...formData, ownerPersonId: val })}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAMILY">Shared (Family)</SelectItem>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editingMode ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
