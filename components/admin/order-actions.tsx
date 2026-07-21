"use client";

import { useState, useTransition } from "react";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  saveOrderNotes,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/lib/actions/admin/orders";
import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/generated/prisma/enums";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const PAYMENTS: PaymentStatus[] = ["PENDING", "PAID", "REFUNDED"];

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  notes,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string;
}) {
  const [pending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState(notes);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) toast.success("Saved");
      else toast.error(result.error ?? "Failed");
    });

  return (
    <Card className="print:hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage</CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer /> Invoice
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Order status</p>
          <Select
            items={STATUSES.map((s) => ({ value: s, label: s }))}
            value={status}
            onValueChange={(v) =>
              v && run(() => updateOrderStatus(orderId, v as OrderStatus))
            }
          >
            <SelectTrigger className="w-full" disabled={pending}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Cancelling or returning puts the items back into stock
            automatically.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Payment</p>
          <Select
            items={PAYMENTS.map((s) => ({ value: s, label: s }))}
            value={paymentStatus}
            onValueChange={(v) =>
              v && run(() => updatePaymentStatus(orderId, v as PaymentStatus))
            }
          >
            <SelectTrigger className="w-full" disabled={pending}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Internal notes</p>
          <Textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Only staff can see these"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => run(() => saveOrderNotes(orderId, noteText))}
          >
            {pending && <Loader2 className="animate-spin" />}
            Save notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
