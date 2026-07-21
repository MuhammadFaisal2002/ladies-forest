"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { OrderStatus, PaymentStatus } from "@/lib/generated/prisma/client";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const DEAD_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

type Result = { ok: true } | { ok: false; error: string };

function revalidateOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Result> {
  const session = await requireAdmin();
  if (!ORDER_STATUSES.includes(status))
    return { ok: false, error: "Invalid status" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status === status) return { ok: true };

  const wasDead = DEAD_STATUSES.includes(order.status);
  const willBeDead = DEAD_STATUSES.includes(status);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status } });

      // Cancelling/returning puts the items back in stock; reactivating a
      // cancelled order takes them out again.
      const direction = willBeDead && !wasDead ? 1 : !willBeDead && wasDead ? -1 : 0;
      if (direction !== 0) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: direction * item.quantity } },
          });
          await tx.stockAdjustment.create({
            data: {
              variantId: item.variantId,
              change: direction * item.quantity,
              reason:
                direction > 0
                  ? `Order ${order.orderNumber} ${status.toLowerCase()}`
                  : `Order ${order.orderNumber} reactivated`,
              adminUserId: session.sub,
            },
          });
        }
      }
    });
    revalidateOrder(orderId);
    return { ok: true };
  } catch (e) {
    console.error("updateOrderStatus failed:", e);
    return { ok: false, error: "Failed to update status" };
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
): Promise<Result> {
  await requireAdmin();
  if (!["PENDING", "PAID", "REFUNDED"].includes(paymentStatus))
    return { ok: false, error: "Invalid payment status" };
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
    });
    revalidateOrder(orderId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update payment status" };
  }
}

export async function saveOrderNotes(
  orderId: string,
  notes: string,
): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { notes: notes.trim() || null },
    });
    revalidateOrder(orderId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save notes" };
  }
}
