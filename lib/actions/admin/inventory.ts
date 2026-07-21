"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const adjustSchema = z.object({
  variantId: z.string().min(1),
  change: z
    .number()
    .int()
    .refine((n) => n !== 0, "Change cannot be zero"),
  reason: z.string().trim().min(2, "Give a short reason").max(120),
});

export async function adjustStock(input: {
  variantId: string;
  change: number;
  reason: string;
}): Promise<{ ok: true; stock: number } | { ok: false; error: string }> {
  const session = await requireAdmin();
  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const { variantId, change, reason } = parsed.data;

  try {
    const stock = await prisma.$transaction(async (tx) => {
      if (change < 0) {
        const res = await tx.variant.updateMany({
          where: { id: variantId, stock: { gte: -change } },
          data: { stock: { increment: change } },
        });
        if (res.count === 0) throw new Error("INSUFFICIENT");
      } else {
        await tx.variant.update({
          where: { id: variantId },
          data: { stock: { increment: change } },
        });
      }
      await tx.stockAdjustment.create({
        data: { variantId, change, reason, adminUserId: session.sub },
      });
      const v = await tx.variant.findUniqueOrThrow({
        where: { id: variantId },
        select: { stock: true },
      });
      return v.stock;
    });
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { ok: true, stock };
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT")
      return { ok: false, error: "Not enough stock to remove that many" };
    console.error("adjustStock failed:", e);
    return { ok: false, error: "Failed to adjust stock" };
  }
}
