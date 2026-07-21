"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adjustStock } from "@/lib/actions/admin/inventory";

export function StockAdjustDialog({
  variantId,
  label,
  stock,
}: {
  variantId: string;
  label: string;
  stock: number;
}) {
  const [open, setOpen] = useState(false);
  const [change, setChange] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await adjustStock({
        variantId,
        change: Number(change) || 0,
        reason,
      });
      if (result.ok) {
        toast.success(`Stock updated — now ${result.stock}`);
        setOpen(false);
        setChange("");
        setReason("");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Adjust
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {label} — currently <span className="font-medium">{stock}</span> in
            stock.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="change">Change (+ add, − remove)</Label>
            <Input
              id="change"
              type="number"
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder="e.g. 10 or -2"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. New shipment received"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending || !change || !reason}>
            {pending && <Loader2 className="animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
