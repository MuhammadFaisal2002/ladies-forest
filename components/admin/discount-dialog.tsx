"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteDiscount, upsertDiscount } from "@/lib/actions/admin/store";

export type DiscountData = {
  id?: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderValue: number | null;
  usageLimit: number | null;
  startsAt: string | null; // yyyy-mm-dd
  endsAt: string | null;
  active: boolean;
};

export function DiscountDialog({
  initial,
  trigger,
}: {
  initial?: DiscountData;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<DiscountData>(
    initial ?? {
      code: "",
      type: "PERCENT",
      value: 10,
      minOrderValue: null,
      usageLimit: null,
      startsAt: null,
      endsAt: null,
      active: true,
    },
  );

  const save = () =>
    startTransition(async () => {
      const result = await upsertDiscount(form);
      if (result.ok) {
        toast.success("Discount saved");
        setOpen(false);
      } else toast.error(result.error);
    });

  const remove = () => {
    if (!initial?.id) return;
    startTransition(async () => {
      const result = await deleteDiscount(initial.id!);
      if (result.ok) {
        toast.success("Discount deleted");
        setOpen(false);
      } else toast.error(result.error);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit coupon" : "New coupon"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                placeholder="SUMMER20"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                items={[
                  { value: "PERCENT", label: "Percent (%)" },
                  { value: "FIXED", label: "Fixed (Rs.)" },
                ]}
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    type: v === "FIXED" ? "FIXED" : "PERCENT",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Percent (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed (Rs.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Value {form.type === "PERCENT" ? "(%)" : "(Rs.)"}
              </Label>
              <Input
                type="number"
                min={1}
                value={form.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min order (Rs.)</Label>
              <Input
                type="number"
                min={0}
                value={form.minOrderValue ?? ""}
                placeholder="None"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    minOrderValue: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Starts</Label>
              <Input
                type="date"
                value={form.startsAt ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startsAt: e.target.value || null }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ends</Label>
              <Input
                type="date"
                value={form.endsAt ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endsAt: e.target.value || null }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Usage limit</Label>
              <Input
                type="number"
                min={1}
                value={form.usageLimit ?? ""}
                placeholder="Unlimited"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    usageLimit: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.active}
                onCheckedChange={(c) =>
                  setForm((f) => ({ ...f, active: c === true }))
                }
              />
              Active
            </label>
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          {initial?.id ? (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={remove}
              disabled={pending}
            >
              <Trash2 /> Delete
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={save} disabled={pending || !form.code}>
            {pending && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
